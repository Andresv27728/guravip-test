/**
 * Sub-bot Manager
 * Manages premium and free sub-bots with custom features
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs-extra');
const path = require('path');
const { Boom } = require('@hapi/boom');
const moment = require('moment-timezone');
const axios = require('axios');

const database = require('./database');
const { loadPlugins } = require('./loader');
const { processMessage } = require('./functions');
const { handleAntiLink, handleWelcome } = require('./message-handlers');
const { parseMessage, getMessageMetadata } = require('./connect');
const settings = require('../config/settings');
const logger = require('../utils/logger');

// In-memory tracking of sub-bots
const subBots = {
    premium: {},  // Premium sub-bots
    free: {},     // Free sub-bots
    reconnectQueue: [], // Queue for reconnection
    lastCleanup: Date.now()
};

/**
 * Initialize a sub-bot
 * @param {String} userNumber - User's WhatsApp number
 * @param {Boolean} isPremium - Whether this is a premium sub-bot
 * @param {Object} customization - Custom settings for the sub-bot
 * @returns {Promise<Object>} Socket connection
 */
const initSubBot = async (userNumber, isPremium = false, customization = {}) => {
    try {
        // Create session directory for this sub-bot
        const sessionDir = path.join(process.cwd(), 'sessions', `subbot-${userNumber}`);
        await fs.ensureDir(sessionDir);
        
        // Authentication state
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        
        // Default customization options
        const defaultOptions = {
            name: isPremium ? `${settings.bot.name} Premium` : settings.bot.name,
            profile: isPremium ? '../public/premium-profile.jpg' : '../public/default-profile.jpg',
            menuType: isPremium ? 'buttons' : 'text',
            reconnectPriority: isPremium ? 1 : 2,  // Lower number = higher priority
        };
        
        // Merge with custom options
        const options = { ...defaultOptions, ...customization };
        
        // Create browser identifier
        const browserName = isPremium 
            ? `${options.name}-Premium-${userNumber}`
            : `${options.name}-Free-${userNumber}`;
            
        // Create socket connection
        const sock = makeWASocket({
            version: [2, 2323, 4],
            auth: state,
            printQRInTerminal: true,
            logger: P({ level: settings.logs.level }),
            browser: [browserName, 'Chrome', '1.0.0'],
            markOnlineOnConnect: settings.message.always_online
        });
        
        // Store sub-bot info
        const botInfo = {
            userNumber,
            isPremium,
            options,
            socket: sock,
            startTime: Date.now(),
            isConnected: false,
            lastReconnect: 0,
            reconnectAttempts: 0,
            plugins: null,
            commands: {},
            sessionDir
        };
        
        // Add to appropriate list
        if (isPremium) {
            subBots.premium[userNumber] = botInfo;
        } else {
            subBots.free[userNumber] = botInfo;
        }
        
        // Load appropriate plugins based on status
        botInfo.plugins = loadPlugins(isPremium 
            ? settings.subbots.premium_commands 
            : settings.subbots.public_commands
        );
        
        logger.info(`Loaded ${Object.keys(botInfo.plugins).length} plugins for sub-bot ${userNumber} (${isPremium ? 'Premium' : 'Free'})`);
        
        // Setup event handlers
        setupSubBotEvents(sock, botInfo, saveCreds);
        
        // Update sub-bot profile if premium (after connection)
        if (isPremium && options.profile) {
            sock.ev.on('connection.update', async (update) => {
                if (update.connection === 'open') {
                    // Wait a bit before updating profile
                    setTimeout(async () => {
                        try {
                            // Update profile picture if provided and different from default
                            if (options.profile && options.profile !== defaultOptions.profile) {
                                if (options.profile.startsWith('http')) {
                                    // Download from URL
                                    const response = await axios.get(options.profile, { responseType: 'arraybuffer' });
                                    await sock.updateProfilePicture(sock.user.id, response.data);
                                } else {
                                    // Use local file
                                    const profilePath = path.resolve(process.cwd(), options.profile);
                                    if (await fs.pathExists(profilePath)) {
                                        const imageData = await fs.readFile(profilePath);
                                        await sock.updateProfilePicture(sock.user.id, imageData);
                                    }
                                }
                                logger.info(`Updated profile picture for sub-bot ${userNumber}`);
                            }
                        } catch (err) {
                            logger.error(`Failed to update profile for sub-bot ${userNumber}: ${err.message}`);
                        }
                    }, 5000);
                }
            });
        }
        
        return sock;
        
    } catch (error) {
        logger.error(`Error initializing sub-bot for ${userNumber}:`, error);
        throw error;
    }
};

