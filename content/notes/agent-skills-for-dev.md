---
title: 研发场景十大热门 Skills 推荐
tags:
  - skills
description: 本文面向实际研发场景，整理并推荐了一组可直接应用于日常开发流程的 Agent Skills。这些 Skills 覆盖前端设计、前后端开发、代码审查、自动化测试、CI/CD、问题修复以及文档维护等常见环节，分别针对具体任务提供明确的能力边界与使用场景说明，帮助你在不同阶段选择合适的 Skills，提高开发效率。
source: https://bytedance.larkoffice.com/wiki/YQWWwcyEBiVWrskcgPkcSPIOntb
---

# 研发场景十大热门 Skills 推荐

## frontend-design

[https://github.com/anthropics/skills/tree/main/skills/frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)

- **构建网页组件或页面**
  当你需要从零开始创建一个具体的 UI 元素时，例如一个 React 组件、一个 HTML/CSS 布局，或一个独立的静态页面。该 Skill 会确保这个组件不仅功能完善，而且在视觉上具有辨识度。
- **开发完整的 Web 应用或网站**
  当你需要构建一个完整的应用界面时，比如一个产品的 Landing Page、一个数据仪表盘或一个小型网站。该 Skill 会从整体出发，确立一个统一且鲜明的设计风格，并将其贯彻到应用的每一个角落。
- **美化或重塑现有界面**
  当你有一个已经存在的、但设计平庸的网页或应用，并希望提升其视觉品质时。该 Skill 会专注于美化层面的工作，通过引入独特的字体、创意的色彩方案、精致的动效和新颖的布局，来重塑界面的整体美感。

## code review

[https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/code-reviewer](https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/code-reviewer)

- **审查远程 PR**
  当你完成功能开发或问题修复并提交 PR 后，可发起 AI 审查请求。你只需提供 PR 编号或 URL（例如："Review PR #123"），AI 会自动检出（checkout）该 PR 的代码，运行项目预设的检查脚本（如 npm run preflight），同时阅读 PR 描述与评论以理解开发目标，随后对代码开展深度分析并给出反馈。
- **审查本地代码变更**
  若你希望在提交代码或创建 PR 前，先对本地修改进行审查，只需发出 “审查我的代码” 等类似指令即可，无需提供 PR 相关信息；AI 会通过 git status、git diff 等命令，检查工作区中已暂存（staged）和未暂存（unstaged）的代码改动，进而对这些变更进行分析并反馈。
- **提供深度分析与结构化反馈**
  无论是审查远程 PR 还是本地代码变更，AI 都会从多维度开展深度的代码质量分析，涵盖正确性、可维护性、可读性与执行效率、安全性与测试完整性等维度。最终，AI 会以结构化形式输出反馈，内容包括总体概述、具体发现（关键问题、改进建议）以及明确的结论（如批准合并或要求修改）。

## 网页通用测试

[https://github.com/anthropics/skills/tree/main/skills/webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)

- **自动验证前端功能**
  当你在本地开发 Web 应用（如使用 React、Vue、Svelte 等框架），并希望验证某个新功能是否正常运行时，只需用自然语言告知 AI 测试需求（例如：“帮我测试登录功能”），AI 会自动编写 Playwright 脚本来模拟用户操作，并向你反馈页面状态或内容是否符合预期。
- **调试与分析 UI 行为**
  若你发现页面中某元素渲染异常或交互行为异常，可向 AI 下达指令（例如：“截取首页完整截图” 或 “检查按钮的 DOM 结构”），AI 会执行对应脚本，捕获截图或获取 HTML 内容，并将侦察结果返回给你，助力快速定位问题。
- **处理需要后台服务的复杂交互**
  若你的应用为前后端分离架构，测试前端功能需后端 API 服务同步运行，只需告知 AI 项目结构与启动命令，AI 会借助 with_server.py 脚本来同时启动所有必需服务，再运行测试脚本，确保测试在完整的环境中执行。
- **测试静态 HTML 文件**
  若你有不依赖服务器的纯静态 HTML 页面，需验证其内容或结构，只需向 AI 提供文件路径与测试需求，AI 会编写脚本并通过 file:// 协议在浏览器中打开该文件，完成验证操作。

## pr-creator

[https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/pr-creator](https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/pr-creator)

- **一键创建符合规范的 PR**
  当你在本地完成新功能开发或 Bug 修复，并已提交代码（git commit）后，可调用此 Skill，让 AI 自动执行分支检查、查找并应用 PR 模板、运行预检脚本（如测试和 linting），并最终生成一个标题和描述都完全符合项目规范的 PR。
- **引导贡献者完成首次代码提交**
  当新团队成员或外部贡献者不熟悉项目的提交流程和规范时，可以使用此 Skill，让 AI 以智能向导的形式，自动完成模板查找、脚本执行等繁琐操作，仅需用户填写必要的标题与描述，大幅降低代码贡献门槛。
- **自动执行创建 PR 前的质量检查**
  在正式创建 PR 之前，可以调用该 Skill，让 AI 自动运行项目预设的 preflight 脚本，执行所有必要的构建、单元测试和代码风格检查。如果任何检查失败，AI 会中止提交流程并提示开发者进行修复，节约了审查者的时间和精力。

## 技术文档更新

[https://github.com/vercel/next.js/blob/canary/.agents/skills/update-docs/SKILL.md](https://github.com/vercel/next.js/blob/canary/.agents/skills/update-docs/SKILL.md)

- **分析代码变更对文档的影响**
  提交代码变更后，可以调用该 Skill 来分析哪些文档文件需要更新。
  它会通过 git diff 命令检查你的分支与 canary 分支之间的差异，并根据预定义的映射关系 (references/CODE-TO-DOCS-MAPPING.md)，找出与变更的代码文件相对应的文档文件。
- **更新现有的文档**
  对于已经存在的文档，当其对应的功能或 API 发生变化时（例如组件新增了 props、函数行为变更），该 Skill 会引导你更新现有文档。
  它会提示你如何添加或修改 props 表格、更新代码示例、添加废弃通知等，并遵循项目固有的文档规范（例如，使用 `<AppOnly>` / `<PagesOnly>` 来区分不同路由的内容）。
- **为新功能创建脚手架文档**
  当你在项目中添加了一个全新的功能时（例如一个新的组件、函数或配置项），该 Skill 可以帮你快速创建符合规范的新文档。
  它为不同类型的文档（如 API 参考、指南）提供了标准模板，确保新文档的结构、命名和元信息（Frontmatter）都符合项目要求。
