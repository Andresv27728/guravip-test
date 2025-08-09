/**
 * Enhanced Sticker command
 * Category: premium
 */

const { formatMessage } = require('../../lib/connect');
const { isPremium } = require('../../lib/functions');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'Sticker',
    desc: 'Create high-quality stickers with custom parameters (premium users only)',
    usage: '!sticker [pack] [author]',
    
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
        
        // Check if media is sent
        const isImage = message.message.imageMessage;
        const isVideo = message.message.videoMessage;
        const isViewOnce = message.message.viewOnceMessage;
        
        if (!isImage && !isVideo && !isViewOnce) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please send an image or short video with the command!\n\n📝 Usage: Send media with caption !sticker [pack] [author]') 
            });
            return;
        }
        
        // Process view once message
        let mediaMessage = isImage || isVideo;
        if (isViewOnce) {
            const viewOnceMessage = message.message.viewOnceMessage.message;
            mediaMessage = viewOnceMessage.imageMessage || viewOnceMessage.videoMessage;
        }
        
        // Get packname and author
        let packname = 'Premium Stickers';
        let author = 'WhatsApp Bot';
        
        if (args.length >= 1) packname = args[0];
        if (args.length >= 2) author = args[1];
        
        try {
            // Send processing message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('⏳ Processing your premium sticker...') 
            });
            
            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Create unique filenames
            const uniqueId = uuidv4();
            const inputPath = path.join(tempDir, `${uniqueId}_input`);
            const outputPath = path.join(tempDir, `${uniqueId}_sticker.webp`);
            
            // Download media
            let mimetype = '';
            let stream;
            
            if (isImage || (isViewOnce && mediaMessage.mimetype.includes('image'))) {
                mimetype = 'image';
                stream = await downloadContentFromMessage(mediaMessage, 'image');
            } else {
                mimetype = 'video';
                stream = await downloadContentFromMessage(mediaMessage, 'video');
            }
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            // Save media to temp file
            const extension = mimetype === 'image' ? 'jpeg' : 'mp4';
            const inputFile = `${inputPath}.${extension}`;
            fs.writeFileSync(inputFile, buffer);
            
            // Convert to webp using FFmpeg
            const ffmpegArgs = mimetype === 'image' 
                ? `-i "${inputFile}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -quality 95 "${outputPath}"`
                : `-i "${inputFile}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=10,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -t 6 -loop 0 -quality 95 -compression_level 6 "${outputPath}"`;
            
            await new Promise((resolve, reject) => {
                exec(`ffmpeg ${ffmpegArgs}`, (error) => {
                    if (error) reject(error);
                    resolve();
                });
            });
            
            // Add metadata using exiftool if available
            try {
                const metadataCmd = `exiftool -overwrite_original -XMP:Title="${packname}" -XMP:Author="${author}" "${outputPath}"`;
                exec(metadataCmd);
            } catch (error) {
                console.log('Exiftool not available, skipping metadata');
            }
            
            // Read the webp file
            const stickerBuffer = fs.readFileSync(outputPath);
            
            // Send the sticker
            await sock.sendMessage(metadata.from, { 
                sticker: stickerBuffer
            });
            
            // Clean up temp files
            try {
                fs.unlinkSync(inputFile);
                fs.unlinkSync(outputPath);
            } catch (error) {
                console.log('Error cleaning up temp files:', error);
            }
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Failed to create sticker'}`) 
            });
        }
    }
};