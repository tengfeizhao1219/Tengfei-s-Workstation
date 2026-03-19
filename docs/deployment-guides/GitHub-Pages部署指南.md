# GitHub Pages 部署指南

## 🚀 概述

GitHub Pages 是 GitHub 提供的免费静态网站托管服务。本指南详细说明如何将项目部署到 GitHub Pages。

## 📋 前提条件

### 1. GitHub 账户
- 已有账户: 使用现有账户
- 新账户: 访问 https://github.com 注册

### 2. 本地环境
- **Git**: 版本控制工具
- **文本编辑器**: VS Code 或其他
- **命令行工具**: Terminal 或 Git Bash

### 3. 项目要求
- 静态网站 (HTML, CSS, JavaScript)
- 无服务器端逻辑
- 大小限制: 每个仓库 1GB
- 带宽限制: 每月 100GB

## 🛠️ 部署步骤

### 方法1: 通过 GitHub 网页界面 (最简单)

#### 步骤1: 创建新仓库
1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息:
   - **Repository name**: 仓库名称 (如: my-website)
   - **Description**: 可选描述
   - **Public/Private**: 选择 Public (Pages需要)
   - **Initialize with README**: 勾选
4. 点击 "Create repository"

#### 步骤2: 上传文件
1. 在仓库页面点击 "Add file" → "Upload files"
2. 拖放项目文件或选择文件
3. 添加提交信息
4. 点击 "Commit changes"

#### 步骤3: 启用 GitHub Pages
1. 进入仓库 Settings
2. 左侧菜单选择 "Pages"
3. 在 "Source" 部分:
   - Branch: 选择 "main"
   - Folder: 选择 "/ (root)"
4. 点击 "Save"

#### 步骤4: 访问网站
- 等待1-2分钟部署完成
- 访问: `https://[用户名].github.io/[仓库名]/`
- 如: `https://tengfeizhao1219.github.io/Tengfei-s-Workstation/`

### 方法2: 通过 Git 命令行 (推荐)

#### 步骤1: 初始化本地仓库
```bash
# 进入项目目录
cd /path/to/your/project

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交"
```

#### 步骤2: 连接到GitHub仓库
```bash
# 添加远程仓库
git remote add origin https://github.com/[用户名]/[仓库名].git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 步骤3: 启用GitHub Pages
1. 在GitHub仓库页面
2. Settings → Pages
3. Source: main branch, / (root) folder
4. Save

### 方法3: 使用自动化脚本 (本项目)

#### 使用 deploy.sh 脚本
```bash
# 进入项目目录
cd projects/ecommerce-prototype

# 给予执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh

# 选择选项1 (GitHub Pages)
# 按照提示操作
```

## 🌐 自定义域名

### 步骤1: 购买域名
- 推荐: Namecheap, GoDaddy, Google Domains
- 选择: .com, .io, .dev 等后缀

### 步骤2: 配置DNS
#### 方法A: CNAME记录 (子域名)
1. 在域名注册商添加CNAME记录:
   ```
   类型: CNAME
   名称: www (或其他子域名)
   值: [用户名].github.io
   TTL: 自动或3600
   ```

2. 在GitHub仓库创建CNAME文件:
   ```bash
   echo "www.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "添加CNAME"
   git push
   ```

#### 方法B: A记录 (根域名)
1. 添加A记录指向GitHub IP:
   ```
   类型: A
   名称: @ (或留空)
   值: 185.199.108.153
   值: 185.199.109.153
   值: 185.199.110.153
   值: 185.199.111.153
   TTL: 自动或3600
   ```

2. 可选: 添加www子域名的CNAME记录

### 步骤3: 在GitHub配置
1. 仓库 Settings → Pages
2. 在 "Custom domain" 输入域名
3. 勾选 "Enforce HTTPS"
4. Save

### 步骤4: 验证
1. 等待DNS传播 (最多48小时)
2. 访问你的域名
3. 检查HTTPS是否自动启用

## 🔧 高级配置

### 使用 Jekyll (静态网站生成器)
GitHub Pages 默认支持 Jekyll。

#### 基本配置 (_config.yml)
```yaml
title: 我的网站
description: 网站描述
baseurl: "" # 子目录路径
url: "https://yourdomain.com" # 网站地址

# 构建设置
markdown: kramdown
theme: minima

# 插件
plugins:
  - jekyll-feed
  - jekyll-seo-tag

# 排除文件
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
```

#### 目录结构
```
.
├── _config.yml      # 配置文件
├── _includes/       # 可重用组件
├── _layouts/        # 布局模板
├── _posts/          # 博客文章
├── _sass/           # Sass样式
├── _site/           # 生成的网站
├── assets/          # 静态资源
├── index.md         # 首页
└── about.md         # 关于页面
```

### 自定义404页面
创建 `404.html` 或 `404.md` 在根目录:
```html
<!DOCTYPE html>
<html>
<head>
    <title>页面未找到</title>
</head>
<body>
    <h1>404 - 页面未找到</h1>
    <p>抱歉，您访问的页面不存在。</p>
    <a href="/">返回首页</a>
</body>
</html>
```

### 环境变量和敏感信息
**重要**: GitHub Pages 是公开的，不要提交:
- API密钥
- 密码
- 私钥
- 数据库连接信息

#### 安全实践
1. 使用环境变量占位符
2. 在构建时替换
3. 使用GitHub Secrets (Actions)
4. 使用客户端配置

## 📊 监控和分析

### 启用分析
#### Google Analytics
```html
<!-- 在<head>中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### 其他分析工具
- **Plausible**: 隐私友好的分析
- **Umami**: 开源分析平台
- **Fathom**: 简单的网站分析

