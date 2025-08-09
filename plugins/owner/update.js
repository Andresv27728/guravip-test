/**
 * Update command
 * Category: owner
 */

const { formatMessage } = require('../../lib/connect');
const { execShell } = require('../../utils/helper');
const logger = require('../../utils/logger');

module.exports = {
    name: 'Update',
    desc: 'Update the bot from the repository',
    usage: '!update',
    isOwnerOnly: true,
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, metadata } = ctx;
        
        // Check if the user is the owner
        if (!ctx.userData.isOwner) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command can only be used by the bot owner!') 
            });
            return;
        }
        
        try {
            // Send update started message
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('🔄 Checking for updates...')
            });
            
            // Check if git is installed
            try {
                await execShell('git --version');
            } catch (error) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('❌ Git is not installed. Cannot update.') 
                });
                return;
            }
            
            // Check if we are in a git repository
            try {
                await execShell('git rev-parse --is-inside-work-tree');
            } catch (error) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('❌ This bot is not in a git repository. Cannot update.') 
                });
                return;
            }
            
            // Fetch remote changes
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('⬇️ Fetching remote changes...') 
            });
            
            const { stdout: fetchOutput } = await execShell('git fetch origin');
            logger.debug('Git fetch output:', fetchOutput);
            
            // Check for changes
            const { stdout: statusOutput } = await execShell('git status -uno');
            
            if (statusOutput.includes('Your branch is up to date')) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('✅ Bot is already up to date!') 
                });
                return;
            }
            
            // Get current commit hash before pull
            const { stdout: oldCommitOutput } = await execShell('git rev-parse --short HEAD');
            const oldCommit = oldCommitOutput.trim();
            
            // Pull changes
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('⬇️ Pulling updates...') 
            });
            
            const { stdout: pullOutput } = await execShell('git pull origin main');
            logger.debug('Git pull output:', pullOutput);
            
            // Get new commit hash
            const { stdout: newCommitOutput } = await execShell('git rev-parse --short HEAD');
            const newCommit = newCommitOutput.trim();
            
            // Get commit message
            const { stdout: commitMsgOutput } = await execShell('git log -1 --pretty=%B');
            const commitMsg = commitMsgOutput.trim();
            
            // Install dependencies if package.json changed
            if (pullOutput.includes('package.json')) {
                await sock.sendMessage(metadata.from, { 
                    text: formatMessage('📦 Installing dependencies...') 
                });
                
                const { stdout: npmOutput } = await execShell('npm install');
                logger.debug('NPM install output:', npmOutput);
            }
            
            // Send update complete message
            let updateText = `✅ *Bot Updated Successfully!*\n\n`;
            updateText += `⏮️ From: \`${oldCommit}\`\n`;
            updateText += `⏭️ To: \`${newCommit}\`\n\n`;
            updateText += `📝 *Latest Commit:*\n\`\`\`${commitMsg}\`\`\`\n\n`;
            updateText += `🔄 *Please restart the bot to apply changes.*\n`;
            updateText += `Use \`!restart\` to restart the bot.`;
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(updateText)
            });
        } catch (error) {
            logger.error('Error updating bot:', error);
            
            await sock.sendMessage(metadata.from, { 
                text: formatMessage(`❌ Update failed: ${error.message}`) 
            });
        }
    }
};