# Tengfei's Workstation 🚀

欢迎来到我的工作站！这里包含了我创建的各种网页项目和工具。

## 🌐 在线项目

### 1. 🛍️ 电商网站UI/UX验证原型
**立即访问**: [https://tengfeizhao1219.github.io/Tengfei-s-Workstation/](https://tengfeizhao1219.github.io/Tengfei-s-Workstation/)

这是一个完整的电商网站原型，用于验证UI/UX设计：
- ✅ 完整电商流程：浏览 → 搜索 → 购物车 → 结账
- ✅ 响应式设计：桌面/平板/手机全适配
- ✅ 现代UI：Tailwind CSS，平滑动画，实时反馈
- ✅ 交互功能：搜索、筛选、购物车管理、表单验证

**技术栈**: HTML5, CSS3, JavaScript, Tailwind CSS

### 2. 📚 单词本应用
**访问**: [/wordbook/](wordbook/)

一个简单的单词学习应用。

### 3. 🛠️ UI验证工具
**访问**: [/projects/ui-validation-tools/](projects/ui-validation-tools/)

包含专业的UI/UX验证模板：
- UI评估检查表 (10维度专业评估框架)
- 用户测试脚本 (标准化测试流程)
- 验证报告模板

## 🚀 快速开始

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/tengfeizhao1219/Tengfei-s-Workstation.git
cd Tengfei-s-Workstation

# 直接在浏览器打开电商原型
open index.html  # macOS
# 或
xdg-open index.html  # Linux
```

### 一键部署
电商原型包含一键部署脚本：
```bash
cd projects/ecommerce-prototype
chmod +x deploy.sh
./deploy.sh
# 选择部署方式：GitHub Pages, Vercel, Netlify
```

## 📁 项目结构

```
Tengfei-s-Workstation/
├── index.html                    # 电商原型主页面 (可直接访问)
├── README.md                     # 本文件
├── wordbook/                     # 单词本应用
│   └── index.html               # 单词本主页面
├── projects/                     # 项目文件夹
│   ├── ecommerce-prototype/     # 电商原型完整项目
│   │   ├── index.html           # 电商原型 (与根目录相同)
│   │   ├── deploy.sh           # 一键部署脚本
│   │   ├── README.md           # 项目详细说明
│   │   ├── package.json        # 项目配置
│   │   └── 验证报告模板.md     # 专业验证模板
│   └── ui-validation-tools/     # UI验证工具
│       ├── UI评估检查表.md     # 10维度评估框架
│       └── 用户测试脚本.md     # 标准化测试脚本
└── docs/                        # 文档
    └── deployment-guides/       # 部署指南
```

## 🎯 电商原型功能详情

### 核心页面
- **首页** - 产品展示、导航、搜索
- **商品列表** - 分类、筛选、排序
- **购物车** - 商品管理、数量调整
- **模拟结账** - 地址、支付、确认

### 技术特性
- **无构建步骤** - 纯HTML/CSS/JS，直接运行
- **响应式设计** - 使用Flexbox/Grid，移动优先
- **现代UI** - Tailwind CSS，Font Awesome图标
- **交互丰富** - 实时搜索、购物车管理、表单验证
- **性能优化** - 图片懒加载，平滑动画

### 验证用途
这个原型专门用于：
1. **UI设计验证** - 验证视觉设计、布局、色彩
2. **UX流程验证** - 测试购物流程是否顺畅
3. **用户测试** - 收集真实用户反馈
4. **开发参考** - 为正式开发提供参考实现

## 🔧 使用指南

### 对于设计师
1. 访问电商原型，体验完整流程
2. 使用UI评估检查表进行评估
3. 基于评估结果优化设计
4. 创建高保真设计规范

### 对于开发者
1. 参考原型理解交互逻辑
2. 查看HTML/CSS/JS实现
3. 基于验证结果确定开发优先级
4. 避免未经验证的设计决策

### 对于产品经理
1. 使用原型验证产品假设
2. 进行用户测试收集数据
3. 基于数据做产品决策
4. 降低产品开发风险

## 🌐 部署说明

### GitHub Pages (已配置)
- 访问: `https://tengfeizhao1219.github.io/Tengfei-s-Workstation/`
- 自动部署：推送到main分支后自动更新
- 免费托管：GitHub提供免费静态网站托管

### 自定义部署
电商原型支持多种部署方式：
1. **GitHub Pages** - 免费，与Git集成
2. **Vercel** - 推荐，自动SSL+全球CDN
3. **Netlify** - 简单拖放，表单处理
4. **本地运行** - 无需网络，即时测试

### 启用GitHub Pages
如果尚未启用：
1. 访问仓库 Settings → Pages
2. Source: 选择 `main` 分支
3. Folder: 选择 `/ (root)`
4. 点击 Save

## 📊 验证方法

### 专业评估框架
1. **10维度设计评估**
   - 视觉层次、排版、色彩、间距等
   - 量化评分 (0-100分)

2. **SUS系统可用性量表**
   - 标准化可用性评估
   - 可比较的评分系统

3. **用户任务测试**
   - 任务完成率、时间、错误率
   - 定性反馈收集

### 验证流程
1. **概念验证** (1-3天) - 内部测试，修复明显问题
2. **用户测试** (3-7天) - 5-8名目标用户测试
3. **设计优化** (3-5天) - 基于反馈优化设计
4. **开发准备** (2-3天) - 创建设计规范，准备开发

## 🔄 更新和维护

### 添加新项目
```bash
# 在对应目录创建新项目
mkdir -p projects/新项目名称
# 添加项目文件
# 更新本README.md
```

### 更新电商原型
```bash
# 修改 projects/ecommerce-prototype/ 中的文件
# 同时更新根目录 index.html (如果需要)
# 提交到GitHub
git add .
git commit -m "更新: 电商原型改进"
git push origin main
```

### 版本控制建议
```bash
# 功能分支工作流
git checkout -b feature/新功能
# 开发完成后
git checkout main
git merge --no-ff feature/新功能
git push origin main
```

## 🛠️ 技术说明

### 电商原型技术栈
- **HTML5** - 语义化标记
- **CSS3** - 现代样式，Flexbox/Grid布局
- **JavaScript (ES6+)** - 交互逻辑
- **Tailwind CSS** - 实用优先的CSS框架
- **Font Awesome** - 图标库
- **Unsplash** - 高质量图片

### 架构特点
- **无构建步骤** - 直接浏览器运行
- **模块化JavaScript** - 功能分离
- **响应式设计** - 移动优先
- **渐进增强** - 基础功能优先
- **无障碍访问** - 基本ARIA支持

## 📞 支持

### 常见问题
1. **网站无法访问**
   - 检查GitHub Pages设置
   - 等待1-2分钟部署完成
   - 清除浏览器缓存

2. **样式或功能不正常**
   - 检查浏览器控制台错误
   - 确保所有资源文件加载
   - 测试不同浏览器

3. **移动端显示问题**
   - 测试不同设备
   - 检查响应式CSS
   - 确保触摸目标足够大

### 获取帮助
1. 查看详细部署指南: `docs/deployment-guides/`
2. 参考电商原型README: `projects/ecommerce-prototype/README.md`
3. 使用验证模板: `projects/ui-validation-tools/`

## 🎉 开始使用

### 立即行动
1. **访问网站**: https://tengfeizhao1219.github.io/Tengfei-s-Workstation/
2. **测试功能**: 体验完整电商流程
3. **进行评估**: 使用UI评估检查表
4. **收集反馈**: 分享链接给测试用户

### 短期计划
1. [ ] 进行初步用户测试 (3-5人)
2. [ ] 收集和分析反馈
3. [ ] 基于反馈优化设计
4. [ ] 准备正式开发

### 长期价值
这个工作站将成为你产品开发的**标准验证流程**：
- 所有设计在开发前都经过验证
- 基于用户反馈和数据做决策
- 降低开发风险，提高产品质量
- 建立专业的产品开发方法

---

**最后更新**: 2026-03-19  
**维护状态**: 活跃维护 🚀  
**访问地址**: https://tengfeizhao1219.github.io/Tengfei-s-Workstation/

**提示**: 推送到main分支后，GitHub Pages会自动部署，通常需要1-2分钟。