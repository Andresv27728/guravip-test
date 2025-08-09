/**
 * Instagram downloader command
 * Category: download
 */

const { formatMessage } = require('../../lib/connect');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'Instagram',
    desc: 'Download Instagram photos and videos',
    usage: '!ig <instagram_url>',
    aliases: ['ig', 'insta'],
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if URL is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide an Instagram URL!\n\n📝 Usage: !ig <instagram_url>\n\nExample: !ig https://www.instagram.com/p/ABC123/') 
            });
            return;
        }
        
        const url = args[0];
        
        // Validate URL format
        if (!url.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/([^/?#&]+)/)) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Invalid Instagram URL!\n\n📝 Make sure it\'s a valid Instagram post, reel, TV, or stories URL.') 
            });
            return;
        }
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage('⏳ Processing your request...\nThis may take a moment.')
        });
        
        try {
            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Use a public Instagram downloader API
            const response = await axios({
                method: 'GET',
                url: `https://api.dlpanda.com/v1/instagram/video?url=${encodeURIComponent(url)}`,
                responseType: 'json'
            });
            
            if (!response.data || (!response.data.video && !response.data.image)) {
                throw new Error('Content not found or unavailable for download');
            }
            
            // Process media URLs
            let mediaUrls = [];
            
            if (response.data.video) {
                mediaUrls.push({ url: response.data.video, type: 'video' });
            } else if (response.data.image) {
                mediaUrls.push({ url: response.data.image, type: 'image' });
            } else if (response.data.medias && response.data.medias.length) {
                mediaUrls = response.data.medias.map(media => ({
                    url: media.url,
                    type: media.type || (media.url.includes('.mp4') ? 'video' : 'image')
                }));
            }
            
            if (mediaUrls.length === 0) {
                throw new Error('No downloadable media found');
            }
            
            // Send status message for multiple media
            if (mediaUrls.length > 1) {
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`🔍 Found ${mediaUrls.length} media items. Sending them now...`)
                });
            }
            
            // Download and send media (limit to 5 items to avoid spam)
            const limit = Math.min(mediaUrls.length, 5);
            for (let i = 0; i < limit; i++) {
                const media = mediaUrls[i];
                const uniqueId = uuidv4();
                const ext = media.type === 'video' ? 'mp4' : 'jpg';
                const filePath = path.join(tempDir, `instagram_${uniqueId}.${ext}`);
                
                try {
                    // Download the media
                    const mediaResponse = await axios({
                        method: 'GET',
                        url: media.url,
                        responseType: 'stream'
                    });
                    
                    const writer = fs.createWriteStream(filePath);
                    mediaResponse.data.pipe(writer);
                    
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    
                    // Send the media
                    if (media.type === 'video') {
                        await sock.sendMessage(metadata.from, {
                            video: fs.readFileSync(filePath),
                            caption: formatMessage(`📱 Instagram ${i + 1}/${limit} (${media.type})`)
                        });
                    } else {
                        await sock.sendMessage(metadata.from, {
                            image: fs.readFileSync(filePath),
                            caption: formatMessage(`📱 Instagram ${i + 1}/${limit} (${media.type})`)
                        });
                    }
                    
                    // Clean up file
                    fs.unlinkSync(filePath);
                    
                } catch (err) {
                    console.error(`Error processing media ${i + 1}:`, err);
                    await sock.sendMessage(metadata.from, {
                        text: formatMessage(`❌ Failed to process media item ${i + 1}: ${err.message}`)
                    });
                }
            }
            
            // Notify if we limited the number of items
            if (mediaUrls.length > 5) {
                await sock.sendMessage(metadata.from, {
                    text: formatMessage(`ℹ️ Only sent 5 out of ${mediaUrls.length} media items to avoid spam.`)
                });
            }
            
        } catch (error) {
            console.error('Instagram downloader error:', error);
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Failed to download content from Instagram'}`) 
            });
        }
    }
};