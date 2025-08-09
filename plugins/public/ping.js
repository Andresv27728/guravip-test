/**
 * Ping command
 * Category: public
 */

const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');

module.exports = {
    name: 'Ping',
    desc: 'Check bot response time',
    usage: '!ping',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata } = ctx;
        
        // Record start time
        const start = Date.now();
        
        // Send initial message
        const pingMsg = await sock.sendMessage(metadata.from, { 
            text: formatMessage(`🏓 *Pinging...*`) 
        });
        
        // Calculate response time
        const responseTime = Date.now() - start;
        
        // Update message with response time
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(`🏓 *Pong!*\n\n⏱️ Response time: *${responseTime}ms*\n🤖 Bot status: *Online*`),
            edit: pingMsg.key
        });
    }
};