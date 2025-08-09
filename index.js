/**
 * WhatsApp Bot using Baileys
 * Author: Alex
 * Created: 2023
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');

// Local modules
const { initDatabase, saveDatabase } = require('./lib/database');
const { loadPlugins } = require('./lib/loader');
const { checkPermission, processMessage } = require('./lib/functions');
const { handleAntiLink, handleWelcome } = require('./lib/message-handlers');
const { parseMessage, getMessageMetadata } = require('./lib/connect');
const settings = require('./config/settings');
const logger = require('./utils/logger');
const subBotManager = require('./lib/subbot-manager');

// Create temp directory if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
    fs.mkdirSync(path.join(process.cwd(), 'temp'));
}

// Display banner
console.log(chalk.green(figlet.textSync('WA-Bot', { font: 'Standard' })));
console.log(chalk.yellow(`WhatsApp Bot v${settings.bot.version}\n`));

// Initialize database
initDatabase();

// Set interval to save database
setInterval(saveDatabase, settings.database.save_interval * 1000);

// Log startup time
const startTime = Date.now();
logger.info(`Bot starting at ${new Date().toLocaleString()}`);

// Main connection function
async function connectToWhatsApp() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    logger.info(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);
    
    // Authentication state
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    // Socket connection
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: settings.logs.level }),
        browser: ['WA-Bot', 'Chrome', '1.0.0'],
        markOnlineOnConnect: settings.message.always_online
    });
    
    // Plugins
    const plugins = loadPlugins();
    logger.info(`Loaded ${Object.keys(plugins).length} plugins`);
    
    // Auto save credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Connection update events
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if(connection === 'close') {
            const shouldReconnect = 
                (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
            logger.warn('Connection closed due to ', lastDisconnect.error);
            
            if(shouldReconnect) {
                logger.info('Reconnecting...');
                connectToWhatsApp();
            } else {
                logger.error('Connection closed. You are logged out.');
                process.exit(0);
            }
        } else if(connection === 'open') {
            logger.success(`Connected! Login as ${sock.user?.name || 'Unknown'}`);
            
            // Store main socket reference globally for sub-bot manager to access
            global.mainSocket = sock;
            
            // Send startup message to owner
            for (const owner of settings.bot.owners) {
                await sock.sendMessage(`${owner}@s.whatsapp.net`, { 
                    text: `🤖 *${settings.bot.name} is now active!*\n\nRunning version: ${settings.bot.version}` 
                });
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
                        metadata.isBotAdmin = metadata.groupAdmins.includes(sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net');
                    } catch (err) {
                        logger.error(`Error getting group metadata: ${err.message}`);
                    }
                }
                
                // Log message to console
                if (settings.logs.show_messages) {
                    const chatName = metadata.isGroup ? metadata.groupName : metadata.senderNumber;
                    const sender = metadata.isGroup ? metadata.senderNumber : 'Direct';
                    const msgContent = parsedMsg.content.length > 50 
                        ? parsedMsg.content.substring(0, 50) + '...' 
                        : parsedMsg.content;
                    
                    console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] `) + 
                        chalk.green(`${chatName} > `) + 
                        chalk.yellow(`${sender}: `) + 
                        chalk.white(`${msgContent}`));
                }
                
                // Handle anti-link before processing commands
                const linkHandled = await handleAntiLink(sock, parsedMsg, metadata);
                if (linkHandled) continue;
                
                // Process the message for commands
                await processMessage(sock, msg, plugins);
                
            } catch (err) {
                logger.error(`Error processing message: ${err.stack}`);
            }
        }
    });
    
    // Group update events
    sock.ev.on('group-participants.update', async (event) => {
        try {
            // Handle welcome messages for new participants
            await handleWelcome(sock, event);
            
            // For compatibility with existing plugins
            const { id, participants, action } = event;
            const groupMetadata = await sock.groupMetadata(id);
            
            logger.info(`Group update in ${groupMetadata.subject}: ${action} ${participants.join(', ')}`);
            
            // Load welcome plugin if exists (legacy support)
            if (plugins.welcome) {
                await plugins.welcome.execute(sock, { 
                    id, participants, action, groupMetadata 
                });
            }
        } catch (err) {
            logger.error(`Error handling group update: ${err.stack}`);
        }
    });
    
    return sock;
}

// Start the bot
connectToWhatsApp().catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
});

// Handle exit
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await saveDatabase();
    process.exit(0);
});