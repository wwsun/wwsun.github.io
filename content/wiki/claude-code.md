---
title: Claude Code
description: Claude Code 使用指南 —— 从配置到日常工作流的完整参考
tags:
  - agent
  - claude-code
source: https://code.claude.com/docs/en/hooks
---

## 初次使用：项目配置

### 生成 CLAUDE.md

在仓库中首次使用时，运行 `/init` 生成初始 `CLAUDE.md`，再用 `/memory` 优化内容。

`CLAUDE.md` 应回答三件事：

1. **WHAT**：项目结构、技术栈
2. **WHY**：项目目的、各模块作用
3. **HOW**：如何运行、测试、验证

### 环境配置

编辑 `~/.claude/settings.json`（macOS/Linux）或 `用户目录/.claude/settings.json`（Windows）：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
```

同时在 `~/.claude.json` 中添加：

```json
{
  "hasCompletedOnboarding": true
}
```

> [!tip] 使用 GLM 接入 Claude Code
> 参考：https://docs.bigmodel.cn/cn/guide/develop/claude

### 常用权限跳过配置

避免反复点击确认，在 `settings.json` 中添加 `permissions.allow`：

```json
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
      "Bash(git tag:*)",
      "Bash(mvn:*)"
    ]
  }
}
```

---

## 日常使用：按场景查命令

### 开始一个任务

| 场景                   | 命令                  |
| ---------------------- | --------------------- |
| 新任务，清空上下文     | `/clear [name]`       |
| 给旧会话命名，方便找回 | `/rename [name]`      |
| 恢复之前的会话         | `/resume [session]`   |
| 在当前节点分叉对话     | `/branch [name]`      |
| 大改动前规划方案       | `/plan [description]` |

### 任务执行中

| 场景                 | 命令                               |
| -------------------- | ---------------------------------- |
| 查看上下文用量       | `/context [all]`                   |
| 压缩总结，释放上下文 | `/compact [instructions]`          |
| 提问但不污染上下文   | `/btw <question>`                  |
| 调整推理深度         | `/effort [low\|medium\|high\|max]` |
| 查看 Token 费用      | `/usage`                           |

### 并行与后台工作

| 场景             | 命令                   |
| ---------------- | ---------------------- |
| 管理子代理配置   | `/agents`              |
| 查看后台任务列表 | `/tasks`               |
| 将当前会话转后台 | `/background [prompt]` |
| 大规模并行变更   | `/batch <instruction>` |

### 发布前检查

| 场景               | 命令                |
| ------------------ | ------------------- |
| 查看当前未提交变更 | `/diff`             |
| 清理代码质量       | `/simplify [focus]` |
| 代码审查           | `/review [PR]`      |
| 安全漏洞扫描       | `/security-review`  |

### 遇到问题时

| 场景           | 命令                   |
| -------------- | ---------------------- |
| 回滚代码和对话 | `/rewind`              |
| 诊断安装问题   | `/doctor`              |
| 启用调试日志   | `/debug [description]` |
| 提交反馈/Bug   | `/feedback`            |

---

## 上下文管理：节省 Token

陈旧的上下文会在每条消息中浪费 Token，主动管理是好习惯：

1. **查看用量**：`/usage` 或配置状态栏持续显示
2. **切换任务前清空**：`/rename` 先为旧会话命名，再 `/clear` 开始新对话，随时可通过 `/resume` 找回
3. **压缩而不清空**：`/compact` 保留项目记忆，同时释放上下文

压缩时可以指定保留重点：

```bash
/compact Focus on code samples and API usage
```

也可以在 `CLAUDE.md` 中写入默认压缩规则：

```md
# Compact instructions

