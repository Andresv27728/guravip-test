/**
 * Redeem premium code command
 * Category: public
 */

const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const database = require('../../lib/database');
const subBotManager = require('../../lib/subbot-manager');
const logger = require('../../utils/logger');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

// Path to premium codes file
const PREMIUM_CODES_FILE = path.join(process.cwd(), 'lib', 'database', 'premium-codes.json');

module.exports = {
    name: 'Redeem',
    desc: 'Redeem a premium code',
    usage: '!redeem [code]',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata, args } = ctx;
        
        if (!args.length) {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`⚠️ Please provide a premium code to redeem\n\nUsage: \`!redeem YOUR_CODE\``)
            });
        }
        
        const code = args[0];
        
        try {
            // Check if user is already premium
            if (await database.isPremium(metadata.senderNumber)) {
                return await sock.sendMessage(metadata.from, {
                    text: formatMessage(`⚠️ You already have premium status\n\nTo check your premium status, use: \`!premium\``)
                });
            }
            
            // Validate and redeem code
            const result = await redeemCode(code, metadata.senderNumber);
            
            if (result.success) {
                // Set premium status
                await database.setPremium(metadata.senderNumber, result.days);
                
                // Initialize premium sub-bot customization
                const premiumInfo = await database.getPremiumInfo(metadata.senderNumber);
                premiumInfo.subBotCustomization = {
                    name: settings.bot.name + ' Premium',
                    menuType: 'buttons',
                    autoReconnect: true
                };
                await database.updatePremiumStatus(metadata.senderNumber, { subBotCustomization: premiumInfo.subBotCustomization });
                
                // Create premium sub-bot
                try {
                    await subBotManager.createPremiumSubBot(metadata.senderNumber);
                    
                    // Send success message
                    await sock.sendMessage(metadata.from, {
                        text: formatMessage(`✅ *PREMIUM ACTIVATED!*\n\n` +
                            `🎉 Congratulations! You have successfully activated premium for ${result.days} days!\n\n` +
                            `📱 Your personal premium bot is being set up. You will receive a QR code to scan soon.\n\n` +
                            `💡 Use \`!premium\` to check your premium status and features\n\n` +
                            `💡 Use \`!premium config help\` to customize your premium bot`)
                    });
                    
                    // Notify owner
                    for (const owner of settings.bot.owners) {
                        await sock.sendMessage(`${owner}@s.whatsapp.net`, { 
                            text: formatMessage(`🔔 *PREMIUM ACTIVATION*\n\n` +
                                `User ${metadata.senderNumber} has redeemed a premium code for ${result.days} days.\n\n` +
                                `Code: ${code}\n` +
                                `Expiration: ${new Date((Math.floor(Date.now() / 1000) + (result.days * 86400))).toLocaleString()}`)
                        });
                    }
                } catch (err) {
                    logger.error(`Error creating premium sub-bot: ${err.message}`);
                    
                    await sock.sendMessage(metadata.from, {
                        text: formatMessage(`⚠️ Premium activated but there was an error creating your sub-bot: ${err.message}\n\nPlease contact the bot owner.`)
                    });
                }
            } else {
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`❌ ${result.message}`)
                });
            }
        } catch (err) {
            logger.error(`Error redeeming code: ${err.message}`);
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ Error redeeming code: ${err.message}`)
            });
        }
    }
};

/**
 * Generate a premium code
 * @param {Number} days - Days of premium access
 * @param {String} generatedBy - Owner number who generated the code
 * @returns {String} Generated code
 */
async function generateCode(days, generatedBy) {
    try {
        // Generate random code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Load existing codes or create file if doesn't exist
        let codes = {};
        
        if (await fs.pathExists(PREMIUM_CODES_FILE)) {
            codes = await fs.readJson(PREMIUM_CODES_FILE);
        }
        
        // Add new code
        codes[code] = {
            days,
            generatedBy,
            generatedAt: Math.floor(Date.now() / 1000),
            redeemed: false,
            redeemedBy: null,
            redeemedAt: null
        };
        
        // Save codes
        await fs.writeJson(PREMIUM_CODES_FILE, codes, { spaces: 2 });
        
        return code;
    } catch (err) {
        logger.error(`Error generating premium code: ${err.message}`);
        throw err;
    }
}

/**
 * Redeem a premium code
 * @param {String} code - Premium code to redeem
 * @param {String} userNumber - User's phone number
 * @returns {Object} Result object { success, message, days }
 */
async function redeemCode(code, userNumber) {
    try {
        // Load existing codes
        if (!await fs.pathExists(PREMIUM_CODES_FILE)) {
            return {
                success: false,
                message: 'Invalid or expired code.'
            };
        }
        
        const codes = await fs.readJson(PREMIUM_CODES_FILE);
        
        // Check if code exists
        if (!codes[code]) {
            return {
                success: false,
                message: 'Invalid or expired code.'
            };
        }
        
        // Check if code already redeemed
        if (codes[code].redeemed) {
            return {
                success: false,
                message: 'This code has already been redeemed.'
            };
        }
        
        // Mark code as redeemed
        codes[code].redeemed = true;
        codes[code].redeemedBy = userNumber;
        codes[code].redeemedAt = Math.floor(Date.now() / 1000);
        
        // Save codes
        await fs.writeJson(PREMIUM_CODES_FILE, codes, { spaces: 2 });
        
        return {
            success: true,
            message: 'Code redeemed successfully',
            days: codes[code].days
        };
    } catch (err) {
        logger.error(`Error redeeming premium code: ${err.message}`);
        throw err;
    }
}

// Export functions for owner commands
module.exports.generateCode = generateCode;