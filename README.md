# 📸 Photo Watermark CLI

一个现代化的 TypeScript CLI 工具，用于智能地为照片添加时间水印。

[![npm version](https://badge.fury.io/js/photo-watermark-cli.svg)](https://badge.fury.io/js/photo-watermark-cli)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 🎯 **智能相对大小算法** - 根据图片分辨率自动调整水印大小
- 📸 **EXIF 时间提取** - 优先使用照片的实际拍摄时间
- 🎨 **多种水印位置** - 支持四个角落的灵活定位
- 🖼️ **全格式支持** - JPG、PNG、TIFF、WebP、BMP
- ⚡ **高性能处理** - 基于 Sharp 库的快速图像处理
- 🔧 **配置持久化** - 个人设置自动保存
- 💻 **现代 TypeScript** - 完全类型安全的开发体验
- 🎪 **交互式界面** - 友好的命令行交互体验

## 🚀 快速开始

### 安装

```bash
npm install -g photo-watermark-cli
```

### 基本使用

```bash
# 交互式模式（推荐）
photo-watermark add

# 命令行模式
photo-watermark add -d /path/to/photos -o /path/to/output
```

## 📋 命令指南

### 添加水印

```bash
# 交互式选择所有选项
photo-watermark add

# 指定目录和输出
photo-watermark add -d ./photos -o ./watermarked

# 自定义时间格式
photo-watermark add -d ./photos -f "YYYY年MM月DD日 HH:mm"

# 启用交互式模式
photo-watermark add -d ./photos -i
```

### 列出支持的文件

```bash
photo-watermark list ./photos
```

### 配置管理

```bash
# 显示当前配置
photo-watermark config

# 重置配置
photo-watermark config --reset

# 显示配置文件路径
photo-watermark config --path
```

## 🎨 配置选项

### 时间格式

- `YYYY-MM-DD HH:mm:ss` (默认): 2024-12-01 14:30:25
- `YYYY年MM月DD日`: 2024 年 12 月 01 日
- `MM/DD/YYYY HH:mm`: 12/01/2024 14:30
- `DD.MM.YYYY`: 01.12.2024

### 水印位置

- **左下角** (bottom-left) - 默认位置
- **右下角** (bottom-right)
- **左上角** (top-left)
- **右上角** (top-right)

### 样式选项

- **字体大小**: 12-48 像素，智能相对缩放
- **字体颜色**: 白色、黑色、红色、蓝色、绿色、黄色
- **文字阴影**: 增强复杂背景下的可读性
- **图片质量**: 1-100，控制输出文件质量

## 🔧 智能相对大小算法

本工具的核心特性是智能相对大小算法，确保水印在不同分辨率的图片上都有合适的大小：

| 分辨率             | 字体大小 | 缩放比例 |
| ------------------ | -------- | -------- |
| 640x480 (标清)     | 12px     | 0.25x    |
| 1920x1080 (全高清) | 14px     | 0.56x    |
| 3840x2160 (4K)     | 27px     | 1.13x    |
| 7680x4320 (8K)     | 54px     | 2.25x    |

## 📁 支持的图片格式

- **JPEG** (.jpg, .jpeg) - 最常用的照片格式
- **PNG** (.png) - 支持透明度的图片格式
- **TIFF** (.tiff) - 高质量专业图像格式
- **WebP** (.webp) - 现代网络优化格式
- **BMP** (.bmp) - Windows 位图格式

## 🛠️ 开发

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.0.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/taosiqi/photo-watermark-cli.git
cd photo-watermark-cli

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test
```

### 项目结构

```
├── src/
│   ├── types.ts          # TypeScript 类型定义
│   ├── bin/
│   │   └── watermark.ts  # CLI 入口点
│   └── lib/
│       ├── config.ts     # 配置管理
│       ├── scanner.ts    # 图片扫描
│       └── watermark.ts  # 核心水印处理
├── dist/                 # 构建输出目录
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细指南。

## 📝 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [npm 包](https://www.npmjs.com/package/photo-watermark-cli)
- [GitHub 仓库](https://github.com/taosiqi/photo-watermark-cli)
- [问题反馈](https://github.com/taosiqi/photo-watermark-cli/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星星！
