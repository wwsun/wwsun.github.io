---
title: GitHub Copilot CLI 最佳实践
description: GitHub 官方文档，介绍如何充分发挥 Copilot CLI 的能力——从自定义环境、计划先行、无限会话到云端委派与多仓库协作，涵盖模型选择、权限管理、常用工作流与团队规范
tags:
  - clippings
  - copilot
  - github
  - cli
  - agent
source: https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices
created: 2026-08-28
author: GitHub Docs
---

## GitHub Copilot CLI 最佳实践

> **原文**：[Best practices for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices) | 作者：GitHub Docs

## 📝 摘要

本文是 GitHub 官方发布的 Copilot CLI 最佳实践指南，系统梳理了七个层面的使用技巧：①自定义环境（自定义指令文件、配置允许的工具、选择模型、接入自有模型提供者、设置 AI 积分上限）；②先规划再编码（计划模式与 explore → plan → code → commit 工作流）；③善用「无限会话」（自动上下文管理、会话管理命令）；④高效委派工作（/delegate 云端智能体）；⑤常用工作流（代码库上手、TDD、代码评审、Git 操作、Bug 排查、重构）；⑥进阶模式（多仓库协作、图片驱动 UI 开发、复杂迁移清单、自动驾驶模式）；⑦团队规范与安全考量。核心方法论是「先给模型一个具体计划，成功率更高」，并通过聚焦会话、合理授权来最大化产出。

## 📋 术语表

| 英文                 | 中文       | 说明                                                    |
| -------------------- | ---------- | ------------------------------------------------------- |
| agentic capabilities | 智能体能力 | 能够自主规划、调用工具并执行多步任务的能力              |
| custom instructions  | 自定义指令 | 用户或仓库提供的指令文件，用于约束 Copilot 的行为与规范 |
| allowed tools        | 允许的工具 | 无需每次请求许可即可由 Copilot 运行的工具白名单         |
| plan mode            | 计划模式   | 在写代码前先生成结构化实施计划的模式                    |
| infinite sessions    | 无限会话   | 通过智能压缩自动管理上下文、不担心耗尽上下文的会话机制  |
| compaction           | 压缩       | 自动汇总对话历史、保留关键信息的上下文管理机制          |
| checkpoint           | 检查点     | 会话上下文被压缩时生成的摘要快照                        |
| delegate             | 委派       | 把任务交给云端 Copilot 智能体异步执行                   |
| sub-agents           | 子智能体   | 由主智能体派生、并行执行子任务的小型智能体              |
| monorepo             | 单仓库     | 将多个项目集中在单一代码仓库中的管理模式                |
| onboarding           | 上手       | 新加入项目时快速熟悉代码库的过程                        |
| allowlist            | 白名单     | 明确允许 Copilot 执行的操作清单                         |

---

## 正文（双语对照）

Best practices for GitHub Copilot CLI

GitHub Copilot CLI 最佳实践

Learn how to get the most out of GitHub Copilot CLI.

了解如何充分发挥 GitHub Copilot CLI 的能力。

### Introduction

### 简介

GitHub Copilot CLI is a terminal-native AI coding assistant that brings agentic capabilities directly to your command line. Copilot CLI can operate like a chatbot, answering your questions, but its true power lies in its ability to work autonomously as your coding partner, allowing you to delegate tasks and oversee its work.

GitHub Copilot CLI 是一款原生终端的 AI 编程助手，将智能体能力直接带到你的命令行。Copilot CLI 可以像聊天机器人一样回答你的问题，但它真正的威力在于能够作为你的编码伙伴自主工作，让你可以委派任务并监督它的执行。

This article provides tips for getting the most out of Copilot CLI, from using the various CLI commands effectively to managing the CLI's access to files. Consider these tips as starting points, then experiment to find out what works best for your workflows.

本文提供充分利用 Copilot CLI 的技巧，从有效使用各种 CLI 命令到管理 CLI 对文件的访问权限。把这些技巧当作起点，然后多试验，找出最适合你工作流程的方式。

> [!NOTE]
> GitHub Copilot CLI is continually evolving. Use the `/help` command to see the most up to date information.

> [!NOTE]
> GitHub Copilot CLI 在不断演进。使用 `/help` 命令查看最新信息。

