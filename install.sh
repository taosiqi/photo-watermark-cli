#!/bin/bash
# 快速安装脚本

echo "🚀 正在安装照片水印CLI工具..."

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "访问 https://nodejs.org 下载并安装"
    exit 1
fi

# 检查npm是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请检查Node.js安装"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功！"
    
    # 设置可执行权限
    chmod +x bin/watermark.js
    
    echo "🎉 安装完成！"
    echo ""
    echo "使用方法："
    echo "  交互式模式: npm start"
    echo "  命令行模式: node bin/watermark.js add -d /path/to/photos"
    echo "  查看帮助:   node bin/watermark.js --help"
    echo ""
    echo "创建测试图片: node create_test_image.js"
    echo "运行测试:     node test_relative_size.js"
else
    echo "❌ 依赖安装失败，请检查网络连接或npm配置"
    exit 1
fi
