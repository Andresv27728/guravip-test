/**
 * Translate command
 * Category: public
 */

const { formatMessage } = require('../../lib/connect');
const axios = require('axios');

module.exports = {
    name: 'Translate',
    desc: 'Translate text to a different language',
    usage: '!translate <lang_code> <text>',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if arguments are provided
        if (args.length < 2) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide a language code and text to translate!\n\n📝 Usage: !translate <lang_code> <text>\n\nExample: !translate es Hello world\n\nCommon Language Codes:\nen - English\nes - Spanish\nfr - French\nde - German\nit - Italian\npt - Portuguese\nja - Japanese\nko - Korean\nzh - Chinese\nar - Arabic') 
            });
            return;
        }
        
        const targetLang = args[0].toLowerCase();
        const textToTranslate = args.slice(1).join(' ');
        
        try {
            // Using LibreTranslate API (no API key required)
            const response = await axios.post('https://libretranslate.de/translate', {
                q: textToTranslate,
                source: 'auto',
                target: targetLang
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const translatedText = response.data.translatedText;
            
            if (!translatedText) {
                throw new Error('Translation failed');
            }
            
            // Format the translation result
            const result = `🔤 *Translation Result*\n\n` +
                `📝 Original: ${textToTranslate}\n` +
                `🌐 Translated (${targetLang}): ${translatedText}`;
            
            // Send translated text
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(result) 
            });
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Could not translate text'}`) 
            });
        }
    }
};