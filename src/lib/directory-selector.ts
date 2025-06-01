import inquirer from 'inquirer';
import { readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

export interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export class DirectorySelector {
  private currentPath: string;

  constructor(initialPath?: string) {
    this.currentPath = initialPath || process.cwd();
  }

  /**
   * 获取当前目录下的所有文件夹和返回上级目录的选项
   */
  private getDirectoryItems(): DirectoryItem[] {
    const items: DirectoryItem[] = [];

    try {
      // 添加返回上级目录选项（除非已经在根目录）
      const parentPath = dirname(this.currentPath);
      if (parentPath !== this.currentPath) {
        items.push({
          name: '📁 .. (返回上级目录)',
          path: parentPath,
          isDirectory: true
        });
      }

      // 添加快捷目录选项
      if (this.currentPath !== homedir()) {
        items.push({
          name: '🏠 用户主目录',
          path: homedir(),
          isDirectory: true
        });
      }

      if (this.currentPath !== process.cwd()) {
        items.push({
          name: '📂 当前工作目录',
          path: process.cwd(),
          isDirectory: true
        });
      }

      // 添加当前目录下的所有文件夹
      const entries = readdirSync(this.currentPath);
      const directories = entries
        .filter(entry => {
          try {
            const fullPath = join(this.currentPath, entry);
            return statSync(fullPath).isDirectory() && !entry.startsWith('.');
          } catch {
            return false;
          }
        })
        .sort()
        .map(entry => ({
          name: `📁 ${entry}`,
          path: join(this.currentPath, entry),
          isDirectory: true
        }));

      items.push(...directories);

      // 添加选择当前目录的选项
      items.push({
        name: `✅ 选择当前目录: ${this.currentPath}`,
        path: this.currentPath,
        isDirectory: false
      });

    } catch (error) {
      console.error(chalk.red('读取目录失败:', (error as Error).message));
    }

    return items;
  }

  /**
   * 显示目录选择器
   */
  async selectDirectory(): Promise<string> {
    while (true) {
      console.clear();
      console.log(chalk.blue('📁 文件夹选择器'));
      console.log(chalk.gray('当前位置:'), chalk.cyan(this.currentPath));
      console.log(chalk.gray('使用方向键选择，Enter确认\n'));

      const items = this.getDirectoryItems();
      
      if (items.length === 0) {
        console.log(chalk.yellow('当前目录没有可访问的子文件夹'));
        return this.currentPath;
      }

      const choices = items.map(item => ({
        name: item.name,
        value: item
      }));

      const { selectedItem } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedItem',
          message: '请选择一个选项:',
          choices,
          pageSize: Math.min(15, choices.length)
        }
      ]);

      // 如果选择的是目录，继续浏览
      if (selectedItem.isDirectory) {
        this.currentPath = resolve(selectedItem.path);
      } else {
        // 选择当前目录，返回结果
        return this.currentPath;
      }
    }
  }
}

/**
 * 便捷函数：显示文件夹选择器
 */
export async function selectDirectory(initialPath?: string): Promise<string> {
  const selector = new DirectorySelector(initialPath);
  return await selector.selectDirectory();
}