### 1. Customize your environment

### 1. 自定义你的环境

#### Use custom instructions files

#### 使用自定义指令文件

Copilot CLI automatically combines applicable user-level, repository, and path-specific instructions. Use repository instructions for project conventions and user-level instructions for preferences that should apply across projects.

Copilot CLI 会自动合并适用的用户级、仓库级和路径特定的指令。用仓库级指令承载项目约定，用用户级指令承载跨项目通用的偏好。

For the complete list of supported locations and details about discovery, file references, and how multiple instruction files interact, see [Adding custom instructions for GitHub Copilot CLI](/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions).

关于支持的指令位置完整列表，以及发现机制、文件引用、多个指令文件如何交互的细节，请参阅[为 GitHub Copilot CLI 添加自定义指令](/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)。

##### Best practice

##### 最佳实践

Avoid conflicting instructions. For example, this is a simple `.github/copilot-instructions.md` file.

避免相互冲突的指令。例如，这是一个简单的 `.github/copilot-instructions.md` 文件。

```markdown
## Build Commands

- `npm run build` - Build the project
- `npm run test` - Run all tests
- `npm run lint:fix` - Fix linting issues

## Code Style

- Use TypeScript strict mode
- Prefer functional components over class components
- Always add JSDoc comments for public APIs

## Workflow

- Run `npm run lint:fix && npm test` after making changes
- Commit messages follow conventional commits format
- Create feature branches from `main`
```

> [!TIP]
> Keep instructions concise and actionable. Lengthy instructions can dilute effectiveness.

> [!TIP]
> 指令要简洁、可执行。冗长的指令会稀释其效果。

For more information, see [About customizing GitHub Copilot responses](/en/copilot/concepts/prompting/response-customization?tool=webui).

更多信息请参阅[关于自定义 GitHub Copilot 响应](/en/copilot/concepts/prompting/response-customization?tool=webui)。

#### Configure allowed tools

#### 配置允许的工具

Manage which tools Copilot can run without asking for permission. When Copilot requests permission for an action, you can typically choose either to allow it just this time, or allow the tool to be used for the rest of the CLI session.

管理哪些工具 Copilot 可以在无需请求许可的情况下运行。当 Copilot 为某个操作请求许可时，你通常可以选择「仅本次允许」或「允许该工具在当前 CLI 会话的剩余时间内使用」。

To reset previously approved tools, use:

要重置之前已批准的工具，使用：

```copilot
/reset-allowed-tools
```

You can also preconfigure allowed tools via CLI flags:

你也可以通过 CLI 标志预先配置允许的工具：

```bash
copilot --allow-tool='shell(git:*)' --deny-tool='shell(git push)'
```

**Common permission patterns:**

**常见权限模式：**

- `shell(git:*)` — Allow all Git commands
- `shell(git:*)` — 允许所有 Git 命令
- `shell(npm run:*)` — Allow all npm scripts
- `shell(npm run:*)` — 允许所有 npm 脚本
- `shell(npm run test:*)` — Allow npm test commands
- `shell(npm run test:*)` — 允许 npm 测试命令
- `write` — Allow file writes
- `write` — 允许文件写入

#### Select your preferred model

#### 选择你的首选模型

Use `/model` to choose from available models based on your task complexity:

使用 `/model` 根据任务复杂度从可用模型中选择：

| Model                         | Best For                                                       | Tradeoffs                                                                                  |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Auto**                      | Reduced rate limiting and lower latency and errors             | See [About Copilot auto model selection](/en/copilot/concepts/models/auto-model-selection) |
| **Claude Opus 4.5** (default) | Complex architecture, difficult debugging, nuanced refactoring | Most capable but more costly                                                               |
| **Claude Sonnet 4.5**         | Day-to-day coding, most routine tasks                          | Fast, cost-effective, handles most work well                                               |
| **GPT-5.2 Codex**             | Code generation, code review, straightforward implementations  | Excellent for reviewing code produced by other models                                      |

