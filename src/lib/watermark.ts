import sharp from 'sharp';
import { promises as fs } from 'fs';
import { basename, relative, dirname, join } from 'path';
import exifReader from 'exif-reader';
import { scanPhotos } from './scanner';
import ora from 'ora';
import chalk from 'chalk';
import moment from 'moment';
import type { WatermarkConfig, ImageInfo, WatermarkOptions, ProcessResult, FontSize } from '../types';

/**
 * 从图片中提取拍摄时间
 */
export async function extractPhotoDate(imagePath: string): Promise<Date> {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (metadata.exif) {
      const exif = exifReader(metadata.exif);

      // 尝试从不同的EXIF字段获取日期
      const dateFields = [
        (exif as any).exif?.DateTimeOriginal,
        (exif as any).exif?.DateTime,
        (exif as any).exif?.DateTimeDigitized
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
    console.warn(chalk.yellow(`⚠️  无法提取 ${basename(imagePath)} 的时间信息，使用文件修改时间`));
    const fileStats = await fs.stat(imagePath);
    return fileStats.mtime;
  }
}

/**
 * 格式化日期，使用 moment.js 提供更好的格式化支持
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return moment(date).format(format);
}

/**
 * 计算水印位置
 */
function calculateWatermarkPosition(
  imageWidth: number,
  imageHeight: number,
  textWidth: number,
  textHeight: number,
  position: WatermarkConfig['position'],
  padding: number = 20
): { x: number; y: number } {
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
 */
export function calculateRelativeFontSize(
  imageWidth: number,
  imageHeight: number,
  baseFontSize: number = 24,
  baseResolution: number = 1920
): number {
  // 计算图片的较小边作为参考
  const minDimension = Math.min(imageWidth, imageHeight);

  // 根据比例调整字体大小，确保在不同分辨率下保持视觉一致性
  const scaleFactor = minDimension / baseResolution;

  // 设置最小和最大字体大小限制
  const minFontSize = 12;
  const maxFontSize = 200;

  const calculatedSize = Math.round(baseFontSize * scaleFactor);

  return Math.max(minFontSize, Math.min(maxFontSize, calculatedSize));
}

/**
 * 计算相对于图片尺寸的边距
 */
export function calculateRelativePadding(
  imageWidth: number,
  imageHeight: number,
  basePadding: number = 20
): number {
  const minDimension = Math.min(imageWidth, imageHeight);
  const scaleFactor = minDimension / 1920;

  const minPadding = 10;
  const maxPadding = 50;

  const calculatedPadding = Math.round(basePadding * scaleFactor);

  return Math.max(minPadding, Math.min(maxPadding, calculatedPadding));
}

/**
 * 为单张图片添加水印
 */
export async function addWatermarkToImage(
  inputPath: string,
  outputPath: string,
  config: WatermarkConfig
): Promise<void> {
  try {
    const {
      timeFormat = 'YYYY-MM-DD HH:mm:ss',
      position = 'bottom-left',
      fontSize = 24,
      fontColor = 'white',
      addShadow = true,
      quality = 95,
      brightness = 1.0
    } = config;

    // 提取图片拍摄时间
    const photoDate = await extractPhotoDate(inputPath);
    const timeText = formatDate(photoDate, timeFormat);

    // 获取图片信息
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }

    // 创建图像处理管道，首先应用亮度调整
    let processedImage = image;
    
    // 如果亮度不是默认值（1.0），则应用亮度调整
    if (brightness !== 1.0) {
      // Sharp 的 modulate 方法中，brightness 值的意义：
      // 1.0 = 原始亮度，> 1.0 = 增亮，< 1.0 = 变暗
      processedImage = processedImage.modulate({ brightness });
    }

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
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              font-size: ${relativeFontSize}px;
              font-weight: 600;
              fill: ${fontColor};
            }
            .watermark-shadow {
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              font-size: ${relativeFontSize}px;
              font-weight: 600;
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
    const outputImage = processedImage.composite([{
      input: Buffer.from(textSvg)
    }]);

    // 根据原始格式保存
    const format = metadata.format;
    switch (format) {
      case 'jpeg':
        await outputImage.jpeg({ quality }).toFile(outputPath);
        break;
      case 'png':
        await outputImage.png().toFile(outputPath);
        break;
      case 'webp':
        await outputImage.webp({ quality }).toFile(outputPath);
        break;
      case 'tiff':
        await outputImage.tiff().toFile(outputPath);
        break;
      default:
        await outputImage.jpeg({ quality }).toFile(outputPath);
    }

  } catch (error) {
    throw new Error(`处理图片 ${basename(inputPath)} 失败: ${(error as Error).message}`);
  }
}

/**
 * 仅调整图片亮度，不添加水印
 */
export async function adjustImageBrightness(
  inputPath: string,
  outputPath: string,
  brightness: number = 1.0,
  quality: number = 95
): Promise<void> {
  try {
    // 获取图片信息
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }

    // 创建图像处理管道，应用亮度调整
    let processedImage = image;
    
    // 如果亮度不是默认值（1.0），则应用亮度调整
    if (brightness !== 1.0) {
      processedImage = processedImage.modulate({ brightness });
    }

    // 根据原始格式保存
    const format = metadata.format;
    switch (format) {
      case 'jpeg':
        await processedImage.jpeg({ quality }).toFile(outputPath);
        break;
      case 'png':
        await processedImage.png().toFile(outputPath);
        break;
      case 'webp':
        await processedImage.webp({ quality }).toFile(outputPath);
        break;
      case 'tiff':
        await processedImage.tiff().toFile(outputPath);
        break;
      default:
        await processedImage.jpeg({ quality }).toFile(outputPath);
    }

  } catch (error) {
    throw new Error(`调整图片亮度 ${basename(inputPath)} 失败: ${(error as Error).message}`);
  }
}

