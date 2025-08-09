/**
 * AI Chat command
 * Category: premium
 */

const { formatMessage } = require('../../lib/connect');
const { isPremium } = require('../../lib/functions');
const axios = require('axios');

module.exports = {
    name: 'AI',
    desc: 'Chat with an AI assistant (premium users only)',
    usage: '!ai <message>',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if user is premium
        if (!isPremium(metadata.sender)) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command is available only for premium users!\n\nUse !premium to learn how to upgrade.') 
            });
            return;
        }
        
        // Check if message is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide a message to chat with AI!\n\n📝 Usage: !ai <message>') 
            });
            return;
        }
        
        const query = args.join(' ');
        
        try {
            // Send typing indicator
            await sock.sendPresenceUpdate('composing', metadata.from);
            
            // Using a public AI API (HuggingFace)
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
                { inputs: query },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            let aiResponse = 'Sorry, I couldn\'t generate a response.';
            
            if (response.data && response.data.generated_text) {
                aiResponse = response.data.generated_text;
            }
            
            // Format AI response
            const formattedResponse = `🤖 *AI Response*\n\n${aiResponse}`;
            
            // Send AI response
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(formattedResponse) 
            });
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Could not connect to AI service'}`) 
            });
        }
    }
};