/**
 * Kick command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');

module.exports = {
    name: 'Kick',
    desc: 'Remove a participant from the group',
    usage: '!kick @user [reason]',
    
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
                text: formatMessage('❌ I need to be an admin to kick users!') 
            });
            return;
        }
        
        // Check if the user is mentioned
        if (!message.message.extendedTextMessage || !message.message.extendedTextMessage.contextInfo || !message.message.extendedTextMessage.contextInfo.mentionedJid) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ You need to mention the user you want to kick!\n\n📝 Usage: !kick @user [reason]') 
            });
            return;
        }
        
        // Get mentioned user
        const mentionedJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        
        // Get reason if provided
        let reason = args.slice(1).join(' ');
        if (!reason) reason = 'No reason provided';
        
        // Check if the mentioned user is an admin
        try {
            const groupMetadata = await sock.groupMetadata(metadata.from);
            const groupAdmins = groupMetadata.participants
                .filter(p => p.admin)
                .map(p => p.id);
            
            if (groupAdmins.includes(mentionedJid)) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('❌ You cannot kick another admin!') 
                });
                return;
            }
            
            // Attempt to kick user
            await sock.groupParticipantsUpdate(metadata.from, [mentionedJid], 'remove');
            
            // Get user name or use the number
            let kickedUser = '';
            try {
                const [result] = await sock.onWhatsApp(mentionedJid);
                kickedUser = result.exists ? result.jid : mentionedJid;
            } catch {
                kickedUser = mentionedJid;
            }
            
            // Send success message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`✅ User @${kickedUser.split('@')[0]} has been kicked from the group!\n\n📝 Reason: ${reason}`), 
                mentions: [mentionedJid]
            });
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};