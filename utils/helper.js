/**
 * Helper utilities for WhatsApp bot
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('./logger');

/**
 * Generate a random ID
 * @param {Number} length - ID length
 * @returns {String} Random ID
 */
const generateId = (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

/**
 * Download file from URL
 * @param {String} url - File URL
 * @param {String} dest - Destination path
 * @returns {Promise<String>} File path
 */
const downloadFile = async (url, dest) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(dest);
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(dest));
            writer.on('error', reject);
        });
    } catch (error) {
        logger.error(`Error downloading file: ${error.message}`);
        throw error;
    }
};

/**
 * Convert seconds to formatted time
 * @param {Number} seconds - Time in seconds
 * @returns {String} Formatted time
 */
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
        hours > 0 ? `${hours}:` : '',
        minutes > 0 ? `${minutes.toString().padStart(2, '0')}:` : '00:',
        secs.toString().padStart(2, '0')
    ].join('');
};

/**
 * Format date
 * @param {Number|String|Date} date - Date to format
 * @param {String} format - Date format
 * @returns {String} Formatted date
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return moment(date).format(format);
};

/**
 * Sleep for specified time
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} Sleep promise
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Execute a shell command
 * @param {String} command - Shell command
 * @returns {Promise<Object>} Command output
 */
const execShell = async (command) => {
    try {
        const { stdout, stderr } = await execAsync(command);
        return { stdout, stderr };
    } catch (error) {
        logger.error(`Error executing command: ${error.message}`);
        throw error;
    }
};

/**
 * Get random item from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random item
 */
const randomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/**
 * Check if URL is valid
 * @param {String} url - URL to check
 * @returns {Boolean} Is valid URL
 */
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Parse command arguments
 * @param {String} text - Command text
 * @param {Array} flags - Flags to parse
 * @returns {Object} Parsed arguments and flags
 */
const parseArgs = (text, flags = []) => {
    const args = text.split(' ');
    const parsedFlags = {};
    const parsedArgs = [];
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // Check if argument is a flag
        if (arg.startsWith('-')) {
            const flag = arg.slice(1);
            
            // Check if flag is valid
            if (flags.includes(flag)) {
                // Check if flag has a value
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    parsedFlags[flag] = args[i + 1];
                    i++; // Skip next argument as it's the flag value
                } else {
                    parsedFlags[flag] = true;
                }
            }
        } else {
            parsedArgs.push(arg);
        }
    }
    
    return {
        args: parsedArgs,
        flags: parsedFlags
    };
};

/**
 * Truncate text
 * @param {String} text - Text to truncate
 * @param {Number} length - Max length
 * @returns {String} Truncated text
 */
const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
};

/**
 * Escape regex special characters
 * @param {String} string - String to escape
 * @returns {String} Escaped string
 */
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
    generateId,
    downloadFile,
    formatTime,
    formatDate,
    sleep,
    execShell,
    randomItem,
    shuffleArray,
    isValidURL,
    parseArgs,
    truncateText,
    escapeRegExp
};