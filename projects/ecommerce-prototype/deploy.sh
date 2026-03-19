#!/bin/bash

# 电商原型部署脚本
# 支持多种部署方式：GitHub Pages, Vercel, Netlify

set -e

echo "🚀 电商网站UI/UX原型部署脚本"
echo "=============================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
check_tools() {
    echo -e "${BLUE}🔧 检查必要工具...${NC}"
    
    local missing_tools=()
    
    # 检查git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    # 检查curl
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}❌ 缺少必要工具: ${missing_tools[*]}${NC}"
        echo "请安装后再运行此脚本。"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${YELLOW}请选择部署方式:${NC}"
    echo "1) GitHub Pages (免费，适合静态网站)"
    echo "2) Vercel (推荐，自动SSL，CDN)"
    echo "3) Netlify (简单拖放部署)"
    echo "4) 本地预览"
    echo "5) 创建压缩包"
    echo "6) 退出"
    echo ""
    read -p "请输入选项 (1-6): " choice
}

# GitHub Pages部署
deploy_github() {
    echo -e "${BLUE}🌐 准备部署到GitHub Pages...${NC}"
    
    # 检查是否在git仓库中
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️  当前目录不是git仓库，正在初始化...${NC}"
        git init
        git add .
        git commit -m "初始提交: 电商网站UI/UX原型"
    fi
    
    # 询问GitHub仓库信息
    read -p "GitHub用户名: " github_user
    read -p "仓库名 (默认: ecommerce-prototype): " repo_name
    repo_name=${repo_name:-ecommerce-prototype}
    
    # 检查远程仓库
    if git remote | grep -q origin; then
        echo -e "${YELLOW}⚠️  已存在远程仓库origin${NC}"
        read -p "是否更新远程仓库URL? (y/n): " update_remote
        if [[ $update_remote =~ ^[Yy]$ ]]; then
            git remote set-url origin "https://github.com/${github_user}/${repo_name}.git"
        fi
    else
        git remote add origin "https://github.com/${github_user}/${repo_name}.git"
    fi
    
    # 推送到GitHub
    echo -e "${BLUE}📤 推送到GitHub...${NC}"
    git branch -M main
    git push -u origin main
    
    echo ""
    echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
    echo ""
    echo -e "${YELLOW}📝 接下来需要在GitHub上启用Pages:${NC}"
    echo "1. 访问 https://github.com/${github_user}/${repo_name}"
    echo "2. 点击 Settings > Pages"
    echo "3. 在 Source 部分选择:"
    echo "   - Branch: main"
    echo "   - Folder: / (根目录)"
    echo "4. 点击 Save"
    echo ""
    echo -e "${GREEN}🌍 网站将发布在: https://${github_user}.github.io/${repo_name}/${NC}"
    
    # 创建README.md
    create_readme "github" "$github_user" "$repo_name"
}

# Vercel部署
deploy_vercel() {
    echo -e "${BLUE}🚀 准备部署到Vercel...${NC}"
    
    # 检查是否安装Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI未安装${NC}"
        read -p "是否安装Vercel CLI? (y/n): " install_vercel
        
        if [[ $install_vercel =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}📦 安装Vercel CLI...${NC}"
            npm install -g vercel
        else
            echo -e "${YELLOW}📝 手动部署步骤:${NC}"
            echo "1. 访问 https://vercel.com"
            echo "2. 导入GitHub仓库或拖放文件夹"
            echo "3. 点击 Deploy"
            return
        fi
    fi
    
    # 创建vercel.json配置文件
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF
    
    echo -e "${BLUE}📁 创建Vercel配置文件...${NC}"
    
    # 部署到Vercel
    echo -e "${BLUE}🚀 开始部署...${NC}"
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ 部署完成!${NC}"
    echo -e "${YELLOW}📝 后续部署:${NC}"
    echo "只需运行: vercel --prod"
    
    # 创建README.md
    create_readme "vercel"
}

# Netlify部署
deploy_netlify() {
    echo -e "${BLUE}🌐 准备部署到Netlify...${NC}"
    
    # 创建netlify.toml配置文件
    cat > netlify.toml << EOF
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
    
    echo -e "${BLUE}📁 创建Netlify配置文件...${NC}"
    
    # 创建部署包
    zip -r ecommerce-prototype.zip . -x "*.git*" "deploy.sh"
    
    echo ""
    echo -e "${GREEN}✅ 已创建部署包: ecommerce-prototype.zip${NC}"
    echo ""
    echo -e "${YELLOW}📝 部署步骤:${NC}"
    echo "1. 访问 https://app.netlify.com"
    echo "2. 拖放 ecommerce-prototype.zip 文件"
    echo "3. 网站将自动部署"
    echo ""
    echo -e "${YELLOW}或者使用Netlify CLI:${NC}"
    echo "1. 安装: npm install -g netlify-cli"
    echo "2. 登录: netlify login"
    echo "3. 部署: netlify deploy --prod"
    
    # 创建README.md
    create_readme "netlify"
}

# 本地预览
local_preview() {
    echo -e "${BLUE}💻 启动本地预览服务器...${NC}"
    
    # 检查Python3
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}✅ 使用Python3启动服务器${NC}"
        echo -e "${YELLOW}访问: http://localhost:8000${NC}"
        echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo -e "${GREEN}✅ 使用Python启动服务器${NC}"
        echo -e "${YELLOW}访问: http://localhost:8000${NC}"
        echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
        python -m SimpleHTTPServer 8000
    else
        echo -e "${RED}❌ 未找到Python，无法启动本地服务器${NC}"
        echo -e "${YELLOW}替代方案:${NC}"
        echo "1. 使用其他HTTP服务器"
        echo "2. 直接在浏览器中打开 index.html"
    fi
}

