#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { resolve, relative } from 'path';
import { existsSync, statSync } from 'fs';
import { processDirectory } from '../lib/watermark';
import { loadConfig, saveConfig, resetConfig, getConfigPath } from '../lib/config';
import { scanPhotos } from '../lib/scanner';
import chalk from 'chalk';
import type { WatermarkConfig, CLIOptions, WatermarkOptions } from '../types';

program
  .name('watermark')
  .description('为目录下的所有照片添加时间水印')
  .version('1.0.0');

program
  .command('add')
  .description('为指定目录下的照片添加时间水印')
  .option('-d, --directory <path>', '指定要处理的目录路径')
  .option('-o, --output <path>', '指定输出目录路径（可选）')
  .option('-f, --format <format>', '时间格式（默认：YYYY-MM-DD HH:mm:ss）')
  .option('--overwrite', '覆盖已存在的文件')
  .option('-i, --interactive', '使用交互式模式')
  .action(async (options: CLIOptions) => {
    try {
      let targetDir = options.directory;

      // 加载用户配置
      const savedConfig = await loadConfig();

      // 如果没有指定目录或启用交互式模式，通过交互式界面询问
      if (!targetDir || options.interactive) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'directory',
            message: '请输入要处理的目录路径:',
            default: options.directory || process.cwd(),
            validate: (input: string) => {
              if (!existsSync(input)) {
                return '目录不存在，请输入有效路径';
              }
              if (!statSync(input).isDirectory()) {
                return '请输入一个有效的目录路径';
              }
              return true;
            }
          }
        ]);
        targetDir = answers.directory;
      }

      if (!targetDir) {
        console.error(chalk.red('❌ 错误: 必须指定目录路径'));
        process.exit(1);
      }

      // 确认处理选项，使用保存的配置作为默认值
      const config = await inquirer.prompt([
        {
          type: 'input',
          name: 'outputDir',
          message: '输出目录（留空则覆盖原文件）:',
          default: options.output || ''
        },
        {
          type: 'input',
          name: 'timeFormat', 
          message: '时间格式:',
          default: options.format || savedConfig.timeFormat,
          validate: (input: string) => {
            if (!input.trim()) {
              return '时间格式不能为空';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'position',
          message: '水印位置:',
          choices: [
            { name: '左下角', value: 'bottom-left' },
            { name: '右下角', value: 'bottom-right' },
            { name: '左上角', value: 'top-left' },
            { name: '右上角', value: 'top-right' }
          ],
          default: savedConfig.position
        },
        {
          type: 'number',
          name: 'fontSize',
          message: '字体大小（像素）:',
          default: savedConfig.fontSize,
          validate: (input: number) => {
            if (input < 12 || input > 50) {
              return '字体大小必须在 12-50 像素之间';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'fontColor',
          message: '字体颜色:',
          choices: [
            { name: '白色', value: 'white' },
            { name: '黑色', value: 'black' },
            { name: '红色', value: 'red' },
            { name: '蓝色', value: 'blue' },
            { name: '绿色', value: 'green' },
            { name: '黄色', value: 'yellow' }
          ],
          default: savedConfig.fontColor
        },
        {
          type: 'confirm',
          name: 'addShadow',
          message: '添加文字阴影以提高可读性?',
          default: savedConfig.addShadow
        },
        {
          type: 'number',
          name: 'quality',
          message: '图片质量 (1-100):',
          default: savedConfig.quality,
          validate: (input: number) => {
            if (input < 1 || input > 100) {
              return '图片质量必须在 1-100 之间';
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'saveAsDefault',
          message: '保存这些设置为默认配置?',
          default: false
        },
        {
          type: 'confirm',
          name: 'proceed',
          message: '确认开始处理?',
          default: true
        }
      ]);

      if (!config.proceed) {
        console.log(chalk.yellow('操作已取消'));
        return;
      }

      // 如果用户选择保存配置
      if (config.saveAsDefault) {
        const configToSave: Partial<WatermarkConfig> = {
          timeFormat: config.timeFormat,
          position: config.position,
          fontSize: config.fontSize,
          fontColor: config.fontColor,
          addShadow: config.addShadow,
          quality: config.quality
        };
        await saveConfig(configToSave);
        console.log(chalk.green('✅ 配置已保存'));
      }

      const watermarkOptions: WatermarkOptions = {
        inputDir: resolve(targetDir),
        outputDir: config.outputDir ? resolve(config.outputDir) : undefined,
        config: {
          timeFormat: config.timeFormat,
          position: config.position,
          fontSize: config.fontSize,
          fontColor: config.fontColor,
          addShadow: config.addShadow,
          quality: config.quality
        },
        overwrite: options.overwrite || false
      };

      console.log(chalk.blue('开始处理照片...'));
      const result = await processDirectory(watermarkOptions);
      
      if (result.success) {
        console.log(chalk.green('✅ 处理完成！'));
      } else {
        console.log(chalk.yellow(`⚠️ 处理完成，但有 ${result.errors.length} 个错误`));
        result.errors.forEach(error => {
          console.log(chalk.red(`  • ${error}`));
        });
      }

    } catch (error) {
      console.error(chalk.red('❌ 错误:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出指定目录下支持的图片文件')
  .argument('<directory>', '要扫描的目录路径')
  .action(async (directory: string) => {
    try {
      const photos = await scanPhotos(directory);

      if (photos.length === 0) {
        console.log(chalk.yellow('未找到支持的图片文件'));
        return;
      }

      console.log(chalk.blue(`找到 ${photos.length} 个图片文件:`));
      photos.forEach((photo, index) => {
        console.log(chalk.gray(`${index + 1}. ${relative(directory, photo)}`));
      });
    } catch (error) {
      console.error(chalk.red('❌ 错误:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('管理配置设置')
  .option('-s, --show', '显示当前配置')
  .option('-r, --reset', '重置为默认配置')
  .option('--path', '显示配置文件路径')
  .action(async (options: { show?: boolean; reset?: boolean; path?: boolean }) => {
    try {
      if (options.path) {
        console.log(chalk.blue('配置文件路径:'), getConfigPath());
        return;
      }

      if (options.reset) {
        const confirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: '确认重置所有配置为默认值?',
            default: false
          }
        ]);

        if (confirm.confirmed) {
          await resetConfig();
          console.log(chalk.green('✅ 配置已重置为默认值'));
        } else {
          console.log(chalk.yellow('操作已取消'));
        }
        return;
      }

      // 显示当前配置
      const config = await loadConfig();
      console.log(chalk.blue('当前配置:'));
      console.log(chalk.gray('时间格式:'), config.timeFormat);
      console.log(chalk.gray('水印位置:'), config.position);
      console.log(chalk.gray('字体大小:'), config.fontSize + 'px');
      console.log(chalk.gray('字体颜色:'), config.fontColor);
      console.log(chalk.gray('文字阴影:'), config.addShadow ? '是' : '否');
      console.log(chalk.gray('图片质量:'), config.quality + '%');
      console.log(chalk.gray('配置文件:'), getConfigPath());

    } catch (error) {
      console.error(chalk.red('❌ 错误:', (error as Error).message));
      process.exit(1);
    }
  });

// 如果没有参数，显示帮助
if (process.argv.length === 2) {
  program.help();
}

program.parse();
