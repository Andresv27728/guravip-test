/**
 * Premium command
 * Category: public
 */

const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const database = require('../../lib/database');
const subBotManager = require('../../lib/subbot-manager');

module.exports = {
    name: 'Premium',
    desc: 'Check premium status and benefits',
    usage: '!premium [config] [option] [value]',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata, args } = ctx;
        
        // Check if user is premium
        const isPremium = await database.isPremium(metadata.senderNumber);
        const premiumInfo = isPremium ? await database.getPremiumInfo(metadata.senderNumber) : null;
        
        // Handle configuration if premium user
        if (isPremium && args.length > 0) {
            const subCmd = args[0].toLowerCase();
            if (subCmd === 'config') {
                return await handlePremiumConfig(sock, metadata, args.slice(1), premiumInfo);
            } else if (subCmd === 'pause' || subCmd === 'resume') {
                return await handlePremiumSubBotStatus(sock, metadata, subCmd, premiumInfo);
            }
        }
        
        // Premium benefits
        const benefits = [
            "✅ Access to all 100+ commands",
            "✅ Unlimited downloads",
            "✅ Access to all premium features",
            "✅ Priority processing",
            "✅ Ad-free experience",
            "✅ 24/7 support from bot owner",
            "✅ Full quality media downloads",
            "✅ No usage limits",
            "✅ Access to exclusive commands",
            "✅ Custom sub-bot configuration",
            "✅ Menu customization options",
            "✅ Priority auto-reconnect"
        ];
        
        // Format message
        let premiumText = `👑 *PREMIUM MEMBERSHIP*\n\n`;
        
        // User premium status
        premiumText += `📊 *YOUR STATUS*\n`;
        if (isPremium) {
            premiumText += `• Status: 👑 Premium\n`;
            premiumText += `• Remaining: ${premiumInfo.formatted}\n`;
            premiumText += `• Expires: ${new Date(premiumInfo.expiration * 1000).toLocaleString()}\n`;
            
            // Show custom settings if premium
            premiumText += `• Menu Style: ${premiumInfo.subBotCustomization?.menuType || 'buttons'}\n`;
            premiumText += `• Custom Name: ${premiumInfo.subBotCustomization?.name || settings.bot.name + ' Premium'}\n\n`;
            
            premiumText += `💡 *To configure your premium bot:*\n`;
            premiumText += `\`\`\`!premium config help\`\`\`\n\n`;
        } else {
            premiumText += `• Status: 🔓 Free\n\n`;
            premiumText += `👋 *You're currently using the free version with limited access*\n\n`;
        }
        
        // Premium benefits
        premiumText += `🌟 *PREMIUM BENEFITS*\n`;
        benefits.forEach(benefit => {
            premiumText += `${benefit}\n`;
        });
        premiumText += '\n';
        
        // Pricing info
        premiumText += `💰 *PRICING*\n`;
        premiumText += `• 7 days: ${settings.premium.price_7d || '$5'}\n`;
        premiumText += `• 30 days: ${settings.premium.price_30d || '$15'}\n`;
        premiumText += `• 90 days: ${settings.premium.price_90d || '$30'}\n\n`;
        
        // How to get premium
        premiumText += `📱 *HOW TO GET PREMIUM*\n`;
        premiumText += `Contact the bot owner to purchase premium access:\n`;
        
        // Owner contact info
        const ownerNumber = settings.bot.owners[0];
        premiumText += `👤 Owner: wa.me/${ownerNumber}\n\n`;
        
        // Command usage
        if (!isPremium) {
            premiumText += `💡 *Use the command below to claim your premium access:*\n`;
            premiumText += `\`\`\`!redeem YOUR_CODE\`\`\`\n\n`;
        }
        
        // Footer message
        premiumText += `🔥 Upgrade now to unlock the full power of ${settings.bot.name} Bot!`;
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(premiumText)
        });
    }
};

/**
 * Handle premium configuration
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 * @param {Array} args - Command arguments
 * @param {Object} premiumInfo - Premium user info
 */
/**
 * Handle premium sub-bot status (pause/resume)
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 * @param {String} action - Action to perform (pause/resume)
 * @param {Object} premiumInfo - Premium user info
 */
async function handlePremiumSubBotStatus(sock, metadata, action, premiumInfo) {
    try {
        // Update pause status in database
        const isPaused = action === 'pause';
        
        // Update premium info
        premiumInfo.subBotPaused = isPaused;
        await database.updatePremiumStatus(metadata.senderNumber, { subBotPaused: isPaused });
        
        if (isPaused) {
            // Try to stop the sub-bot if it's running
            try {
                await subBotManager.pauseSubBot(metadata.senderNumber);
                
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⏸️ Your premium bot has been paused. Your premium days will not be counted while paused.\n\nUse \`!premium resume\` to resume your bot.`)
                });
            } catch (err) {
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Your premium status has been paused but there was an error stopping your bot: ${err.message}\n\nYour premium days will not be counted.`)
                });
            }
        } else {
            // Try to restart the sub-bot
            try {
                await subBotManager.resumeSubBot(metadata.senderNumber);
                
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`▶️ Your premium bot has been resumed. Premium days will continue to count down.\n\nUse \`!premium pause\` to pause your bot and stop counting premium days.`)
                });
            } catch (err) {
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Your premium status has been resumed but there was an error starting your bot: ${err.message}\n\nPlease contact the bot owner.`)
                });
            }
        }
    } catch (err) {
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error ${action === 'pause' ? 'pausing' : 'resuming'} your premium bot: ${err.message}`)
        });
    }
}

