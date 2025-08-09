/**
 * Plugin loader for WhatsApp bot
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all available plugins from the plugins directory
 * @returns {Object} Map of command name to plugin handler
 */
const loadPlugins = () => {
    const plugins = {};
    const pluginsDir = path.join(process.cwd(), 'plugins');
    
    try {
        // Ensure plugins directory exists
        fs.ensureDirSync(pluginsDir);
        
        // Get all categories (subdirectories)
        const categories = fs.readdirSync(pluginsDir).filter(file => {
            return fs.statSync(path.join(pluginsDir, file)).isDirectory();
        });
        
        // Load plugins from each category
        for (const category of categories) {
            const categoryDir = path.join(pluginsDir, category);
            
            // Get all plugin files
            const pluginFiles = fs.readdirSync(categoryDir).filter(file => {
                return file.endsWith('.js');
            });
            
            // Load each plugin
            for (const file of pluginFiles) {
                const pluginPath = path.join(categoryDir, file);
                const commandName = file.replace('.js', '').toLowerCase();
                
                try {
                    // Clear require cache to ensure fresh reload
                    delete require.cache[require.resolve(pluginPath)];
                    
                    // Load plugin
                    const plugin = require(pluginPath);
                    
                    // Validate plugin structure
                    if (!plugin.name || !plugin.desc || typeof plugin.execute !== 'function') {
                        logger.warn(`Invalid plugin structure in ${pluginPath}`);
                        continue;
                    }
                    
                    // Add plugin to map
                    plugins[commandName] = {
                        ...plugin,
                        category
                    };
                    
                    logger.debug(`Loaded plugin: ${commandName} from ${category}`);
                } catch (error) {
                    logger.error(`Failed to load plugin ${commandName}: ${error.message}`);
                }
            }
        }
        
        logger.info(`Loaded ${Object.keys(plugins).length} plugins from ${categories.length} categories`);
    } catch (error) {
        logger.error(`Error loading plugins: ${error.message}`);
    }
    
    return plugins;
};

/**
 * Get plugin information for help command
 * @returns {Object} Plugin information grouped by category
 */
const getPluginInfo = () => {
    const plugins = loadPlugins();
    const info = {};
    
    // Group by category
    for (const [name, plugin] of Object.entries(plugins)) {
        const { category, desc, usage = '', isOwnerOnly = false, isPremiumOnly = false } = plugin;
        
        if (!info[category]) {
            info[category] = [];
        }
        
        info[category].push({
            name,
            desc,
            usage,
            isOwnerOnly,
            isPremiumOnly
        });
    }
    
    return info;
};

/**
 * Create a new plugin file
 * @param {String} name - Plugin name
 * @param {String} category - Plugin category
 * @param {String} description - Plugin description
 * @param {String} usage - Plugin usage example
 * @returns {Promise<String>} Path to created plugin
 */
const createPlugin = async (name, category, description, usage) => {
    try {
        // Convert name to lowercase and replace spaces with underscores
        const fileName = name.toLowerCase().replace(/\s+/g, '_');
        const categoryDir = path.join(process.cwd(), 'plugins', category);
        const filePath = path.join(categoryDir, `${fileName}.js`);
        
        // Ensure category directory exists
        await fs.ensureDir(categoryDir);
        
        // Check if plugin already exists
        if (await fs.pathExists(filePath)) {
            throw new Error(`Plugin ${name} already exists in ${category}`);
        }
        
        // Plugin template
        const template = `/**
 * ${name} command
 * Category: ${category}
 */

module.exports = {
    name: '${name}',
    desc: '${description}',
    usage: '${usage}',
    isOwnerOnly: ${category === 'owner'},
    isPremiumOnly: ${category === 'premium'},
    
    /**
     * Execute command
     * @param {Object} ctx - Command context
     * @param {Object} ctx.sock - Socket connection
     * @param {Object} ctx.message - Message object
     * @param {Array} ctx.args - Command arguments
     * @param {Object} ctx.metadata - Message metadata
     * @param {Object} ctx.userData - User data
     * @param {Function} ctx.downloadMedia - Function to download media
     */
    execute: async (ctx) => {
        const { sock, message, args, metadata } = ctx;
        
        // Command implementation goes here
    }
};`;
        
        // Write plugin file
        await fs.writeFile(filePath, template);
        
        logger.info(`Created plugin ${name} in ${category}`);
        
        return filePath;
    } catch (error) {
        logger.error(`Error creating plugin: ${error.message}`);
        throw error;
    }
};

module.exports = {
    loadPlugins,
    getPluginInfo,
    createPlugin
};