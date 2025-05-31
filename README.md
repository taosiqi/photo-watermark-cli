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

## 📋 完整使用指南

### 1. 交互式模式（推荐新手使用）

```bash
# 启动交互式界面
npm start

# 或者直接运行
photo-watermark add
```

这将启动交互式界面，逐步引导你完成配置。

### 2. 命令行模式（推荐高级用户）

```bash
# 基本用法 - 为指定目录下的照片添加水印
photo-watermark add -d /path/to/your/photos

# 指定输出目录（不覆盖原文件）
photo-watermark add -d /path/to/photos -o /path/to/output

# 自定义时间格式
photo-watermark add -d /path/to/photos -f "YYYY年MM月DD日 HH:mm"

# 启用交互式模式
photo-watermark add -d ./photos -i

# 列出目录下所有支持的图片文件
photo-watermark list /path/to/photos
```

### 3. 配置管理

```bash
# 显示当前配置
photo-watermark config

# 重置配置
photo-watermark config --reset

# 显示配置文件路径
photo-watermark config --path
```

## 🎨 配置选项

### 时间来源

1. **EXIF 信息**：优先使用照片的拍摄时间（DateTimeOriginal、DateTime、DateTimeDigitized）
2. **文件时间**：如果没有 EXIF 信息，使用文件的修改时间

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

## 💡 使用场景示例

### 场景 1：旅行照片整理

```bash
# 为旅行照片添加拍摄时间，输出到新目录
photo-watermark add -d ~/Pictures/旅行2024 -o ~/Pictures/旅行2024_带水印
```

### 场景 2：活动照片批处理

```bash
# 预览效果（不修改文件）
photo-watermark add -d ./event_photos --dry-run

# 确认无误后执行
photo-watermark add -d ./event_photos -f "YYYY年MM月DD日 HH:mm"
```

### 场景 3：照片存档

```bash
# 直接在原图上添加水印（请先备份！）
photo-watermark add -d ./archive_photos
```

## ⚠️ 注意事项

1. **备份重要照片**：建议在处理重要照片前先做备份
2. **预览功能**：使用 `--dry-run` 选项可以预览效果而不修改文件
3. **输出目录**：如果指定输出目录，会保持原有的目录结构
4. **性能**：使用 Sharp 库，处理速度较快，但大量高分辨率照片可能需要一些时间
5. **权限**：确保对目标目录有读写权限

## 🔧 故障排除

### 常见问题

1. **"目录不存在"错误**

   - 检查路径是否正确
   - 使用绝对路径或相对于当前目录的正确路径

2. **"权限被拒绝"错误**

   - 检查目录和文件的读写权限
   - 在 macOS/Linux 上可能需要使用 `sudo`

3. **"未找到图片文件"**

   - 确认目录下有支持的图片格式
   - 使用 `list` 命令检查可识别的文件

4. **处理缓慢**
   - 大文件和高分辨率图片需要更多处理时间
   - 可以先用小批量测试

### 获取帮助

```bash
# 查看整体帮助
photo-watermark --help

# 查看特定命令帮助
photo-watermark add --help
photo-watermark list --help
photo-watermark config --help
```

## 🛠️ 开发指南

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
npm run test
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

### 开发流程

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📝 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [npm 包](https://www.npmjs.com/package/photo-watermark-cli)
- [GitHub 仓库](https://github.com/taosiqi/photo-watermark-cli)
- [问题反馈](https://github.com/taosiqi/photo-watermark-cli/issues)
- [更多使用示例](EXAMPLES.md)

## 📊 项目统计

- 🎯 智能相对大小算法确保水印视觉一致性
- 📦 包大小：~19KB（压缩后）
- ⚡ 支持所有主流图片格式
- 🔧 完全类型安全的 TypeScript 实现
- 🌟 现代化的 CLI 交互体验

---

⭐ 如果这个项目对你有帮助，请给它一个星星！
