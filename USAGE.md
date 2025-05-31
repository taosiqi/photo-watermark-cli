# 使用指南

## 快速开始

### 1. 交互式模式（推荐新手使用）

```bash
npm start
```

或者：

```bash
node bin/watermark.js add
```

这将启动交互式界面，逐步引导你完成配置。

### 2. 命令行模式（推荐高级用户）

```bash
# 基本用法 - 为指定目录下的照片添加水印
node bin/watermark.js add -d /path/to/your/photos

# 指定输出目录（不覆盖原文件）
node bin/watermark.js add -d /path/to/photos -o /path/to/output

# 自定义时间格式
node bin/watermark.js add -d /path/to/photos -f "YYYY年MM月DD日 HH:mm"

# 预览模式（查看效果但不修改文件）
node bin/watermark.js add -d /path/to/photos --dry-run

# 列出目录下所有支持的图片文件
node bin/watermark.js list /path/to/photos
```

## 功能说明

### 时间来源

1. **EXIF 信息**：优先使用照片的拍摄时间（DateTimeOriginal、DateTime、DateTimeDigitized）
2. **文件时间**：如果没有 EXIF 信息，使用文件的修改时间

### 支持的图片格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- TIFF (.tiff)
- WebP (.webp)
- BMP (.bmp)

### 水印配置选项

#### 时间格式

- `YYYY-MM-DD HH:mm:ss` (默认): 2024-12-01 14:30:25
- `YYYY年MM月DD日`: 2024 年 12 月 01 日
- `MM/DD/YYYY`: 12/01/2024
- `HH:mm DD/MM/YY`: 14:30 01/12/24

#### 水印位置

- **左下角** (bottom-left): 默认位置
- **右下角** (bottom-right)
- **左上角** (top-left)
- **右上角** (top-right)

#### 样式选项

- **字体大小**: 12-48 像素 (默认 24)
- **字体颜色**: 白色、黑色、红色、蓝色
- **文字阴影**: 提高在复杂背景下的可读性

## 使用场景示例

### 场景 1：旅行照片整理

```bash
# 为旅行照片添加拍摄时间，输出到新目录
node bin/watermark.js add -d ~/Pictures/旅行2024 -o ~/Pictures/旅行2024_带水印
```

### 场景 2：活动照片批处理

```bash
# 预览效果
node bin/watermark.js add -d ./event_photos --dry-run

# 确认无误后执行
node bin/watermark.js add -d ./event_photos -f "YYYY年MM月DD日 HH:mm"
```

### 场景 3：照片存档

```bash
# 直接覆盖原文件（请先备份！）
node bin/watermark.js add -d ./archive_photos
```

## 注意事项

1. **备份重要照片**：建议在处理重要照片前先做备份
2. **预览功能**：使用 `--dry-run` 选项可以预览效果而不修改文件
3. **输出目录**：如果指定输出目录，会保持原有的目录结构
4. **性能**：使用 Sharp 库，处理速度较快，但大量高分辨率照片可能需要一些时间
5. **权限**：确保对目标目录有读写权限

## 故障排除

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
node bin/watermark.js --help

# 查看特定命令帮助
node bin/watermark.js add --help
node bin/watermark.js list --help
```
