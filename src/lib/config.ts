import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { WatermarkConfig } from '../types';

// 配置文件路径
const CONFIG_DIR = join(homedir(), '.watermark-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// 默认配置
export const DEFAULT_CONFIG: WatermarkConfig = {
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
async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    // 目录可能已存在，忽略错误
  }
}

/**
 * 加载配置文件
 * @returns 配置对象
 */
export async function loadConfig(): Promise<WatermarkConfig> {
  try {
    await ensureConfigDir();
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData) as Partial<WatermarkConfig>;

    // 合并默认配置和用户配置
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    // 配置文件不存在或损坏，返回默认配置
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * 保存配置文件
 * @param config - 要保存的配置
 */
export async function saveConfig(config: Partial<WatermarkConfig>): Promise<void> {
  try {
    await ensureConfigDir();
    const configToSave = { ...DEFAULT_CONFIG, ...config };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(configToSave, null, 2));
  } catch (error) {
    throw new Error(`保存配置失败: ${(error as Error).message}`);
  }
}

/**
 * 重置配置为默认值
 */
export async function resetConfig(): Promise<void> {
  try {
    await saveConfig(DEFAULT_CONFIG);
  } catch (error) {
    throw new Error(`重置配置失败: ${(error as Error).message}`);
  }
}

/**
 * 获取配置文件路径
 * @returns 配置文件路径
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