/**
 * 处理目录下的所有图片，仅调整亮度
 */
export async function processBrightnessOnly(options: WatermarkOptions): Promise<ProcessResult> {
  const {
    inputDir,
    outputDir,
    config,
    overwrite = false
  } = options;

  // 扫描所有支持的图片
  const photos = await scanPhotos(inputDir);

  if (photos.length === 0) {
    console.log(chalk.yellow('未找到支持的图片文件'));
    return {
      success: false,
      processed: 0,
      skipped: 0,
      errors: ['未找到支持的图片文件']
    };
  }

  console.log(chalk.blue(`找到 ${photos.length} 张图片`));

  // 显示处理统计信息
  const processingStats = await getProcessingStats(photos);
  console.log(chalk.gray(`总大小: ${formatFileSize(processingStats.totalSize)}`));
  console.log(chalk.gray(`格式分布: ${Object.entries(processingStats.formats).map(([format, count]) => `${format}(${count})`).join(', ')}`));

  // 如果指定了输出目录，创建目录结构
  if (outputDir) {
    await fs.mkdir(outputDir, { recursive: true });
  }

  const spinner = ora('正在调整图片亮度...').start();
  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const photo of photos) {
    try {
      const relativePath = relative(inputDir, photo);
      const outputPath = outputDir
        ? join(outputDir, relativePath)
        : photo;

      // 如果输出到不同目录，确保目标目录存在
      if (outputDir) {
        await fs.mkdir(dirname(outputPath), { recursive: true });
      }

      // 检查文件是否已存在且不允许覆盖
      if (!overwrite && outputPath !== photo) {
        try {
          await fs.access(outputPath);
          skipped++;
          continue;
        } catch {
          // 文件不存在，可以继续
        }
      }

      await adjustImageBrightness(
        photo, 
        outputPath, 
        config?.brightness || 1.0,
        config?.quality || 95
      );
      processed++;

      spinner.text = `正在调整图片亮度... (${processed}/${photos.length})`;

    } catch (error) {
      const errorMsg = `${basename(photo)}: ${(error as Error).message}`;
      errors.push(errorMsg);
      console.log(`\n${chalk.red('❌')} ${errorMsg}`);
    }
  }

  spinner.stop();

  const success = errors.length === 0;
  console.log(chalk.green(`\n✅ 亮度调整完成！成功: ${processed}, 跳过: ${skipped}, 失败: ${errors.length}`));

  if (outputDir) {
    console.log(chalk.blue(`输出目录: ${outputDir}`));
  }

  return {
    success,
    processed,
    skipped,
    errors
  };
}

/**
 * 处理目录下的所有图片
 */
