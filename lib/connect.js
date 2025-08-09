/**
 * Connection handler for Baileys library
 */

const { proto, getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const settings = require('../config/settings');
const logger = require('../utils/logger');

/**
 * Parse message to get content and type
 * @param {Object} msg - The message object
 * @returns {Object} Parsed message data
 */
const parseMessage = (msg) => {
    const type = getContentType(msg.message);
    const content = type === 'conversation' ? msg.message.conversation :
                    type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
                    type === 'imageMessage' ? msg.message.imageMessage.caption :
                    type === 'videoMessage' ? msg.message.videoMessage.caption :
                    '';
    
    return { content, type };
};

/**
 * Get message metadata
 * @param {Object} msg - The message object
 * @returns {Object} Message metadata
 */
const getMessageMetadata = (msg) => {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const isOwner = settings.bot.owners.includes(senderNumber);
    
    return {
        id: msg.key.id,
        from: msg.key.remoteJid,
        sender,
        senderNumber,
        isGroup,
        isOwner,
        quotedMsg: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null,
        quotedSender: msg.message?.extendedTextMessage?.contextInfo?.participant || null,
        mentionedJids: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
        timestamp: msg.messageTimestamp
    };
};

/**
 * Download media from message
 * @param {Object} sock - The socket connection
 * @param {Object} msg - The message containing media
 * @returns {Promise<String>} Path to downloaded file
 */
const downloadMedia = async (sock, msg) => {
    try {
        const type = getContentType(msg.message);
        if (!type || !type.includes('Message')) return null;
        
        const buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            {
                logger,
                reuploadRequest: sock.updateMediaMessage
            }
        );
        
        const fileName = `${uuidv4()}.${type.replace('Message', '')}`;
        const filePath = path.join(process.cwd(), 'temp', fileName);
        
        await fs.writeFile(filePath, buffer);
        return filePath;
    } catch (error) {
        logger.error('Error downloading media:', error);
        return null;
    }
};

/**
 * Send text message
 * @param {Object} sock - The socket connection 
 * @param {String} to - Target jid
 * @param {String} text - Message content
 * @param {Object} options - Additional options
 */
const sendText = async (sock, to, text, options = {}) => {
    try {
        await sock.sendMessage(to, { text }, { ...options });
    } catch (error) {
        logger.error('Error sending text message:', error);
    }
};

/**
 * Send media message
 * @param {Object} sock - The socket connection
 * @param {String} to - Target jid
 * @param {String|Buffer} media - Path to file or buffer
 * @param {String} caption - Media caption
 * @param {String} type - Media type (image, video, audio, document)
 * @param {Object} options - Additional options
 */
const sendMedia = async (sock, to, media, caption = '', type = 'image', options = {}) => {
    try {
        let mediaObject = {};
        
        // Determine if media is URL, file path, or buffer
        if (typeof media === 'string' && media.startsWith('http')) {
            const response = await axios.get(media, { responseType: 'arraybuffer' });
            media = Buffer.from(response.data, 'binary');
        } else if (typeof media === 'string' && fs.existsSync(media)) {
            media = fs.readFileSync(media);
        }
        
        // Create media object based on type
        switch (type) {
            case 'image':
                mediaObject = { image: media, caption };
                break;
            case 'video':
                mediaObject = { video: media, caption };
                break;
            case 'audio':
                mediaObject = { audio: media, mimetype: 'audio/mp4' };
                break;
            case 'document':
                mediaObject = { document: media, mimetype: 'application/octet-stream', fileName: options.fileName || 'file' };
                break;
            default:
                mediaObject = { image: media, caption };
        }
        
        await sock.sendMessage(to, mediaObject, { ...options });
    } catch (error) {
        logger.error('Error sending media message:', error);
    }
};

/**
 * Send a reaction to a message
 * @param {Object} sock - The socket connection
 * @param {String} jid - Chat JID
 * @param {Array} keys - Message keys to react to
 * @param {String} reaction - Reaction emoji
 */
const sendReaction = async (sock, jid, keys, reaction) => {
    try {
        await sock.sendMessage(jid, { 
            react: {
                text: reaction,
                key: keys
            }
        });
    } catch (error) {
        logger.error('Error sending reaction:', error);
    }
};

/**
 * Format a message with bot styling
 * @param {String} text - Message text
 * @param {Boolean} footer - Add footer
 * @returns {String} Formatted message
 */
const formatMessage = (text, footer = true) => {
    const botName = settings.bot.name;
    const botEmoji = settings.bot.emoji;
    const footerText = settings.message.footer;
    
    let formattedText = `${botEmoji} *${botName}*\n\n${text}`;
    
    if (footer) {
        formattedText += `\n\n_${footerText}_`;
    }
    
    return formattedText;
};

module.exports = {
    parseMessage,
    getMessageMetadata,
    downloadMedia,
    sendText,
    sendMedia,
    sendReaction,
    formatMessage
};