/**
 * Setup event handlers for a sub-bot
 * @param {Object} sock - Socket connection
 * @param {Object} botInfo - Bot information
 * @param {Function} saveCreds - Credentials save function
 */
const setupSubBotEvents = (sock, botInfo, saveCreds) => {
    // Auto save credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Connection update events
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            botInfo.isConnected = false;
            const statusCode = (lastDisconnect.error instanceof Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            logger.warn(`Sub-bot ${botInfo.userNumber} disconnected due to: ${lastDisconnect.error}`);
            
            if (shouldReconnect) {
                // Add to reconnect queue with priority
                botInfo.lastReconnect = Date.now();
                botInfo.reconnectAttempts++;
                
                // Only add to queue if not already there
                if (!subBots.reconnectQueue.includes(botInfo.userNumber)) {
                    subBots.reconnectQueue.push(botInfo.userNumber);
                    
                    // Sort queue by priority (premium first)
                    subBots.reconnectQueue.sort((a, b) => {
                        const botA = subBots.premium[a] || subBots.free[a];
                        const botB = subBots.premium[b] || subBots.free[b];
                        return botA.options.reconnectPriority - botB.options.reconnectPriority;
                    });
                    
                    // If premium user, pause their premium time during disconnection
                    if (botInfo.isPremium) {
                        // Notify owner about premium bot disconnection
                        for (const owner of settings.bot.owners) {
                            try {
                                await sendMessageToOwner(
                                    `⚠️ *Premium Sub-bot Disconnected*\n\n` +
                                    `• Number: ${botInfo.userNumber}\n` +
                                    `• Time: ${new Date().toLocaleString()}\n` +
                                    `• Reason: ${lastDisconnect.error?.message || 'Unknown'}\n\n` +
                                    `Premium time has been paused until reconnection. The bot will attempt to reconnect automatically.`
                                );
                            } catch (err) {
                                logger.error(`Failed to notify owner about disconnection: ${err.message}`);
                            }
                        }
                        
                        // Mark premium as paused in database
                        const premiumInfo = await database.getPremiumInfo(botInfo.userNumber);
                        if (premiumInfo) {
                            await database.updatePremiumStatus(botInfo.userNumber, {
                                paused: true,
                                pauseTime: Date.now()
                            });
                        }
                    }
                    
                    // Process reconnect queue
                    processReconnectQueue();
                }
            } else {
                logger.error(`Sub-bot ${botInfo.userNumber} logged out and will not reconnect`);
                // Remove from subBots list
                if (botInfo.isPremium) {
                    delete subBots.premium[botInfo.userNumber];
                } else {
                    delete subBots.free[botInfo.userNumber];
                }
            }
        } else if (connection === 'open') {
            botInfo.isConnected = true;
            botInfo.reconnectAttempts = 0;
            logger.success(`Sub-bot ${botInfo.userNumber} connected as ${sock.user?.name || 'Unknown'}`);
            
            // If premium user, resume their premium time
            if (botInfo.isPremium) {
                const premiumInfo = await database.getPremiumInfo(botInfo.userNumber);
                if (premiumInfo && premiumInfo.paused) {
                    // Calculate paused duration and extend expiration
                    const pauseDuration = Date.now() - premiumInfo.pauseTime;
                    await database.updatePremiumStatus(botInfo.userNumber, {
                        paused: false,
                        pauseTime: 0,
                        // Add paused time to expiration (convert ms to seconds)
                        expiration: premiumInfo.expiration + Math.floor(pauseDuration / 1000)
                    });
                    
                    // Notify user about reconnection
                    await sock.sendMessage(`${botInfo.userNumber}@s.whatsapp.net`, {
                        text: `✅ *Sub-bot Reconnected*\n\n` +
                              `Your premium sub-bot has been reconnected and your premium time has been adjusted to account for the disconnection period.`
                    });
                    
                    // Notify owner
                    for (const owner of settings.bot.owners) {
                        try {
                            await sendMessageToOwner(
                                `✅ *Premium Sub-bot Reconnected*\n\n` +
                                `• Number: ${botInfo.userNumber}\n` +
                                `• Time: ${new Date().toLocaleString()}\n` +
                                `• Premium time adjusted: +${Math.floor(pauseDuration / (1000 * 60))} minutes`
                            );
                        } catch (err) {
                            logger.error(`Failed to notify owner about reconnection: ${err.message}`);
                        }
                    }
                }
            }
            
            // Remove from reconnect queue if present
            const queueIndex = subBots.reconnectQueue.indexOf(botInfo.userNumber);
            if (queueIndex !== -1) {
                subBots.reconnectQueue.splice(queueIndex, 1);
            }
        }
    });
    
    // Message handling
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const msg of messages) {
            if (!msg.message) continue; // Skip if no message content
            
            try {
                // Parse message content
                const parsedMsg = parseMessage(msg);
                const metadata = getMessageMetadata(msg);
                
                // Enhanced metadata for group operations
                if (metadata.isGroup) {
                    try {
                        const groupMetadata = await sock.groupMetadata(metadata.from);
                        metadata.groupName = groupMetadata.subject;
                        metadata.groupDesc = groupMetadata.desc || '';
                        metadata.groupMembers = groupMetadata.participants;
                        metadata.groupAdmins = groupMetadata.participants
                            .filter(p => p.admin)
                            .map(p => p.id);
                        metadata.isGroupAdmin = metadata.groupAdmins.includes(metadata.sender);
                        metadata.isBotAdmin = metadata.groupAdmins.includes(sock.user.id.replace(/:\\d+/, '') + '@s.whatsapp.net');
                    } catch (err) {
                        logger.error(`Error getting group metadata for sub-bot: ${err.message}`);
                    }
                }
                
                // Add premium status to metadata
                metadata.isPremium = botInfo.isPremium;
                metadata.menuType = botInfo.options.menuType;
                
                // Handle anti-link before processing commands (premium feature)
                if (botInfo.isPremium) {
                    const linkHandled = await handleAntiLink(sock, parsedMsg, metadata);
                    if (linkHandled) continue;
                }
                
                // Process the message for commands with limit based on status
                await processMessage(sock, msg, botInfo.plugins, {
                    isPremium: botInfo.isPremium,
                    menuType: botInfo.options.menuType
                });
                
            } catch (err) {
                logger.error(`Error processing message for sub-bot ${botInfo.userNumber}: ${err.stack}`);
            }
        }
    });
    
    // Group update events
    sock.ev.on('group-participants.update', async (event) => {
        try {
            // Handle welcome messages for new participants (premium feature)
            if (botInfo.isPremium) {
                await handleWelcome(sock, event);
            }
            
            // For compatibility with existing plugins
            const { id, participants, action } = event;
            const groupMetadata = await sock.groupMetadata(id);
            
            logger.info(`Group update in ${groupMetadata.subject}: ${action} ${participants.join(', ')}`);
            
            // Load welcome plugin if exists (legacy support)
            if (botInfo.plugins.welcome) {
                await botInfo.plugins.welcome.execute(sock, { 
                    id, participants, action, groupMetadata 
                });
            }
        } catch (err) {
            logger.error(`Error handling group update for sub-bot ${botInfo.userNumber}: ${err.stack}`);
        }
    });
};

