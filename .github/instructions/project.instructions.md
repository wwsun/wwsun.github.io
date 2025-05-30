---
applyTo: '**'
---

# 项目指令

## 项目概述

- **项目类型**: 基于 Hexo 搭建的个人博客网站
- **主要技术栈**: Jekyll, HTML, CSS, JavaScript, Markdown
- **部署平台**: GitHub Pages
- **域名**: wwsun.github.io

## 技术栈和工具

### 前端技术

- Jekyll 静态站点生成器
- Liquid 模板引擎
- Sass/SCSS 样式预处理器
- JavaScript (ES6+)
- Markdown 内容编写

## 文件结构约定

```
/
├── _config.yml           # Jekyll 配置文件
├── _layouts/             # 页面模板
├── _includes/            # 可复用组件
├── _sass/                # Sass 样式文件
├── _posts/               # 博客文章 (YYYY-MM-DD-title.md)
├── _data/                # 数据文件 (YAML/JSON)
├── assets/               # 静态资源
│   ├── css/
│   ├── js/
│   └── images/
├── pages/                # 静态页面
└── README.md
```

## 内容创作规范

### 博客文章

- Front matter 必需字段:
  ```yaml
  ---
  layout: post
  title: '文章标题'
  date: YYYY-MM-DD HH:MM:SS +0800
  categories: [category1, category2]
  tags: [tag1, tag2]
  ---
  ```
- 使用中文撰写，英文术语保持原文
- 代码块必须指定语言
- 图片使用相对路径，存放在 `/assets/images/`

### 页面创建

- 使用描述性的文件名
- 包含适当的 front matter
- 设置正确的 layout

## Git 提交规范

### 提交信息格式

```
<type>: <description>

[optional body]

[optional footer]
```

### 类型说明

- `ci`: 其他修改 (如配置文件、依赖更新等)
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 样式调整
- `refactor`: 代码重构
- `post`: 新增博客文章
- `update`: 更新现有内容
