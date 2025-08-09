/**
 * Info command
 * Category: public
 */

const os = require('os');
const moment = require('moment-timezone');
const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const helper = require('../../utils/helper');

let startTime = Date.now();

module.exports = {
    name: 'Info',
    desc: 'Display information about the bot',
    usage: '!info',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Calculate uptime
        const uptime = Date.now() - startTime;
        const formattedUptime = moment.duration(uptime).humanize();
        
        // Get system information
        const totalMemory = os.totalmem() / (1024 * 1024 * 1024);
        const freeMemory = os.freemem() / (1024 * 1024 * 1024);
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = process.memoryUsage().heapUsed / (1024 * 1024);
        const platform = os.platform();
        const nodeVersion = process.version;
        
        // Get bot information
        const botName = settings.bot.name;
        const prefix = settings.bot.prefix;
        const owner = settings.bot.owners[0];
        
        // Get premium status
        const isPremium = await require('../../lib/database').isPremium(metadata.senderNumber);
        const premiumInfo = isPremium ? await require('../../lib/database').getPremiumInfo(metadata.senderNumber) : null;
        
        // Format message
        let infoText = `🤖 *${botName} BOT INFO*\n\n`;
        
        // Bot information
        infoText += `📊 *BOT STATUS*\n`;
        infoText += `• Name: ${botName}\n`;
        infoText += `• Prefix: ${prefix}\n`;
        infoText += `• Uptime: ${formattedUptime}\n`;
        infoText += `• Version: ${settings.bot.version || '1.0.0'}\n`;
        infoText += `• Owner: ${settings.bot.ownerName || owner}\n\n`;
        
        // User information
        infoText += `👤 *USER INFO*\n`;
        infoText += `• Name: ${metadata.pushName || 'Unknown'}\n`;
        infoText += `• Number: ${metadata.senderNumber}\n`;
        
        // Premium status
        if (isPremium) {
            infoText += `• Status: 👑 Premium\n`;
            infoText += `• Remaining: ${premiumInfo.formatted}\n\n`;
        } else {
            infoText += `• Status: 🔓 Free\n\n`;
        }
        
        // System information
        infoText += `💻 *SYSTEM INFO*\n`;
        infoText += `• Platform: ${platform}\n`;
        infoText += `• Node: ${nodeVersion}\n`;
        infoText += `• Memory: ${usedMemory.toFixed(2)}/${totalMemory.toFixed(2)} GB\n`;
        infoText += `• Process: ${memoryUsage.toFixed(2)} MB\n\n`;
        
        // Commands
        const plugins = require('../../lib/loader').getPluginInfo();
        let totalCommands = 0;
        
        for (const category in plugins) {
            totalCommands += plugins[category].length;
        }
        
        infoText += `🔧 *COMMANDS*\n`;
        infoText += `• Total: ${totalCommands} commands\n`;
        infoText += `• Categories: ${Object.keys(plugins).length}\n\n`;
        
        infoText += `📚 Use *${prefix}help* to see all commands\n`;
        infoText += `👑 Use *${prefix}premium* to check premium benefits`;
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(infoText)
        });
    }
};