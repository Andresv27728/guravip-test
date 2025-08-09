/**
 * Group Status command
 * Category: admin
 */

const { formatMessage } = require('../../lib/connect');
const database = require('../../lib/database');
const logger = require('../../utils/logger');
const moment = require('moment-timezone');

module.exports = {
    name: 'Status',
    desc: 'Check group feature status',
    usage: '!status',
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Check if the command is used in a group
        if (!metadata.isGroup) {
            await sock.sendMessage(metadata.from, { 
                text: formatMessage('❌ This command can only be used in groups!') 
            });
            return;
        }
        
        // Get group data
        const groupData = await database.getGroupData(metadata.from);
        
        // Format group creation time
        const creationTime = moment.unix(groupData.registeredAt).format('MMMM D, YYYY');
        
        // Format feature statuses
        const welcomeStatus = groupData.welcome ? '✅ ON' : '❌ OFF';
        const antilinkStatus = groupData.antilink ? '✅ ON' : '❌ OFF';
        const antiSpamStatus = groupData.antiSpam ? '✅ ON' : '❌ OFF';
        
        // Build status message
        let statusMsg = `📊 *Group Status*\n\n`;
        statusMsg += `*Group Name:* ${metadata.groupName}\n`;
        statusMsg += `*Members:* ${metadata.groupMembers.length}\n`;
        statusMsg += `*Group Created:* ${creationTime}\n\n`;
        
        statusMsg += `*Features Status:*\n`;
        statusMsg += `• Welcome Messages: ${welcomeStatus}\n`;
        statusMsg += `• Anti-Link: ${antilinkStatus}\n`;
        statusMsg += `• Anti-Spam: ${antiSpamStatus}\n\n`;
        
        if (groupData.welcome) {
            statusMsg += `*Current Welcome Message:*\n${groupData.welcomeMessage || 'Default welcome message'}\n\n`;
        }
        
        statusMsg += `*Admin Commands:*\n`;
        statusMsg += `• !welcome on/off - Toggle welcome messages\n`;
        statusMsg += `• !welcome set <text> - Set custom welcome message\n`;
        statusMsg += `• !antilink on/off - Toggle anti-link feature\n`;
        
        await sock.sendMessage(metadata.from, { 
            text: formatMessage(statusMsg) 
        });
    }
};