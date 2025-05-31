#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const { processDirectory } = require('../lib/watermark');
const { loadConfig, saveConfig, resetConfig, getConfigPath } = require('../lib/config');
const chalk = require('chalk');

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
    .option('--dry-run', '预览模式，不实际修改文件')
    .action(async (options) => {
        try {
            let targetDir = options.directory;

            // 加载用户配置
            const savedConfig = await loadConfig();

            // 如果没有指定目录，通过交互式界面询问
            if (!targetDir) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'directory',
                        message: '请输入要处理的目录路径:',
                        default: process.cwd(),
                        validate: (input) => {
                            if (!fs.existsSync(input)) {
                                return '目录不存在，请输入有效路径';
                            }
                            if (!fs.statSync(input).isDirectory()) {
                                return '请输入一个有效的目录路径';
                            }
                            return true;
                        }
                    }
                ]);
                targetDir = answers.directory;
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
                    default: options.format || savedConfig.timeFormat
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
                    default: savedConfig.fontSize
                },
                {
                    type: 'list',
                    name: 'fontColor',
                    message: '字体颜色:',
                    choices: [
                        { name: '白色', value: 'white' },
                        { name: '黑色', value: 'black' },
                        { name: '红色', value: 'red' },
                        { name: '蓝色', value: 'blue' }
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
                const configToSave = {
                    timeFormat: config.timeFormat,
                    position: config.position,
                    fontSize: config.fontSize,
                    fontColor: config.fontColor,
                    addShadow: config.addShadow
                };
                await saveConfig(configToSave);
                console.log(chalk.green('✅ 配置已保存'));
            }

            const watermarkConfig = {
                inputDir: path.resolve(targetDir),
                outputDir: config.outputDir ? path.resolve(config.outputDir) : null,
                timeFormat: config.timeFormat,
                position: config.position,
                fontSize: config.fontSize,
                fontColor: config.fontColor,
                addShadow: config.addShadow,
                dryRun: options.dryRun
            };

            console.log(chalk.blue('开始处理照片...'));
            await processDirectory(watermarkConfig);
            console.log(chalk.green('✅ 处理完成！'));

        } catch (error) {
            console.error(chalk.red('❌ 错误:', error.message));
            process.exit(1);
        }
    });

program
    .command('list')
    .description('列出指定目录下支持的图片文件')
    .argument('<directory>', '要扫描的目录路径')
    .action(async (directory) => {
        try {
            const { scanPhotos } = require('../lib/scanner');
            const photos = await scanPhotos(directory);

            if (photos.length === 0) {
                console.log(chalk.yellow('未找到支持的图片文件'));
                return;
            }

            console.log(chalk.blue(`找到 ${photos.length} 个图片文件:`));
            photos.forEach((photo, index) => {
                console.log(chalk.gray(`${index + 1}. ${path.relative(directory, photo)}`));
            });
        } catch (error) {
            console.error(chalk.red('❌ 错误:', error.message));
            process.exit(1);
        }
    });

program
    .command('config')
    .description('管理配置设置')
    .option('-s, --show', '显示当前配置')
    .option('-r, --reset', '重置为默认配置')
    .option('--path', '显示配置文件路径')
    .action(async (options) => {
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
            console.error(chalk.red('❌ 错误:', error.message));
            process.exit(1);
        }
    });

// 如果没有参数，显示帮助
if (process.argv.length === 2) {
    program.help();
}

program.parse();
