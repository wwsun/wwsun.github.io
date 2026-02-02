---
created: 2026-02-02 10:02
url: https://notes.nicolevanderhoeven.com/How+to+publish+Obsidian+notes+with+Quartz+on+GitHub+Pages#Step%205.%20Host%20your%20vault%20online
tags:
  - quartz
  - obsidian
  - blog
---
## 第一阶段：本地初始化 Quartz

Quartz 是一个将 Obsidian Markdown 转换为 HTML 的引擎。

1. **克隆项目模板**：
    
    找一个存放代码的文件夹（非 Obsidian 库文件夹），打开终端执行：
    
    Bash
    
    ```
    git clone https://github.com/jackyzha0/quartz.git
    cd quartz
    npm install
    ```
    
2. **初始化配置**：
    
    执行初始化命令：
    
    Bash
    
    ```
    npx quartz create
    ```
    
    - 提示选择时，选 **"Empty Quartz"**（这会给你一个干净的起点）。
        
    - 链接方式选择 **"Symbolic link"**（软链接），然后输入你 Obsidian Vault 中**公开笔记文件夹**的完整路径。
        
    
    > **技巧**：建议在 Obsidian 里专门建一个 `Public` 文件夹，只把想发布的文章放进去。
    
3. **本地预览**：
    
    Bash
    
    ```
    npx quartz build --serve
    ```
    
    现在访问 `http://localhost:8080`，你应该能看到你的笔记已经在浏览器中渲染出来了。
    

---

## 第二阶段：GitHub 仓库设置

1. **新建仓库**：
    
    在 GitHub 上创建一个新的 **Public** 仓库，命名为 `my-blog`（或者你喜欢的任何名字）。**不要**勾选 "Initialize this repository with a README"。
    
2. **关联远程库**：
    
    回到本地的 `quartz` 文件夹终端：
    
    Bash
    
    ```
    git remote add origin https://github.com/你的用户名/你的仓库名.git
    git add .
    git commit -m "Initialize blog"
    git push -u origin HEAD
    ```
    

---

## 第三阶段：配置自动部署 (GitHub Actions)

这是最关键的一步，让你的博客实现“推送即发布”。

1. **修改 GitHub 设置**：
    
    - 打开你的 GitHub 仓库页面。
        
    - 点击 **Settings** -> **Pages**。
        
    - 在 **Build and deployment** 下的 **Source** 选项中，下拉选择 **"GitHub Actions"**。
        
2. **触发构建**：
    
    Quartz 源码中已经自带了 `.github/workflows/deploy.yml` 文件。当你刚才执行 `git push` 时，构建任务已经自动开始了。
    
    - 点击仓库顶部的 **Actions** 标签，你可以看到一个正在运行的工作流。
        
    - 等待 2-3 分钟，待绿色对勾出现。
        
3. **查看成果**：
    
    返回 **Settings -> Pages**，你会看到一条消息：“Your site is live at...”，点击那个 URL 即可看到你的博客。
    

---

## 第四阶段：优化写作工作流

为了让发布像在 Obsidian 里打字一样简单，我们需要配置自动化。

1. **安装 Obsidian Git 插件**：
    
    - 在 Obsidian 插件市场搜索并安装 **Obsidian Git**。
        
2. **配置自动化**：
    
    - 在插件设置中，开启 **"Auto Backup"**（例如设置为每 60 分钟自动提交）。
        
    - 开启 **"Push on backup"**。
        
3. **发布流程**：
    
    - 你只需要把写好的 `.md` 文件拖入 `Public` 文件夹。
        
    - 插件会自动帮你推送到 GitHub。
        
    - GitHub Actions 自动构建并在几分钟后更新网页。
        

## Blog Template

```
---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - status/seed
  - type/post
draft: true
description: "简短的文章描述，用于 SEO 和预览"
---

# <% tp.file.title %>

## 引言
在此输入内容...
```

---

## 避坑小贴士

- **图片路径**：在 Obsidian 里的 `Settings -> Files & Links`，将 "Default location for new attachments" 改为 "Same folder as current file"，并确保 Quartz 的配置文件中图片路径解析正确。
    
- **自定义域名**：如果你有自己的域名，只需在 `quartz.config.ts` 的 `baseUrl` 中修改，并在 GitHub Pages 设置中绑定即可。
    
- **搜索失效**：如果发现搜索搜不到内容，请检查文章的 Frontmatter 是否有 `draft: true`，草稿状态的文章默认不会被索引。
    