/**
 * Process the reconnect queue
 * Reconnects sub-bots in order of priority
 */
const processReconnectQueue = () => {
    if (subBots.reconnectQueue.length === 0) return;
    
    // Get the next sub-bot to reconnect
    const userNumber = subBots.reconnectQueue[0];
    const botInfo = subBots.premium[userNumber] || subBots.free[userNumber];
    
    if (!botInfo) {
        // Remove invalid entry from queue
        subBots.reconnectQueue.shift();
        return processReconnectQueue();
    }
    
    // Check if enough time has passed since last reconnect attempt
    const cooldownTime = Math.min(30000 * botInfo.reconnectAttempts, 300000); // Max 5 minutes
    const timeSinceLastReconnect = Date.now() - botInfo.lastReconnect;
    
    if (timeSinceLastReconnect < cooldownTime) {
        // Not time to reconnect yet, wait
        setTimeout(processReconnectQueue, cooldownTime - timeSinceLastReconnect + 1000);
        return;
    }
    
    logger.info(`Attempting to reconnect sub-bot ${userNumber} (${botInfo.isPremium ? 'Premium' : 'Free'}), attempt #${botInfo.reconnectAttempts}`);
    
    // Remove from queue
    subBots.reconnectQueue.shift();
    
    // Reinitialize the sub-bot
    initSubBot(userNumber, botInfo.isPremium, botInfo.options)
        .then(() => {
            logger.success(`Successfully reconnected sub-bot ${userNumber}`);
            
            // Process next in queue with a delay
            setTimeout(processReconnectQueue, 5000);
        })
        .catch(err => {
            logger.error(`Failed to reconnect sub-bot ${userNumber}: ${err.message}`);
            
            // Re-add to end of queue for another attempt
            if (!subBots.reconnectQueue.includes(userNumber)) {
                subBots.reconnectQueue.push(userNumber);
            }
            
            // Process next in queue with a delay
            setTimeout(processReconnectQueue, 5000);
        });
};

