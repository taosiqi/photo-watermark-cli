# NPM 发布前检查清单

## 📋 必备步骤

### 1. 账号准备

- [ ] 注册 npm 账号 (https://www.npmjs.com/signup)
- [ ] 验证邮箱地址
- [ ] 在本地登录 npm：`npm login`

### 2. 包名检查

- [ ] 检查包名 `photo-watermark-cli` 是否可用：`npm search photo-watermark-cli`
- [ ] 如果包名已存在，考虑修改为：
  - `@taosiqi/photo-watermark-cli` (scoped package)
  - `photo-watermark-timestamp-cli`
  - `smart-photo-watermark-cli`

### 3. 代码质量检查

- [x] 核心功能测试完成
- [x] 智能相对大小功能验证
- [x] CLI 命令测试
- [x] 错误处理验证
- [x] 文档编写完成

### 4. 版本管理

- [x] 当前版本：1.0.0 (首次发布)
- [ ] 后续更新使用语义化版本 (semantic versioning)
  - 修复 bug：1.0.1
  - 新功能：1.1.0
  - 破坏性变更：2.0.0

### 5. 依赖检查

- [x] 所有依赖项已安装并测试
- [x] 版本兼容性检查完成
- [ ] 运行 `npm audit` 检查安全漏洞

### 6. 文件清单

- [x] package.json 配置完整
- [x] README.md 文档
- [x] .npmignore 排除不必要文件
- [x] bin/ 目录（CLI 可执行文件）
- [x] lib/ 目录（核心功能模块）

## 🚀 发布步骤

### 测试发布（推荐首次发布前执行）

```bash
# 1. 打包测试
npm pack

# 2. 检查打包内容
tar -tzf photo-watermark-cli-1.0.0.tgz

# 3. 全局安装测试包
npm install -g ./photo-watermark-cli-1.0.0.tgz

# 4. 测试安装的命令
photo-watermark --help
watermark --help

# 5. 卸载测试包
npm uninstall -g photo-watermark-cli
```

### 正式发布

```bash
# 1. 最后检查
npm run test
npm run demo

# 2. 发布到 npm
npm publish

# 3. 验证发布成功
npm view photo-watermark-cli

# 4. 全局安装验证
npm install -g photo-watermark-cli
```

## 📝 发布后维护

### GitHub 仓库设置

1. 创建 GitHub 仓库：`https://github.com/taosiqi/photo-watermark-cli`
2. 推送代码：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/taosiqi/photo-watermark-cli.git
   git push -u origin main
   ```
3. 创建 Release 标签
4. 添加项目描述和标签

### 文档更新

- [ ] 更新 README.md 添加安装说明
- [ ] 添加使用示例 GIF 或截图
- [ ] 更新项目 badges (npm version, downloads, license)

### 推广

- [ ] 在相关社区分享（如 Reddit r/node, r/photography）
- [ ] 写技术博客介绍项目
- [ ] 在社交媒体分享

## ⚠️ 常见问题

1. **包名冲突**：选择唯一的包名或使用 scoped package
2. **权限问题**：确保已登录 npm 且有发布权限
3. **版本冲突**：不能发布相同版本号，需要更新版本
4. **文件过大**：检查 .npmignore 是否正确排除了测试文件

## 📊 发布后监控

- npm 下载统计：https://www.npmjs.com/package/photo-watermark-cli
- GitHub Issues 和 PR 处理
- 用户反馈收集
- 定期更新和维护

---

**注意**：package.json 中的个人信息已更新为：

- 作者：Tao Siqi
- 邮箱：taosiqi@example.com
- GitHub：https://github.com/taosiqi/photo-watermark-cli

如需修改邮箱地址，请更新 package.json 中的 author.email 字段。
