/**
 * Custom logger utility for WhatsApp bot
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');

// Log levels
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 4,
};

// Create logs directory
const logDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logDir);

// Log file path
const logFile = path.join(logDir, `${moment().format('YYYY-MM-DD')}.log`);

/**
 * Write log to file
 * @param {String} level - Log level
 * @param {Array} args - Log arguments
 */
const writeToFile = (level, args) => {
    try {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');
        
        const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        fs.appendFileSync(logFile, logLine);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
};

/**
 * Get colored log prefix based on level
 * @param {String} level - Log level
 * @returns {String} - Colored log prefix
 */
const getPrefix = (level) => {
    const timestamp = moment().format('HH:mm:ss');
    
    switch (level) {
        case 'debug':
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.blue('[DEBUG]')}`;
        case 'info':
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.cyan('[INFO]')}`;
        case 'warn':
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.yellow('[WARN]')}`;
        case 'error':
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.red('[ERROR]')}`;
        case 'success':
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.green('[SUCCESS]')}`;
        default:
            return `${chalk.gray(`[${timestamp}]`)} ${chalk.white(`[${level.toUpperCase()}]`)}`;
    }
};

/**
 * Log message with level
 * @param {String} level - Log level
 * @param {...any} args - Log arguments
 */
const log = (level, ...args) => {
    const settings = require('../config/settings');
    
    // Check minimum log level
    const minLevel = LOG_LEVELS[settings.logs.level] || LOG_LEVELS.info;
    if (LOG_LEVELS[level] < minLevel) return;
    
    // Console log
    if (settings.logs.console) {
        console.log(getPrefix(level), ...args);
    }
    
    // File log
    if (settings.logs.file) {
        writeToFile(level, args);
    }
};

// Export logger methods
module.exports = {
    debug: (...args) => log('debug', ...args),
    info: (...args) => log('info', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args),
    success: (...args) => log('success', ...args)
};