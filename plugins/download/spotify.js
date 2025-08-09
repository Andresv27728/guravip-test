/**
 * Spotify downloader command
 * Category: download
 */

const { formatMessage } = require('../../lib/connect');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'Spotify',
    desc: 'Search and download Spotify tracks',
    usage: '!spotify <song name> | !spotify <spotify_url>',
    aliases: ['sp'],
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if query is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide a song name or Spotify URL!\n\n📝 Usage:\n!spotify <song name>\n!spotify <spotify_url>') 
            });
            return;
        }
        
        const query = args.join(' ');
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage('🔍 Searching for the track...\nThis may take a moment.')
        });
        
        try {
            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Determine if input is a URL or search query
            const isSpotifyUrl = query.match(/https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
            
            let trackInfo;
            let apiUrl;
            
            if (isSpotifyUrl) {
                // Process Spotify URL
                const spotifyId = isSpotifyUrl[2];
                const contentType = isSpotifyUrl[1];
                
                if (contentType !== 'track') {
                    await sock.sendMessage(metadata.from, { 
                        text: formatMessage('❌ Only single tracks are supported at this time. Albums and playlists are not supported.') 
                    });
                    return;
                }
                
                apiUrl = `https://api.spotifydown.com/download/${spotifyId}`;
                
                // Get track info first
                const infoResponse = await axios.get(`https://api.spotifydown.com/metadata/track/${spotifyId}`);
                if (!infoResponse.data || infoResponse.data.error) {
                    throw new Error('Track not found or not available');
                }
                
                trackInfo = infoResponse.data;
                
            } else {
                // Process search query
                const searchResponse = await axios.get(`https://api.spotifydown.com/search/${encodeURIComponent(query)}`);
                
                if (!searchResponse.data || !searchResponse.data.tracks || searchResponse.data.tracks.length === 0) {
                    throw new Error('No tracks found for your search query');
                }
                
                // Use the first track from search results
                trackInfo = searchResponse.data.tracks[0];
                apiUrl = `https://api.spotifydown.com/download/${trackInfo.id}`;
            }
            
            // Get download link
            const downloadResponse = await axios.get(apiUrl);
            if (!downloadResponse.data || !downloadResponse.data.link) {
                throw new Error('Download link not available');
            }
            
            // Download track information
            const downloadLink = downloadResponse.data.link;
            const audioFilename = `${trackInfo.artists[0].name} - ${trackInfo.name}`.replace(/[^\w\s]/gi, '');
            const uniqueId = uuidv4().substring(0, 8);
            const filePath = path.join(tempDir, `spotify_${uniqueId}.mp3`);
            
            // Send track info while downloading
            const artistNames = trackInfo.artists.map(artist => artist.name).join(', ');
            const infoMessage = `🎵 *Track Found*\n\n` +
                `🎤 Artist: ${artistNames}\n` +
                `🎧 Title: ${trackInfo.name}\n` +
                `💿 Album: ${trackInfo.album?.name || 'N/A'}\n` +
                `⏱️ Duration: ${formatDuration(trackInfo.duration_ms)}\n\n` +
                `⏳ Downloading audio file...`;
            
            await sock.sendMessage(metadata.from, {
                text: formatMessage(infoMessage)
            });
            
            // Download the track
            const writer = fs.createWriteStream(filePath);
            const audioResponse = await axios({
                method: 'GET',
                url: downloadLink,
                responseType: 'stream'
            });
            
            audioResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            // Send track as audio message
            await sock.sendMessage(metadata.from, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${audioFilename}.mp3`
            });
            
            // Clean up file
            fs.unlinkSync(filePath);
            
        } catch (error) {
            console.error('Spotify downloader error:', error);
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Failed to download from Spotify'}`) 
            });
        }
    }
};

/**
 * Format milliseconds to MM:SS format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
    if (!ms) return '00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}