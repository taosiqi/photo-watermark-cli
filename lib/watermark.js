const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const exifReader = require('exif-reader');
const { scanPhotos } = require('./scanner');
const ora = require('ora');
const chalk = require('chalk');

/**
 * 从图片中提取拍摄时间
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Date|null>} 拍摄时间或null
 */
async function extractPhotoDate(imagePath) {
    try {
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        if (metadata.exif) {
            const exif = exifReader(metadata.exif);

            // 尝试从不同的EXIF字段获取日期
            const dateFields = [
                exif.exif?.DateTimeOriginal,
                exif.exif?.DateTime,
                exif.exif?.DateTimeDigitized
            ];

            for (const dateField of dateFields) {
                if (dateField) {
                    return new Date(dateField);
                }
            }
        }

        // 如果没有EXIF信息，使用文件修改时间
        const fileStats = await fs.stat(imagePath);
        return fileStats.mtime;

    } catch (error) {
        console.warn(chalk.yellow(`⚠️  无法提取 ${path.basename(imagePath)} 的时间信息，使用文件修改时间`));
        const fileStats = await fs.stat(imagePath);
        return fileStats.mtime;
    }
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 计算水印位置
 * @param {number} imageWidth - 图片宽度
 * @param {number} imageHeight - 图片高度
 * @param {number} textWidth - 文字宽度
 * @param {number} textHeight - 文字高度
 * @param {string} position - 位置（bottom-left, bottom-right, top-left, top-right）
 * @param {number} padding - 边距
 * @returns {Object} 位置坐标 {x, y}
 */
function calculateWatermarkPosition(imageWidth, imageHeight, textWidth, textHeight, position, padding = 20) {
    switch (position) {
        case 'bottom-left':
            return { x: padding, y: imageHeight - textHeight - padding };
        case 'bottom-right':
            return { x: imageWidth - textWidth - padding, y: imageHeight - textHeight - padding };
        case 'top-left':
            return { x: padding, y: padding };
        case 'top-right':
            return { x: imageWidth - textWidth - padding, y: padding };
        default:
            return { x: padding, y: imageHeight - textHeight - padding };
    }
}

/**
 * 计算相对于图片尺寸的字体大小
 * @param {number} imageWidth - 图片宽度
 * @param {number} imageHeight - 图片高度
 * @param {number} baseFontSize - 基础字体大小
 * @param {number} baseResolution - 基础分辨率（默认1920x1080）
 * @returns {number} 调整后的字体大小
 */
function calculateRelativeFontSize(imageWidth, imageHeight, baseFontSize = 24, baseResolution = 1920) {
    // 计算图片的较小边作为参考
    const minDimension = Math.min(imageWidth, imageHeight);

    // 根据比例调整字体大小，确保在不同分辨率下保持视觉一致性
    const scaleFactor = minDimension / baseResolution;

    // 设置最小和最大字体大小限制
    const minFontSize = 12;
    const maxFontSize = 100;

    const calculatedSize = Math.round(baseFontSize * scaleFactor);

    return Math.max(minFontSize, Math.min(maxFontSize, calculatedSize));
}

/**
 * 计算相对于图片尺寸的边距
 * @param {number} imageWidth - 图片宽度
 * @param {number} imageHeight - 图片高度
 * @param {number} basePadding - 基础边距
 * @returns {number} 调整后的边距
 */
function calculateRelativePadding(imageWidth, imageHeight, basePadding = 20) {
    const minDimension = Math.min(imageWidth, imageHeight);
    const scaleFactor = minDimension / 1920;

    const minPadding = 10;
    const maxPadding = 50;

    const calculatedPadding = Math.round(basePadding * scaleFactor);

    return Math.max(minPadding, Math.min(maxPadding, calculatedPadding));
}

/**
 * 为单张图片添加水印
 * @param {string} inputPath - 输入图片路径
 * @param {string} outputPath - 输出图片路径
 * @param {Object} config - 配置选项
 */
async function addWatermarkToImage(inputPath, outputPath, config) {
    try {
        const {
            timeFormat = 'YYYY-MM-DD HH:mm:ss',
            position = 'bottom-left',
            fontSize = 24,
            fontColor = 'white',
            addShadow = true
        } = config;

        // 提取图片拍摄时间
        const photoDate = await extractPhotoDate(inputPath);
        const timeText = formatDate(photoDate, timeFormat);

        // 获取图片信息
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // 计算文字尺寸（估算）
        const relativeFontSize = calculateRelativeFontSize(metadata.width, metadata.height, fontSize);
        const textWidth = timeText.length * relativeFontSize * 0.6;
        const textHeight = relativeFontSize;
        const padding = calculateRelativePadding(metadata.width, metadata.height);

        // 计算水印位置
        const pos = calculateWatermarkPosition(
            metadata.width,
            metadata.height,
            textWidth,
            textHeight,
            position,
            padding
        );

        // 创建文字水印的SVG
        const shadowOffset = addShadow ? 2 : 0;
        const textSvg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <defs>
          <style>
            .watermark-text {
              font-family: Arial, sans-serif;
              font-size: ${relativeFontSize}px;
              font-weight: bold;
              fill: ${fontColor};
            }
            .watermark-shadow {
              font-family: Arial, sans-serif;
              font-size: ${relativeFontSize}px;
              font-weight: bold;
              fill: black;
              opacity: 0.5;
            }
          </style>
        </defs>
        ${addShadow ? `<text x="${pos.x + shadowOffset}" y="${pos.y + textHeight + shadowOffset}" class="watermark-shadow">${timeText}</text>` : ''}
        <text x="${pos.x}" y="${pos.y + textHeight}" class="watermark-text">${timeText}</text>
      </svg>
    `;

        // 应用水印，保持原始格式
        const outputImage = image.composite([{
            input: Buffer.from(textSvg)
        }]);

        // 根据原始格式保存
        const format = metadata.format;
        switch (format) {
            case 'jpeg':
                await outputImage.jpeg({ quality: 95 }).toFile(outputPath);
                break;
            case 'png':
                await outputImage.png({ quality: 95 }).toFile(outputPath);
                break;
            case 'webp':
                await outputImage.webp({ quality: 95 }).toFile(outputPath);
                break;
            case 'tiff':
                await outputImage.tiff({ quality: 95 }).toFile(outputPath);
                break;
            default:
                await outputImage.jpeg({ quality: 95 }).toFile(outputPath);
        }

    } catch (error) {
        throw new Error(`处理图片 ${path.basename(inputPath)} 失败: ${error.message}`);
    }
}

/**
 * 处理目录下的所有图片
 * @param {Object} config - 配置选项
 */
async function processDirectory(config) {
    const {
        inputDir,
        outputDir,
        dryRun = false
    } = config;

    // 扫描所有支持的图片
    const photos = await scanPhotos(inputDir);

    if (photos.length === 0) {
        console.log(chalk.yellow('未找到支持的图片文件'));
        return;
    }

    console.log(chalk.blue(`找到 ${photos.length} 张图片`));

    // 显示处理统计信息
    const processingStats = await getProcessingStats(photos);
    console.log(chalk.gray(`总大小: ${formatFileSize(processingStats.totalSize)}`));
    console.log(chalk.gray(`格式分布: ${Object.entries(processingStats.formats).map(([format, count]) => `${format}(${count})`).join(', ')}`));
    console.log(chalk.gray(`分辨率分布: ${Object.entries(processingStats.resolutions).map(([res, count]) => `${res}(${count})`).join(', ')}`));

    if (dryRun) {
        console.log(chalk.yellow('预览模式 - 不会修改任何文件:'));
        for (const photo of photos) {
            const photoDate = await extractPhotoDate(photo);
            const timeText = formatDate(photoDate, config.timeFormat);

            // 获取图片尺寸用于显示预览信息
            const image = sharp(photo);
            const metadata = await image.metadata();
            const { calculateRelativeFontSize, calculateRelativePadding } = require('./watermark');
            const relativeFontSize = calculateRelativeFontSize(metadata.width, metadata.height, config.fontSize);
            const relativePadding = calculateRelativePadding(metadata.width, metadata.height);

            console.log(chalk.gray(`  ${path.relative(inputDir, photo)} (${metadata.width}x${metadata.height})`));
            console.log(chalk.gray(`    时间: ${timeText}`));
            console.log(chalk.gray(`    字体大小: ${relativeFontSize}px (基础: ${config.fontSize}px)`));
            console.log(chalk.gray(`    边距: ${relativePadding}px`));
        }
        return;
    }

    // 如果指定了输出目录，创建目录结构
    if (outputDir) {
        await fs.mkdir(outputDir, { recursive: true });
    }

    const spinner = ora('正在处理图片...').start();
    let processed = 0;
    let errors = 0;

    for (const photo of photos) {
        try {
            const relativePath = path.relative(inputDir, photo);
            const outputPath = outputDir
                ? path.join(outputDir, relativePath)
                : photo;

            // 如果输出到不同目录，确保目标目录存在
            if (outputDir) {
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
            }

            await addWatermarkToImage(photo, outputPath, config);
            processed++;

            spinner.text = `正在处理图片... (${processed}/${photos.length})`;

        } catch (error) {
            errors++;
            console.log(`\n${chalk.red('❌')} ${error.message}`);
        }
    }

    spinner.stop();

    console.log(chalk.green(`\n✅ 处理完成！成功: ${processed}, 失败: ${errors}`));

    if (outputDir) {
        console.log(chalk.blue(`输出目录: ${outputDir}`));
    }

    // 输出处理统计信息
    const stats = await getProcessingStats(photos);
    console.log(chalk.blue('\n图片处理统计信息:'));
    console.log(`  总文件数: ${stats.totalFiles}`);
    console.log(`  总大小: ${formatFileSize(stats.totalSize)}`);

    const resolutionList = Object.entries(stats.resolutions);
    if (resolutionList.length > 0) {
        console.log('  尺寸分布:');
        for (const [resolution, count] of resolutionList) {
            console.log(`    ${resolution}: ${count} 张`);
        }
    }

    const formatList = Object.entries(stats.formats);
    if (formatList.length > 0) {
        console.log('  格式分布:');
        for (const [format, count] of formatList) {
            console.log(`    ${format}: ${count} 张`);
        }
    }
}

/**
 * 获取图片处理统计信息
 * @param {string[]} photos - 图片路径数组
 * @returns {Promise<Object>} 统计信息
 */
async function getProcessingStats(photos) {
    let totalSize = 0;
    const resolutions = {};
    const formats = {};

    for (const photo of photos) {
        try {
            const fileStats = await fs.stat(photo);
            totalSize += fileStats.size;

            const image = sharp(photo);
            const metadata = await image.metadata();

            const resolution = `${metadata.width}x${metadata.height}`;
            resolutions[resolution] = (resolutions[resolution] || 0) + 1;

            const format = metadata.format || 'unknown';
            formats[format] = (formats[format] || 0) + 1;
        } catch (error) {
            // 忽略无法读取的文件
        }
    }

    return {
        totalFiles: photos.length,
        totalSize: totalSize,
        resolutions: resolutions,
        formats: formats
    };
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

module.exports = {
    addWatermarkToImage,
    processDirectory,
    extractPhotoDate,
    formatDate,
    calculateRelativeFontSize,
    calculateRelativePadding
};
