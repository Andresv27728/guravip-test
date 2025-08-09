/**
 * Database manager for user data, groups, and premium status
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const settings = require('../config/settings');
const logger = require('../utils/logger');

// Database file paths
const USERS_DB = path.join(process.cwd(), 'lib', 'database', 'users.json');
const GROUPS_DB = path.join(process.cwd(), 'lib', 'database', 'groups.json');
const PREMIUM_DB = path.join(process.cwd(), 'lib', 'database', 'premium.json');

// In-memory databases
let users = {};
let groups = {};
let premium = {};

/**
 * Initialize the database
 */
const initDatabase = async () => {
    try {
        // Create database directory if it doesn't exist
        await fs.ensureDir(path.join(process.cwd(), 'lib', 'database'));
        
        // Load users database
        if (await fs.pathExists(USERS_DB)) {
            users = await fs.readJson(USERS_DB);
        } else {
            await fs.writeJson(USERS_DB, {});
        }
        
        // Load groups database
        if (await fs.pathExists(GROUPS_DB)) {
            groups = await fs.readJson(GROUPS_DB);
        } else {
            await fs.writeJson(GROUPS_DB, {});
        }
        
        // Load premium database
        if (await fs.pathExists(PREMIUM_DB)) {
            premium = await fs.readJson(PREMIUM_DB);
        } else {
            await fs.writeJson(PREMIUM_DB, {});
        }
        
        logger.info('Database initialized successfully');
        
        // Schedule check for premium expiration
        setInterval(checkPremiumExpiration, 60 * 60 * 1000); // Check every hour
    } catch (error) {
        logger.error('Error initializing database:', error);
    }
};

/**
 * Save all databases to disk
 */
const saveDatabase = async () => {
    try {
        await fs.writeJson(USERS_DB, users, { spaces: 2 });
        await fs.writeJson(GROUPS_DB, groups, { spaces: 2 });
        await fs.writeJson(PREMIUM_DB, premium, { spaces: 2 });
        logger.debug('Database saved successfully');
    } catch (error) {
        logger.error('Error saving database:', error);
    }
};

/**
 * Get user data, create if doesn't exist
 * @param {String} id - User ID (phone number)
 * @returns {Object} User data
 */
const getUserData = async (id) => {
    if (!users[id]) {
        users[id] = {
            id,
            name: '',
            registeredAt: moment().unix(),
            lastSeen: moment().unix(),
            commandsUsed: 0,
            publicCommandsUsed: 0,
            banned: false,
            warnings: 0,
            isAdmin: false
        };
    }
    
    // Update last seen
    users[id].lastSeen = moment().unix();
    
    return users[id];
};

/**
 * Update user data
 * @param {String} id - User ID
 * @param {Object} data - User data to update
 * @returns {Object} Updated user data
 */
const updateUserData = async (id, data) => {
    // Get user data first to ensure it exists
    const userData = await getUserData(id);
    
    // Update data
    users[id] = {
        ...userData,
        ...data
    };
    
    return users[id];
};

/**
 * Get group data, create if doesn't exist
 * @param {String} id - Group ID
 * @returns {Object} Group data
 */
const getGroupData = async (id) => {
    if (!id.endsWith('@g.us')) return null;
    
    if (!groups[id]) {
        groups[id] = {
            id,
            name: '',
            registeredAt: moment().unix(),
            members: [],
            admins: [],
            welcome: false,
            welcomeMessage: 'Welcome @user to @group!\n\nWe now have @count members.\n\n@desc',
            antilink: false,
            antiSpam: false,
            botAdmin: false,
            settings: {
                welcome: false,
                antiLink: false,
                antiSpam: false,
                botAdmin: false
            }
        };
    }
    
    // Legacy support for older database structure
    if (groups[id].settings && typeof groups[id].welcome === 'undefined') {
        groups[id].welcome = groups[id].settings.welcome || false;
        groups[id].antilink = groups[id].settings.antiLink || false;
    }
    
    return groups[id];
};

/**
 * Update group data
 * @param {String} id - Group ID
 * @param {Object} data - Group data to update
 * @returns {Object} Updated group data
 */
const updateGroupData = async (id, data) => {
    if (!id.endsWith('@g.us')) return null;
    
    // Get group data first to ensure it exists
    const groupData = await getGroupData(id);
    
    // Update data
    groups[id] = {
        ...groupData,
        ...data
    };
    
    return groups[id];
};

/**
 * Set premium status for a user
 * @param {String} id - User ID (phone number)
 * @param {Number} days - Premium days
 * @returns {Object} Premium info
 */
const setPremium = async (id, days) => {
    // Validate days
    if (days < settings.premium.min_days) days = settings.premium.min_days;
    if (days > settings.premium.max_days) days = settings.premium.max_days;
    
    // Calculate expiration
    const now = moment();
    const expiration = now.add(days, 'days').unix();
    
    premium[id] = {
        id,
        startTime: moment().unix(),
        expiration,
        notified: false,
        paused: false,
        pauseTime: 0,
        subBotCustomization: {
            name: settings.bot.name + ' Premium',
            menuType: 'buttons', // buttons, list, or text
            autoReconnect: true
        }
    };
    
    // Save database
    await saveDatabase();
    
    return premium[id];
};

