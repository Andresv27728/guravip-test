/**
 * Broadcast command
 * Category: owner
 */

const { formatMessage } = require('../../lib/connect');
const { isOwner } = require('../../lib/functions');

module.exports = {
    name: 'Broadcast',
    desc: 'Send a message to all groups the bot is in',
    usage: '!broadcast <message>',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if user is owner
        if (!isOwner(metadata.sender)) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Only the bot owner can use this command!') 
            });
            return;
        }
        
        // Check if message is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide a message to broadcast!\n\n📝 Usage: !broadcast <message>') 
            });
            return;
        }
        
        const broadcastMessage = args.join(' ');
        
        try {
            // Get all groups
            const groups = Object.keys(await sock.groupFetchAllParticipating());
            
            let successCount = 0;
            let failCount = 0;
            
            // Send status message first
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`🔄 Broadcasting message to ${groups.length} groups...`) 
            });
            
            // Send to all groups
            for (const group of groups) {
                try {
                    await sock.sendMessage(group, { 
                        text: formatMessage(`📢 *BROADCAST MESSAGE*\n\n${broadcastMessage}`) 
                    });
                    successCount++;
                } catch (err) {
                    failCount++;
                    console.error(`Failed to broadcast to ${group}: ${err.message}`);
                }
            }
            
            // Send completion message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`✅ Broadcast completed!\n\n✓ Sent to: ${successCount} groups\n✗ Failed: ${failCount} groups`) 
            });
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};