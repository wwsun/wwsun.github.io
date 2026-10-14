---
title: GitHub Copilot CLI 最佳实践
tags:
  - copilot
  - cli
draft: false
description: GitHub Copilot CLI 是一款原生终端 AI 编程助手，将智能体能力直接带入命令行，支持自主委派任务、代码审查与多仓库工作流。
source: https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices
---

GitHub Copilot CLI 是一款原生终端 AI 编程助手，将智能体能力直接带入命令行。Copilot CLI 可以像聊天机器人一样回答你的问题，但其真正强大之处在于能够作为你的编码伙伴自主工作，让你可以委派任务并监督其工作。

本文提供充分利用 Copilot CLI 的技巧，从有效使用各种 CLI 命令到管理 CLI 的文件访问权限。将这些技巧作为起点，然后实验找出最适合你工作流程的方法。

> [!NOTE]
> GitHub Copilot CLI 正在不断演进。使用 `/help` 命令查看最新信息。

---

## 1. 自定义环境

### 使用自定义指令文件

Copilot CLI 自动从多个位置读取指令，允许你定义组织范围内的标准和仓库特定的约定。

支持的指令文件位置（按发现顺序）：

| 位置                                        | 作用范围           |
| ------------------------------------------- | ------------------ |
| `~/.copilot/copilot-instructions.md`        | 所有会话（全局）   |
| `.github/copilot-instructions.md`           | 仓库级别           |
| `.github/instructions/**/*.instructions.md` | 仓库级别（模块化） |
| `AGENTS.md`（Git 根目录或当前工作目录）     | 仓库级别           |
| `Copilot.md`, `GEMINI.md`, `CODEX.md`       | 仓库级别           |

#### 最佳实践

仓库指令始终优先于全局指令。利用这一点来强制执行团队约定。例如，这是一个简单的 `.github/copilot-instructions.md` 文件：

```markdown
## 构建命令

- `npm run build` - 构建项目
- `npm run test` - 运行所有测试
- `npm run lint:fix` - 修复代码风格问题

## 代码风格

- 使用 TypeScript 严格模式
- 优先使用函数组件而非类组件
- 始终为公共 API 添加 JSDoc 注释

## 工作流程

- 修改后运行 `npm run lint:fix && npm test`
- 提交信息遵循约定式提交格式
- 从 `main` 分支创建功能分支
```

> [!TIP]
> 保持指令简洁且可操作。冗长的指令可能会降低有效性。

### 配置允许的工具

管理 Copilot 可以在不请求权限的情况下运行哪些工具。当 Copilot 请求某个操作的权限时，你通常可以选择仅允许这一次，或允许该工具在当前 CLI 会话的剩余时间内使用。

要重置之前批准的工具，使用：

```copilot
/reset-allowed-tools
```

你也可以通过 CLI 标志预配置允许的工具：

```bash
copilot --allow-tool='shell(git:*)' --deny-tool='shell(git push)'
```

常用权限模式：

- `shell(git:*)` — 允许所有 Git 命令
- `shell(npm run:*)` — 允许所有 npm 脚本
- `shell(npm run test:*)` — 允许 npm 测试命令
- `write` — 允许文件写入

### 选择首选模型

使用 `/model` 根据任务复杂度选择可用模型：

