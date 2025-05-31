import { promises as fs } from 'fs';
import { extname } from 'path';
import { glob } from 'glob';

// 支持的图片格式
export const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.tiff', '.webp', '.bmp'] as const;

/**
 * 扫描目录下的所有支持的图片文件
 * @param directory - 要扫描的目录路径
 * @returns 图片文件路径数组
 */
export async function scanPhotos(directory: string): Promise<string[]> {
  try {
    // 验证目录是否存在
    await fs.access(directory);

    // 使用glob模式匹配所有支持的图片文件
    const patterns = [
      ...SUPPORTED_FORMATS.map(ext => `**/*${ext}`),
      ...SUPPORTED_FORMATS.map(ext => `**/*${ext.toUpperCase()}`)
    ];

    const allFiles: string[] = [];

    for (const pattern of patterns) {
      const files = await glob(pattern, {
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
    throw new Error(`扫描目录失败: ${(error as Error).message}`);
  }
}

/**
 * 检查文件是否为支持的图片格式
 * @param filePath - 文件路径
 * @returns 是否为支持的图片格式
 */
export function isSupportedImage(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext as typeof SUPPORTED_FORMATS[number]);
}
