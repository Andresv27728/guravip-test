/**
 * Add command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');
const logger = require('../../utils/logger');

module.exports = {
    name: 'Add',
    desc: 'Add a participant to the group',
    usage: '!add phoneNumber',
    
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
                text: formatMessage('❌ I need to be an admin to add users!') 
            });
            return;
        }
        
        // Check if a phone number is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ You need to provide a phone number!\n\n📝 Usage: !add phoneNumber')
            });
            return;
        }
        
        // Format the phone number
        let phoneNumber = args[0];
        
        // Remove any + or - characters
        phoneNumber = phoneNumber.replace(/[+\- ]/g, '');
        
        // Check if the number contains @s.whatsapp.net or @g.us
        if (!phoneNumber.includes('@')) {
            // Add @s.whatsapp.net if it doesn't have it
            phoneNumber = `${phoneNumber}@s.whatsapp.net`;
        }
        
        // Attempt to add user
        try {
            // Check if the user exists on WhatsApp
            const [result] = await sock.onWhatsApp(phoneNumber);
            
            if (!result || !result.exists) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('❌ The provided number is not registered on WhatsApp!') 
                });
                return;
            }
            
            // Add user to group
            const response = await sock.groupParticipantsUpdate(metadata.from, [result.jid], 'add');
            logger.debug('Add user response:', JSON.stringify(response));
            
            // Check response
            if (response && response[0] && response[0].status === '200') {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`✅ @${result.jid.split('@')[0]} has been added to the group!`), 
                    mentions: [result.jid]
                });
            } else if (response && response[0] && response[0].status === '403') {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`❌ Failed to add @${phoneNumber.split('@')[0]} to the group. They may have their privacy settings set to not be added to groups.`),
                    mentions: [phoneNumber]
                });
            } else if (response && response[0] && response[0].status === '408') {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`❌ The user @${phoneNumber.split('@')[0]} has already been invited to this group.`),
                    mentions: [phoneNumber]
                });
            } else if (response && response[0] && response[0].status === '409') {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`❌ The user @${phoneNumber.split('@')[0]} is already in this group.`),
                    mentions: [phoneNumber]
                });
            } else {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`❌ Failed to add @${phoneNumber.split('@')[0]} to the group. Unknown error.`),
                    mentions: [phoneNumber]
                });
            }
        } catch (error) {
            logger.error('Error in add command:', error);
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};