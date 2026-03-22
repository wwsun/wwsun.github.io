---
title: OpenClaw
tags:
  - agent
  - openclaw
  - wiki
draft: false
description: OpenClaw 是一款开源本地优先的自主 AI 智能体，本文整理了关于 OpenClaw 的核心架构、配置文件体系及高阶安全与协作边界设定。
source: https://docs.openclaw.ai/zh-CN/start/openclaw
---

## 什么是 OpenClaw？

OpenClaw 是一款免费、开源的本地优先（Local-first）自主 AI 智能体（Autonomous AI Agent），它能够通过大语言模型（LLM）执行复杂任务。与传统的网页端 Chatbot 不同，OpenClaw 主要通过通讯软件（如 Discord, Slack, Telegram 等）作为用户界面交互，并且能够真正在用户的本地基础设施中运行和操作。

## 核心生态与配置体系

OpenClaw 的强大之处在于其基于文件的**上下文配置体系**。使用者不需要每次都写一长串提示词，而是通过几个核心的 Markdown 文件来定义 Agent 的状态和边界。

### 1. 核心人设与用户档案

- **`SOUL.md`**：Agent 的“灵魂”或完整人格文件。包含声音/语气、词汇、决策框架、反水文（anti-slop）标准。确保 Agent 像具体的“人”一样沟通。
- **`USER.md`**：使用者的深度档案。记录用户的作息/日程、偏好、内容赛道、关注领域等，让 Agent 具备背景知识。

### 2. 环境与周期控制

- **`HEARTBEAT.md`**：心跳式批量周期检查机制。利用心跳轮询批量处理周期性任务（例如日历、待办事项监控、看板同步），而不是为单个动作设立独立的定时任务。
- **`TOOLS.md`**：Agent 的“环境速查表（作弊小抄）”。记录本地环境配置要点、SSH 细节、API 路径及常用工具。
  > [!warning] 安全注意
  > API Key 等敏感信息应当放入 `.secrets` 等环境变量或加密文件中，绝不直接写在此处。

### 3. 反思与记忆闭环

- **`LEARNINGS.md`**：每次纠错后的教训库。执行修复逻辑：`修复当前问题` → `把教训写入此文件（标注错误模式）` → `建立防侧漏规则` → `并在每次会话开始时回顾`。**同一个错误禁止犯两次**。
- **`MEMORY.md`**：精炼后的长期记忆。仅保存提炼后的核心洞见、项目状态和高优决策。
  > [!tip] 记忆的最佳实践
  > 原始的执行日志可以按天写入 `memory/YYYY-MM-DD.md` 中。必须牢记：**脑内记忆跨不过重启，想让 Agent 记住就必须固化进文件。**

## 关键协作边界与纪律

赋予 Agent 自主权时，必须明确划分**放权边界**，以防止灾难性操作：

> [!important] 决策权限划分
>
> - **可以自主执行（大胆做）**：查阅文档、上网搜索、修复常规 Bug、梳理日志、更新本地知识库等非破坏性工作。
> - **必须询问（小心做）**：产生费用、删除或修改生产环境核心资源、代码分支覆盖（**严禁 force push**）、涉及外部内容发布的敏感操作。

> [!note] 状态透明化与 Vibe Coding
>
> - **工作状态反馈**：若操作执行预计超过 10 秒，OpenClaw 必须在开始前反馈其正在做什么，避免让用户陷入死寂的等待黑盒。
> - **审批流建立**：面向公众发布的内容，必须经过人类审核拦截。采用严格的审批流：`草稿生成` → `发送到审批频道` → `人类 Approve/Reject`。文案应当具有独立观点，杜绝 AI 的套话。

## 技能与扩展机制 (Skills & Hooks)

OpenClaw 允许通过安装 [ClawHub](https://clawhub.ai/skills) 的 Skills 进行能力扩展：

- 结合 [[Brave Search API]] 进行去中心化的网络资料检索。
- 集成 [[Gemini API]] 处理视觉和图片生成素材。
- 配置 [[Voicebox]] 跑通本地声音克隆链路（如 Qwen-TTS），将语音私有数据留在本地。
- 利用隔离浏览器环境 (`profile="openclaw"`) 进行高深度的网页自动化，或者使用 `profile="chrome"` 跑需要登录态的站点（如 Twitter、YouTube）。

## CLI 指令与部署

你可以通过 OpenClaw 的 CLI 对系统事件、心跳、模型和插件进行配置。
详细指令参考官方参考文档：[[CLI Reference|CLI (docs.openclaw.ai)]]

---

**相关阅读**：

- [[how-i-use-openclaw]]：我对 OpenClaw 的自动化工作流实践总结
- [[20-openclaw-prompts]]：用于调教 OpenClaw 的 20 条高频提示词与规则
