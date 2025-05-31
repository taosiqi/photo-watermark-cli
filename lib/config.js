const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.watermark-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 默认配置
const DEFAULT_CONFIG = {
    timeFormat: 'YYYY-MM-DD HH:mm:ss',
    position: 'bottom-left',
    fontSize: 24,
    fontColor: 'white',
    addShadow: true,
    quality: 95
};

/**
 * 确保配置目录存在
 */
async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (error) {
        // 目录可能已存在，忽略错误
    }
}

/**
 * 加载配置文件
 * @returns {Promise<Object>} 配置对象
 */
async function loadConfig() {
    try {
        await ensureConfigDir();
        const configData = await fs.readFile(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configData);

        // 合并默认配置和用户配置
        return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
        // 配置文件不存在或损坏，返回默认配置
        return { ...DEFAULT_CONFIG };
    }
}

/**
 * 保存配置文件
 * @param {Object} config - 要保存的配置
 */
async function saveConfig(config) {
    try {
        await ensureConfigDir();
        const configToSave = { ...DEFAULT_CONFIG, ...config };
        await fs.writeFile(CONFIG_FILE, JSON.stringify(configToSave, null, 2));
    } catch (error) {
        throw new Error(`保存配置失败: ${error.message}`);
    }
}

/**
 * 重置配置为默认值
 */
async function resetConfig() {
    try {
        await saveConfig(DEFAULT_CONFIG);
    } catch (error) {
        throw new Error(`重置配置失败: ${error.message}`);
    }
}

/**
 * 获取配置文件路径
 * @returns {string} 配置文件路径
 */
function getConfigPath() {
    return CONFIG_FILE;
}

module.exports = {
    loadConfig,
    saveConfig,
    resetConfig,
    getConfigPath,
    DEFAULT_CONFIG
};
