/**
 * Status command
 * Category: public
 */

const os = require('os');
const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const helper = require('../../utils/helper');

// Start time to calculate uptime
const startTime = Date.now();

module.exports = {
    name: 'Status',
    desc: 'Check bot status and system information',
    usage: '!status',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata } = ctx;
        
        // Calculate uptime
        const uptime = Date.now() - startTime;
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        // Format uptime
        let formattedUptime = '';
        if (days > 0) formattedUptime += `${days}d `;
        if (hours > 0) formattedUptime += `${hours}h `;
        if (minutes > 0) formattedUptime += `${minutes}m `;
        formattedUptime += `${seconds}s`;
        
        // Get system information
        const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
        const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
        const usedMem = Math.round((totalMem - freeMem) * 100) / 100;
        const memPercentage = Math.round((usedMem / totalMem) * 100);
        
        // Get CPU load
        const cpus = os.cpus();
        const cpuCount = cpus.length;
        const cpuModel = cpus[0].model;
        const loadAvg = os.loadavg()[0];
        const cpuPercentage = Math.round((loadAvg / cpuCount) * 100);
        
        // Format status message
        let statusText = `📊 *BOT STATUS*\n\n`;
        
        // Bot status
        statusText += `🤖 *BOT INFO*\n`;
        statusText += `• Name: ${settings.bot.name}\n`;
        statusText += `• Prefix: ${settings.bot.prefix}\n`;
        statusText += `• Version: ${settings.bot.version || '1.0.0'}\n`;
        statusText += `• Uptime: ${formattedUptime}\n\n`;
        
        // System status
        statusText += `💻 *SYSTEM INFO*\n`;
        statusText += `• Platform: ${os.platform()} ${os.release()}\n`;
        statusText += `• CPU: ${cpuModel}\n`;
        statusText += `• CPU Usage: ${cpuPercentage}%\n`;
        statusText += `• Cores: ${cpuCount}\n`;
        statusText += `• Memory: ${usedMem}/${totalMem} GB (${memPercentage}%)\n`;
        statusText += `• Node.js: ${process.version}\n\n`;
        
        // Response time
        const start = Date.now();
        const responseMsg = await sock.sendMessage(metadata.from, { 
            text: formatMessage(`🔄 Calculating response time...`) 
        });
        
        const responseTime = Date.now() - start;
        
        // Update message with response time
        statusText += `📡 *CONNECTION INFO*\n`;
        statusText += `• Response Time: ${responseTime}ms\n`;
        statusText += `• Status: Online\n\n`;
        
        // Add usage statistics
        const database = require('../../lib/database');
        const userData = await database.getUserData(metadata.senderNumber);
        
        statusText += `📈 *YOUR USAGE*\n`;
        statusText += `• Commands Used: ${userData.commandsUsed}\n`;
        
        // Add premium status if applicable
        const isPremium = await database.isPremium(metadata.senderNumber);
        if (isPremium) {
            const premiumInfo = await database.getPremiumInfo(metadata.senderNumber);
            statusText += `• Premium: ✅ (${premiumInfo.formatted} remaining)\n`;
        } else {
            statusText += `• Premium: ❌\n`;
        }
        
        // Send status message
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(statusText),
            edit: responseMsg.key
        });
    }
};