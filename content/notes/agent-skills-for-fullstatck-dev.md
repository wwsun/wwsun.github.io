---
title: 面向全栈开发者的 Agent Skills
date: 2026-04-02
tags:
  - agent-skill
  - fullstack
  - ai-workflow
draft: false
description: 推荐 10 个在全栈开发各个阶段（设计、实现、测试、部署）极具赋能作用的 AI Agent Skills。
source:
---

本篇整理了 10 个考虑到设计落地频率、对视觉/交互质量的直接提升、以及在 [[claude-code-cheatsheet|Claude Code]] 等 Agent 工具中具备高复用性的核心 Skills。

### 1. **frontend-skill**

来自 ==OpenAI==，适合做 landing page、品牌页、demo 页。强项是视觉论点、内容节奏、首屏质量。
https://github.com/openai/skills/tree/main/skills/.curated/frontend-skill

### 2. **frontend-design**

来自 ==Anthropic==，更偏“高完成度、强风格”的前端设计实现。适合你想把页面做得更有辨识度时用。
https://github.com/anthropics/skills/tree/main/skills/frontend-design

### 3. **figma-implement-design**

来自 ==OpenAI==，设计稿到代码的核心 skill。凡是产品/设计/前端协作，这个都应该是常用项。结合 [[Spec-Driven-Development|规约驱动开发]] 效果更佳。
https://github.com/openai/skills/tree/main/skills/.curated/figma-implement-design

### 4. **web-design-guidelines**

来自 ==Vercel==，做 UI 审查非常强。可访问性、表单、动效、排版、交互细节，都能系统性补漏。
https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

### 5. **react-best-practices**

来自 ==Vercel==，如果你做 React / Next.js，这个基本必装。它提升的是“实现质量”和“性能质量”。
https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices

### 6. **playwright**

来自 ==OpenAI==，前端不是只写代码，还要验证真实浏览器行为。这个是 UI 流程调试和回归检查的通用执行层。
https://github.com/openai/skills/tree/main/skills/.curated/playwright

### 7. **webapp-testing**

来自 ==Anthropic==，比 playwright 更贴近日常本地应用验证，适合检查页面行为、截图、日志和交互回归。参考 [[Chrome DevTools MCP]] 进行深度调试。
https://github.com/anthropics/skills/tree/main/skills/webapp-testing

### 8. **canvas-design**

来自 ==Anthropic==，适合更自由的视觉探索、展示型页面、画布式交互或概念设计，不是每个项目都需要，但做创意产品页很有价值。
https://github.com/anthropics/skills/tree/main/skills/canvas-design

### 9. **brand-guidelines**

来自 ==Anthropic==，如果你在做官网、营销页、设计系统、品牌一致性，这个比单纯“写 UI”更上层，适合产品/品牌协同。
https://github.com/anthropics/skills/tree/main/skills/brand-guidelines

### 10. **vercel-deploy-claimable**

来自 ==Vercel==，严格说它不是设计 skill，但对前端/产品工作流非常关键。做完页面立刻可部署预览，反馈闭环会快很多。
https://github.com/vercel-labs/agent-skills/tree/main/skills/vercel-deploy-claimable

## 场景选型快速指南

| 场景                 | 推荐 Skills                                                               |
| :------------------- | :------------------------------------------------------------------------ |
| **品牌官网/营销页**  | `frontend-skill`, `frontend-design`, `brand-guidelines`                   |
| **产品 UI/还原设计** | `figma-implement-design`, `react-best-practices`, `web-design-guidelines` |
| **交互验证/可用性**  | `playwright`, `webapp-testing`                                            |
| **创意探索**         | `canvas-design`                                                           |

---

**相关阅读**:

- [[ai-coding-workflow]]
- [[Vibe Coding]]
