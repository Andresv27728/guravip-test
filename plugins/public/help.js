/**
 * Help command
 * Category: public
 */

const { getPluginInfo } = require('../../lib/loader');
const { formatMessage } = require('../../lib/connect');
const settings = require('../../config/settings');

module.exports = {
    name: 'Help',
    desc: 'Display all available commands or info about a specific command',
    usage: '!help [command]',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Get command name if provided
        const commandName = args[0] ? args[0].toLowerCase() : null;
        
        // Get all plugin information
        const pluginsInfo = getPluginInfo();
        
        // If command name is provided, show detailed info for that command
        if (commandName) {
            // Search for the command in all categories
            let foundCommand = null;
            let foundCategory = null;
            
            for (const [category, commands] of Object.entries(pluginsInfo)) {
                const command = commands.find(cmd => cmd.name.toLowerCase() === commandName);
                if (command) {
                    foundCommand = command;
                    foundCategory = category;
                    break;
                }
            }
            
            if (foundCommand) {
                const { name, desc, usage, isOwnerOnly, isPremiumOnly } = foundCommand;
                
                let helpText = `📚 *Command: ${name}*\n\n`;
                helpText += `📝 *Description:* ${desc}\n`;
                helpText += `🔧 *Usage:* ${usage}\n`;
                helpText += `📂 *Category:* ${foundCategory}\n`;
                
                // Show restrictions
                if (isOwnerOnly) helpText += `⚠️ *Owner Only Command*\n`;
                if (isPremiumOnly) helpText += `👑 *Premium Only Command*\n`;
                
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(helpText) 
                });
                
                return;
            } else {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage(`❌ Command *${commandName}* not found. Use !help to see all available commands.`) 
                });
                
                return;
            }
        }
        
        // Show all commands grouped by category
        const botName = settings.bot.name;
        let helpText = `📋 *${botName} Command List*\n\n`;
        
        // Public commands always available
        helpText += `📌 *PUBLIC COMMANDS*\n`;
        if (pluginsInfo.public) {
            for (const cmd of pluginsInfo.public) {
                helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
            }
        }
        helpText += '\n';
        
        // Check if user is premium
        if (ctx.userData.isOwner || await require('../../lib/database').isPremium(metadata.senderNumber)) {
            // Owner commands
            if (ctx.userData.isOwner && pluginsInfo.owner) {
                helpText += `👑 *OWNER COMMANDS*\n`;
                for (const cmd of pluginsInfo.owner) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Admin commands
            if (pluginsInfo.admin) {
                helpText += `👮 *ADMIN COMMANDS*\n`;
                for (const cmd of pluginsInfo.admin) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Premium commands
            if (pluginsInfo.premium) {
                helpText += `⭐ *PREMIUM COMMANDS*\n`;
                for (const cmd of pluginsInfo.premium) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Download commands
            if (pluginsInfo.download) {
                helpText += `⬇️ *DOWNLOAD COMMANDS*\n`;
                for (const cmd of pluginsInfo.download) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Game commands
            if (pluginsInfo.games) {
                helpText += `🎮 *GAME COMMANDS*\n`;
                for (const cmd of pluginsInfo.games) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
        } else {
            // For non-premium users, show limited commands
            helpText += `⚠️ *You are using PUBLIC version with limited commands*\n\n`;
            
            // Limited admin commands for public
            if (pluginsInfo.admin) {
                helpText += `👮 *ADMIN COMMANDS (LIMITED)*\n`;
                const limitedAdminCmds = pluginsInfo.admin.slice(0, 3);
                for (const cmd of limitedAdminCmds) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Limited download commands for public
            if (pluginsInfo.download) {
                helpText += `⬇️ *DOWNLOAD COMMANDS (LIMITED)*\n`;
                const limitedDownloadCmds = pluginsInfo.download.slice(0, 2);
                for (const cmd of limitedDownloadCmds) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Limited game commands for public
            if (pluginsInfo.games) {
                helpText += `🎮 *GAME COMMANDS (LIMITED)*\n`;
                const limitedGameCmds = pluginsInfo.games.slice(0, 3);
                for (const cmd of limitedGameCmds) {
                    helpText += `• !${cmd.name.toLowerCase()} - ${cmd.desc}\n`;
                }
                helpText += '\n';
            }
            
            // Show premium info
            helpText += `👑 *UPGRADE TO PREMIUM*\n`;
            helpText += `Get access to all commands by becoming a premium user!\n`;
            helpText += `Contact: ${settings.bot.owners[0]}\n\n`;
        }
        
        helpText += `💡 *Tip:* Use !help <command> to see detailed information about a specific command.`;
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(helpText)
        });
    }
};