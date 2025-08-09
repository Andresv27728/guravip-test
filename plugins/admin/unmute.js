/**
 * Unmute command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');

module.exports = {
    name: 'Unmute',
    desc: 'Unmute the group chat (everyone can send messages)',
    usage: '!unmute',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if the command is used in a group
        if (!metadata.isGroup) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command can only be used in groups!') 
            });
            return;
        }
        
        // Check if the user is an admin
        const isAdmin = metadata.isGroupAdmin || metadata.fromMe;
        if (!isAdmin) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ You need to be an admin to use this command!') 
            });
            return;
        }
        
        // Check if the bot is an admin
        if (!metadata.isBotAdmin) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ I need to be an admin to unmute the group!') 
            });
            return;
        }
        
        try {
            // Set group to all-participant messages
            await sock.groupSettingUpdate(metadata.from, 'not_announcement');
            
            // Send success message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('🔊 Group has been unmuted! Everyone can send messages now.')
            });
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};