/**
 * Send a message to all bot owners
 * @param {String} message - Message to send
 */
const sendMessageToOwner = async (message) => {
    // Get main bot socket from index.js (this is a workaround)
    const mainSock = global.mainSocket;
    
    if (!mainSock) {
        logger.error('Main socket not available for owner notification');
        return;
    }
    
    for (const owner of settings.bot.owners) {
        try {
            await mainSock.sendMessage(`${owner}@s.whatsapp.net`, { text: message });
        } catch (err) {
            logger.error(`Failed to send message to owner ${owner}: ${err.message}`);
        }
    }
};

/**
 * Create a premium sub-bot
 * @param {String} userNumber - User's WhatsApp number
 * @param {Object} customization - Custom settings for the sub-bot
 * @returns {Promise<Object>} Socket connection
 */
const createPremiumSubBot = async (userNumber, customization = {}) => {
    // Check if user is premium
    if (!await database.isPremium(userNumber)) {
        throw new Error('User is not premium');
    }
    
    // Check if sub-bot already exists
    if (subBots.premium[userNumber]) {
        return subBots.premium[userNumber].socket;
    }
    
    return await initSubBot(userNumber, true, customization);
};

/**
 * Create a free sub-bot
 * @param {String} userNumber - User's WhatsApp number
 * @returns {Promise<Object>} Socket connection
 */
const createFreeSubBot = async (userNumber) => {
    // Check if sub-bot already exists
    if (subBots.free[userNumber]) {
        return subBots.free[userNumber].socket;
    }
    
    return await initSubBot(userNumber, false);
};

/**
 * Update sub-bot customization
 * @param {String} userNumber - User's WhatsApp number
 * @param {Object} customization - New custom settings
 * @returns {Promise<Boolean>} Success status
 */
const updateSubBotCustomization = async (userNumber, customization = {}) => {
    // Check if user has a premium sub-bot
    if (!subBots.premium[userNumber]) {
        throw new Error('No premium sub-bot found for this user');
    }
    
    // Update customization options
    subBots.premium[userNumber].options = {
        ...subBots.premium[userNumber].options,
        ...customization
    };
    
    return true;
};

/**
 * Clean up unused temp files and sessions
 * Runs every 24 hours
 */
