# 📖 使用示例

本文档提供了 Photo Watermark CLI 的详细使用示例和最佳实践。

## 🚀 基础使用

### 1. 交互式模式（推荐新手）

```bash
# 启动交互式界面
npm start

# 或者直接运行
watermark add
```

这将启动友好的交互式界面，逐步引导您完成所有配置。

### 2. 快速开始

```bash
# 为当前目录下的照片添加水印
watermark add -d .

# 为指定目录添加水印并输出到新目录
watermark add -d ./photos -o ./watermarked_photos
```

## 🎯 实际场景示例

### 场景一：旅行照片整理

```bash
# 1. 预览将要处理的照片
watermark list ~/Pictures/巴黎之旅2024

# 2. 添加中文格式的时间水印，输出到新目录
watermark add \
  -d ~/Pictures/巴黎之旅2024 \
  -o ~/Pictures/巴黎之旅2024_水印版 \
  -f "YYYY年MM月DD日 HH:mm"
```

### 场景二：活动摄影后期处理

```bash
# 1. 交互式选择所有参数
watermark add -d ./event_photos -i

# 2. 使用预设配置快速处理
watermark add -d ./event_photos -o ./processed --overwrite
```

### 场景三：照片存档

```bash
# 直接在原图上添加水印（请先备份！）
watermark add -d ./archive_photos -f "YYYY-MM-DD"
```

## ⚙️ 高级配置示例

### 自定义时间格式

```bash
# 标准格式
watermark add -d ./photos -f "YYYY-MM-DD HH:mm:ss"

# 中文格式
watermark add -d ./photos -f "YYYY年MM月DD日"

# 美式格式
watermark add -d ./photos -f "MM/DD/YYYY HH:mm"

# 简洁格式
watermark add -d ./photos -f "YYYY-MM-DD"
```

### 不同水印位置效果

```bash
# 左下角（默认，适合大多数照片）
watermark add -d ./photos --position bottom-left

# 右下角（适合左下角有重要内容的照片）
watermark add -d ./photos --position bottom-right

# 左上角（适合风景照）
watermark add -d ./photos --position top-left

# 右上角（适合人像照）
watermark add -d ./photos --position top-right
```

## 🎨 样式配置示例

### 配置管理

```bash
# 查看当前配置
watermark config

# 重置所有配置为默认值
watermark config --reset

# 查看配置文件位置
watermark config --path
```

### 字体大小智能缩放展示

使用我们的智能相对大小算法，相同的字体设置在不同分辨率下的效果：

| 分辨率    | 设置字体 | 实际字体 | 视觉效果 |
| --------- | -------- | -------- | -------- |
| 640x480   | 24px     | 12px     | 协调     |
| 1920x1080 | 24px     | 14px     | 协调     |
| 3840x2160 | 24px     | 27px     | 协调     |
| 7680x4320 | 24px     | 54px     | 协调     |

## 🔧 脚本化使用

### Bash 脚本示例

```bash
#!/bin/bash
# batch_watermark.sh - 批量处理多个目录

DIRS=(
    "~/Pictures/2024-01"
    "~/Pictures/2024-02"
    "~/Pictures/2024-03"
)

for dir in "${DIRS[@]}"; do
    echo "处理目录: $dir"
    watermark add -d "$dir" -o "${dir}_watermarked" -f "YYYY年MM月DD日"
done

echo "所有目录处理完成！"
```

### Python 脚本示例

```python
#!/usr/bin/env python3
# batch_process.py - Python批量处理脚本

import os
import subprocess
from pathlib import Path

def process_directory(input_dir, output_dir, time_format="YYYY-MM-DD HH:mm:ss"):
    """使用watermark CLI处理目录"""
    cmd = [
        "watermark", "add",
        "-d", str(input_dir),
        "-o", str(output_dir),
        "-f", time_format
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ 成功处理: {input_dir}")
    else:
        print(f"❌ 处理失败: {input_dir}")
        print(result.stderr)

# 使用示例
photo_dirs = [
    Path("~/Pictures/travel_2024"),
    Path("~/Pictures/family_photos"),
    Path("~/Pictures/events")
]

for photo_dir in photo_dirs:
    if photo_dir.exists():
        output_dir = photo_dir.parent / f"{photo_dir.name}_watermarked"
        process_directory(photo_dir, output_dir, "YYYY年MM月DD日 HH:mm")
```

## 📊 性能优化建议

### 大批量处理

```bash
# 对于大量文件，建议先预览
watermark list ./large_photo_collection | wc -l

# 分批处理以避免内存问题
find ./photos -name "*.jpg" -print0 | \
  xargs -0 -n 50 -I {} watermark add -d {} -o ./processed
```

### 质量与速度平衡

```bash
# 高质量设置（较慢）
watermark add -d ./photos --quality 95

# 快速处理设置（较快）
watermark add -d ./photos --quality 85
```

## 🛠️ 故障排除示例

### 常见问题解决

```bash
# 1. 检查支持的文件格式
watermark list ./photos

# 2. 验证目录权限
ls -la ./photos

# 3. 测试单个文件处理
watermark add -d ./single_photo_dir

# 4. 检查磁盘空间
df -h
```

### 调试模式

```bash
# 使用 Node.js 调试选项
NODE_OPTIONS="--inspect" watermark add -d ./photos

# 详细日志输出
DEBUG=* watermark add -d ./photos
```

## 💡 最佳实践

1. **始终备份原始照片**
2. **先用小批量测试配置**
3. **使用输出目录而非覆盖原文件**
4. **定期清理临时文件**
5. **保存常用配置为默认值**

## 🔗 相关资源

- [GitHub 仓库](https://github.com/taosiqi/photo-watermark-cli)
- [npm 包页面](https://www.npmjs.com/package/photo-watermark-cli)
- [问题反馈](https://github.com/taosiqi/photo-watermark-cli/issues)
