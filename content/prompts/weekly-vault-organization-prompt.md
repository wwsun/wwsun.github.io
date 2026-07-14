---
title: Weekly Vault Organizer Prompt
tags:
  - prompt
  - ai-agent
description: 每周一定时触发的知识库整理 AI Agent 任务提示词，指导 Jules 使用 vault-manager 技能进行日常维护。
---

# Weekly Vault Organizer Prompt

> [!note] 任务背景
> 这是一个定时任务提示词，设计为每周一凌晨 2 点通过 AI Agent (Google Jules) 自动运行，用于维护和整理基于 Obsidian/Quartz 的知识库。

**触发时间：** 每周一 02:00 AM
**执行者：** Google Jules

## 提示词

你可以直接复制以下提示词交给 Jules 执行：

```markdown
你好，Jules。现在是每周知识库常规维护时间。请使用 `vault-manager` 技能，帮我全面整理我的知识库。请按照以下顺序执行，并且在涉及文件写入和重命名操作前，务必先向我展示变更预览并等待我的确认：

### 1. 知识库健康诊断 (health)

请首先执行知识库整体健康状态的**只读诊断**。检查 `content/` 目录下缺失 title、tags、description 的情况，检查缺少 `index.md` 的目录，以及疑似断链。请输出 `Vault Health Report`。

### 2. 同步索引文件 (sync-index)

请检查并更新 `content/` 及其主要子目录（包括但不限于 `content/blog/`、`content/wiki/`、`content/clippings/`、`content/notes/` 等）的 `index.md`。

- 确保每个目录的 `index.md` 包含所有文件的最新列表及一句话简介。
- 展示将要写入的预览，确认后写入。

### 3. 补全缺失的元数据 (update-meta)

根据健康诊断的结果，帮我为那些缺失 Frontmatter（title、description、tags）的 `.md` 文件补全元数据。

- 严格遵循规则：不修改已有且有效的值，仅补全缺失内容；**绝对不可修改文件正文**。
- 列出变更清单（文件路径 + 将写入的值），我确认后你再写入。

### 4. 附件整理与重命名 (rename-attachments)

请帮我找出当前所有在 Markdown 文件中被引用、且位于 `assets/` 目录下的非语义化图片附件（如带有 `Pasted image` 前缀或纯时间戳命名的图片）。

- 使用读取工具查看图片内容，生成合适的、英文 `kebab-case` 格式的语义化文件名。
- 以表格形式向我展示**【原文件名】**、**【新文件名】**、**【引用位置】**。
- 在我确认后，执行重命名并全局替换引用。

### 5. 最终验证与提交

所有清理和更新操作完成后：

1. 帮我执行 `npm run format` 格式化变动的文件（或者仅对修改过的文件执行 `npx prettier --write`）。
2. 运行 `npm run check` 确保没有构建错误或新的问题。
3. 协助我将变更提交 (Commit & Submit)。
```