| 模型                        | 最适合                         | 权衡                                                                              |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| **Auto**                    | 降低限流、更低延迟与更少错误   | 参见[关于 Copilot 自动模型选择](/en/copilot/concepts/models/auto-model-selection) |
| **Claude Opus 4.5**（默认） | 复杂架构、棘手调试、精细重构   | 能力最强但成本更高                                                                |
| **Claude Sonnet 4.5**       | 日常编码、大多数常规任务       | 快速、经济，能很好处理大多数工作                                                  |
| **GPT-5.2 Codex**           | 代码生成、代码评审、直白的实现 | 非常适合评审其他模型产出的代码                                                    |

**Recommendations:**

**推荐：**

- **Auto** intelligently chooses models based on real-time system health and model performance (reducing rate limiting and providing lower latency and errors), and the complexity of the task you have given Copilot.
- **Auto** 会根据实时系统健康状态和模型表现（减少限流、提供更低延迟和更少错误）以及你交给 Copilot 的任务复杂度，智能选择模型。
- **Opus 4.5** is ideal for tasks requiring deep reasoning, complex system design, subtle bug investigation, or extensive context understanding.
- **Opus 4.5** 非常适合需要深度推理、复杂系统设计、微妙 Bug 排查或大量上下文理解的任务。
- **Switch to Sonnet 4.5** for routine tasks where speed and cost efficiency matter—it handles the majority of everyday coding effectively.
- 对于速度和成本效率更重要的常规任务，切换到 **Sonnet 4.5**——它能有效处理绝大多数日常编码。
- **Use Codex** for high-volume code generation and as a second opinion for reviewing code produced by other models.
- **Codex** 用于大批量代码生成，并可作为评审其他模型产出代码的「第二意见」。

You can switch models mid-session with `/model` as task complexity changes.

你可以随着任务复杂度的变化，用 `/model` 在会话中途切换模型。

If your organization or enterprise has configured custom models using their own LLM provider API keys, those models also appear in `/model` at the bottom of the list.

如果你的组织或企业使用自有 LLM 提供者的 API 密钥配置了自定义模型，这些模型也会出现在 `/model` 列表底部。

#### Use your own model provider

#### 使用你自己的模型提供者

You can configure Copilot CLI to use your own model provider instead of GitHub-hosted models. Run `copilot help providers` for full setup instructions.

你可以将 Copilot CLI 配置为使用你自己的模型提供者，而非 GitHub 托管的模型。运行 `copilot help providers` 获取完整配置说明。

**Key considerations:**

**关键考量：**

- Your model must support **tool calling** (function calling) and **streaming**. Copilot CLI returns an error if either capability is missing.
- 你的模型必须支持**工具调用**（函数调用）和**流式输出**。若缺少任一能力，Copilot CLI 会返回错误。
- For best results, use a model with a context window of at least 128k tokens.
- 为获得最佳效果，使用上下文窗口至少 128k Token 的模型。
- Built-in sub-agents (`/review`, `/task`, explore, `/fleet`) automatically inherit your provider configuration.
- 内置子智能体（`/review`、`/task`、explore、`/fleet`）会自动继承你的提供者配置。
- Cost estimates are hidden when using your own provider. Token usage (input, output, and cache counts) is still displayed.
- 使用自有提供者时，成本估算会被隐藏。Token 用量（输入、输出和缓存计数）仍会显示。
- `/delegate` only works if you are also signed in to GitHub. It transfers the session to GitHub's server-side Copilot, not your provider.
- `/delegate` 仅在你同时登录 GitHub 时才可用。它会把会话转移到 GitHub 服务端 Copilot，而非你的提供者。