/**
 * Update premium status for a user
 * @param {String} id - User ID (phone number)
 * @param {Object} data - Premium data to update
 * @returns {Object} Updated premium info
 */
const updatePremiumStatus = async (id, data = {}) => {
    if (!premium[id]) return null;
    
    // Check if we're updating pause status
    if (data.hasOwnProperty('subBotPaused')) {
        // If pausing, store current timestamp to calculate unused time
        if (data.subBotPaused) {
            data.pausedAt = moment().unix();
        } 
        // If resuming, calculate and extend expiration by the paused time
        else if (premium[id].pausedAt) {
            const pausedDuration = moment().unix() - premium[id].pausedAt;
            premium[id].expiration += pausedDuration;
            
            // Clear the pausedAt field
            data.pausedAt = null;
        }
    }
    
    // Update data
    premium[id] = {
        ...premium[id],
        ...data
    };
    
    // Save database
    await saveDatabase();
    
    return premium[id];
};

/**
 * Check if a user is premium
 * @param {String} id - User ID (phone number)
 * @returns {Boolean} Is premium user
 */
const isPremium = (id) => {
    if (!premium[id]) return false;
    
    const now = moment().unix();
    return premium[id].expiration > now;
};

/**
 * Get premium info for a user
 * @param {String} id - User ID (phone number)
 * @returns {Object|null} Premium info or null if not premium
 */
const getPremiumInfo = (id) => {
    if (!isPremium(id)) return null;
    
    const info = premium[id];
    const now = moment().unix();
    const remaining = info.expiration - now;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    return {
        ...info,
        remainingDays: days,
        remainingHours: hours,
        formatted: `${days} days and ${hours} hours`
    };
};

/**
 * Check premium expiration and notify users
 */
const checkPremiumExpiration = async () => {
    const now = moment().unix();
    const notificationThreshold = settings.premium.reminder_hours * 3600;
    
    for (const id in premium) {
        const info = premium[id];
        
        // Skip already notified users
        if (info.notified) continue;
        
        // Check if expiration is within threshold
        const timeToExpiration = info.expiration - now;
        
        if (timeToExpiration > 0 && timeToExpiration <= notificationThreshold) {
            // Mark as notified
            premium[id].notified = true;
            
            // Calculate remaining time
            const hours = Math.ceil(timeToExpiration / 3600);
            
            // Send notification (will be handled by the bot)
            logger.info(`Premium expiration notification for ${id}: ${hours} hours remaining`);
            
            // This is a flag for the bot to send notification
            premium[id].sendNotification = true;
        }
    }
    
    // Save changes
    await saveDatabase();
};

/**
 * Ban a user
 * @param {String} id - User ID (phone number)
 * @param {String} reason - Ban reason
 * @param {Number} duration - Ban duration in hours (0 for permanent)
 * @returns {Object} Updated user data
 */
const banUser = async (id, reason = '', duration = 0) => {
    const userData = await getUserData(id);
    
    userData.banned = true;
    userData.banReason = reason;
    userData.banTime = moment().unix();
    
    if (duration > 0) {
        userData.banExpiration = moment().add(duration, 'hours').unix();
    } else {
        userData.banExpiration = 0; // Permanent
    }
    
    return userData;
};

/**
 * Unban a user
 * @param {String} id - User ID (phone number)
 * @returns {Object} Updated user data
 */
const unbanUser = async (id) => {
    const userData = await getUserData(id);
    
    userData.banned = false;
    userData.banReason = '';
    userData.banTime = 0;
    userData.banExpiration = 0;
    
    return userData;
};

/**
 * Check if a user is banned
 * @param {String} id - User ID (phone number)
 * @returns {Boolean|Object} False if not banned, ban info if banned
 */
const isBanned = async (id) => {
    const userData = await getUserData(id);
    
    if (!userData.banned) return false;
    
    // Check if ban has expired
    if (userData.banExpiration > 0) {
        const now = moment().unix();
        if (now >= userData.banExpiration) {
            // Ban expired, unban user
            await unbanUser(id);
            return false;
        }
    }
    
    return {
        reason: userData.banReason,
        time: userData.banTime,
        expiration: userData.banExpiration
    };
};

/**
 * Update specific group settings
 * @param {String} id - Group ID
 * @param {String} setting - Setting key to update
 * @param {any} value - New setting value
 * @returns {Object} Updated group data
 */
const updateGroupSetting = async (id, setting, value) => {
    if (!id.endsWith('@g.us')) return null;
    
    // Get group data first to ensure it exists
    const groupData = await getGroupData(id);
    
    // Update specific setting
    groupData[setting] = value;
    
    // For backward compatibility
    if (groupData.settings) {
        if (setting === 'welcome') groupData.settings.welcome = value;
        if (setting === 'antilink') groupData.settings.antiLink = value;
    }
    
    // Save the updated group data
    groups[id] = groupData;
    
    return groupData;
};

module.exports = {
    initDatabase,
    saveDatabase,
    getUserData,
    updateUserData,
    getGroupData,
    updateGroupData,
    updateGroupSetting,
    setPremium,
    updatePremiumStatus,
    isPremium,
    getPremiumInfo,
    banUser,
    unbanUser,
    isBanned
};