---
title: Claude Code
description: Claude Code 使用指南
tags:
  - agent
  - claude-code
source: https://code.claude.com/docs/en/hooks
---

## 减少 token 用量

主动管理上下文：

- 使用 `/usage` 检查当前 Token 用量，或配置状态栏持续显示。
- 任务间清空上下文：切换无关任务时使用 `/clear` 重新开始，陈旧上下文会在后续每条消息中浪费 Token。
- clear 前使用 `/rename` 命名会话，方便后续通过 `/resume` 找回。
- 添加自定义压缩指令：`/compact Focus on code samples and API usage` 告诉 Claude 在总结时保留哪些内容。

也可在 CLAUDE.md 中自定义压缩行为：

```md
# Compact instructions

When you are using compact, please focus on test output and code changes
```

## 典型工作流中的命令

大多数命令在会话的特定节点发挥作用，从项目初始化到发布变更。

**首次在仓库中使用。** 运行 `/init` 生成初始 `CLAUDE.md`，然后使用 `/memory` 进行优化。使用 `/mcp` 和 `/agents` 设置项目所需的任何服务器或子代理，并使用 `/permissions` 设置所需的审批规则。

**任务执行中。**`/plan` 在大型变更前切换到规划模式。`/model` 和 `/effort` 调整推理投入程度。当对话过长时，`/context` 显示窗口使用情况，`/compact` 进行压缩总结；使用 `/btw` 进行不应增加历史记录的快速旁问。

