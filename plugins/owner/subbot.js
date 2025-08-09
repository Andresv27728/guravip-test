/**
 * Sub-bot management command
 * Category: owner
 */

const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const database = require('../../lib/database');
const subBotManager = require('../../lib/subbot-manager');
const logger = require('../../utils/logger');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'SubBot',
    desc: 'Manage premium sub-bots',
    usage: '!subbot [action] [params]',
    category: 'owner',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata, args } = ctx;
        
        // Owner-only command
        if (!metadata.isOwner) {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ This command is only available to the bot owner`)
            });
        }
        
        if (!args.length || args[0].toLowerCase() === 'help') {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`🤖 *SUB-BOT MANAGER*\n\n` +
                    `Manage premium sub-bots with the following commands:\n\n` +
                    `🔹 *List All Sub-Bots*\n` +
                    `\`\`\`!subbot list\`\`\`\n\n` +
                    `🔹 *Create Sub-Bot*\n` +
                    `\`\`\`!subbot create [number] [premium|free]\`\`\`\n\n` +
                    `🔹 *Delete Sub-Bot*\n` +
                    `\`\`\`!subbot delete [number]\`\`\`\n\n` +
                    `🔹 *Customize Sub-Bot*\n` +
                    `\`\`\`!subbot customize [number] [option] [value]\`\`\`\n\n` +
                    `🔹 *Clean Files*\n` +
                    `\`\`\`!subbot cleanup\`\`\`\n\n` +
                    `Available customization options:\n` +
                    `- name: Set bot name\n` +
                    `- menu: Set menu style (buttons/list/text)\n` +
                    `- reconnect: Set auto reconnect (on/off)`)
            });
        }
        
        const action = args[0].toLowerCase();
        
        switch (action) {
            case 'list':
                return await listSubBots(sock, metadata);
                
            case 'create':
                if (args.length < 3) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`⚠️ Please specify a phone number and type (premium/free)`)
                    });
                }
                
                const phoneNumber = args[1].replace(/[^0-9]/g, '');
                const botType = args[2].toLowerCase();
                
                if (!phoneNumber || phoneNumber.length < 10) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Invalid phone number format`)
                    });
                }
                
                if (!['premium', 'free'].includes(botType)) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Invalid bot type. Choose 'premium' or 'free'`)
                    });
                }
                
                return await createSubBot(sock, metadata, phoneNumber, botType === 'premium');
                
            case 'delete':
                if (args.length < 2) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`⚠️ Please specify a phone number`)
                    });
                }
                
                const deleteNumber = args[1].replace(/[^0-9]/g, '');
                
                if (!deleteNumber || deleteNumber.length < 10) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Invalid phone number format`)
                    });
                }
                
                return await deleteSubBot(sock, metadata, deleteNumber);
                
            case 'customize':
                if (args.length < 4) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`⚠️ Usage: !subbot customize [number] [option] [value]`)
                    });
                }
                
                const customizeNumber = args[1].replace(/[^0-9]/g, '');
                const option = args[2].toLowerCase();
                const value = args.slice(3).join(' ');
                
                if (!customizeNumber || customizeNumber.length < 10) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Invalid phone number format`)
                    });
                }
                
                return await customizeSubBot(sock, metadata, customizeNumber, option, value);
                
            case 'cleanup':
                return await cleanupSubBotFiles(sock, metadata);
                
            default:
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`❌ Unknown action. Use \`!subbot help\` to see available options`)
                });
        }
    }
};

