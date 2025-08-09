/**
 * Core functions for processing messages and commands
 */

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const { parseMessage, getMessageMetadata, downloadMedia, sendText, sendReaction, formatMessage } = require('./connect');
const { getUserData, getGroupData, setPremium, isPremium } = require('./database');
const settings = require('../config/settings');
const logger = require('../utils/logger');

/**
 * Check command permission level
 * @param {String} command - Command name
 * @param {Object} userData - User data
 * @returns {Boolean} - Whether user can access this command
 */
const checkPermission = (command, userData) => {
    // Owner has access to everything
    if (userData.isOwner) return true;
    
    // Get command category
    const pluginPath = path.join(process.cwd(), 'plugins');
    let category = '';
    
    // Check in which category the command exists
    const categories = ['admin', 'download', 'games', 'owner', 'premium', 'public'];
    for (const cat of categories) {
        const cmdFile = path.join(pluginPath, cat, `${command}.js`);
        if (fs.existsSync(cmdFile)) {
            category = cat;
            break;
        }
    }
    
    // Permission rules
    switch (category) {
        case 'owner':
            return userData.isOwner;
            
        case 'admin':
            return userData.isAdmin || userData.isOwner;
            
        case 'premium':
            return isPremium(userData.id) || userData.isOwner;
            
        case 'public':
            return true;
            
        case 'download':
        case 'games':
            // Public users have limited access to download/games commands
            if (!isPremium(userData.id) && !userData.isOwner) {
                // Check if command is in allowed public commands
                // This would require additional implementation
                return userData.publicCommandsUsed < settings.subbots.public_commands;
            }
            return true;
            
        default:
            // Unknown category
            return false;
    }
};

/**
 * Process incoming messages
 * @param {Object} sock - The socket connection
 * @param {Object} msg - Incoming message
 * @param {Object} plugins - Loaded plugins
 */
const processMessage = async (sock, msg, plugins) => {
    try {
        // Skip status broadcasts and messages without content
        if (msg.key.remoteJid === 'status@broadcast' || !msg.message) return;
        
        // Parse message content
        const { content, type } = parseMessage(msg);
        if (!content) return;
        
        // Get message metadata
        const metadata = getMessageMetadata(msg);
        
        // Get user data
        const userData = await getUserData(metadata.senderNumber);
        userData.isOwner = metadata.isOwner;
        
        // Set user as admin if in a group and is admin
        if (metadata.isGroup) {
            const groupData = await getGroupData(metadata.from);
            const groupAdmins = groupData.admins || [];
            userData.isAdmin = groupAdmins.includes(metadata.sender);
        }
        
        // Check if message is a command
        const prefix = settings.bot.prefix;
        if (!content.startsWith(prefix)) return;
        
        // Parse command and arguments
        const [cmd, ...args] = content.slice(prefix.length).trim().split(' ');
        const command = cmd.toLowerCase();
        
        // Special command to set premium status
        if (command === 'vip' && userData.isOwner) {
            // Format: !vip 1234567890 30
            const targetNumber = args[0];
            const days = parseInt(args[1]);
            
            if (!targetNumber || isNaN(days)) {
                await sendText(sock, metadata.from, formatMessage('Usage: !vip <number> <days>'));
                return;
            }
            
            // Set premium status
            const result = await setPremium(targetNumber, days);
            await sendText(sock, metadata.from, formatMessage(`Premium status set for ${targetNumber} for ${days} days.`));
            
            // Notify target user
            await sendText(sock, `${targetNumber}@s.whatsapp.net`, 
                formatMessage(`🎉 Congratulations! You have been granted Premium status for ${days} days!

*Benefits:*
- Access to all premium commands
- Unlimited downloads
- Priority support
- And much more!

Thank you for your support!`));
            
            return;
        }
        
        // Check if command exists
        if (!plugins[command]) {
            await sendReaction(sock, metadata.from, msg.key, '❓');
            return;
        }
        
        // Check permission
        if (!checkPermission(command, userData)) {
            await sendReaction(sock, metadata.from, msg.key, '🔒');
            await sendText(sock, metadata.from, formatMessage('You don\'t have permission to use this command. Upgrade to premium!'));
            return;
        }
        
        // Show typing indicator
        if (settings.message.auto_typing) {
            await sock.presenceSubscribe(metadata.from);
            await sock.sendPresenceUpdate('composing', metadata.from);
        }
        
        // Mark message as read
        if (settings.message.read_messages) {
            await sock.readMessages([msg.key]);
        }
        
        // Execute command
        logger.info(`Executing command: ${command} by ${metadata.senderNumber}`);
        await sendReaction(sock, metadata.from, msg.key, '⏳');
        
        try {
            // Create context object
            const ctx = {
                sock,
                message: msg,
                args,
                metadata,
                userData,
                downloadMedia: () => downloadMedia(sock, msg)
            };
            
            // Execute the plugin
            await plugins[command].execute(ctx);
            await sendReaction(sock, metadata.from, msg.key, '✅');
        } catch (error) {
            logger.error(`Error executing command ${command}: ${error.stack}`);
            await sendReaction(sock, metadata.from, msg.key, '❌');
            await sendText(sock, metadata.from, formatMessage(`Error executing command: ${error.message}`));
        }
        
    } catch (error) {
        logger.error(`Error processing message: ${error.stack}`);
    }
};

/**
 * Get human-readable file size
 * @param {Number} bytes - File size in bytes
 * @returns {String} - Human-readable file size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format time duration
 * @param {Number} seconds - Duration in seconds
 * @returns {String} - Formatted duration
 */
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
        hours > 0 ? `${hours}h` : '',
        minutes > 0 ? `${minutes}m` : '',
        `${secs}s`
    ].filter(Boolean).join(' ');
};

module.exports = {
    checkPermission,
    processMessage,
    formatFileSize,
    formatDuration
};