# Photo Watermark CLI

一个 Node.js 命令行工具，用于为目录下的所有照片添加时间水印。

## 功能特性

- 📸 自动扫描目录下的所有图片文件
- ⏰ 从 EXIF 信息提取拍摄时间，或使用文件修改时间
- 🎨 支持多种水印位置（左下角、右下角、左上角、右上角）
- 🎭 可自定义字体大小、颜色和阴影效果
- 📁 支持输出到指定目录或覆盖原文件
- 🔍 预览模式，可在不修改文件的情况下查看效果
- 🛡️ 支持多种图片格式：JPG、PNG、TIFF、WebP、BMP

## 安装

```bash
npm install
```

## 使用方法

### 交互式模式

```bash
npm start
# 或
node bin/watermark.js add
```

### 命令行模式

```bash
# 为指定目录添加水印
node bin/watermark.js add -d /path/to/photos

# 指定输出目录
node bin/watermark.js add -d /path/to/photos -o /path/to/output

# 自定义时间格式
node bin/watermark.js add -d /path/to/photos -f "YYYY年MM月DD日"

# 预览模式（不修改文件）
node bin/watermark.js add -d /path/to/photos --dry-run

# 列出目录下的所有支持的图片
node bin/watermark.js list /path/to/photos
```

### 配置选项

- **目录路径**: 要处理的图片目录
- **输出目录**: 水印图片的保存位置（可选，留空则覆盖原文件）
- **时间格式**: 支持 `YYYY-MM-DD HH:mm:ss` 等格式
- **水印位置**: 左下角、右下角、左上角、右上角
- **字体大小**: 以像素为单位
- **字体颜色**: 白色、黑色、红色、蓝色
- **文字阴影**: 提高文字在复杂背景下的可读性

## 支持的图片格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- TIFF (.tiff)
- WebP (.webp)
- BMP (.bmp)

## 示例

```bash
# 基本使用
node bin/watermark.js add -d ./photos

# 高级使用
node bin/watermark.js add \
  -d ./photos \
  -o ./watermarked \
  -f "YYYY-MM-DD HH:mm:ss" \
  --dry-run
```

## 开发

项目结构：

```
├── bin/
│   └── watermark.js     # CLI入口
├── lib/
│   ├── scanner.js       # 图片扫描模块
│   └── watermark.js     # 水印处理模块
├── package.json
└── README.md
```

## 依赖库

- `sharp`: 高性能图片处理
- `commander`: CLI 框架
- `inquirer`: 交互式命令行界面
- `exif-reader`: EXIF 信息读取
- `glob`: 文件匹配
- `chalk`: 终端颜色输出
- `ora`: 加载动画

## 许可证

MIT
