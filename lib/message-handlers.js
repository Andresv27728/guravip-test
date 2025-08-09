/**
 * Message event handlers for special features
 */

const { formatMessage } = require('./connect');
const database = require('./database');
const logger = require('../utils/logger');

/**
 * Handle anti-link feature
 * @param {Object} sock - The socket connection
 * @param {Object} msg - The message object
 * @param {Object} metadata - Message metadata
 * @returns {Boolean} True if message contained link and was handled
 */
const handleAntiLink = async (sock, msg, metadata) => {
    try {
        // Skip if not in a group
        if (!metadata.isGroup) return false;
        
        // Skip if sender is admin or bot
        if (metadata.isGroupAdmin || metadata.fromMe) return false;
        
        // Get group data
        const groupData = await database.getGroupData(metadata.from);
        
        // Skip if anti-link is disabled
        if (!groupData.antilink) return false;
        
        // Check if the bot is admin
        if (!metadata.isBotAdmin) {
            logger.warn(`Anti-link triggered but bot is not admin in ${metadata.from}`);
            return false;
        }
        
        // Check for links in the message
        const { content } = msg;
        if (!content) return false;
        
        // Regular expression for detecting links
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;
        
        if (linkRegex.test(content)) {
            // Delete the message
            await sock.sendMessage(metadata.from, { delete: msg.key });
            
            // Warn the user
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ @${metadata.senderNumber} links are not allowed in this group!`),
                mentions: [metadata.sender]
            });
            
            // Log the action
            logger.info(`Anti-link triggered: Deleted message from ${metadata.senderNumber} in ${metadata.from}`);
            
            return true;
        }
        
        return false;
    } catch (error) {
        logger.error('Error in anti-link handler:', error);
        return false;
    }
};

/**
 * Handle welcome messages for new participants
 * @param {Object} sock - The socket connection
 * @param {Object} groupUpdate - Group update data
 */
const handleWelcome = async (sock, groupUpdate) => {
    try {
        // Check if it's a participant update
        if (!groupUpdate.id || !groupUpdate.participants || groupUpdate.participants.length === 0) {
            return;
        }
        
        const groupJid = groupUpdate.id;
        
        // Get group data
        const groupData = await database.getGroupData(groupJid);
        
        // Skip if welcome messages are disabled
        if (!groupData.welcome) return;
        
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(groupJid);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || '';
        const participantCount = groupMetadata.participants.length;
        
        // Get welcome message template
        let welcomeMessage = groupData.welcomeMessage || 'Welcome @user to @group!';
        
        // Process each participant
        for (const participant of groupUpdate.participants) {
            // Skip if not an add action
            if (groupUpdate.action !== 'add') continue;
            
            // Format welcome message
            const formattedMessage = welcomeMessage
                .replace('@user', `@${participant.split('@')[0]}`)
                .replace('@group', groupName)
                .replace('@desc', groupDesc)
                .replace('@count', participantCount.toString());
            
            // Send welcome message
            await sock.sendMessage(groupJid, { 
                text: formatMessage(formattedMessage, false),
                mentions: [participant]
            });
            
            logger.info(`Welcome message sent for ${participant} in ${groupJid}`);
        }
    } catch (error) {
        logger.error('Error in welcome message handler:', error);
    }
};

module.exports = {
    handleAntiLink,
    handleWelcome
};