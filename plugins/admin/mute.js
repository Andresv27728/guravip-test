/**
 * Mute command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');

module.exports = {
    name: 'Mute',
    desc: 'Mute the group chat (only admins can send messages)',
    usage: '!mute',
    
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
                text: formatMessage('❌ I need to be an admin to mute the group!') 
            });
            return;
        }
        
        try {
            // Set group to admin-only messages
            await sock.groupSettingUpdate(metadata.from, 'announcement');
            
            // Send success message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('🔇 Group has been muted! Only admins can send messages now.')
            });
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};