See [Using your own model provider](/en/copilot/concepts/agents/copilot-cli/about-copilot-cli#using-your-own-model-provider).

参见[使用你自己的模型提供者](/en/copilot/concepts/agents/copilot-cli/about-copilot-cli#using-your-own-model-provider)。

#### Set AI credit session limits

#### 设置 AI 积分会话上限

You can cap the amount of AI credits that Copilot can spend on a single session so that long-running or complex tasks don't consume more resources than you expect. See [Setting an AI credit session limit in GitHub Copilot CLI](/en/copilot/how-tos/copilot-cli/use-copilot-cli/set-session-limit).

你可以为单个会话设置 AI 积分消耗上限，避免长时间运行或复杂任务消耗超出预期的资源。参见[在 GitHub Copilot CLI 中设置 AI 积分会话上限](/en/copilot/how-tos/copilot-cli/use-copilot-cli/set-session-limit)。

For more information on how to optimize your AI credits usage generally, see [Optimizing your AI usage to maximize efficiency and reduce cost](/en/copilot/tutorials/optimize-ai-usage).

关于如何整体优化 AI 积分用量的更多信息，参见[优化 AI 用量以最大化效率并降低成本](/en/copilot/tutorials/optimize-ai-usage)。

### 2. Plan before you code

### 2. 先规划再编码

#### Plan mode

#### 计划模式

**Models achieve higher success rates when given a concrete plan to follow.** In plan mode, Copilot will create a structured implementation plan before any code is written.

**当模型被赋予一个具体的计划去执行时，成功率更高。** 在计划模式下，Copilot 会在写任何代码之前先创建一个结构化的实施计划。

Press Shift + Tab to toggle between normal mode and plan mode. In plan mode, all prompts you enter will trigger the plan workflow.

按 Shift + Tab 在普通模式和计划模式之间切换。在计划模式下，你输入的所有提示词都会触发计划工作流。

Alternatively, you can use the `/plan` command in normal mode to achieve the same effect.

或者，你也可以在普通模式下使用 `/plan` 命令达到同样的效果。

**Example prompt (from normal mode):**

**示例提示词（来自普通模式）：**

```copilot
/plan Add OAuth2 authentication with Google and GitHub providers
```

**What happens:**

**会发生什么：**

- Copilot analyzes your request and codebase.
- Copilot 分析你的请求和代码库。
- **Asks clarifying questions** to align on requirements and approach.
- **提出澄清性问题**，以对齐需求和方案。
- Creates a structured implementation plan with checkboxes.
- 创建带复选框的结构化实施计划。
- Saves the plan to `plan.md` in your session folder.
- 将计划保存到会话文件夹中的 `plan.md`。
- **Waits for your approval** before implementing.
- 在实施前**等待你的批准**。

You can press Ctrl + y to view and edit the plan in your default editor for Markdown files.

你可以按 Ctrl + y 在 Markdown 文件的默认编辑器中查看和编辑该计划。

**Example plan output:**

**示例计划输出：**

```markdown
# Implementation Plan: OAuth2 Authentication

## Overview

Add social authentication using OAuth2 with Google and GitHub providers.

## Tasks

- [ ] Install dependencies (passport, passport-google-oauth20, passport-github2)
- [ ] Create authentication routes in `/api/auth`
- [ ] Implement passport strategies for each provider
- [ ] Add session management middleware
- [ ] Create login/logout UI components
- [ ] Add environment variables for OAuth credentials
- [ ] Write integration tests

## Detailed Steps

1. **Dependencies**: Add to package.json...
2. **Routes**: Create `/api/auth/google` and `/api/auth/github`...
```

#### When to use plan mode

#### 何时使用计划模式

| Scenario                           | Use plan mode? |
| ---------------------------------- | -------------- |
| Complex multi-file changes         |                |
| Refactoring with many touch points |                |
| New feature implementation         |                |
| Quick bug fixes                    |                |
| Single file changes                |                |

| 场景               | 是否使用计划模式？ |
| ------------------ | ------------------ |
| 复杂的多文件改动   | 是                 |
| 涉及多处改动的重构 | 是                 |
| 新功能实现         | 是                 |
| 快速 Bug 修复      | 否                 |
| 单文件改动         | 否                 |

#### The explore → plan → code → commit workflow

#### explore → plan → code → commit 工作流

For best results on complex tasks:

对于复杂任务，为获得最佳结果：

- **Explore**:
  `Read the authentication files but don't write code yet`
- **Explore（探索）**：
  `阅读认证相关文件，但先别写代码`
- **Plan**:
  `/plan Implement password reset flow`
- **Plan（规划）**：
  `/plan 实现密码重置流程`
- **Review**:
  Check the plan, suggest modifications
- **Review（评审）**：
  检查计划，提出修改建议
- **Implement**:
  `Proceed with the plan`
- **Implement（实施）**：
  `继续执行计划`
- **Verify**:
  `Run the tests and fix any failures`
- **Verify（验证）**：
  `运行测试并修复任何失败`
- **Commit**:
  `Commit these changes with a descriptive message`
- **Commit（提交）**：
  `用描述性信息提交这些改动`

### 3. Leverage infinite sessions

### 3. 善用无限会话

#### Automatic context window management

#### 自动上下文窗口管理

Copilot CLI features **infinite sessions**. You don't need to worry about running out of context. The system automatically manages context through intelligent compaction that summarizes conversation history while preserving essential information.

Copilot CLI 拥有**无限会话**特性。你无需担心上下文耗尽。系统通过智能压缩自动管理上下文，在保留关键信息的同时汇总对话历史。

**Session storage location:**

**会话存储位置：**

```text
~/.copilot/session-state/{session-id}/
├── events.jsonl      # Full session history
├── workspace.yaml    # Metadata
├── plan.md           # Implementation plan (if created)
├── checkpoints/      # Compaction history
└── files/            # Persistent artifacts
```

> [!NOTE]
> If you ever need to manually trigger compaction, use `/compact`. This is rarely necessary since the system handles it automatically.

> [!NOTE]
> 如果你需要手动触发压缩，使用 `/compact`。由于系统会自动处理，这通常很少需要。

#### Session management commands

#### 会话管理命令

To view information about the current CLI session, enter:

要查看当前 CLI 会话的信息，输入：

```copilot
/session
```

To view a list of any session checkpoints, enter:

要查看会话检查点列表，输入：

```copilot
/session checkpoints
```

> [!NOTE]
> A checkpoint is created when session context is compacted, and allows you to view the summary context that Copilot created.

> [!NOTE]
> 检查点在会话上下文被压缩时创建，让你能够查看 Copilot 生成的摘要上下文。

To view the details of a specific checkpoint, enter:

要查看特定检查点的详情，输入：

```copilot
/session checkpoints NUMBER
```

where NUMBER specifies the checkpoint you want to display.

其中 NUMBER 指定你想显示的检查点。

To view any temporary files that have been created during the current session—for example, artifacts created by Copilot that shouldn't be saved to the repository—enter:

要查看当前会话期间创建的任何临时文件——例如 Copilot 创建的、不应保存到仓库的工件——输入：

```copilot
/session files
```

To view the current plan (if Copilot has generated one), enter:

要查看当前计划（如果 Copilot 已生成），输入：

```copilot
/session plan
```

#### Best practice: Keep sessions focused

#### 最佳实践：保持会话聚焦

While infinite sessions allow long-running work, focused sessions produce better results:

虽然无限会话支持长时间运行的工作，但聚焦的会话能产出更好的结果：

- Use `/clear` or `/new` between unrelated tasks.
- 在无关任务之间使用 `/clear` 或 `/new`。
- This resets context and improves response quality.
- 这会重置上下文并提升响应质量。
- Think of it like starting a fresh conversation with a colleague.
- 可以把它想象成与同事开启一段全新的对话。

#### The `/context` command

#### `/context` 命令

Visualize your current context usage with `/context`. It shows a breakdown of:

使用 `/context` 可视化当前上下文使用情况。它会展示以下项目的明细：

- System/tools tokens
- 系统/工具 Token
- Message history tokens
- 消息历史 Token
- Free space
- 空闲空间
- Buffer allocation
- 缓冲区分配

### 4. Delegate work effectively

### 4. 高效委派工作

#### The `/delegate` command

#### `/delegate` 命令

**Offload work to run in the cloud using Copilot cloud agent.** This is particularly powerful for:

**将工作卸载到云端，使用 Copilot 云端智能体运行。** 这在以下场景尤其强大：

- Tasks that can run asynchronously.
- 可异步运行的任务。
- Changes to other repositories.
- 对其他仓库的改动。
- Long-running operations you don't want to wait for.
- 你不想等待的长时间运行操作。

**Example prompt:**

**示例提示词：**

```copilot
/delegate Add dark mode support to the settings page
```

**What happens:**

**会发生什么：**

- Your request is sent to Copilot cloud agent.
- 你的请求被发送到 Copilot 云端智能体。
- The agent creates a pull request with the changes.
- 该智能体创建一个包含改动的拉取请求。
- You can continue working locally while the cloud agent works.
- 云端智能体工作时，你可以继续在本地工作。

#### When to use `/delegate`

#### 何时使用 `/delegate`

| Use `/delegate`              | Work locally            |
| ---------------------------- | ----------------------- |
| Tangential tasks             | Core feature work       |
| Documentation updates        | Debugging               |
| Refactoring separate modules | Interactive exploration |

| 使用 `/delegate` | 本地工作     |
| ---------------- | ------------ |
| 外围/次要任务    | 核心功能开发 |
| 文档更新         | 调试         |
| 重构独立模块     | 交互式探索   |

### 5. Common workflows

### 5. 常用工作流

#### Codebase onboarding

#### 代码库上手

Use Copilot CLI as your pair programming partner when joining a new project. For example, you could ask Copilot:

加入新项目时，把 Copilot CLI 当作你的结对编程伙伴。例如，你可以问 Copilot：

- `How is logging configured in this project?`
- `这个项目的日志是如何配置的？`
- `What's the pattern for adding a new API endpoint?`
- `新增 API 端点的模式是什么？`
- `Explain the authentication flow`
- `解释一下认证流程`
- `Where are the database migrations?`
- `数据库迁移文件在哪里？`

#### Test-driven development

#### 测试驱动开发（TDD）

Pair with Copilot CLI to develop tests.

与 Copilot CLI 结对开发测试。

- `Write failing tests for the user registration flow`
- `为用户注册流程编写会失败的测试`
- _Review and approve the tests._
- _评审并批准这些测试。_
- `Now implement code to make all tests pass`
- `现在实现代码，让所有测试通过`
- _Review the implementation._
- _评审实现。_
- `Commit with message "feat: add user registration"`
- `用 "feat: add user registration" 信息提交`

#### Code review assistance

#### 代码评审辅助

- `/security-review Review my current local changes for security issues. Prioritize high-severity findings and suggest remediations I can apply before opening a pull request.`
- `/security-review 评审我当前本地改动的安全问题。优先处理高严重性发现，并建议我可以在打开拉取请求前应用的修复措施。`
- ``/review Use Opus 4.5 and Codex 5.2 to review the changes in my current branch against `main`. Focus on potential bugs and security issues.``
- ``/review 使用 Opus 4.5 和 Codex 5.2 评审我当前分支相对 `main` 的改动。重点关注潜在 Bug 和安全问题。``
- Triage high-severity findings first, validate your fixes, then continue through your normal pull request review workflow.
- 先对高严重性发现做分级处理，验证你的修复，然后继续走常规的拉取请求评审流程。

#### Git operations

#### Git 操作

Copilot excels at Git workflows:

Copilot 擅长 Git 工作流：

- ``What changes went into version `2.3.0`?``
- ``版本 `2.3.0` 引入了哪些改动？``
- `Create a PR for this branch with a detailed description`
- `为这个分支创建一个带详细描述的 PR`
- ``Rebase this branch against `main` ``
- ``将这个分支变基到 `main` ``
- ``Resolve the merge conflicts in `package.json` ``
- ``解决 `package.json` 中的合并冲突``

#### Bug investigation

#### Bug 排查

- ``The `/api/users` endpoint returns 500 errors intermittently. Search the codebase and logs to identify the root cause.``
- ```/api/users` 端点间歇性返回 500 错误。搜索代码库和日志以定位根本原因。``

#### Refactoring

#### 重构

- `/plan Migrate all class components to functional components with hooks`
- `/plan 将所有类组件迁移为带 hooks 的函数组件`

Then answer the questions Copilot asks. Review the plan it creates, and ask Copilot to make changes if necessary. When you are happy with the plan you can prompt: `Implement this plan`

然后回答 Copilot 提出的问题。评审它生成的计划，必要时让 Copilot 修改。当你对计划满意后，可以提示：`Implement this plan`（实施这个计划）

### 6. Advanced patterns

### 6. 进阶模式

#### Work across multiple repositories

#### 跨多个仓库工作

**Copilot CLI provides flexible multi-repository workflows**—a key differentiator for teams working on microservices, monorepos, or related projects.

**Copilot CLI 提供灵活的多仓库工作流**——对于做微服务、单仓库或相关项目的团队来说，这是一个关键的差异化能力。

**Option 1: Run from a parent directory**

**方式一：从父目录运行**

```bash
# Navigate to a parent directory containing multiple repos
# 进入包含多个仓库的父目录
cd ~/projects
copilot
```

Copilot can now access and work across all child repositories simultaneously. This is ideal for:

Copilot 现在可以同时访问并跨所有子仓库工作。这非常适合：

- Microservices architectures
- 微服务架构
- Making coordinated changes across related repos
- 跨相关仓库做协同改动
- Refactoring shared patterns across projects
- 跨项目重构共享模式

**Option 2: Use `/add-dir` to expand access**

**方式二：使用 `/add-dir` 扩展访问范围**

```bash
# Start in one repo, then add others (requires full paths)
# 从一个仓库开始，然后添加其他仓库（需要完整路径）
copilot
/add-dir /Users/me/projects/backend-service
/add-dir /Users/me/projects/shared-libs
/add-dir /Users/me/projects/documentation
```

**View and manage allowed directories:**

**查看和管理允许的目录：**

```copilot
/list-dirs
```

**Example workflow: coordinated API changes**

**示例工作流：协同 API 改动**

```copilot
I need to update the user authentication API. The changes span:

- @/Users/me/projects/api-gateway (routing changes)
- @/Users/me/projects/auth-service (core logic)
- @/Users/me/projects/frontend (client updates)

Start by showing me the current auth flow across all three repos.
```

```copilot
我需要更新用户认证 API。改动涉及：

- @/Users/me/projects/api-gateway（路由改动）
- @/Users/me/projects/auth-service（核心逻辑）
- @/Users/me/projects/frontend（客户端更新）

先展示这三个仓库当前的认证流程。
```

This multi-repository capability enables:

这种多仓库能力支持：

- Cross-cutting refactors (update a shared pattern everywhere)
- 横切重构（在各处更新共享模式）
- API contract changes with client updates
- 伴随客户端更新的 API 契约变更
- Documentation that references multiple codebases
- 引用多个代码库的文档
- Dependency upgrades across a monorepo
- 单仓库内的依赖升级

#### Using images for UI work

#### 使用图片辅助 UI 开发

Copilot can work with visual references. Simply **drag and drop** images directly into the CLI input, paste an image from the clipboard by using Ctrl + V, or reference image files in your prompt:

Copilot 可以使用视觉参考。只需将图片直接**拖放**到 CLI 输入框，用 Ctrl + V 从剪贴板粘贴图片，或在提示词中引用图片文件：

```copilot
Implement this design: @mockup.png
Match the layout and spacing exactly
```

```copilot
实现这个设计：@mockup.png
精确匹配布局和间距
```

#### Checklists for complex migrations

#### 复杂迁移的检查清单

For large-scale changes:

对于大规模改动：

```copilot
Run the linter and write all errors to `migration-checklist.md` as a checklist.
Then fix each issue one by one, checking them off as you go.
```

```copilot
运行 linter，将所有错误作为检查清单写入 `migration-checklist.md`。
然后逐个修复每个问题，边修边勾选。
```

#### Autonomous task completion

#### 自主完成任务

Switch into autopilot mode to allow Copilot to work autonomously on a task until it is complete. This is ideal for long-running tasks that don't require constant supervision. For more information, see [Allowing GitHub Copilot CLI to work autonomously](/en/copilot/concepts/agents/copilot-cli/autopilot).

切换到自动驾驶模式，让 Copilot 自主处理任务直至完成。这非常适合不需要持续监督的长时间运行任务。更多信息参见[允许 GitHub Copilot CLI 自主工作](/en/copilot/concepts/agents/copilot-cli/autopilot)。

Optionally, you can usually speed up large tasks by using the `/fleet` slash command at the start of your prompt to allow Copilot to break the task into parallel subtasks that are run by subagents. For more information, see [Running tasks in parallel with the `/fleet` command](/en/copilot/concepts/agents/copilot-cli/fleet).

或者，你通常可以在提示词开头使用 `/fleet` 斜杠命令来加速大型任务，让 Copilot 把任务拆分为由子智能体运行的并行子任务。更多信息参见[使用 `/fleet` 命令并行运行任务](/en/copilot/concepts/agents/copilot-cli/fleet)。

### 7. Team guidelines

### 7. 团队规范

#### Recommended repository setup

#### 推荐的仓库配置

- **Create `.github/copilot-instructions.md`** with:
  - Build and test commands
  - Code style guidelines
  - Required checks before commits
  - Architecture decisions
- **创建 `.github/copilot-instructions.md`**，包含：
  - 构建和测试命令
  - 代码风格规范
  - 提交前必须执行的检查
  - 架构决策

- **Establish conventions** for:
  - When to use `/plan` (complex features, refactoring)
  - When to use `/delegate` (tangential work)
  - Code review processes with AI assistance
- **建立约定**，明确：
  - 何时使用 `/plan`（复杂功能、重构）
  - 何时使用 `/delegate`（外围工作）
  - 结合 AI 辅助的代码评审流程

#### Security considerations

#### 安全考量

- Copilot CLI requires explicit approval for potentially destructive operations.
- Copilot CLI 对潜在破坏性操作要求显式批准。
- Review all proposed changes before accepting.
- 在接受前评审所有提议的改动。
- Use permission allowlists judiciously.
- 谨慎使用权限白名单。
- Never commit secrets. Copilot is designed to avoid this, but always verify.
- 永远不要提交密钥。Copilot 被设计为会避免这一点，但始终要自行核实。

#### Measuring productivity

#### 衡量生产力

Track metrics like:

跟踪以下指标：

- Time from issue to pull request
- 从 issue 到拉取请求的耗时
- Number of iterations before merge
- 合并前的迭代次数
- Code review feedback cycles
- 代码评审反馈轮次
- Test coverage improvements
- 测试覆盖率提升

### Getting help

### 获取帮助

From the command line, you can display help by using the command: `copilot -h`.

在命令行中，你可以用命令 `copilot -h` 显示帮助。

For help on various topics enter:

获取各类主题的帮助，输入：

```bash
copilot help TOPIC
```

where `TOPIC` can be one of: `config`, `commands`, `environment`, `logging`, or `permissions`.

其中 `TOPIC` 可以是：`config`、`commands`、`environment`、`logging` 或 `permissions`。

#### Within the CLI

#### 在 CLI 内部

For help within the CLI, enter:

在 CLI 内部获取帮助，输入：

```copilot
/help
```

To view usage statistics, enter:

查看使用统计，输入：

```copilot
/usage
```

To submit private feedback to GitHub about Copilot CLI, raise a bug report, or submit a feature request, enter:

向 GitHub 提交关于 Copilot CLI 的私密反馈、提出 Bug 报告或提交功能请求，输入：

```copilot
/feedback
```

### Hands-on practice

### 动手实践

Try the [Creating applications with Copilot CLI](https://github.com/skills/create-applications-with-the-copilot-cli) Skills exercise for practical experience building an application with Copilot CLI.

尝试[使用 Copilot CLI 创建应用](https://github.com/skills/create-applications-with-the-copilot-cli)的 Skills 练习，获得用 Copilot CLI 构建应用的实战经验。

Here is what you will learn:

你将学到：

- Install Copilot CLI
- 安装 Copilot CLI
- Use the issue template to create an issue
- 使用 issue 模板创建 issue
- Generate a Node.js CLI calculator app
- 生成一个 Node.js CLI 计算器应用
- Expand calculator functionality
- 扩展计算器功能
- Write unit tests for calculator functions
- 为计算器函数编写单元测试
- Create, review, and merge your pull request
- 创建、评审并合并你的拉取请求

### Further reading

### 延伸阅读

- [About GitHub Copilot CLI](/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)
- [关于 GitHub Copilot CLI](/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)
- [Using GitHub Copilot CLI](/en/copilot/how-tos/copilot-cli/use-copilot-cli/overview)
- [使用 GitHub Copilot CLI](/en/copilot/how-tos/copilot-cli/use-copilot-cli/overview)
- [GitHub Copilot CLI command reference](/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [GitHub Copilot CLI 命令参考](/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [Copilot plans and pricing](https://github.com/features/copilot/plans)
- [Copilot 套餐与定价](https://github.com/features/copilot/plans)

---

> **译者注**：原文中「When to use plan mode」和「When to use `/delegate`」两处表格里，第二列仅有勾选符号（✅/❌）在原文渲染中被省略为空白，此处根据上下文语义补全为「是/否」与「使用 /delegate / 本地工作」两列。译文中的代码块命令均保持英文原文，以便直接复制使用。
