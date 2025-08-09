/**
 * Restart command
 * Category: owner
 */

const { formatMessage } = require('../../lib/connect');
const { isOwner } = require('../../lib/functions');
const { exec } = require('child_process');

module.exports = {
    name: 'Restart',
    desc: 'Restart the bot service',
    usage: '!restart',
    
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
        
        try {
            // Send notification that bot is restarting
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('🔄 Restarting bot service...\nThis will take a few moments.')
            });
            
            // Wait 2 seconds before restarting
            setTimeout(() => {
                // Execute restart command - using PM2 if available, otherwise process exit
                try {
                    exec('pm2 restart all', (error) => {
                        if (error) {
                            console.log('PM2 not found, using process.exit()');
                            process.exit(1); // This will restart the process if using a process manager
                        }
                    });
                } catch (error) {
                    process.exit(1);
                }
            }, 2000);
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message}`) 
            });
        }
    }
};