/**
 * List all sub-bots
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 */
async function listSubBots(sock, metadata) {
    try {
        const botList = subBotManager.getSubBots();
        
        let listText = `🤖 *SUB-BOT LIST*\n\n`;
        listText += `👑 *Premium Sub-Bots (${botList.premium.length}):*\n`;
        
        if (botList.premium.length > 0) {
            for (const number of botList.premium) {
                const premiumInfo = await database.getPremiumInfo(number);
                listText += `• ${number} - ${premiumInfo?.subBotCustomization?.name || 'Unknown'}\n`;
                listText += `  ↪ Expires: ${new Date(premiumInfo.expiration * 1000).toLocaleDateString()}\n`;
            }
        } else {
            listText += `• None\n`;
        }
        
        listText += `\n🔓 *Free Sub-Bots (${botList.free.length}):*\n`;
        
        if (botList.free.length > 0) {
            for (const number of botList.free) {
                listText += `• ${number}\n`;
            }
        } else {
            listText += `• None\n`;
        }
        
        listText += `\n📊 *Total: ${botList.total} sub-bots*`;
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(listText)
        });
    } catch (err) {
        logger.error(`Error listing sub-bots: ${err.message}`);
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error listing sub-bots: ${err.message}`)
        });
    }
}

/**
 * Create a new sub-bot
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 * @param {String} phoneNumber - User's phone number
 * @param {Boolean} isPremium - Whether this is a premium sub-bot
 */
async function createSubBot(sock, metadata, phoneNumber, isPremium) {
    try {
        // If premium, check if user has premium status, if not add it
        if (isPremium && !await database.isPremium(phoneNumber)) {
            // Add premium for 30 days
            await database.setPremium(phoneNumber, 30);
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Added premium status to ${phoneNumber} for 30 days`)
            });
        }
        
        // Create sub-bot
        if (isPremium) {
            await subBotManager.createPremiumSubBot(phoneNumber);
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Created premium sub-bot for ${phoneNumber}\n\nUser will need to scan the QR code to use the bot.`)
            });
        } else {
            await subBotManager.createFreeSubBot(phoneNumber);
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Created free sub-bot for ${phoneNumber}\n\nUser will need to scan the QR code to use the bot.`)
            });
        }
    } catch (err) {
        logger.error(`Error creating sub-bot: ${err.message}`);
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error creating sub-bot: ${err.message}`)
        });
    }
}

/**
 * Delete a sub-bot
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 * @param {String} phoneNumber - User's phone number
 */
async function deleteSubBot(sock, metadata, phoneNumber) {
    try {
        // Remove sub-bot session directory
        const sessionDir = path.join(process.cwd(), 'sessions', `subbot-${phoneNumber}`);
        
        if (await fs.pathExists(sessionDir)) {
            await fs.remove(sessionDir);
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ Deleted sub-bot for ${phoneNumber}`)
            });
        } else {
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`⚠️ No sub-bot found for ${phoneNumber}`)
            });
        }
    } catch (err) {
        logger.error(`Error deleting sub-bot: ${err.message}`);
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error deleting sub-bot: ${err.message}`)
        });
    }
}

/**
 * Customize a sub-bot
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 * @param {String} phoneNumber - User's phone number
 * @param {String} option - Option to customize
 * @param {String} value - New value
 */
async function customizeSubBot(sock, metadata, phoneNumber, option, value) {
    try {
        // Check if user has premium status
        if (!await database.isPremium(phoneNumber)) {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ User ${phoneNumber} does not have premium status`)
            });
        }
        
        const premiumInfo = await database.getPremiumInfo(phoneNumber);
        
        // Initialize customization object if doesn't exist
        if (!premiumInfo.subBotCustomization) {
            premiumInfo.subBotCustomization = {
                name: settings.bot.name + ' Premium',
                menuType: 'buttons',
                autoReconnect: true
            };
        }
        
        // Update based on option
        switch (option) {
            case 'name':
                if (value.length > 25) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Bot name too long. Maximum 25 characters`)
                    });
                }
                
                premiumInfo.subBotCustomization.name = value;
                break;
                
            case 'menu':
                const menuType = value.toLowerCase();
                if (!['buttons', 'list', 'text'].includes(menuType)) {
                    return await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Invalid menu type. Choose from: buttons, list, or text`)
                    });
                }
                
                premiumInfo.subBotCustomization.menuType = menuType;
                break;
                
            case 'reconnect':
                const autoReconnect = value.toLowerCase() === 'on';
                premiumInfo.subBotCustomization.autoReconnect = autoReconnect;
                break;
                
            default:
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`❌ Unknown option. Valid options: name, menu, reconnect`)
                });
        }
        
        // Update premium info
        await database.updatePremiumStatus(phoneNumber, { subBotCustomization: premiumInfo.subBotCustomization });
        
        // Try to update running sub-bot
        try {
            await subBotManager.updateSubBotCustomization(phoneNumber, { 
                [option === 'menu' ? 'menuType' : option]: 
                option === 'reconnect' ? (value.toLowerCase() === 'on') : value 
            });
        } catch (err) {
            // Not critical if fails
            logger.debug(`Couldn't update running sub-bot: ${err.message}`);
        }
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`✅ Updated ${option} for sub-bot ${phoneNumber} to: ${value}`)
        });
        
    } catch (err) {
        logger.error(`Error customizing sub-bot: ${err.message}`);
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error customizing sub-bot: ${err.message}`)
        });
    }
}

/**
 * Clean up sub-bot files
 * @param {Object} sock - Socket connection
 * @param {Object} metadata - Message metadata
 */
async function cleanupSubBotFiles(sock, metadata) {
    try {
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`🔄 Cleaning up files... This may take a moment`)
        });
        
        await subBotManager.cleanupFiles();
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`✅ Files cleanup completed successfully`)
        });
    } catch (err) {
        logger.error(`Error cleaning up files: ${err.message}`);
        
        await sock.sendMessage(metadata.from, {
            text: formatMessage(`❌ Error cleaning up files: ${err.message}`)
        });
    }
}