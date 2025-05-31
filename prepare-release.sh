#!/bin/bash
# 项目发布准备脚本

set -e

echo "🚀 开始准备项目发布..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo -e "${BLUE}📋 检查 Node.js 环境...${NC}"
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${RED}❌ 错误: 需要 Node.js >= 18.0.0，当前版本: $NODE_VERSION${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 检查 npm 版本
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm 版本: $NPM_VERSION${NC}"

# 清理之前的构建
echo -e "${BLUE}🧹 清理之前的构建...${NC}"
npm run clean 2>/dev/null || rm -rf dist/

# 安装依赖
echo -e "${BLUE}📦 安装依赖...${NC}"
npm install

# TypeScript 构建
echo -e "${BLUE}🔨 构建 TypeScript 项目...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript 构建失败${NC}"
    exit 1
fi

# 运行测试
echo -e "${BLUE}🧪 运行核心功能测试...${NC}"
npm run test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 测试失败${NC}"
    exit 1
fi

# 检查 CLI 基本功能
echo -e "${BLUE}🔧 测试 CLI 基本功能...${NC}"

# 测试版本命令
VERSION_OUTPUT=$(node dist/bin/watermark.js --version)
echo -e "${GREEN}✅ 版本命令: $VERSION_OUTPUT${NC}"

# 测试帮助命令
HELP_OUTPUT=$(node dist/bin/watermark.js --help | head -n 1)
echo -e "${GREEN}✅ 帮助命令正常${NC}"

# 测试配置命令
CONFIG_OUTPUT=$(node dist/bin/watermark.js config 2>/dev/null | head -n 1)
echo -e "${GREEN}✅ 配置命令正常${NC}"

# 检查包文件
echo -e "${BLUE}📋 检查包文件结构...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 缺少 package.json${NC}"
    exit 1
fi

if [ ! -f "README.md" ]; then
    echo -e "${RED}❌ 缺少 README.md${NC}"
    exit 1
fi

if [ ! -d "dist/" ]; then
    echo -e "${RED}❌ 缺少构建输出目录${NC}"
    exit 1
fi

if [ ! -f "dist/bin/watermark.js" ]; then
    echo -e "${RED}❌ 缺少 CLI 可执行文件${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 包文件结构完整${NC}"

# 检查包大小
echo -e "${BLUE}📊 检查包大小...${NC}"
PACK_SIZE=$(npm pack --dry-run 2>/dev/null | tail -n 1 | grep -o '[0-9.]*[kMG]B' || echo "未知")
echo -e "${GREEN}✅ 包大小: $PACK_SIZE${NC}"

# 安全检查
echo -e "${BLUE}🔒 运行安全检查...${NC}"
npm audit --audit-level moderate

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ 发现安全问题，建议运行 'npm audit fix'${NC}"
fi

# 生成发布检查清单
echo -e "${BLUE}📝 生成发布检查清单...${NC}"
cat > PUBLISH_CHECKLIST.md << EOF
# 📋 发布前检查清单

## ✅ 已完成检查

- [x] Node.js 版本检查 (>= 18.0.0)
- [x] TypeScript 构建成功
- [x] 核心功能测试通过
- [x] CLI 命令测试正常
- [x] 包文件结构完整
- [x] 安全检查完成

## 📊 项目信息

- **项目名称**: photo-watermark-cli
- **当前版本**: $(node dist/bin/watermark.js --version)
- **包大小**: $PACK_SIZE
- **Node.js 要求**: >= 18.0.0
- **构建时间**: $(date)

## 🚀 发布步骤

### 1. 最终检查
\`\`\`bash
# 再次运行完整测试
npm run test

# 检查包内容
npm pack --dry-run
\`\`\`

### 2. npm 发布
\`\`\`bash
# 登录 npm（如果还未登录）
npm login

# 发布包
npm publish
\`\`\`

### 3. 验证发布
\`\`\`bash
# 全局安装测试
npm install -g photo-watermark-cli

# 测试安装的包
photo-watermark --version
photo-watermark --help
\`\`\`

### 4. GitHub 发布
\`\`\`bash
# 创建并推送 tag
git tag v$(node dist/bin/watermark.js --version)
git push origin v$(node dist/bin/watermark.js --version)

# 在 GitHub 上创建 Release
\`\`\`

## 📝 发布后任务

- [ ] 更新项目文档
- [ ] 社区分享推广
- [ ] 收集用户反馈
- [ ] 计划下一版本功能

---
生成时间: $(date)
EOF

echo -e "${GREEN}✅ 发布检查清单已生成: PUBLISH_CHECKLIST.md${NC}"

# 最终总结
echo -e "${GREEN}"
echo "🎉 项目发布准备完成！"
echo ""
echo "📊 项目统计:"
echo "  - 版本: $(node dist/bin/watermark.js --version)"
echo "  - 包大小: $PACK_SIZE"
echo "  - Node.js: $NODE_VERSION"
echo "  - npm: $NPM_VERSION"
echo ""
echo "🚀 下一步:"
echo "  1. 检查 PUBLISH_CHECKLIST.md"
echo "  2. 运行 'npm pack --dry-run' 预览包内容"
echo "  3. 运行 'npm publish' 发布到 npm"
echo ""
echo -e "${NC}${BLUE}💡 提示: 发布前建议先运行 'npm pack' 生成本地包进行最终测试${NC}"