**并行工作。**`/agents` 打开 Claude 可委托旁任务的[子代理](https://code.claude.com/docs/en/sub-agents)管理器，`/tasks` 列出当前会话后台运行的任务。`/background` 将会话转为[后台代理](https://code.claude.com/docs/en/agent-view)运行，释放终端。对于跨越整个代码库的大型变更，`/batch` 将其分解为独立单元并在各自的 [worktree](https://code.claude.com/docs/en/worktrees) 中运行。参见[并行运行代理](https://code.claude.com/docs/en/agents)了解这些方法之间的关系。

**发布前。**`/diff` 显示变更内容，`/simplify` 审查最近文件并应用质量和效率修复，`/review` 或 `/security-review` 进行更深度的只读审查。

**会话之间。**`/clear` 在新任务上重新开始同时保留项目记忆。`/resume` 和 `/branch` 让你返回或分叉较早的对话。`/teleport` 将 Web 会话拉入终端，`/remote-control` 让你从另一设备继续当前本地会话。

**遇到问题时。**`/rewind` 将代码和对话回滚到检查点，或总结对话的某部分。`/doctor` 和 `/debug` 诊断安装和运行时问题，`/feedback` 附带会话上下文提交错误报告。

## 所有命令

下表列出了 Claude Code 中包含的所有命令。标记为 **Skill** 的条目是捆绑技能。它们使用与你自行编写的技能相同的机制：一个交给 Claude 的提示词，Claude 也会在相关时自动调用。其他所有命令都是内置命令，其行为编码在 CLI 中。要添加自己的命令，参见[技能](https://code.claude.com/docs/en/skills)。在下表中，`<arg>` 表示必需参数，`[arg]` 表示可选参数。

并非每个命令对每个用户都可见。可用性取决于平台、计划和环境。例如，`/desktop` 仅在 macOS 和 Windows 上显示，`/upgrade` 仅在 Pro 和 Max 计划上显示。

| 命令                                            | 用途                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/add-dir <path>`                               | 为当前会话添加工作目录以允许文件访问。添加的目录不会[发现](https://code.claude.com/docs/en/permissions#additional-directories-grant-file-access-not-configuration)大多数 `.claude/` 配置。之后可使用 `--continue` 或 `--resume` 从添加的目录恢复会话                                                                                                                                                                                                                                                                       |
| `/agents`                                       | 管理[代理](https://code.claude.com/docs/en/sub-agents)配置                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/autofix-pr [prompt]`                          | 启动一个 [Claude Code 网页版](https://code.claude.com/docs/en/claude-code-on-the-web#auto-fix-pull-requests)会话，监视当前分支的 PR 并在 CI 失败或审查者留下评论时推送修复。通过 `gh pr view` 从已检出分支检测打开的 PR；要监视其他 PR，请先检出其分支。默认远程会话被指示修复所有 CI 失败和审查评论；传入提示词可给予不同指令，例如 `/autofix-pr only fix lint and type errors`。需要 `gh` CLI 和 [Claude Code 网页版](https://code.claude.com/docs/en/claude-code-on-the-web#who-can-use-claude-code-on-the-web)访问权限 |
| `/background [prompt]`                          | 将当前会话转为[后台代理](https://code.claude.com/docs/en/agent-view)运行，释放此终端。传入提示词可在分离前再发送一条指令。使用 `claude agents` 监控会话。别名：`/bg`                                                                                                                                                                                                                                                                                                                                                       |
| `/batch <instruction>`                          | **[Skill]** 在代码库中并行编排大规模变更。研究代码库，将工作分解为 5 到 30 个独立单元，并呈现计划。批准后，在每个隔离的 [git worktree](https://code.claude.com/docs/en/worktrees) 中为每个单元启动一个[后台子代理](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)。每个子代理实现其单元、运行测试并打开一个 Pull Request。需要 git 仓库。示例：`/batch migrate src/ from Solid to React`                                                                                            |
| `/branch [name]`                                | 在当前节点创建对话分支。切换到分支并保留原始对话，可通过 `/resume` 返回。别名：`/fork`。当 [`CLAUDE_CODE_FORK_SUBAGENT`](https://code.claude.com/docs/en/env-vars) 设置时，`/fork` 改为启动[分叉子代理](https://code.claude.com/docs/en/sub-agents#fork-the-current-conversation)，不再作为此命令的别名                                                                                                                                                                                                                    |
| `/btw <question>`                               | 提出快速[旁问](https://code.claude.com/docs/en/interactive-mode#side-questions-with-%2Fbtw)，不加入对话上下文                                                                                                                                                                                                                                                                                                                                                                                                              |
| `/chrome`                                       | 配置 [Claude in Chrome](https://code.claude.com/docs/en/chrome) 设置                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/claude-api [migrate\|managed-agents-onboard]` | **[Skill]** 为项目语言（Python、TypeScript、Java、Go、Ruby、C#、PHP 或 cURL）加载 Claude API 参考材料和 Managed Agents 参考。涵盖工具使用、流式传输、批次、结构化输出和常见陷阱。当代码导入 `anthropic` 或 `@anthropic-ai/sdk` 时也会自动激活。运行 `/claude-api migrate` 将现有 Claude API 代码升级到较新模型：Claude 询问要扫描哪些文件和目标模型，然后更新模型 ID、thinking 配置和其他在版本间变更的参数。运行 `/claude-api managed-agents-onboard` 进行交互式演练，从头创建新的 Managed Agent                          |
| `/clear [name]`                                 | 以空上下文开始新对话。先前的对话在 `/resume` 中保持可用。传入名称可在 `/resume` 选择器中标记先前的对话。要释放上下文同时继续同一对话，请改用 `/compact`。别名：`/reset`、`/new`                                                                                                                                                                                                                                                                                                                                            |
| `/color [color\|default]`                       | 设置当前会话的提示栏颜色。可用颜色：`red`、`blue`、`green`、`yellow`、`purple`、`orange`、`pink`、`cyan`。使用 `default` 重置，或无参数运行时随机选择颜色。当[远程控制](https://code.claude.com/docs/en/remote-control)连接时，颜色同步到 claude.ai/code                                                                                                                                                                                                                                                                   |
| `/compact [instructions]`                       | 通过总结当前对话来释放上下文。可选择性传入总结的重点指令。参见[压缩如何处理规则、技能和记忆文件](https://code.claude.com/docs/en/context-window#what-survives-compaction)                                                                                                                                                                                                                                                                                                                                                  |
| `/config`                                       | 打开[设置](https://code.claude.com/docs/en/settings)界面，调整主题、模型、[输出风格](https://code.claude.com/docs/en/output-styles)和其他偏好。别名：`/settings`                                                                                                                                                                                                                                                                                                                                                           |
| `/context [all]`                                | 以彩色网格形式可视化当前上下文使用情况。显示上下文密集型工具的优化建议、内存膨胀和容量警告。在[全屏模式](https://code.claude.com/docs/en/fullscreen)下，逐项明细折叠以保持网格可见。传入 `all` 可展开                                                                                                                                                                                                                                                                                                                      |
| `/copy [N]`                                     | 将最后一个助手响应复制到剪贴板。传入数字 `N` 复制第 N 个最新的响应：`/copy 2` 复制倒数第二个。存在代码块时，显示交互式选择器以选择单个块或完整响应。在选择器中按 `w` 将选择写入文件而非剪贴板，这在 SSH 连接时很有用                                                                                                                                                                                                                                                                                                       |
| `/cost`                                         | `/usage` 的别名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/debug [description]`                          | **[Skill]** 为当前会话启用调试日志记录，并通过读取会话调试日志排查问题。除非使用 `claude --debug` 启动，否则调试日志默认关闭，因此在会话中运行 `/debug` 将从该时间点开始捕获日志。可选择描述问题以聚焦分析                                                                                                                                                                                                                                                                                                                 |
| `/desktop`                                      | 在 Claude Code 桌面应用中继续当前会话。仅限 macOS 和 Windows。别名：`/app`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/diff`                                         | 打开交互式 diff 查看器，显示未提交的更改和每次对话轮的 diff。使用左右箭头在 git diff 和各个 Claude 对话轮之间切换，使用上下箭头浏览文件                                                                                                                                                                                                                                                                                                                                                                                    |
| `/doctor`                                       | 诊断和验证 Claude Code 安装和设置。结果显示状态图标。按 `f` 让 Claude 修复报告的问题                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/effort [level\|auto]`                         | 设置模型[努力级别](https://code.claude.com/docs/en/model-config#adjust-effort-level)。接受 `low`、`medium`、`high`、`xhigh` 或 `max`；可用级别取决于模型，`max` 仅限当前会话。`auto` 重置为模型默认值。无参数时打开交互式滑块；使用左右箭头选择级别，`Enter` 应用。立即生效，无需等待当前响应完成                                                                                                                                                                                                                          |
| `/exit`                                         | 退出 CLI。在附加的[后台会话](https://code.claude.com/docs/en/agent-view#attach-to-a-session)中，此操作将分离且会话继续运行。别名：`/quit`                                                                                                                                                                                                                                                                                                                                                                                  |
| `/export [filename]`                            | 将当前对话导出为纯文本。有文件名时直接写入该文件。无参数时打开对话框复制到剪贴板或保存到文件                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `/extra-usage`                                  | 配置额外用量，在达到速率限制时继续工作                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/fast [on\|off]`                               | 开启或关闭[快速模式](https://code.claude.com/docs/en/fast-mode)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/feedback [report]`                            | 提交关于 Claude Code 的反馈。别名：`/bug`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `/fewer-permission-prompts`                     | **[Skill]** 扫描对话记录中常见的只读 Bash 和 MCP 工具调用，然后向项目 `.claude/settings.json` 添加优先级允许列表以减少权限提示                                                                                                                                                                                                                                                                                                                                                                                             |
| `/focus`                                        | 切换聚焦视图，仅显示你的最后一个提示、带编辑差异统计的单行工具调用摘要和最终响应。选择在会话间保持；在设置中设置 [`viewMode`](https://code.claude.com/docs/en/settings#available-settings) 可覆盖。仅在[全屏渲染](https://code.claude.com/docs/en/fullscreen)中可用                                                                                                                                                                                                                                                        |
| `/goal [condition\|clear]`                      | 设置[目标](https://code.claude.com/docs/en/goal)：Claude 将持续跨轮工作直到条件满足。无参数时显示当前或最近完成的目标。`clear`、`stop`、`off`、`reset`、`none` 或 `cancel` 提前移除活动目标                                                                                                                                                                                                                                                                                                                                |
| `/heapdump`                                     | 将 JavaScript 堆快照和内存分解写入 `~/Desktop`（Linux 无 Desktop 文件夹时写入主目录），用于诊断高内存使用。参见[故障排除](https://code.claude.com/docs/en/troubleshooting#high-cpu-or-memory-usage)                                                                                                                                                                                                                                                                                                                        |
| `/help`                                         | 显示帮助和可用命令                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/hooks`                                        | 查看工具事件的[钩子](https://code.claude.com/docs/en/hooks)配置                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/ide`                                          | 管理 IDE 集成并显示状态                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `/init`                                         | 使用 `CLAUDE.md` 指南初始化项目。设置 `CLAUDE_CODE_NEW_INIT=1` 可启用交互式流程，同时引导完成技能、钩子和个人记忆文件                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/insights`                                     | 生成分析 Claude Code 会话的报告，包括项目领域、交互模式和摩擦点                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/install-github-app`                           | 为仓库设置 [Claude GitHub Actions](https://code.claude.com/docs/en/github-actions) 应用。引导完成选择仓库和配置集成                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/install-slack-app`                            | 安装 Claude Slack 应用。打开浏览器完成 OAuth 流程                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `/keybindings`                                  | 打开或创建按键绑定配置文件                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/login`                                        | 登录 Anthropic 账户                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/logout`                                       | 退出 Anthropic 账户                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/loop [interval] [prompt]`                     | **[Skill]** 在会话保持打开期间重复运行提示词。省略间隔则 Claude 在每次迭代之间自行节奏。省略提示词则 Claude 运行自主维护检查，或运行 `.claude/loop.md` 中的提示词（如果存在）。示例：`/loop 5m check if the deploy finished`。参见[按计划运行提示词](https://code.claude.com/docs/en/scheduled-tasks)。别名：`/proactive`                                                                                                                                                                                                  |
| `/mcp`                                          | 管理 MCP 服务器连接和 OAuth 认证                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/memory`                                       | 编辑 `CLAUDE.md` 记忆文件，启用或禁用[自动记忆](https://code.claude.com/docs/en/memory#auto-memory)，以及查看自动记忆条目                                                                                                                                                                                                                                                                                                                                                                                                  |
| `/mobile`                                       | 显示下载 Claude 移动应用的二维码。别名：`/ios`、`/android`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/model [model]`                                | 选择或更改 AI 模型。对于支持此功能的模型，使用左右箭头[调整努力级别](https://code.claude.com/docs/en/model-config#adjust-effort-level)。无参数时打开选择器，当对话已有输出时需要确认，因为下一个响应将在无缓存上下文的情况下重新读取完整历史。一旦确认，变更立即生效，无需等待当前响应完成                                                                                                                                                                                                                                 |
| `/passes`                                       | 与朋友分享 Claude Code 免费一周使用权。仅在账户符合条件时可见                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `/permissions`                                  | 管理工具权限的允许、询问和拒绝规则。打开交互式对话框，可按范围查看规则、添加或移除规则、管理工作目录，并查看[最近的自动模式拒绝记录](https://code.claude.com/docs/en/auto-mode-config#review-denials)。别名：`/allowed-tools`                                                                                                                                                                                                                                                                                              |
| `/plan [description]`                           | 直接从提示进入规划模式。传入可选描述以进入规划模式并立即开始该任务，例如 `/plan fix the auth bug`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `/plugin`                                       | 管理 Claude Code [插件](https://code.claude.com/docs/en/plugins)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/powerup`                                      | 通过带有动画演示的快速交互式课程发现 Claude Code 功能                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/pr-comments [PR]`                             | 在 v2.1.91 中已移除。直接请求 Claude 查看 Pull Request 评论即可。在早期版本中，获取并显示 GitHub Pull Request 的评论；自动检测当前分支的 PR，或传入 PR URL 或编号。需要 `gh` CLI                                                                                                                                                                                                                                                                                                                                           |
| `/privacy-settings`                             | 查看和更新隐私设置。仅适用于 Pro 和 Max 计划订阅者                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/radio`                                        | 在浏览器中打开 Claude FM lo-fi 电台。没有浏览器时打印流媒体 URL。Bedrock、Vertex 或 Foundry 上不可用                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/recap`                                        | 按需生成当前会话的一行摘要。参见[会话回顾](https://code.claude.com/docs/en/interactive-mode#session-recap)了解离开后自动出现的回顾                                                                                                                                                                                                                                                                                                                                                                                         |
| `/release-notes`                                | 在交互式版本选择器中查看更新日志。选择特定版本查看其发布说明，或选择显示所有版本                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/reload-plugins`                               | 重新加载所有活动[插件](https://code.claude.com/docs/en/plugins)以应用待处理更改而无需重启。报告每个重新加载组件的计数并标记任何加载错误                                                                                                                                                                                                                                                                                                                                                                                    |
| `/remote-control`                               | 使此会话可通过 claude.ai 进行[远程控制](https://code.claude.com/docs/en/remote-control)。别名：`/rc`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/remote-env`                                   | 为[使用 `--remote` 启动的 Web 会话](https://code.claude.com/docs/en/claude-code-on-the-web#configure-your-environment)配置默认远程环境                                                                                                                                                                                                                                                                                                                                                                                     |
| `/rename [name]`                                | 重命名当前会话并在提示栏显示名称。无名称时从对话历史自动生成                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `/resume [session]`                             | 通过 ID 或名称恢复对话，或打开会话选择器。别名：`/continue`                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `/review [PR]`                                  | 在当前会话中本地审查 Pull Request。如需更深度的云端审查，参见 [`/ultrareview`](https://code.claude.com/docs/en/ultrareview)                                                                                                                                                                                                                                                                                                                                                                                                |
| `/rewind`                                       | 将对话和/或代码回滚到之前的节点，或从选定消息开始总结。参见[检查点](https://code.claude.com/docs/en/checkpointing)。别名：`/checkpoint`、`/undo`                                                                                                                                                                                                                                                                                                                                                                           |
| `/sandbox`                                      | 切换[沙箱模式](https://code.claude.com/docs/en/sandboxing)。仅在支持的平台上可用                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/schedule [description]`                       | 创建、更新、列出或运行[例程](https://code.claude.com/docs/en/routines)，这些例程在 Anthropic 管理的云基础设施上执行。Claude 以对话方式引导完成设置。别名：`/routines`                                                                                                                                                                                                                                                                                                                                                      |
| `/scroll-speed`                                 | 交互式调整鼠标滚轮[滚动速度](https://code.claude.com/docs/en/fullscreen#mouse-wheel-scrolling)，带有一个标尺，可在对话框打开时滚动预览更改。仅在[全屏渲染](https://code.claude.com/docs/en/fullscreen)中可用，JetBrains IDE 终端中不可用                                                                                                                                                                                                                                                                                   |
| `/security-review`                              | 分析当前分支上待处理更改的安全漏洞。审查 git diff 并识别注入、认证问题和数据暴露等风险                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/setup-bedrock`                                | 通过交互式向导配置 [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) 认证、区域和模型固定。仅在 `CLAUDE_CODE_USE_BEDROCK=1` 设置时可见。首次使用的 Bedrock 用户也可从登录屏幕访问此向导                                                                                                                                                                                                                                                                                                                     |
| `/setup-vertex`                                 | 通过交互式向导配置 [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) 认证、项目、区域和模型固定。仅在 `CLAUDE_CODE_USE_VERTEX=1` 设置时可见。首次使用的 Vertex AI 用户也可从登录屏幕访问此向导                                                                                                                                                                                                                                                                                                          |
| `/simplify [focus]`                             | **[Skill]** 审查最近更改的文件，检查代码重用、质量和效率问题，然后修复它们。并行启动三个审查代理，汇总发现并应用修复。传入文本以聚焦特定关注点：`/simplify focus on memory efficiency`                                                                                                                                                                                                                                                                                                                                     |
| `/skills`                                       | 列出可用[技能](https://code.claude.com/docs/en/skills)。按 `t` 按 token 数量排序。按 `Space` [对 Claude 或 `/` 菜单隐藏技能](https://code.claude.com/docs/en/skills#override-skill-visibility-from-settings)，然后按 `Enter` 保存                                                                                                                                                                                                                                                                                          |
| `/stats`                                        | `/usage` 的别名。打开 Stats 选项卡                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/status`                                       | 打开设置界面（Status 选项卡），显示版本、模型、账户和连接状态。可在 Claude 响应期间工作，无需等待当前响应完成                                                                                                                                                                                                                                                                                                                                                                                                              |
| `/statusline`                                   | 配置 Claude Code 的[状态行](https://code.claude.com/docs/en/statusline)。描述你想要的，或无参数运行时从 shell 提示符自动配置                                                                                                                                                                                                                                                                                                                                                                                               |
| `/stickers`                                     | 订购 Claude Code 贴纸                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/stop`                                         | 停止当前[后台会话](https://code.claude.com/docs/en/agent-view)。仅在附加到后台会话时可用；对话记录和任何 worktree 将被保留。要分离而不停止，请使用 `/exit` 或按 `←`                                                                                                                                                                                                                                                                                                                                                        |
| `/tasks`                                        | 列出和管理后台任务。也可用 `/bashes`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/team-onboarding`                              | 从 Claude Code 使用历史生成团队入职指南。Claude 分析过去 30 天的会话、命令和 MCP 服务器使用情况，生成 markdown 指南，团队成员可将其粘贴为第一条消息以快速上手。对于 claude.ai 上 Pro、Max、Team 和 Enterprise 计划的订阅者，还会返回一个分享链接，团队成员可在 Claude Code 中直接打开                                                                                                                                                                                                                                      |
| `/teleport`                                     | 将 [Claude Code 网页版](https://code.claude.com/docs/en/claude-code-on-the-web#from-web-to-terminal)会话拉入此终端：打开选择器，然后获取分支和对话。也可用 `/tp`。需要 claude.ai 订阅                                                                                                                                                                                                                                                                                                                                      |
| `/terminal-setup`                               | 配置 Shift+Enter 和其他快捷键的终端按键绑定。仅在需要的终端中可见，如 VS Code、Cursor、Windsurf、Alacritty 或 Zed                                                                                                                                                                                                                                                                                                                                                                                                          |
| `/theme`                                        | 更改颜色主题。包括匹配终端浅色或深色背景的 `auto` 选项、浅色和深色变体、色盲可访问（daltonized）主题、使用终端调色板的 ANSI 主题，以及来自 `~/.claude/themes/` 或插件的任何[自定义主题](https://code.claude.com/docs/en/terminal-config#create-a-custom-theme)。选择 **New custom theme…** 创建新主题                                                                                                                                                                                                                      |
| `/tui [default\|fullscreen]`                    | 设置终端 UI 渲染器并重新启动进入，保留对话完好。`fullscreen` 启用[无闪烁 alt-screen 渲染器](https://code.claude.com/docs/en/fullscreen)。无参数时打印当前渲染器                                                                                                                                                                                                                                                                                                                                                            |
| `/ultraplan <prompt>`                           | 在 [ultraplan](https://code.claude.com/docs/en/ultraplan) 会话中起草计划，在浏览器中审查，然后远程执行或发送回终端                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/ultrareview [PR]`                             | 使用 [ultrareview](https://code.claude.com/docs/en/ultrareview) 在云沙箱中运行深度多代理代码审查。Pro 和 Max 计划包含 3 次免费运行，之后需要[额外用量](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)                                                                                                                                                                                                                                                                                  |
| `/upgrade`                                      | 打开升级页面切换到更高计划层级                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `/usage`                                        | 显示会话费用、计划用量限制和活动统计。订阅特定细节见[费用追踪指南](https://code.claude.com/docs/en/costs#using-the-%2Fusage-command)。`/cost` 和 `/stats` 是别名                                                                                                                                                                                                                                                                                                                                                           |
| `/vim`                                          | 在 v2.1.92 中已移除。在 Vim 和普通编辑模式间切换，请使用 `/config` → Editor mode                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `/voice [hold\|tap\|off]`                       | 切换[语音输入](https://code.claude.com/docs/en/voice-dictation)，或启用到特定模式。需要 Claude.ai 账户                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/web-setup`                                    | 使用本地 `gh` CLI 凭据将 GitHub 账户连接到 [Claude Code 网页版](https://code.claude.com/docs/en/web-quickstart#connect-from-your-terminal)。`/schedule` 在 GitHub 未连接时会自动提示此项                                                                                                                                                                                                                                                                                                                                   |

## claude.md

1. WHAT：项目结构、技术栈
2. WHY：项目目的、各模块作用
3. HOW：如何运行、测试、验证

## 自定义配置

```json
# 编辑或新增 `settings.json` 文件
# MacOS & Linux 为 `~/.claude/settings.json`
# Windows 为`用户目录/.claude/settings.json`
# 新增或修改里面的 env 字段
# 注意替换里面的 `your_zhipu_api_key` 为您上一步获取到的 API Key
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
# 再编辑或新增 `.claude.json` 文件
# MacOS & Linux 为 `~/.claude.json`
# Windows 为`用户目录/.claude.json`
# 新增 `hasCompletedOnboarding` 参数
{
  "hasCompletedOnboarding": true
}
```

- GLM + Claude Code https://docs.bigmodel.cn/cn/guide/develop/claude

## 常用权限跳过配置

```
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
      "Bash(mvn:*)"
    ]
  }
}
```

## skill 加载限制

```json
// .claude/settings.json（项目级）或 ~/.claude/settings.json（全局）
{
  "skillOverrides": {
    "legacy-context": "name-only", // 只显示名称，不自动加载内容
    "deploy": "off", // 完全禁用
    "pdf": "user-invocable-only" // 只能手动 /pdf 调用，不自动触发
  }
}
```

分层设置

```
~/.claude/settings.json          ← 全局：关掉不属于当前工作流的 global skills
.claude/settings.json            ← 项目共享：项目级 skill 的开关，提交到 git
.claude/settings.local.json      ← 个人覆盖：本机特有的关闭项，gitignore
```

## 禁用 ai commit

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

## Hooks

钩子允许在 Claude Code 特定事件发生时自动执行 shell 命令，实现自动化工作流。

| 钩子事件            | 触发时机        | 常用场景               |
| ------------------- | --------------- | ---------------------- |
| `SessionStart`      | 新会话开始      | 初始化环境、加载配置   |
| `SessionEnd`        | 会话结束        | 清理资源、生成报告     |
| `PreToolUse`        | 工具执行前      | 验证、修改工具输入     |
| `PostToolUse`       | 工具执行后      | 日志记录、触发后续操作 |
| `UserPromptSubmit`  | 用户提交提示后  | 添加上下文、权限检查   |
| `PermissionRequest` | 请求权限时      | 自动审批/拒绝权限      |
| `PreCompact`        | 对话压缩前      | 保存重要信息           |
| `SubagentStart`     | 子代理启动      | 监控、日志             |
| `SubagentStop`      | 子代理停止      | 收集结果               |
| `Stop`              | Claude 停止工作 | 通知、清理             |
| `Notification`      | 通知事件        | 自定义通知处理         |

### Config demo

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

### 例子：代码提交前自动格式化

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -q \"git commit\"; then cd $CLAUDE_PROJECT_DIR && npm run format; fi'"
      }
    ]
  }
}
```

### 钩子命令可通过环境变量访问上下文

```
$CLAUDE_PROJECT_DIR    # 项目目录
$CLAUDE_FILE_PATH      # 当前操作的文件路径
$CLAUDE_TOOL_INPUT     # 工具输入参数 (JSON)
$CLAUDE_TOOL_OUTPUT    # 工具输出结果 (JSON)
```
