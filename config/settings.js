/**
 * WhatsApp Bot Configuration
 * Configure your bot preferences here
 */

module.exports = {
    // Bot information
    bot: {
        name: "WA-Bot", // Your bot name
        emoji: "🤖", // Bot emoji displayed in messages
        version: "1.0.0", // Bot version
        prefix: "!", // Command prefix
        owners: ["5511987654321"], // Bot owner WhatsApp numbers (replace with your number)
        channel: "https://youtube.com/channel/yourchannelhere", // Your YouTube channel
    },
    
    // Message settings
    message: {
        footer: "Powered by WA-Bot", // Footer text for messages
        read_messages: true, // Mark messages as read
        always_online: true, // Show bot as always online
        auto_typing: true, // Show typing indicator when processing commands
        max_filesize: 100, // Max file size for downloads in MB
    },
    
    // Premium user settings
    premium: {
        enabled: true, // Enable premium system
        min_days: 1, // Minimum days to add for premium
        max_days: 365, // Maximum days to add for premium
        reminder_hours: 24, // Hours before expiration to send reminder
    },
    
    // Sub-bot settings
    subbots: {
        enabled: true, // Enable sub-bots system
        public_commands: 20, // Number of commands available to public users
        premium_commands: 60, // Number of commands available to premium users
    },
    
    // Logging and debugging
    logs: {
        level: "info", // Log level: error, warn, info, debug
        console: true, // Show logs in console
        file: true, // Save logs to file
    },
    
    // API endpoints
    apis: {
        download: "https://api.somewebsite.com/v1/", // API for downloads
        games: "https://api.games.com/v1/", // API for games
        ai: "https://api.ai-service.com/v1/", // API for AI functions
    },
    
    // Database settings
    database: {
        save_interval: 60, // Save database every X seconds
    },
    
    // Ban settings
    ban: {
        enabled: true, // Enable ban system
        warn_limit: 3, // Number of warnings before ban
        temp_ban_hours: 12, // Hours for temporary ban
    }
};