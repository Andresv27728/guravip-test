/**
 * Welcome command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');
const database = require('../../lib/database');
const logger = require('../../utils/logger');

module.exports = {
    name: 'Welcome',
    desc: 'Enable or disable welcome messages in groups',
    usage: '!welcome on/off/set <message>',
    
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
        
        // Check for arguments
        if (args.length === 0) {
            // Check current status
            const groupData = await database.getGroupData(metadata.from);
            const status = groupData.welcome ? '✅ ON' : '❌ OFF';
            let welcomeMessage = groupData.welcomeMessage || 'Welcome @user to @group!';
            
            // Format help message
            let helpMsg = `📝 *Welcome Message Status*: ${status}\n\n`;
            helpMsg += `*Current welcome message:*\n${welcomeMessage}\n\n`;
            helpMsg += `*Available commands:*\n`;
            helpMsg += `• \`!welcome on\` - Enable welcome messages\n`;
            helpMsg += `• \`!welcome off\` - Disable welcome messages\n`;
            helpMsg += `• \`!welcome set <message>\` - Set custom welcome message\n\n`;
            helpMsg += `*Variables you can use:*\n`;
            helpMsg += `• @user - Mentions the new user\n`;
            helpMsg += `• @group - Shows the group name\n`;
            helpMsg += `• @desc - Shows the group description\n`;
            helpMsg += `• @count - Shows the number of participants`;
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(helpMsg) 
            });
            return;
        }
        
        const option = args[0].toLowerCase();
        
        if (option === 'on' || option === 'enable' || option === '1') {
            // Enable welcome messages
            await database.updateGroupSetting(metadata.from, 'welcome', true);
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('✅ Welcome messages have been *ENABLED*!\n\nNew members will be greeted with a welcome message.') 
            });
            
        } else if (option === 'off' || option === 'disable' || option === '0') {
            // Disable welcome messages
            await database.updateGroupSetting(metadata.from, 'welcome', false);
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Welcome messages have been *DISABLED*!') 
            });
            
        } else if (option === 'set' || option === 'message' || option === 'msg') {
            // Set custom welcome message
            if (args.length < 2) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('❌ Please provide a welcome message!\n\nExample: !welcome set Welcome @user to @group! Read our rules: @desc') 
                });
                return;
            }
            
            // Get the custom message
            const customMessage = args.slice(1).join(' ');
            
            // Update the custom message
            await database.updateGroupSetting(metadata.from, 'welcomeMessage', customMessage);
            
            // Preview the message
            let previewMsg = customMessage
                .replace('@user', `@${metadata.senderNumber}`)
                .replace('@group', metadata.groupName || 'Group Name')
                .replace('@desc', 'Group description will appear here')
                .replace('@count', '100');
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`✅ Welcome message has been set!\n\n*Preview:*\n${previewMsg}`),
                mentions: [`${metadata.senderNumber}@s.whatsapp.net`]
            });
            
        } else {
            // Invalid option
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❓ Invalid option! Use \`!welcome on\`, \`!welcome off\`, or \`!welcome set <message>\`') 
            });
        }
    }
};