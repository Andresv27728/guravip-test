/**
 * Weather command
 * Category: public
 */

const { formatMessage } = require('../../lib/connect');
const axios = require('axios');

module.exports = {
    name: 'Weather',
    desc: 'Get current weather information for a location',
    usage: '!weather <city>',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if location is provided
        if (args.length === 0) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ Please provide a city name!\n\n📝 Usage: !weather <city>') 
            });
            return;
        }
        
        const city = args.join(' ');
        
        try {
            // Using a free weather API (OpenWeatherMap API alternative that doesn't require API key)
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            const data = response.data;
            
            if (!data || !data.current_condition || !data.current_condition[0]) {
                throw new Error('Invalid location or weather data not available');
            }
            
            const weather = data.current_condition[0];
            const location = data.nearest_area[0];
            
            // Format the weather information
            const weatherInfo = `🌤️ *Weather in ${location.areaName[0].value}, ${location.country[0].value}*\n\n` +
                `🌡️ Temperature: ${weather.temp_C}°C / ${weather.temp_F}°F\n` +
                `💧 Humidity: ${weather.humidity}%\n` +
                `🌬️ Wind: ${weather.windspeedKmph} km/h\n` +
                `☁️ Cloud: ${weather.cloudcover}%\n` +
                `👁️ Visibility: ${weather.visibility} km\n` +
                `🌧️ Precipitation: ${weather.precipMM} mm\n` +
                `🔆 Condition: ${weather.weatherDesc[0].value}\n\n` +
                `⏰ Last Updated: ${weather.observation_time} GMT`;
            
            // Send weather information
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(weatherInfo) 
            });
            
        } catch (error) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ An error occurred: ${error.message || 'Could not fetch weather information'}`) 
            });
        }
    }
};