/**
 * Generate premium code command
 * Category: owner
 */

const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');
const { generateCode } = require('../public/redeem');
const logger = require('../../utils/logger');

module.exports = {
    name: 'GenCode',
    desc: 'Generate premium code',
    usage: '!gencode [days]',
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
        
        if (!args.length) {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`⚠️ Please specify the number of days for the premium code\n\nUsage: \`!gencode [days]\``)
            });
        }
        
        const days = parseInt(args[0]);
        
        if (isNaN(days) || days < 1) {
            return await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ Invalid number of days. Please provide a positive number.`)
            });
        }
        
        try {
            // Generate code
            const code = await generateCode(days, metadata.senderNumber);
            
            // Send code
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`✅ *PREMIUM CODE GENERATED*\n\n` +
                    `📋 Code: \`${code}\`\n` +
                    `⏳ Duration: ${days} days\n\n` +
                    `🔄 To redeem: \`!redeem ${code}\`\n\n` +
                    `💡 Share this code with users you want to give premium access to.`)
            });
        } catch (err) {
            logger.error(`Error generating premium code: ${err.message}`);
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(`❌ Error generating premium code: ${err.message}`)
            });
        }
    }
};