async function handlePremiumConfig(sock, metadata, args, premiumInfo) {
    if (!args.length || args[0].toLowerCase() === 'help') {
        return await sock.sendMessage(metadata.from, {
            text: formatMessage(`🛠️ *PREMIUM BOT CONFIGURATION*\n\n` +
                `Configure your premium bot with the following commands:\n\n` +
                `🔹 *Menu Style*\n` +
                `\`\`\`!premium config menu buttons\`\`\`\n` +
                `\`\`\`!premium config menu list\`\`\`\n` +
                `\`\`\`!premium config menu text\`\`\`\n\n` +
                `🔹 *Custom Name*\n` +
                `\`\`\`!premium config name Your Bot Name\`\`\`\n\n` +
                `🔹 *Custom Profile*\n` +
                `Send an image with caption:\n` +
                `\`\`\`!premium config profile\`\`\`\n\n` +
                `🔹 *Auto Reconnect*\n` +
                `\`\`\`!premium config reconnect on\`\`\`\n` +
                `\`\`\`!premium config reconnect off\`\`\`\n\n` +
                `🔹 *Pause/Resume*\n` +
                `\`\`\`!premium pause\`\`\`\n` +
                `\`\`\`!premium resume\`\`\`\n\n` +
                `🔹 *View Current Settings*\n` +
                `\`\`\`!premium config show\`\`\``)
        });
    }
    
    const option = args[0].toLowerCase();
    
    // Initialize customization object if doesn't exist
    if (!premiumInfo.subBotCustomization) {
        premiumInfo.subBotCustomization = {
            name: settings.bot.name + ' Premium',
            menuType: 'buttons',
            autoReconnect: true
        };
    }
    
    switch (option) {
        case 'menu':
            if (!args[1]) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Please specify a menu style: buttons, list, or text`)
                });
            }
            
            const menuType = args[1].toLowerCase();
            if (!['buttons', 'list', 'text'].includes(menuType)) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`❌ Invalid menu type. Choose from: buttons, list, or text`)
                });
            }
            
            // Update premium info
            premiumInfo.subBotCustomization.menuType = menuType;
            await database.updatePremiumStatus(metadata.senderNumber, { subBotCustomization: premiumInfo.subBotCustomization });
            
            // Update sub-bot if exists
            try {
                await subBotManager.updateSubBotCustomization(metadata.senderNumber, { menuType });
            } catch (err) {
                // Not critical if fails, will apply on next start
            }
            
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Menu style updated to: *${menuType}*`)
            });
            
        case 'name':
            if (args.length < 2) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Please provide a name for your bot`)
                });
            }
            
            const botName = args.slice(1).join(' ');
            if (botName.length > 25) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`❌ Bot name too long. Maximum 25 characters`)
                });
            }
            
            // Update premium info
            premiumInfo.subBotCustomization.name = botName;
            await database.updatePremiumStatus(metadata.senderNumber, { subBotCustomization: premiumInfo.subBotCustomization });
            
            // Update sub-bot if exists
            try {
                await subBotManager.updateSubBotCustomization(metadata.senderNumber, { name: botName });
            } catch (err) {
                // Not critical if fails, will apply on next start
            }
            
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Bot name updated to: *${botName}*\n\nThis will apply the next time your sub-bot is started.`)
            });
            
        case 'profile':
            // Check if message has quoted image
            const quotedMsg = metadata.quotedMsg;
            if (!quotedMsg || !['imageMessage'].includes(quotedMsg.type)) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Please send or quote an image with the command to set as profile picture`)
                });
            }
            
            // To be implemented in future update
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`🔄 Profile picture update will be available in the next update`)
            });
            
        case 'reconnect':
            if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ Please specify 'on' or 'off' for auto reconnect`)
                });
            }
            
            const autoReconnect = args[1].toLowerCase() === 'on';
            
            // Update premium info
            premiumInfo.subBotCustomization.autoReconnect = autoReconnect;
            await database.updatePremiumStatus(metadata.senderNumber, { subBotCustomization: premiumInfo.subBotCustomization });
            
            // Update sub-bot if exists
            try {
                await subBotManager.updateSubBotCustomization(metadata.senderNumber, { autoReconnect });
            } catch (err) {
                // Not critical if fails, will apply on next start
            }
            
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Auto reconnect has been turned *${autoReconnect ? 'ON' : 'OFF'}*`)
            });
            
        case 'show':
            // Format current settings
            const customization = premiumInfo.subBotCustomization;
            let settingsText = `🛠️ *CURRENT BOT SETTINGS*\n\n`;
            settingsText += `• Bot Name: ${customization.name || settings.bot.name + ' Premium'}\n`;
            settingsText += `• Menu Style: ${customization.menuType || 'buttons'}\n`;
            settingsText += `• Auto Reconnect: ${customization.autoReconnect ? 'ON' : 'OFF'}\n`;
            
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(settingsText)
            });
            
        default:
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ Unknown configuration option. Use \`!premium config help\` to see available options`)
            });
    }
}