### 性能监控
#### Lighthouse 分数
1. 使用 Chrome DevTools 运行 Lighthouse
2. 目标分数:
   - Performance: >90
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >90

#### 真实用户监控 (RUM)
- **Google PageSpeed Insights**
- **WebPageTest**
- **SpeedCurve**

## 🚨 故障排除

### 常见问题

#### 1. 网站无法访问
**可能原因**:
- 部署未完成 (等待1-2分钟)
- 错误的仓库设置
- DNS配置问题

**解决方案**:
```bash
# 检查部署状态
curl -I https://[用户名].github.io/[仓库名]/

# 检查GitHub Pages设置
# Settings → Pages → 查看状态
```

#### 2. 样式或脚本不加载
**可能原因**:
- 相对路径错误
- 缓存问题
- 文件权限问题

**解决方案**:
```html
<!-- 使用绝对路径 -->
<link rel="stylesheet" href="/css/style.css">
<!-- 而不是 -->
<link rel="stylesheet" href="css/style.css">
```

#### 3. 自定义域名不工作
**检查步骤**:
1. DNS配置是否正确
2. 是否等待足够时间 (最多48小时)
3. GitHub Pages设置是否正确
4. 是否启用HTTPS

```bash
# 检查DNS解析
nslookup yourdomain.com
dig yourdomain.com

# 检查GitHub验证
host -t CNAME yourdomain.com
```

#### 4. Jekyll构建失败
**查看构建日志**:
1. 仓库 Settings → Pages
2. 查看构建状态和错误信息

**常见错误**:
- 语法错误 in _config.yml
- 缺少依赖
- 插件不兼容

### 调试工具
```bash
# 本地测试Jekyll
bundle exec jekyll serve

# 检查HTML有效性
python -m html5validator --root _site/

# 检查链接
bundle exec htmlproofer ./_site
```

## 🔄 持续部署

### GitHub Actions 自动化
创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v2
      
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 多环境部署
#### 开发环境
- 分支: `develop`
- URL: `https://[用户名].github.io/[仓库名]/develop/`

#### 预发布环境
- 分支: `staging`
- URL: `https://[用户名].github.io/[仓库名]/staging/`

#### 生产环境
- 分支: `main`
- URL: `https://[用户名].github.io/[仓库名]/`

## 📈 最佳实践

### 1. 版本控制策略
```bash
# 功能分支工作流
git checkout -b feature/new-design
# 开发完成后
git checkout main
git merge --no-ff feature/new-design
git branch -d feature/new-design
```

### 2. 文件组织
```
project/
├── src/                    # 源代码
│   ├── css/
│   ├── js/
│   └── images/
├── dist/                   # 构建输出
├── docs/                   # 文档
├── tests/                  # 测试文件
├── .github/               # GitHub配置
├── .gitignore             # Git忽略文件
├── README.md              # 项目说明
└── package.json           # 项目配置
```

### 3. 性能优化
- 压缩CSS和JavaScript
- 优化图片 (WebP格式)
- 使用CDN加载库
- 实现懒加载
- 添加缓存头

### 4. 安全考虑
- 使用HTTPS
- 设置安全头
- 避免敏感信息
- 定期更新依赖

### 5. SEO优化
- 语义化HTML
- 正确的meta标签
- XML站点地图
- robots.txt
- 结构化数据

## 🎯 成功指标

### 部署成功
- [ ] 网站可访问
- [ ] HTTPS启用
- [ ] 自定义域名工作
- [ ] 所有资源加载正常
- [ ] 无控制台错误

### 性能指标
- [ ] Lighthouse分数 >90
- [ ] 首屏加载 <3秒
- [ ] 交互响应 <100ms
- [ ] 移动端体验良好

### 维护指标
- [ ] 自动部署工作
- [ ] 错误监控设置
- [ ] 备份策略就绪
- [ ] 文档完整

## 📞 支持资源

### 官方文档
- [GitHub Pages文档](https://docs.github.com/en/pages)
- [Jekyll文档](https://jekyllrb.com/docs/)
- [GitHub Actions文档](https://docs.github.com/en/actions)

### 社区支持
- [GitHub Community](https://github.community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github-pages)
- [Jekyll Talk](https://talk.jekyllrb.com/)

### 工具推荐
- [GitHub Desktop](https://desktop.github.com/) - Git图形界面
- [Visual Studio Code](https://code.visualstudio.com/) - 代码编辑器
- [Netlify](https://www.netlify.com/) - 替代部署平台

---

## 🚀 快速检查清单

### 部署前
- [ ] 代码测试通过
- [ ] 无敏感信息
- [ ] 所有资源路径正确
- [ ] 自定义域名配置完成

### 部署中
- [ ] 推送到正确分支
- [ ] 启用GitHub Pages
- [ ] 等待构建完成
- [ ] 验证网站可访问

### 部署后
- [ ] 测试所有功能
- [ ] 检查移动端
- [ ] 验证性能
- [ ] 设置监控

### 维护
- [ ] 定期更新
- [ ] 监控性能
- [ ] 备份数据
- [ ] 更新文档

---

**最后更新**: 2026-03-19  
**适用版本**: GitHub Pages 最新版  
**维护状态**: 活跃维护  

**提示**: 遇到问题时，先检查GitHub Pages构建日志，大多数问题都有详细错误信息。