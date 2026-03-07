---
title: My OpenClaw Automation Workflow
tags:
  - openclaw
  - agent
  - blog
draft: false
description: 使用 OpenClaw 自动化工作流
source:
---

OpenClaw 不仅仅是一个 AI 助手，它更像是一个可以深度定制的"数字同事"。写这篇博客主要分享我是如何与 OpenClaw 协作，以及在实际工作中的一些具体实践。

这篇文章随便聊聊我目前用它跑通的几个场景。

## 设定行为准则

在与 OpenClaw 协作之前，首先让 OpenClaw 明确了三个基本原则：

1. **先尝试解决问题，但不要擅自做重大决定**
   - 我希望 OpenClaw 具备主动性，能够自主探索和尝试
   - 但在涉及重要决策时，必须征得我的同意

2. **对于破坏性操作，始终先询问**
   - 删除文件、发送消息等操作需要确认
   - 这是安全边界，也是信任的基础

3. **学会判断「用户希望我帮忙」vs「用户想自己处理」**
   - 知道何时介入，何时退后
   - 好的助手知道什么时候不说话

## 日常工作流

### 1. 会话启动：建立上下文

每次开始新会话时，OpenClaw 会自动读取关键文件：

- `SOUL.md` —— AI 的"灵魂"，定义了行为准则
- `USER.md` —— 关于我的基本信息
- `memory/` —— 历史对话和记忆

这让我不需要重复介绍自己，每次对话都能从上一次继续。

### 2. 任务处理模式

根据任务类型，我主要使用两种模式：

| 模式                   | 适用场景             | 特点               |
| ---------------------- | -------------------- | ------------------ |
| **直接对话**           | 简单查询、快速任务   | 即时响应，单次交互 |
| **子代理 (Sub-agent)** | 复杂任务、长时间运行 | 异步处理，后台执行 |

### 3. 技能系统 (Skills)

OpenClaw 的技能系统让我能够按需扩展能力。官方的技能市场是 [ClawHub](https://clawhub.ai/skills?sort=downloads)

## 我的使用实践

### 1. 开发进展总结

下班前写总结和日报挺烦人的。我现在让 OpenClaw 直接去盯我的 GitLab 账号。

它会抓取我当天的 Commit 和 Merge Request，到点自动整理成一份代码进展，发到项目群里。这省了我不少回忆和组织语言的时间，团队也能直接看到我今天干了什么。

### 2. 联动个人 Obsidian 知识库

我是一个深度的 Obsidian 进行 PKM 的用户，日常的工作笔记甚至是个人的日常的所思所看都会记录到 Obsidian 中，但只是写笔记就很容易吃灰。

现在 OpenClaw 会每天去读我的 Daily Notes 和 Tasks 的数据。结合前一天的总结和今天的待办，它会在早上发一段汇总消息给我，算是把个人的本地管理给盘活了。

### 3. 每天的工作提醒

定时任务是 OpenClaw 非常典型的一个场景，因此可以借助 OpenClaw 每天定时发送消息，列出今天要处理的 Overmind 任务。

### 4. 调研报告和文档生成

以前要做个新技术选型或者写竞品分析，得在浏览器开十几个标签页，边看边做笔记，一搞就是大半天。

或者你也可以使用 ChatGPT/Gemini 的深度调研功能，但毕竟有付费墙，OpenClaw 提供了一个更廉价的解决方案。

现在遇到想深入了解的领域，我直接扔个主题给 OpenClaw。它会自己去搜资料、读长文章、交叉对比，最后交给我一份结构清晰的调研报告。你甚至可以让它直接给你返回 PPT/PDF 文档。

### 5. 消息资讯和市场简报

最后一个可能是非常多的同学在做的一件事，就是利用 OpenClaw 去搭建工作流去抓市场动态和行业新闻。

它每天去爬我关注的几个领域的资讯，总结完丢给我一个带链接的简报。吃早饭或者通勤路上刷一刷，就能顺便了解下行业里发生了什么。

## 打造个性化的 OpenClaw

### 记忆管理

我定期（通过 heartbeat）让 OpenClaw：

1. 回顾近期的 `memory/YYYY-MM-DD.md` 文件
2. 提取值得长期保存的洞察
3. 更新 `MEMORY.md`
4. 清理过时的信息

这就像定期整理笔记，把临时想法沉淀为知识。

### 技能扩展

当发现重复需求时，我会：

1. 评估是否需要新技能
2. 查看 ClawHub 是否已有类似技能
3. 必要时创建自定义技能

## OpenClaw 的配置文件

```yaml
# 核心文件结构
workspace/
├── SOUL.md           # AI 行为准则
├── USER.md           # 用户信息
├── IDENTITY.md       # AI 身份定义
├── MEMORY.md         # 长期记忆
├── HEARTBEAT.md      # 定期检查任务
├── TOOLS.md          # 本地工具配置
├── AGENTS.md         # 工作空间指南
├── memory/           # 每日记忆文件
│   └── YYYY-MM-DD.md
└── docs/             # OpenClaw 文档
```

### 灵魂在于 `SOUL.md`

用 OpenClaw 时，`soul.md` 这个文件值得花点心思。

SOUL.md 是 OpenClaw 框架中的核心配置文件，用于定义 AI 助手的人格特质、行为准则和交互风格。它回答了「我是谁」这个根本问题，决定了助手如何与用户互动。

与系统提示词（System Prompt）不同，SOUL.md 是**持续演进**的——随着与 OpenClaw 相处时间的增加，你可以不断更新它，让助手更懂你。

一个示例的 SOUL.md 内容

```markdown
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.**
Skip the corporate speak — just help.

**Have opinions.**
Disagree when you disagree. Find things funny when they are.

**Be resourceful before asking.**
Read, search, check context. Then ask if stuck.

**Earn trust through competence.**
Be careful with external actions. Be bold with internal ones.

## Boundaries

- Privacy is absolute
- Ask before sending emails/tweets/posts
- No half-baked replies to messaging surfaces
- In groups: participate, don't dominate

## Vibe

Concise when needed, thorough when it matters.
Not a corporate drone. Not a sycophant. Just... good.

## Group Chat Rules

**Speak when:** directly asked, can add value, or something's funny
**Stay silent when:** casual banter, already answered, or would just say "yeah"

## Reactions

Use emoji reactions naturally: 👍 for agreement, 😂 for funny,
🤔 for interesting, ✅ for done.

## Continuity

Each session you wake up fresh. These files are your memory.
Read them. Update them. They're how you persist.
```

## 总结

我不认为 OpenClaw 是"一个更聪明的搜索引擎"，而是一个可以深度协作的虚拟伙伴。通过明确的边界设定、持续的反馈迭代，可以建立了一种高效的协作模式。目前我高频在用的就这几个场景，目前也在持续探索一些其他场景，后续有机会再分享。