const cleanupFiles = async () => {
    const now = Date.now();
    
    // Only run once every 24 hours
    if (now - subBots.lastCleanup < 24 * 60 * 60 * 1000) return;
    
    logger.info('Running file cleanup...');
    subBots.lastCleanup = now;
    
    try {
        // Clean temp directory - files older than 24 hours
        const tempDir = path.join(process.cwd(), 'temp');
        const tempFiles = await fs.readdir(tempDir);
        
        for (const file of tempFiles) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.stat(filePath);
            
            // If file is older than 24 hours, delete it
            if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
                await fs.unlink(filePath);
                logger.debug(`Deleted old temp file: ${file}`);
            }
        }
        
        // Clean unused session directories - for non-connected sub-bots
        const sessionsDir = path.join(process.cwd(), 'sessions');
        const sessionDirs = await fs.readdir(sessionsDir);
        
        for (const dir of sessionDirs) {
            // Skip if not a sub-bot session
            if (!dir.startsWith('subbot-')) continue;
            
            const userNumber = dir.replace('subbot-', '');
            const isActive = subBots.premium[userNumber] || subBots.free[userNumber];
            
            // If sub-bot is not active and directory is older than 30 days
            if (!isActive) {
                const dirPath = path.join(sessionsDir, dir);
                const stats = await fs.stat(dirPath);
                
                if (now - stats.mtime.getTime() > 30 * 24 * 60 * 60 * 1000) {
                    await fs.remove(dirPath);
                    logger.info(`Deleted unused session directory: ${dir}`);
                }
            }
        }
        
        logger.success('File cleanup completed');
    } catch (err) {
        logger.error(`Error during file cleanup: ${err.message}`);
    }
};

// Run cleanup every hour and check if it's time for a full cleanup
setInterval(cleanupFiles, 60 * 60 * 1000);

/**
 * Pause a premium sub-bot
 * @param {String} userNumber - User's WhatsApp number
 * @returns {Promise<Boolean>} Success status
 */
const pauseSubBot = async (userNumber) => {
    // Check if user has a premium sub-bot
    if (!subBots.premium[userNumber]) {
        throw new Error('No premium sub-bot found for this user');
    }
    
    try {
        const botInfo = subBots.premium[userNumber];
        
        // If connected, gracefully disconnect
        if (botInfo.isConnected) {
            // Mark as manually paused to prevent auto-reconnect
            botInfo.manuallyPaused = true;
            
            // Send message to user
            await botInfo.socket.sendMessage(`${userNumber}@s.whatsapp.net`, {
                text: `🛑 *Premium Sub-bot Paused*\n\n` +
                      `Your premium bot has been paused as requested. Your premium days will not be counted while paused.\n\n` +
                      `Use \`!premium resume\` to restart your bot when needed.`
            });
            
            // Wait a moment for the message to be sent
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Logout and close connection
            await botInfo.socket.logout();
            
            logger.info(`Paused sub-bot for ${userNumber}`);
        }
        
        // Remove from subBots list
        delete subBots.premium[userNumber];
        
        // Remove from reconnect queue if present
        const queueIndex = subBots.reconnectQueue.indexOf(userNumber);
        if (queueIndex !== -1) {
            subBots.reconnectQueue.splice(queueIndex, 1);
        }
        
        return true;
    } catch (err) {
        logger.error(`Error pausing sub-bot for ${userNumber}: ${err.message}`);
        throw err;
    }
};

/**
 * Resume a paused premium sub-bot
 * @param {String} userNumber - User's WhatsApp number
 * @returns {Promise<Object>} Socket connection
 */
const resumeSubBot = async (userNumber) => {
    // Check if user is premium
    if (!await database.isPremium(userNumber)) {
        throw new Error('User is not premium');
    }
    
    // Get premium info and customization
    const premiumInfo = await database.getPremiumInfo(userNumber);
    if (!premiumInfo) {
        throw new Error('Premium info not found');
    }
    
    // Create new sub-bot with existing customization
    return await createPremiumSubBot(userNumber, premiumInfo.subBotCustomization || {});
};

// Export functions
module.exports = {
    createPremiumSubBot,
    createFreeSubBot,
    updateSubBotCustomization,
    pauseSubBot,
    resumeSubBot,
    getSubBots: () => ({ 
        premium: Object.keys(subBots.premium),
        free: Object.keys(subBots.free),
        total: Object.keys(subBots.premium).length + Object.keys(subBots.free).length
    }),
    cleanupFiles
};