# 创建压缩包
create_archive() {
    echo -e "${BLUE}📦 创建部署压缩包...${NC}"
    
    # 排除不必要的文件
    zip -r ecommerce-prototype.zip . \
        -x "*.git*" \
        -x "deploy.sh" \
        -x "*.zip" \
        -x "*.tmp"
    
    echo -e "${GREEN}✅ 已创建: ecommerce-prototype.zip${NC}"
    echo -e "${YELLOW}📏 文件大小: $(du -h ecommerce-prototype.zip | cut -f1)${NC}"
    
    # 显示包含的文件
    echo -e "${BLUE}📁 包含的文件:${NC}"
    unzip -l ecommerce-prototype.zip | tail -20
}

# 创建README.md
create_readme() {
    local deploy_type=$1
    local github_user=$2
    local repo_name=$3
    
    cat > README_DEPLOY.md << EOF
# 电商网站UI/UX原型 - 部署指南

## 项目概述
这是一个电商网站的UI/UX验证原型，用于在正式开发前验证设计概念和用户体验。

## 部署方式: ${deploy_type^^}

EOF
    
    case $deploy_type in
        "github")
            cat >> README_DEPLOY.md << EOF
### GitHub Pages部署
网站地址: https://${github_user}.github.io/${repo_name}/

#### 部署步骤
1. 代码已推送到GitHub仓库: ${github_user}/${repo_name}
2. 在GitHub仓库设置中启用Pages:
   - Settings > Pages
   - Source: Branch: main, Folder: /
   - 点击 Save

#### 更新部署
\`\`\`bash
git add .
git commit -m "更新说明"
git push origin main
\`\`\`
EOF
            ;;
        "vercel")
            cat >> README_DEPLOY.md << EOF
### Vercel部署
网站地址: 部署后Vercel会提供URL

#### 部署步骤
1. 安装Vercel CLI: \`npm install -g vercel\`
2. 部署: \`vercel --prod\`
3. 后续更新: \`vercel --prod\`

#### 环境变量
无需特殊环境变量
EOF
            ;;
        "netlify")
            cat >> README_DEPLOY.md << EOF
### Netlify部署
网站地址: 部署后Netlify会提供URL

#### 部署步骤
1. 访问 https://app.netlify.com
2. 拖放 ecommerce-prototype.zip 文件
3. 或使用CLI:
   \`\`\`bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   \`\`\`
EOF
            ;;
    esac
    
    cat >> README_DEPLOY.md << EOF

## 本地开发
\`\`\`bash
# 启动本地服务器
python3 -m http.server 8000
# 或
npx serve .
\`\`\`

访问: http://localhost:8000

## 项目结构
\`\`\`
.
├── index.html              # 主页面
├── README.md               # 项目说明
├── README_DEPLOY.md        # 部署指南 (本文件)
├── vercel.json             # Vercel配置
├── netlify.toml            # Netlify配置
└── deploy.sh               # 部署脚本
\`\`\`

## 功能验证
这个原型用于验证:

### UI设计验证
- [ ] 视觉层次是否清晰
- [ ] 色彩搭配是否和谐  
- [ ] 排版是否易读
- [ ] 间距是否舒适
- [ ] 组件是否一致

### UX体验验证
- [ ] 导航是否直观
- [ ] 购物车流程是否顺畅
- [ ] 交互是否自然
- [ ] 响应是否及时
- [ ] 错误是否友好

### 响应式设计
- [ ] 桌面端 (≥1024px)
- [ ] 平板端 (768px-1023px)
- [ ] 手机端 (<768px)

## 技术说明
- 纯HTML/CSS/JavaScript实现
- 使用Tailwind CSS进行样式
- 使用Font Awesome图标
- 使用Unsplash图片
- 无后端依赖

## 注意事项
1. 这是一个UI/UX验证原型，不包含完整后端逻辑
2. 数据存储在浏览器内存中，刷新页面会重置
3. 专注于前端体验验证
4. 实际开发时需要添加后端和数据库

## 反馈收集
请记录以下反馈:
1. 最喜欢的UI元素
2. 最困惑的交互
3. 建议改进的地方
4. 缺失的重要功能

---
*部署时间: $(date)*
*部署方式: ${deploy_type}*
EOF
    
    echo -e "${GREEN}✅ 已创建部署指南: README_DEPLOY.md${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}  电商网站UI/UX原型部署工具   ${NC}"
    echo -e "${BLUE}================================${NC}"
    
    # 检查工具
    check_tools
    
    while true; do
        show_menu
        
        case $choice in
            1)
                deploy_github
                ;;
            2)
                deploy_vercel
                ;;
            3)
                deploy_netlify
                ;;
            4)
                local_preview
                ;;
            5)
                create_archive
                ;;
            6)
                echo -e "${GREEN}👋 再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 无效选项，请重新选择${NC}"
                ;;
        esac
    done
}

# 运行主函数
main "$@"