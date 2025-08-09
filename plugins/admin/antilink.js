/**
 * AntiLink command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');
const database = require('../../lib/database');
const logger = require('../../utils/logger');

module.exports = {
    name: 'AntiLink',
    desc: 'Enable or disable anti-link feature in groups',
    usage: '!antilink on/off',
    
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
                text: formatMessage('❌ I need to be an admin to use the anti-link feature!') 
            });
            return;
        }
        
        // Check for arguments
        if (args.length === 0) {
            // Check current status
            const groupData = await database.getGroupData(metadata.from);
            const status = groupData.antilink ? '✅ ON' : '❌ OFF';
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`📝 *Anti-Link Status*: ${status}\n\nUse \`!antilink on\` to enable or \`!antilink off\` to disable`) 
            });
            return;
        }
        
        // Enable or disable anti-link
        const option = args[0].toLowerCase();
        
        if (option === 'on' || option === 'enable' || option === '1') {
            // Enable anti-link
            await database.updateGroupSetting(metadata.from, 'antilink', true);
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('✅ Anti-Link has been *ENABLED*!\n\nLinks sent by non-admins will be deleted and the sender may be warned or kicked.') 
            });
            
        } else if (option === 'off' || option === 'disable' || option === '0') {
            // Disable anti-link
            await database.updateGroupSetting(metadata.from, 'antilink', false);
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Anti-Link has been *DISABLED*!\n\nGroup members can now send links freely.') 
            });
            
        } else {
            // Invalid option
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❓ Invalid option! Use \`!antilink on\` to enable or \`!antilink off\` to disable') 
            });
        }
    }
};