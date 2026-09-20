---
title: OpenAI Codex 精要 —— AI 辅助智能体开发课程
description:
tags:
  - codex
  - openai
  - course
  - ai-agent
  - clippings
source:
---

# OpenAI Codex 精要 —— AI 辅助智能体开发课程

原文：https://www.freecodecamp.org/news/openai-codex-essentials-ai-assisted-agentic-development-course/

---

## 课程概述

OpenAI Codex 是一个专门的人工智能系统，旨在将自然语言转换为代码。

freeCodeCamp.org YouTube 频道刚刚发布了一门课程，教你如何使用 Codex 加速真实世界的编码工作流程和开发者生产力。本课程由 ExamPro 的 **Andrew Brown** 开发。

完整课程时长约 **5 小时**。

---

## 课程内容

### 1. 简介 (Introduction)

课程介绍和学习目标。

### 2. Codex 精要 (Codex Essentials)

Codex 核心概念和基础知识。

### 3. AI 认证路线图 (The AI Certification Roadmap)

AI 领域的认证路径规划。

### 4. 学习建议与通过要求 (Study Recommendations & Passing Requirements)

如何有效学习并通过认证考试。

### 5. 有效期与重新认证 (Validity and Re-certification)

认证的有效期和续证流程。

### 6. 访问代码仓库 (Accessing the Code Repository)

课程代码仓库的使用方法。

---

## Codex 基础 (Codex Fundamentals)

### 7. 什么是 Codex？智能体编码 vs 编码工具 (What is Codex? Agentic Coding vs. Coding Harness)

- Codex 的定义和核心功能
- **智能体编码 (Agentic Coding)**：AI 自主决策和执行
- **编码工具 (Coding Harness)**：AI 辅助人类编码
- 两种模式的区别和适用场景

### 8. 常见用例和技能 (Common Use Cases and Skills)

Codex 在实际开发中的应用场景。

### 9. 理解智能体循环 (Understanding the Agentic Loop)

智能体如何感知、决策、执行的循环机制。

### 10. OpenAI GPT 模型家族 (OpenAI GPT Model Families)

OpenAI 各代 GPT 模型的特点和演进。

### 11. 深入探讨：模型智能 vs 上下文窗口 (Deep Dive: Model Intelligence vs. Context Windows)

- **模型智能**：推理能力、代码质量
- **上下文窗口**：模型能处理的 token 数量
- 两者之间的权衡关系

### 12. 安装要求 (Node.js & WSL 2)

- Node.js 环境配置
- Windows 用户的 WSL 2 设置

### 13. 认证：订阅 vs API 密钥 (Authentication: Subscription vs. API Keys)

两种使用方式的认证机制对比。

### 14. 检查登录状态和账户信息 (Checking Login Status and Account Info)

如何验证 Codex 的连接状态。

### 15. 实验：安装 Codex 和 "Hello World"

动手实践：从零开始安装并运行第一个 Codex 程序。

### 16. 在生产环境和自动化中使用 API 密钥 (Using API Keys for Production and Automation)

API 密钥的最佳实践和安全管理。

### 17. 为密钥设置环境变量 (Setting Environment Variables for Keys)

安全地存储和读取 API 密钥。

### 18. 订阅 vs API Token 计费 (Subscriptions vs. API Token Billing)

两种付费模式的对比和选择建议。

---

## 上下文管理

### 19. 管理上下文窗口 (400k Token 限制)

Codex 的 40 万 token 上下文窗口限制。

### 20. 截断和幻觉问题 (Truncation and Hallucination Issues)

- **截断 (Truncation)**：超出上下文时的信息丢失
- **幻觉 (Hallucination)**：模型生成不准确信息

### 21. 命令：/clear 和 /compact

- `/clear`：清空当前对话
- `/compact`：压缩上下文历史

### 22. 实验：管理上下文历史

实践操作上下文管理技巧。

---

## 会话管理

### 23. Codex 会话、线程和消息 (Codex Sessions, Threads, and Messages)

理解 Codex 的会话架构。

### 24. 会话命令：/new, /resume, /fork, /rename

- `/new`：创建新会话
- `/resume`：恢复历史会话
- `/fork`：分叉现有会话
- `/rename`：重命名会话

### 25. 底层实现：SQLite 和 JSONL 会话存储

Codex 如何持久化会话数据。

### 26. 使用自定义脚本跟踪使用情况 (Tracking Usage with Custom Scripts)

监控 API 使用量和成本。

### 27. 自定义状态行 (Customizing the Status Line)

个性化 Codex 界面显示。

---

## 项目配置

### 28. 通过 agents.md 进行项目指导 (Project Guidance via agents.md)

使用 `agents.md` 文件为 Codex 提供项目上下文和指导。

### 29. 截断限制和追踪 (Truncation Limits and Tracing)

理解截断机制和调试方法。

### 30. 实验：创建项目指南

动手创建项目级别的 Codex 配置。

---

## 规划模式

### 31. 深入探讨：规划模式和澄清问题 (Deep Dive: Plan Mode and Clarifying Questions)