When you are using compact, please focus on test output and code changes
```

---

## 进阶能力

### Workflow：编排大规模任务

Workflow 是在后台执行的 JavaScript 脚本，用于编排多个子代理协同工作。相比逐轮对话，它将复杂的编排逻辑固化到代码中，适合：

- **突破对话规模限制**：协调数十乃至上百个代理
- **固化可复用流程**：如标准审查、自动迁移
- **需要交叉验证的任务**：多代理互相验证来源，对抗性审查

**触发方式**：在提示词中包含 `workflow` 一词，Claude 会自动编写脚本而不是逐轮处理：

```
Run a workflow to audit every API endpoint under src/routes/ for missing auth checks
```

- 按 `Option+W`（macOS）或 `Alt+W`（Windows/Linux）可取消当前提示词的 Workflow 高亮
- 在 `/config` 中可完全关闭 Workflow 关键字触发器

> [!tip] 自动触发
> 开启 `/effort ultracode` 后，Claude 会自动为实质性任务规划并运行 Workflow。

通过 `/workflows` 视图管理正在运行的任务。更多参考：https://code.claude.com/docs/en/workflows

### Hooks：自动化事件响应

Hooks 在特定事件发生时自动执行 shell 命令：

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

**配置格式**：

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

**示例：提交前自动格式化**

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

**钩子可用的环境变量**：

```
$CLAUDE_PROJECT_DIR    # 项目目录
$CLAUDE_FILE_PATH      # 当前操作的文件路径
$CLAUDE_TOOL_INPUT     # 工具输入参数 (JSON)
$CLAUDE_TOOL_OUTPUT    # 工具输出结果 (JSON)
```

---

## 配置参考

### 可用模型（2026 年 6 月）

| 模型              | API Model ID                | 说明                         |
| ----------------- | --------------------------- | ---------------------------- |
| Claude Opus 4.8   | `claude-opus-4-8`           | Claude Code 当前默认主力模型 |
| Claude Opus 4.7   | `claude-opus-4-7`           | 上一代 Opus                  |
| Claude Opus 4.6   | `claude-opus-4-6`           | 更早 Opus                    |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | 平衡型，性价比高             |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | 快速轻量                     |

> [!note]
> Opus 4.8 已成为 Max、Team Premium、Enterprise 及 API 账号的默认模型，默认 effort=high，可用 `/effort xhigh` 处理最复杂任务。

### Skill 加载控制

在 `.claude/settings.json` 中控制哪些 Skill 自动加载：

```json
{
  "skillOverrides": {
    "legacy-context": "name-only", // 只显示名称，不自动加载内容
    "deploy": "off", // 完全禁用
    "pdf": "user-invocable-only" // 只能手动 /pdf 调用，不自动触发
  }
}
```

**配置分层**：

```
~/.claude/settings.json          ← 全局：关掉不属于当前工作流的 global skills
.claude/settings.json            ← 项目共享：项目级 skill 开关，提交到 git
.claude/settings.local.json      ← 个人覆盖：本机特有的关闭项，加入 .gitignore
```

### 禁用 AI Commit 署名

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

---

## 完整命令索引

> [!note] 关于命令可见性
> 并非每个命令对所有用户可见，可用性取决于平台、计划和环境。标记 **[Skill]** 的条目是可自定义的提示词技能，其余为内置命令。`<arg>` 表示必需参数，`[arg]` 表示可选参数。

| 命令                                            | 用途                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `/add-dir <path>`                               | 为当前会话添加工作目录以允许文件访问                                      |
| `/agents`                                       | 管理子代理配置                                                            |
| `/autofix-pr [prompt]`                          | 启动网页版会话，监视 PR 并在 CI 失败或审查留言时推送修复（需要 `gh` CLI） |
| `/background [prompt]`                          | 将当前会话转为后台代理运行，释放终端。别名：`/bg`                         |
| `/batch <instruction>`                          | **[Skill]** 并行编排大规模变更，每个单元在独立 worktree 中运行            |
| `/branch [name]`                                | 在当前节点创建对话分支，保留原始对话可通过 `/resume` 返回。别名：`/fork`  |
| `/btw <question>`                               | 提出快速旁问，不加入对话上下文                                            |
| `/chrome`                                       | 配置 Claude in Chrome 设置                                                |
| `/claude-api [migrate\|managed-agents-onboard]` | **[Skill]** 加载 Claude API 参考材料；`migrate` 升级现有代码到新模型      |
| `/clear [name]`                                 | 以空上下文开始新对话，旧对话可通过 `/resume` 恢复。别名：`/reset`、`/new` |
| `/color [color\|default]`                       | 设置当前会话的提示栏颜色                                                  |
| `/compact [instructions]`                       | 通过总结当前对话来释放上下文                                              |
| `/config`                                       | 打开设置界面（主题、模型、输出风格等）。别名：`/settings`                 |
| `/context [all]`                                | 可视化当前上下文使用情况，显示优化建议                                    |
| `/copy [N]`                                     | 将最后一个助手响应复制到剪贴板                                            |
| `/debug [description]`                          | **[Skill]** 启用调试日志记录并排查运行时问题                              |
| `/desktop`                                      | 在 Claude Code 桌面应用中继续当前会话（仅 macOS/Windows）。别名：`/app`   |
| `/diff`                                         | 打开交互式 diff 查看器，显示未提交更改                                    |
| `/doctor`                                       | 诊断和验证 Claude Code 安装，按 `f` 自动修复问题                          |
| `/effort [level\|auto]`                         | 设置模型努力级别（`low` / `medium` / `high` / `xhigh` / `max`）           |
| `/exit`                                         | 退出 CLI。别名：`/quit`                                                   |
| `/export [filename]`                            | 将当前对话导出为纯文本                                                    |
| `/extra-usage`                                  | 配置额外用量，在达到速率限制时继续工作                                    |
| `/fast [on\|off]`                               | 开启或关闭快速模式                                                        |
| `/feedback [report]`                            | 提交关于 Claude Code 的反馈。别名：`/bug`                                 |
| `/fewer-permission-prompts`                     | **[Skill]** 扫描对话记录，向 settings.json 添加允许列表减少权限提示       |
| `/focus`                                        | 切换聚焦视图（仅在全屏渲染中可用）                                        |
| `/goal [condition\|clear]`                      | 设置目标，Claude 持续工作直到条件满足                                     |
| `/heapdump`                                     | 将 JS 堆快照写入 `~/Desktop`，用于诊断内存问题                            |
| `/help`                                         | 显示帮助和可用命令                                                        |
| `/hooks`                                        | 查看钩子配置                                                              |
| `/ide`                                          | 管理 IDE 集成并显示状态                                                   |
| `/init`                                         | 使用 CLAUDE.md 指南初始化项目                                             |
| `/insights`                                     | 生成分析 Claude Code 会话的报告（交互模式、摩擦点等）                     |
| `/install-github-app`                           | 为仓库设置 Claude GitHub Actions 应用                                     |
| `/keybindings`                                  | 打开或创建按键绑定配置文件                                                |
| `/loop [interval] [prompt]`                     | **[Skill]** 在会话期间重复运行提示词。别名：`/proactive`                  |
| `/mcp`                                          | 管理 MCP 服务器连接和 OAuth 认证                                          |
| `/memory`                                       | 编辑 CLAUDE.md 记忆文件，管理自动记忆                                     |
| `/model [model]`                                | 选择或更改 AI 模型                                                        |
| `/permissions`                                  | 管理工具权限的允许、询问和拒绝规则。别名：`/allowed-tools`                |
| `/plan [description]`                           | 直接进入规划模式，例如 `/plan fix the auth bug`                           |
| `/plugin`                                       | 管理 Claude Code 插件                                                     |
| `/powerup`                                      | 通过交互式课程发现 Claude Code 功能                                       |
| `/recap`                                        | 按需生成当前会话的一行摘要                                                |
| `/release-notes`                                | 在交互式版本选择器中查看更新日志                                          |
| `/remote-control`                               | 使此会话可通过 claude.ai 进行远程控制。别名：`/rc`                        |
| `/rename [name]`                                | 重命名当前会话（无参数时自动生成）                                        |
| `/resume [session]`                             | 恢复之前的对话。别名：`/continue`                                         |
| `/review [PR]`                                  | 在当前会话中本地审查 Pull Request                                         |
| `/rewind`                                       | 将对话和/或代码回滚到之前节点。别名：`/checkpoint`、`/undo`               |
| `/sandbox`                                      | 切换沙箱模式（仅在支持的平台上可用）                                      |
| `/schedule [description]`                       | 创建和管理在云端执行的例程。别名：`/routines`                             |
| `/security-review`                              | 分析待处理更改的安全漏洞（注入、认证、数据暴露等）                        |
| `/simplify [focus]`                             | **[Skill]** 审查最近更改的文件并修复质量和效率问题                        |
| `/skills`                                       | 列出可用技能，按 `t` 按 token 数量排序                                    |
| `/status`                                       | 显示版本、模型、账户和连接状态                                            |
| `/statusline`                                   | 配置状态行显示内容                                                        |
| `/stop`                                         | 停止当前后台会话（仅在附加到后台会话时可用）                              |
| `/tasks`                                        | 列出和管理后台任务。别名：`/bashes`                                       |
| `/team-onboarding`                              | 从使用历史生成团队入职指南                                                |
| `/teleport`                                     | 将 Claude Code 网页版会话拉入终端。别名：`/tp`                            |
| `/terminal-setup`                               | 配置 Shift+Enter 等快捷键的终端按键绑定                                   |
| `/theme`                                        | 更改颜色主题（支持自定义主题）                                            |
| `/tui [default\|fullscreen]`                    | 设置终端 UI 渲染器                                                        |
| `/ultraplan <prompt>`                           | 在 ultraplan 会话中起草计划并远程执行                                     |
| `/ultrareview [PR]`                             | 在云沙箱中运行深度多代理代码审查（Pro/Max 含 3 次免费）                   |
| `/usage`                                        | 显示会话费用、计划用量限制和活动统计。别名：`/cost`、`/stats`             |
| `/voice [hold\|tap\|off]`                       | 切换语音输入（需要 Claude.ai 账户）                                       |
| `/web-setup`                                    | 使用本地 `gh` CLI 凭据连接 GitHub 账户到网页版                            |
| `/workflows`                                    | 查看和管理 Workflow 运行状态                                              |
