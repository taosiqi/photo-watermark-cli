const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.tiff', '.webp', '.bmp'];

/**
 * 扫描目录下的所有支持的图片文件
 * @param {string} directory - 要扫描的目录路径
 * @returns {Promise<string[]>} 图片文件路径数组
 */
async function scanPhotos(directory) {
    try {
        // 验证目录是否存在
        await fs.access(directory);

        // 使用glob模式匹配所有支持的图片文件
        const patterns = SUPPORTED_FORMATS.map(ext =>
            `**/*${ext}`
        ).concat(
            SUPPORTED_FORMATS.map(ext =>
                `**/*${ext.toUpperCase()}`
            )
        );

        const allFiles = [];

        for (const pattern of patterns) {
            const files = await glob.glob(pattern, {
                cwd: directory,
                absolute: true,
                nodir: true
            });
            allFiles.push(...files);
        }

        // 去重并排序
        const uniqueFiles = [...new Set(allFiles)];
        uniqueFiles.sort();

        return uniqueFiles;
    } catch (error) {
        throw new Error(`扫描目录失败: ${error.message}`);
    }
}

/**
 * 检查文件是否为支持的图片格式
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为支持的图片格式
 */
function isSupportedImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
}

module.exports = {
    scanPhotos,
    isSupportedImage,
    SUPPORTED_FORMATS
};