- **规划模式 (Plan Mode)**：先制定计划再执行
- **澄清问题 (Clarifying Questions)**：AI 主动询问以明确需求

### 32. 项目实验：构建 Wolfenstein 3D 克隆版 (Project Lab: Building a Wolfenstein 3D Clone)

实战项目：使用 Codex 开发经典游戏。

---

## 安全与权限

### 33. 沙箱安全：Bubble Wrap 和 Seatbelt (Sandbox Security: Bubble Wrap and Seatbelt)

Codex 的安全隔离机制。

### 34. 审批策略 (Approval Policies)

- **Untrusted**：不信任模式，所有操作需审批
- **Request**：请求模式，敏感操作需审批
- **Never**：从不审批模式（不推荐）

### 35. 操作系统特定设置和网络访问 (OS-Specific Settings and Network Access)

不同操作系统的安全配置。

### 36. 权限覆盖：自动模式 vs 完全访问 (Permission Overrides: Auto Mode vs. Full Access)

自动化审批和完全手动控制的对比。

### 37. 创建和排查规则 (Creating and Troubleshooting Rules)

定义自定义安全规则和调试。

### 38. 全局 vs 项目配置 (config.toml)

- **全局配置**：`~/.codex/config.toml`
- **项目配置**：项目根目录的 `config.toml`

---

## API、SDK 和扩展

### 39. 非交互式（无头）模式用于 CI/CD (Non-Interactive (Headless) Mode for CI/CD)

在自动化流水线中使用 Codex。

### 40. OpenAI 交互层：REST API vs SDK (OpenAI Interaction Layers)

- **REST API**：直接 HTTP 调用
- **SDK**：封装好的开发工具包

### 41. 实现 OpenAI Agents SDK (Implementing the OpenAI Agents SDK)

使用官方 SDK 构建智能体应用。

### 42. 使用 Codex SDK (Working with the Codex SDK)

Codex 专用 SDK 的功能和使用。

### 43. 使用 Codex 桌面应用 (Using the Codex Desktop Application)

图形界面版 Codex 的使用方法。

### 44. 安装 VS Code 扩展 (Installing the VS Code Extension)

在 VS Code 中集成 Codex。

### 45. Codex 应用服务器协议 (The Codex App Server Protocol)

Codex 的底层通信协议。

### 46. 使用 GitHub Actions 实现自动化工作流 (Automated Workflows with GitHub Actions)

将 Codex 集成到 CI/CD 流程。

---

## 智能体技能 (Agent Skills)

### 47. 智能体技能剖析 (Anatomy of Agent Skills)

技能的内部结构和工作原理。

### 48. 发现、激活和执行 (Discovery, Activation, and Execution)

- 如何发现可用技能
- 激活技能的机制
- 执行技能的方法

### 49. 技能位置和技能市场 (Skill Locations and Marketplace)

- 本地技能存储位置
- 技能市场生态

### 50. 实验：图像生成技能 (Lab: Image Generation Skills)

实战：创建图像生成技能。

### 51. 项目实验：构建任务管理器技能 (Project Lab: Building a Task Manager Skill)

实战项目：开发完整的任务管理技能。

---

## 高级主题

### 52. 通过模型和工作量选择优化成本 (Optimizing Cost with Model and Effort Selection)

- 选择合适的模型控制成本
- **工作量 (Effort)** 参数的影响

### 53. 推理快速模式 (Fast Mode for Inference)

牺牲质量换取速度的推理模式。

### 54. 连接 MCP 工具（Roblox 示例）(Connecting MCP Tools)

集成外部工具和服务的示例。

### 55. 编排子代理和工作团队 (Orchestrating Sub-Agents and Worker Teams)

- **子代理 (Sub-Agents)**：分解复杂任务
- **工作团队 (Worker Teams)**：并行处理

---

## 学习路径总结

```
基础概念
    ↓
安装配置
    ↓
上下文与会话管理
    ↓
项目配置 (agents.md)
    ↓
规划模式实战
    ↓
安全与权限
    ↓
API/SDK 集成
    ↓
智能体技能开发
    ↓
高级优化技巧
```

---

## 关键知识点

| 主题           | 核心概念                          |
| -------------- | --------------------------------- |
| **智能体编码** | AI 自主决策 vs 工具辅助           |
| **上下文管理** | 40万 token 限制、/clear、/compact |
| **会话管理**   | /new、/resume、/fork、/rename     |
| **项目配置**   | agents.md、config.toml            |
| **安全策略**   | Untrusted/Request/Never 审批模式  |
| **集成方式**   | CLI、SDK、VS Code、GitHub Actions |
| **技能开发**   | 发现、激活、执行、市场            |
| **成本优化**   | 模型选择、工作量参数、Fast Mode   |

---

## 观看课程

完整课程可在 [freeCodeCamp.org YouTube 频道](https://www.youtube.com/watch?v=...) 观看（5小时）。

---

_课程由 Andrew Brown (ExamPro) 开发，freeCodeCamp.org 出品_