export async function processDirectory(options: WatermarkOptions): Promise<ProcessResult> {
  const {
    inputDir,
    outputDir,
    config,
    overwrite = false
  } = options;

  // 扫描所有支持的图片
  const photos = await scanPhotos(inputDir);

  if (photos.length === 0) {
    console.log(chalk.yellow('未找到支持的图片文件'));
    return {
      success: false,
      processed: 0,
      skipped: 0,
      errors: ['未找到支持的图片文件']
    };
  }

  console.log(chalk.blue(`找到 ${photos.length} 张图片`));

  // 显示处理统计信息
  const processingStats = await getProcessingStats(photos);
  console.log(chalk.gray(`总大小: ${formatFileSize(processingStats.totalSize)}`));
  console.log(chalk.gray(`格式分布: ${Object.entries(processingStats.formats).map(([format, count]) => `${format}(${count})`).join(', ')}`));
  console.log(chalk.gray(`分辨率分布: ${Object.entries(processingStats.resolutions).map(([res, count]) => `${res}(${count})`).join(', ')}`));

  // 如果指定了输出目录，创建目录结构
  if (outputDir) {
    await fs.mkdir(outputDir, { recursive: true });
  }

  const spinner = ora('正在处理图片...').start();
  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const photo of photos) {
    try {
      const relativePath = relative(inputDir, photo);
      const outputPath = outputDir
        ? join(outputDir, relativePath)
        : photo;

      // 如果输出到不同目录，确保目标目录存在
      if (outputDir) {
        await fs.mkdir(dirname(outputPath), { recursive: true });
      }

      // 检查文件是否已存在且不允许覆盖
      if (!overwrite && outputPath !== photo) {
        try {
          await fs.access(outputPath);
          skipped++;
          continue;
        } catch {
          // 文件不存在，可以继续
        }
      }

      await addWatermarkToImage(photo, outputPath, {
        timeFormat: config?.timeFormat || 'YYYY-MM-DD HH:mm:ss',
        position: config?.position || 'bottom-left',
        fontSize: config?.fontSize || 24,
        fontColor: config?.fontColor || 'white',
        addShadow: config?.addShadow !== false,
        quality: config?.quality || 95,
        brightness: config?.brightness || 1.0
      });
      processed++;

      spinner.text = `正在处理图片... (${processed}/${photos.length})`;

    } catch (error) {
      const errorMsg = `${basename(photo)}: ${(error as Error).message}`;
      errors.push(errorMsg);
      console.log(`\n${chalk.red('❌')} ${errorMsg}`);
    }
  }

  spinner.stop();

  const success = errors.length === 0;
  console.log(chalk.green(`\n✅ 处理完成！成功: ${processed}, 跳过: ${skipped}, 失败: ${errors.length}`));

  if (outputDir) {
    console.log(chalk.blue(`输出目录: ${outputDir}`));
  }

  // 输出处理统计信息
  console.log(chalk.blue('\n图片处理统计信息:'));
  console.log(`  总文件数: ${processingStats.totalFiles}`);
  console.log(`  总大小: ${formatFileSize(processingStats.totalSize)}`);

  const resolutionList = Object.entries(processingStats.resolutions);
  if (resolutionList.length > 0) {
    console.log('  尺寸分布:');
    for (const [resolution, count] of resolutionList) {
      console.log(`    ${resolution}: ${count} 张`);
    }
  }

  const formatList = Object.entries(processingStats.formats);
  if (formatList.length > 0) {
    console.log('  格式分布:');
    for (const [format, count] of formatList) {
      console.log(`    ${format}: ${count} 张`);
    }
  }

  return {
    success,
    processed,
    skipped,
    errors
  };
}

/**
 * 获取图片处理统计信息
 */
async function getProcessingStats(photos: string[]): Promise<{
  totalFiles: number;
  totalSize: number;
  resolutions: Record<string, number>;
  formats: Record<string, number>;
}> {
  let totalSize = 0;
  const resolutions: Record<string, number> = {};
  const formats: Record<string, number> = {};

  for (const photo of photos) {
    try {
      const fileStats = await fs.stat(photo);
      totalSize += fileStats.size;

      const image = sharp(photo);
      const metadata = await image.metadata();

      if (metadata.width && metadata.height) {
        const resolution = `${metadata.width}x${metadata.height}`;
        resolutions[resolution] = (resolutions[resolution] || 0) + 1;
      }

      const format = metadata.format || 'unknown';
      formats[format] = (formats[format] || 0) + 1;
    } catch (error) {
      // 忽略无法读取的文件
    }
  }

  return {
    totalFiles: photos.length,
    totalSize,
    resolutions,
    formats
  };
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