| 模型                    | 最适合                       | 权衡                                                                                                                                          |
| ----------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto                    | 减少速率限制、更低延迟和错误 | 参见 [关于 Copilot 自动模型选择](https://docs.github.com/en/copilot/concepts/auto-model-selection#auto-model-selection-in-github-copilot-cli) |
| Claude Opus 4.5（默认） | 复杂架构、困难调试、细致重构 | 最强大但使用更多 [高级请求](https://docs.github.com/en/copilot/concepts/billing/copilot-requests#model-multipliers)                           |
| Claude Sonnet 4.5       | 日常编码、大多数常规任务     | 快速、成本效益高，能很好地处理大多数工作                                                                                                      |
| GPT-5.2 Codex           | 代码生成、代码审查、直接实现 | 非常适合审查其他模型生成的代码                                                                                                                |

推荐：

- **Auto** 根据实时系统健康和模型性能智能选择模型，减少速率限制并提供更低延迟和错误。
- **Opus 4.5** 适合需要深度推理、复杂系统设计、微妙错误调查或广泛上下文理解的任务。
- 对于速度和成本效率重要的常规任务，切换到 **Sonnet 4.5** — 它能有效处理大部分日常编码。
- 使用 **Codex** 进行大批量代码生成，并作为审查其他模型生成代码的第二意见。

你可以在会话中随时使用 `/model` 切换模型，以适应任务复杂度的变化。

### 使用自己的模型提供商

你可以配置 Copilot CLI 使用自己的模型提供商，而不是 GitHub 托管的模型。运行 `copilot help providers` 获取完整的设置说明。

关键考虑因素：

- 你的模型必须支持工具调用（函数调用）和流式传输。如果缺少任一能力，Copilot CLI 将返回错误。
- 为获得最佳效果，使用上下文窗口至少为 128k tokens 的模型。
- 内置子代理（`/review`, `/task`, explore, `/fleet`）自动继承你的提供商配置。
- 使用自己的提供商时，高级请求成本估算会被隐藏。Token 使用量（输入、输出和缓存计数）仍然显示。
- `/delegate` 仅在你也登录 GitHub 时才有效。它会将会话转移到 GitHub 的服务器端 Copilot，而不是你的提供商。

---

## 2. 编码前先规划

### 规划模式

当给定具体计划遵循时，模型能达到更高的成功率。在规划模式中，Copilot 会在编写任何代码之前创建一个结构化的实施计划。

按 **Shift+Tab** 在正常模式和规划模式之间切换。在规划模式下，你输入的所有提示都会触发规划工作流。

或者，你可以在正常模式下使用 `/plan` 命令达到相同效果。

示例提示（来自正常模式）：

```copilot
/plan 添加 Google 和 GitHub 提供商的 OAuth2 认证
```

执行过程：

- Copilot 分析你的请求和代码库
- 提出澄清问题以统一需求和方案
- 创建带有复选框的结构化实施计划
- 将计划保存到会话文件夹中的 `plan.md`
- 等待你的批准后再实施

你可以按 **Ctrl+y** 在默认的 Markdown 编辑器中查看和编辑计划。

示例计划输出：

```markdown
# 实施计划：OAuth2 认证

## 概述

使用 Google 和 GitHub 提供商添加 OAuth2 社交认证。

## 任务

- [ ] 安装依赖（passport, passport-google-oauth20, passport-github2）
- [ ] 在 `/api/auth` 中创建认证路由
- [ ] 为每个提供商实现 passport 策略
- [ ] 添加会话管理中间件
- [ ] 创建登录/注销 UI 组件
- [ ] 为 OAuth 凭证添加环境变量
- [ ] 编写集成测试

## 详细步骤

1. **依赖项**：添加到 package.json...
2. **路由**：创建 `/api/auth/google` 和 `/api/auth/github`...
```

### 何时使用规划模式

| 场景               | 使用规划模式？ |
| ------------------ | -------------- |
| 复杂的多文件更改   | ✅             |
| 涉及多个地方的重构 | ✅             |
| 新功能实现         | ✅             |
| 快速 Bug 修复      | ❌             |
| 单文件更改         | ❌             |

### explore → plan → code → commit 工作流

对于复杂任务的最佳实践：

1. **Explore**：`读取认证文件但先不写代码`
2. **Plan**：`/plan 实现密码重置流程`
3. **Review**：检查计划，建议修改
4. **Implement**：`继续执行计划`
5. **Verify**：`运行测试并修复任何失败`
6. **Commit**：`提交这些更改并附带描述性信息`

---

## 3. 利用无限会话

### 自动上下文窗口管理

Copilot CLI 具有无限会话功能。你不必担心上下文耗尽。系统通过智能压缩来管理上下文，在保留关键信息的同时总结对话历史。

会话存储位置：

```text
~/.copilot/session-state/{session-id}/
├── events.jsonl      # 完整会话历史
├── workspace.yaml    # 元数据
├── plan.md           # 实施计划（如果已创建）
├── checkpoints/      # 压缩历史
└── files/            # 持久化产物
```

> [!NOTE]
> 如果你需要手动触发压缩，使用 `/compact`。这很少需要，因为系统会自动处理。

### 会话管理命令

查看当前 CLI 会话信息：

```copilot
/session
```

查看会话检查点列表：

```copilot
/session checkpoints
```

> [!NOTE]
> 检查点在会话上下文被压缩时创建，允许你查看 Copilot 创建的摘要上下文。

查看特定检查点的详细信息：

```copilot
/session checkpoints NUMBER
```

其中 NUMBER 指定你要显示的检查点。

查看当前会话中创建的任何临时文件 — 例如 Copilot 创建的不应保存到仓库的产物：

```copilot
/session files
```

查看当前计划（如果 Copilot 已生成）：

```copilot
/session plan
```

### 最佳实践：保持会话专注

虽然无限会话允许长时间运行的工作，但专注的会话能产生更好的结果：

- 在不相关的任务之间使用 `/clear` 或 `/new`
- 这会重置上下文并提高响应质量
- 把它想象成与同事开始新的对话

### `/context` 命令

使用 `/context` 可视化你当前的上下文使用情况。它显示以下细分：

- 系统/工具 tokens
- 消息历史 tokens
- 可用空间
- 缓冲区分配

---

## 4. 有效委派工作

### `/delegate` 命令

使用 Copilot 云代理将工作卸载到云端运行。这对以下情况特别强大：

- 可以异步运行的任务
- 对其他仓库的更改
- 你不想等待的长时运行操作

示例提示：

```copilot
/delegate 为设置页面添加深色模式支持
```

执行过程：

- 你的请求被发送到 Copilot 云代理
- 代理创建一个包含更改的 Pull Request
- 你可以在云代理工作时继续在本地工作

### 何时使用 `/delegate`

| 使用 `/delegate` | 本地工作     |
| ---------------- | ------------ |
| 边缘任务         | 核心功能工作 |
| 文档更新         | 调试         |
| 重构独立模块     | 交互式探索   |

---

## 5. 常见工作流

### 代码库上手

加入新项目时将 Copilot CLI 作为你的结对编程伙伴。例如，你可以问 Copilot：

- `这个项目中的日志是如何配置的？`
- `添加新 API 端点的模式是什么？`
- `解释认证流程`
- `数据库迁移在哪里？`

### 测试驱动开发

与 Copilot CLI 结对开发测试：

- `为用户注册流程编写失败的测试`
- 审查并批准测试
- `现在实现代码使所有测试通过`
- 审查实现
- `提交信息为 "feat: add user registration"`

### 代码审查辅助

- `/review 使用 Opus 4.5 和 Codex 5.2 审查我当前分支相对于 main 的更改。关注潜在错误和安全问题。`

### Git 操作

Copilot 擅长 Git 工作流：

- `版本 2.3.0 中包含了哪些更改？`
- `为这个分支创建一个带有详细描述的 PR`
- `将这个分支 rebase 到 main`
- `解决 package.json 中的合并冲突`

### Bug 调查

- `/api/users 端点间歇性返回 500 错误。搜索代码库和日志以识别根本原因。`

### 重构

- `/plan 将所有类组件迁移到使用 hooks 的函数组件` 然后回答 Copilot 提出的问题。审查它创建的计划，如有需要让 Copilot 进行更改。当你对计划满意时，可以提示：`实施这个计划`

---

## 6. 高级模式

### 跨多个仓库工作

Copilot CLI 提供灵活的多仓库工作流 — 这是从事微服务、单体仓库或相关项目的团队的关键差异化功能。

**选项 1：从父目录运行**

```bash
# 导航到包含多个仓库的父目录
cd ~/projects
copilot
```

Copilot 现在可以同时访问和处理所有子仓库。这非常适合：

- 微服务架构
- 跨相关仓库进行协调更改
- 跨项目重构共享模式

**选项 2：使用 `/add-dir` 扩展访问**

```bash
# 在一个仓库中启动，然后添加其他仓库（需要完整路径）
copilot
/add-dir /Users/me/projects/backend-service
/add-dir /Users/me/projects/shared-libs
/add-dir /Users/me/projects/documentation
```

查看和管理允许的目录：

```copilot
/list-dirs
```

示例工作流：协调 API 更改

```copilot
我需要更新用户认证 API。更改涉及：

- @/Users/me/projects/api-gateway（路由更改）
- @/Users/me/projects/auth-service（核心逻辑）
- @/Users/me/projects/frontend（客户端更新）

首先向我展示所有三个仓库中当前的认证流程。
```

这种多仓库能力支持：

- 跨领域重构（在每个地方更新共享模式）
- API 契约更改与客户端更新
- 引用多个代码库的文档
- 跨单体仓库的依赖升级

### 使用图像进行 UI 工作

Copilot 可以使用视觉参考。直接将图像拖放到 CLI 输入中，或引用图像文件：

```copilot
实现这个设计：@mockup.png
精确匹配布局和间距
```

### 复杂迁移的检查清单

对于大规模更改：

```copilot
运行 linter 并将所有错误写入 `migration-checklist.md` 作为检查清单。
然后逐一修复每个问题，完成后勾选。
```

### 自主任务完成

切换到自动驾驶模式，允许 Copilot 自主处理任务直到完成。这非常适合不需要持续监督的长时运行任务。

可选地，你通常可以通过在提示开头使用 `/fleet` 斜杠命令来加速大型任务，允许 Copilot 将任务分解为由子代理并行运行的子任务。

---

## 7. 团队指南

### 推荐的仓库设置

- 创建 `.github/copilot-instructions.md`，包含：
  - 构建和测试命令
  - 代码风格指南
  - 提交前必需的检查
  - 架构决策
- 将 `AGENTS.md` 添加到根目录以提供高级上下文
- 使用 `.github/instructions/*.md` 组织模块化指令

### 共享会话

会话存储在 `~/.copilot/session-state/`。你可以：

- 与同事共享会话文件夹以进行协作调试
- 将会话检入仓库以记录复杂重构
- 使用 `/export` 创建可共享的会话存档

---

## 8. 安全与权限

### 文件访问控制

Copilot CLI 默认只能访问你启动它的目录中的文件。使用以下命令管理访问：

```copilot
/allow-dir /path/to/additional/code      # 授予对额外目录的访问权限
/deny-dir /path/to/sensitive/data        # 撤销对敏感目录的访问权限
/list-dirs                               # 查看当前允许的目录
```

### 权限边界

- **只读操作**：Copilot 可以在没有权限的情况下读取文件
- **写入操作**：需要显式批准（或预配置允许的工具）
- **Shell 命令**：每个命令在执行前都需要批准
- **网络请求**：需要显式批准

### 敏感数据

- 避免在提示中传递 API 密钥或密码
- 使用环境变量或配置文件进行敏感数据
- 使用 `/session files` 查看 Copilot 创建的临时文件

---

## 9. 故障排除

### 常见问题和解决方案

| 问题       | 解决方案                              |
| ---------- | ------------------------------------- |
| 响应太慢   | 切换到 Sonnet 4.5 或 Auto 模型        |
| 上下文丢失 | 使用 `/compact` 或开始新会话          |
| 权限被拒绝 | 检查 `/list-dirs` 并使用 `/allow-dir` |
| 模型不理解 | 提供更具体的指令或切换到 Opus 4.5     |
| 网络错误   | 检查连接，必要时使用 `/delegate`      |

### 获取帮助

- `/help` - 显示所有可用命令
- `/help <command>` - 获取特定命令的帮助
- `copilot help providers` - 模型提供商设置

---

## 总结

GitHub Copilot CLI 是一个强大的工具，可以显著提高你的生产力。关键要点：

1. **自定义环境** - 使用指令文件和工具配置
2. **先规划** - 对复杂任务使用规划模式
3. **利用无限会话** - 但不要害怕开始新会话
4. **有效委派** - 对合适的工作使用 `/delegate`
5. **掌握工作流** - 从代码审查到重构
6. **探索高级模式** - 多仓库、图像、检查清单

记住：Copilot CLI 正在不断演进。使用 `/help` 保持更新，并尝试找到最适合你工作流程的方法。
