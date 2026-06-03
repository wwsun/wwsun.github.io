---
title: "我读了 Claude Code 源代码——那些文档没告诉你的配置能力"
description: "翻译自 buildingbetter.tech 文章，详细解读 Claude Code 源代码中隐藏的 hooks 返回字段、技能配置、agent 记忆系统、自动模式分类器等未文档化功能。"
tags:
  - claude-code
  - ai-agent
  - configuration
  - translation
source: "https://buildingbetter.tech/p/i-read-the-claude-code-source-code"
date: 2026-06-02
---

## 我读了 Claude Code 源代码——那些文档没告诉你的配置能力

> 原文：[I Read the Claude Code Source Code. Here's Everything You Can Configure That the Docs Don't Tell You.](https://buildingbetter.tech/p/i-read-the-claude-code-source-code)
> 作者：Building Better Tech
> 翻译日期：2026-06-02

---

Claude Code 的自动模式权限系统在内部被称为"YOLO 分类器"。这是 `yoloClassifier.ts` 中的实际变量名。你可以用纯英文描述你的环境来配置它，类似"这是一台 staging 服务器，破坏性操作是可接受的"这样的描述，分类器会读取这些内容来决定什么可以自动批准。这些内容在任何文档中都没有。

这只是隐藏在 Claude Code 源代码中的数十个未记录功能之一——它就作为公开分发的 npm 包躺在你的 node_modules 里。官方文档很好地覆盖了基础知识（如需了解进阶用法，可阅读 [[how-i-use-claude-code|我如何使用 Claude Code]] 以及 [[Claude Code 最佳实践]]）。但源代码揭示了字段、响应格式和设置，这些能极大地扩展你能构建的东西。以下所有内容当前都可用，每个示例都设计为可以直接放入你的项目中使用。

> **版本说明**：这些发现来自 `@anthropic-ai/claude-code@2.1.87`。未记录的功能可能会在不同版本之间变化，所以把这看作当前可用功能的一个快照。名称中包含 "EXPERIMENTAL" 的字段被 Anthropic 工程师明确标记为不稳定，我会单独标注。（想看更多实战心得，可参考 [[Claude Code 功能太强了——6 个月重度使用心得分享]]）。

文件位置速查：

- **设置**：`~/.claude/settings.json`（个人）或 `.claude/settings.json`（项目级，通过 git 共享）
- **技能**：`~/.claude/skills/<名称>/SKILL.md`（个人）或 `.claude/skills/<名称>/SKILL.md`（项目级）（关于如何开发和管理自定义技能，请参考 [[Claude Skills Tutorial Give your AI Superpowers|Claude Skills 教程]] 和 [[五步框架把 Workflow 变成可进化的 Skill]]）
- **Agent**：`~/.claude/agents/<名称>.md`（个人）或 `.claude/agents/<名称>.md`（项目级）
- **Hook 脚本**：`~/.claude/hooks/` 是一个好的惯例。记得 `chmod +x` 你的脚本。

`.claude/` 中的项目级文件可以提交到 git 并与团队共享。`~/.claude/` 中的个人文件是你独有的。

## Hooks 的秘密返回字段

这是文档中最大的缺口。文档告诉你 hooks 从 stdin 接收 JSON，退出码 2 会阻止操作。但没有告诉你的是，hooks 可以在 stdout 返回 JSON，其中包含事件特定的字段，可以实时修改 Claude Code 的行为。源代码揭示了每种事件类型接受的确切内容。

**PreToolUse** hooks 可以返回：

- `updatedInput` — 在执行前重写工具的输入。你可以在中途修改命令。
- `permissionDecision` — 强制"允许"或"拒绝"而不提示用户。
- `permissionDecisionReason` — 解释决策（在 UI 中显示）。
- `additionalContext` — 将文本注入对话上下文。

**SessionStart** hooks 可以返回：

- `watchPaths` — 设置自动文件监听，触发 FileChanged 事件。
- `initialUserMessage` — 在会话的第一条用户消息前添加内容。
- `additionalContext` — 注入整个会话持续有效的上下文。

**PostToolUse** hooks 可以返回：

- `updatedMCPToolOutput` — 修改 Claude 对 MCP 工具响应的内容。
- `additionalContext` — 在工具运行后注入上下文。

**PermissionRequest** hooks 可以返回：

- `decision` — 通过 `updatedInput` 或 `updatedPermissions` 编程式允许或拒绝。

这很强大。下面是一个 PreToolUse hook，在 Claude 执行前自动给任何 `git push` 命令添加 `--dry-run`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/dry-run-pushes.sh"
          }
        ]
      }
    ]
  }
}
```

`~/.claude/hooks/dry-run-pushes.sh`：

```bash
#!/bin/bash
INPUT=$(jq -r '.tool_input.command' < /dev/stdin)
if echo "$INPUT" | grep -q 'git push'; then
  jq -n --arg cmd "$INPUT --dry-run" '{"updatedInput": {"command": $cmd}}'
fi
```

Claude 以为它在运行 `git push origin main`，但你的 hook 悄悄地在执行前把它重写为 `git push origin main --dry-run`。`updatedInput` 字段不在任何文档中。

这是一个 SessionStart hook，它监听你的配置文件并将 git 上下文注入每个会话：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/session-context.sh",
            "statusMessage": "Loading project context..."
          }
        ]
      }
    ]
  }
}
```

`~/.claude/hooks/session-context.sh`：

```bash
#!/bin/bash
BRANCH=$(git branch --show-current 2>/dev/null)
CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

jq -n \
  --arg branch "$BRANCH" \
  --arg changes "$CHANGES" \
  '{
    "watchPaths": ["package.json", ".env", "tsconfig.json"],
    "additionalContext": "Current branch: \($branch). Uncommitted changes: \($changes) files."
  }'
```

现在 Claude Code 会自动监听 `package.json`、`.env` 和 `tsconfig` 的变更，并且在你输入任何内容之前，它就知道你在哪个分支以及有多少未提交的文件。

还有一个自动批准只读 bash 命令的 hook：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/auto-approve-readonly.sh"
          }
        ]
      }
    ]
  }
}
```

`~/.claude/hooks/auto-approve-readonly.sh`：

```bash
#!/bin/bash
CMD=$(jq -r '.tool_input.command' < /dev/stdin)
if echo "$CMD" | grep -qE '^(ls|cat|echo|pwd|whoami|date|git status|git log|git diff)'; then
  echo '{"permissionDecision": "allow", "permissionDecisionReason": "Safe read-only command"}'
fi
```

你基本上是用 shell 脚本在构建自己的权限分类器。`permissionDecision` 字段不在任何文档中。

## 未记录的 Hook 配置字段

文档中记录的 hook 字段是 `type`、`command`、`matcher`、`timeout`、`if` 和 `statusMessage`。源代码解析器还接受另外三个从根本上改变 hook 行为的字段。

`once: true` 让 hook 只触发一次，然后自动移除。非常适合首次会话设置：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "[ -f .env ] || cp .env.example .env && echo 'Created .env from template'",
            "once": true,
            "statusMessage": "First-time setup..."
          }
        ]
      }
    ]
  }
}
```

简单到可以内联。它检查 `.env` 是否存在，如果不存在则复制模板，并且永远不会再运行。

`async: true` 在后台运行 hook 而不阻塞 Claude。即发即忘：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq '{timestamp: now, command: .tool_input.command, session: .session_id}' < /dev/stdin >> ~/.claude/audit.jsonl",
            "async": true
          }
        ]
      }
    ]
  }
}
```

这会记录每条 bash 命令到审计文件，不会给会话增加任何延迟。

`asyncRewake: true` 是最巧妙的一个。它像 async 一样在后台运行，所以在正常路径上不会阻塞。但如果它退出码为 2，它会唤醒模型并阻止操作。一切正常时不阻塞，出问题时阻塞：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/scan-secrets.sh",
            "asyncRewake": true,
            "statusMessage": "Scanning for secrets..."
          }
        ]
      }
    ]
  }
}
```

`~/.claude/hooks/scan-secrets.sh`：

```bash
#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // .tool_response.filePath' < /dev/stdin)
if grep -qE '(password|secret|api_key)\s*=' "$FILE" 2>/dev/null; then
  exit 2  # 阻止：检测到密钥
fi
exit 0    # 干净：继续
```

这会扫描 Claude 写入的每个文件中是否有硬编码密钥。如果发现，它会阻止并告知 Claude。如果没有，你甚至感觉不到它运行了。

## 未记录的技能 Frontmatter 字段

文档覆盖了 `name`、`description`、`allowed-tools`、`argument-hint`、`when_to_use` 和 `context`。源代码中实际的 frontmatter 解析器接受另外六个字段。

`model` 允许你覆盖运行技能的模型。用 haiku 做便宜快速的任务，用 opus 做复杂分析：

```yaml
---
name: quick-lint
description: Fast lint check using the cheapest model
model: haiku
effort: low
allowed-tools: Bash, Read
argument-hint: "[file]"
---
Run the project linter on: $ARGUMENTS
Detect the linter from config (eslint, ruff, clippy) and run it. Report only errors, not warnings.
```

这使用 Haiku 和低努力级别运行，所以又快又便宜。对于深度架构审查，你会想要 `model: opus` 和 `effort: max`。

`effort` 控制模型思考的深度。可选值：`low`、`medium`、`high` 或 `max`。这映射到内部控制每次响应推理深度的相同努力系统。

`hooks` 定义了技能活跃时作用域内的 hooks。它们在技能触发时注册，在技能完成时取消注册：

```yaml
---
name: strict-typescript
description: Write TypeScript with type checking on every save
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
hooks:
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "~/.claude/hooks/typecheck-on-save.sh"
          statusMessage: "Type checking..."
        - type: command
          command: "~/.claude/hooks/lint-on-save.sh"
          async: true
---
Write TypeScript with strict enforcement. Every file you touch gets type-checked and linted automatically.
$ARGUMENTS
```

`~/.claude/hooks/typecheck-on-save.sh`：

```bash
#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // .tool_response.filePath' < /dev/stdin)
[[ "$FILE" == *.ts ]] && npx tsc --noEmit 2>&1 || true
```

`~/.claude/hooks/lint-on-save.sh`：

```bash
#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // .tool_response.filePath' < /dev/stdin)
[[ "$FILE" == *.ts ]] && npx eslint --fix "$FILE" 2>&1 || true
```

当这个技能运行时，Claude 写入的每个 TypeScript 文件都会被同步类型检查并后台 lint。技能完成后，那些 hooks 消失。作用域干净利落。

`agent` 将技能委托给自定义 agent：

```yaml
---
name: deep-review
description: Thorough security review delegated to the review agent
agent: security-review
---
Review the following: $ARGUMENTS
```

`disable-model-invocation: true` 阻止自动调用。只有显式 `/skill-name` 才有效。用于你不希望意外触发的破坏性技能。

`shell: bash` 指定执行时使用的 shell。

## 未记录的 Agent Frontmatter 字段

`.claude/agents/` 中的自定义 agent 支持文档未提及的 frontmatter 字段。

`color` 设置 UI 颜色：`red`、`orange`、`yellow`、`green`、`blue`、`purple`、`pink` 或 `gray`。有助于在多个 agent 运行时从视觉上区分。

`memory` 是重磅功能。它给 agent 提供跨调用的持久记忆：

- `user` — 全局，跨所有项目持久化
- `project` — 每个项目级持久化
- `local` — 每个项目私有的（gitignored，被 git 忽略）

这意味着你可以构建一个会学习的 agent。记住过去发现的安全审查员。跨会话记住你代码模式的代码审查员。记忆使用与自动记忆系统相同的 frontmatter 格式。

```yaml
---
name: codebase-guide
description: Answer questions about the codebase, learning more with each session
tools: [Read, Grep, Glob, Bash]
color: green
memory: project
---
You are a codebase guide with persistent memory. Check your memory first before exploring the code.

After answering a question, save useful context to memory:
- Architecture decisions (type: project)
- Code locations for common tasks (type: reference)
- Patterns and conventions (type: feedback)

Over time, you should answer faster because you remember where things are.
```

几个会话之后，这个 agent 就建立了关于你代码库的知识库，并开始从记忆中回答而不是 grep。

`omitClaudeMd: true` 跳过加载 [[Writing a good CLAUDE.md|CLAUDE.md]] 指令层级。对于应用行业标准而非项目约定的"全新视角"审查员很有用：

```yaml
---
name: fresh-eyes
description: Review code without project-specific biases
tools: [Read, Grep, Glob]
omitClaudeMd: true
effort: high
color: blue
---
Review this code purely from first principles. You have no project context.
Focus on correctness, security, performance, and readability by industry standards.
```

`criticalSystemReminder_EXPERIMENTAL` 是一个简短消息，在每次会话轮次作为系统提醒重新注入。即使在对话压缩后，这仍然保留在上下文中：

```yaml
---
name: prod-deployer
description: Manages production deployments with strict safety checks
tools: [Bash, Read, Grep]
color: red
criticalSystemReminder_EXPERIMENTAL: "Always run migrations with --dry-run first. Never skip the staging verification step."
---
```

> ⚠️ **警告**：这个字段的源代码中的实际名称包含 EXPERIMENTAL。Anthropic 的工程师认为它不稳定。它现在能用，但可能在任何版本中被移除或重命名。用它做锦上添花的安全提醒，不要在此基础上构建关键基础设施。

`requiredMcpServers` 列出必须配置的 MCP服务器名称模式。如果服务器不可用，agent 就不会出现。防止 agent 在依赖未设置时加载。

## 自动模式："YOLO 分类器"

`settings.json` 中的 `autoMode` 字段配置了 Anthropic 内部称为"YOLO 分类器"的系统。这控制在自动模式下什么会被自动批准：

```json
{
  "autoMode": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Read",
      "Grep",
      "Glob"
    ],
    "soft_deny": ["Bash(git push *)", "Bash(rm *)", "Write(.env*)"],
    "environment": [
      "NODE_ENV=development",
      "This is a local dev machine with no production database access",
      "All Docker containers use isolated networks",
      "The test suite is safe to run repeatedly, it uses a dedicated test database"
    ]
  }
}
```

`allow` 模式会被自动批准。`soft_deny` 模式始终需要确认。`environment` 数组是最有趣的——它根本不是模式匹配。这些是分类器读取以理解你的设置的纯英文上下文字符串。你可以写"This project uses Docker, all commands run in containers"，分类器会将其纳入对模糊命令的安全决策中。

把 `environment` 想象成给分类器做你的环境简报。你越具体，它做的决策就越好。"没有生产环境访问权限"告诉它对破坏性操作不那么警惕。"测试数据库是隔离的"告诉它运行测试始终是安全的。

## 自我改进：记忆与梦境

两个 `settings.json` 字段激活 Claude Code 的自我改进系统：

```json
{
  "autoMemoryEnabled": true,
  "autoDreamEnabled": true
}
```

`autoMemoryEnabled` 让 Claude Code 自动从你的会话中提取持久记忆。每次对话后，一个后台 agent 提取值得记住的事情——你的偏好、代码库模式、你做的决策——并使用标准记忆 frontmatter 格式写入 `~/.claude/projects/<路径>/memory/`。

`autoDreamEnabled` 激活后台"梦境"整合。每 24 小时，如果积累了 5 个或更多会话，一个后台 agent 会审查过去的会话记录并整合记忆。它合并重复项、解决矛盾、将相对日期转换为绝对日期、并清理过期条目。

两者共同创建一个复合学习循环：会话产生记忆，梦境整合记忆，整合后的记忆为未来会话提供信息。两者都打开，几周后你会注意到 Claude Code 无需被告知就能记住你的偏好、约定和常见模式。这是真正的从经验中学习，无需任何模型重新训练。

## MAGIC DOC：自动维护的文档

源代码揭示了正则表达式：`/^#\s*MAGIC\s+DOC:\s*(.+)$/im`。它必须是 H1 标题，不区分大小写，下一行可以是用斜体指令（包裹在 `_下划线_` 或 `*星号*` 中），用于限定更新 agent 关注的范围：

```markdown
# MAGIC DOC: API Endpoint Reference

_Only document public REST endpoints. Include method, path, request body, response schema, and auth requirements._

## Endpoints

(content auto-maintained by Claude Code)
```

没有指令行时，更新 agent 尝试更新所有内容。有了它，你告诉它"只追踪公共端点"或"专注于破坏性变更"，它就会遵守。更新 agent 在后台运行，且被限制只能编辑那个特定文件。删除标题会自动停止追踪。

## 完整的权限模式语法

文档展示了像 `Bash(git *)` 这样的基本示例。源代码揭示了完整的模式语言：

```
Bash(npm *)              # "npm " 后的通配符
Bash(git commit *)       # 特定子命令
Read(*.ts)               # 文件扩展名
Read(src/**/*.ts)        # 递归目录加扩展名
Write(src/**)            # 递归，所有文件
mcp__slack               # slack 服务器上的所有工具
mcp__slack__*            # 显式通配符（相同效果）
mcp__slack__post_message # 特定工具
Bash(npm:*)              # 旧式冒号前缀（单词边界）
```

`*` 像 shell glob 一样在边界内匹配。`**` 递归匹配目录。MCP 工具权限使用双下划线：`mcp__<服务器>__<工具>`。hook 中的 `if` 字段使用完全相同的语法。不是正则，只是 glob。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Read(src/**)",
      "Read(tests/**)",
      "Grep",
      "Glob",
      "mcp__database__query"
    ],
    "deny": ["Bash(rm -rf *)", "Write(/etc/**)", "Write(.env*)", "mcp__slack__delete_*"],
    "ask": ["Bash(git push *)", "Write(*.json)", "Write(*.lock)", "mcp__slack__post_message"]
  }
}
```

## fork 技能的缓存合约

当你在技能上设置 `context: fork` 时，它作为后台 fork 的子 agent 运行。源代码揭示 fork 通过一个叫 `CacheSafeParams` 的类型化合约共享父级的提示缓存。所有 fork 产生字节相同的 API 请求前缀以最大化缓存命中。

实际影响：如果你为 forked 技能设置不同的模型，缓存就会失效。父对话在 Opus 上，fork 在 Haiku 上，前缀不同，缓存未命中，你付全价。要么省略 model 字段，要么在 forked 技能上使用 `model: inherit` 来保持缓存工作。

将 `context: fork` 用于繁重工作：安全扫描、依赖分析、文档生成、测试套件运行。fork 在后台运行，完成时通知你，保持主对话响应流畅。

```yaml
---
name: full-audit
description: Comprehensive codebase audit running in the background
context: fork
allowed-tools: Bash, Read, Grep, Glob, WebSearch
effort: high
---
Run a comprehensive audit:
- Security scan (grep for dangerous patterns, check dependencies for CVEs)
- Code quality (duplicated logic, dead code, missing error handling)
- Test coverage (untested critical paths)
- Dependency health (outdated packages, unused deps, license issues)

Write a detailed report to /tmp/audit-report.md when complete.
```

## 综合示例：自改进代码审查员

一个带持久记忆和作用域 hooks 的自改进代码审查员：

`.claude/agents/reviewer.md`：

```yaml
---
name: reviewer
description: Code reviewer that learns your codebase patterns over time
tools: [Read, Grep, Glob, Bash]
effort: high
color: yellow
memory: project
hooks:
  PostToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "~/.claude/hooks/log-review.sh"
          async: true
---
Before reviewing, read your memory for past findings on this codebase.

Review git diff HEAD~1 for:
- Patterns you've flagged before (check memory)
- New issues worth flagging
- Resolved issues from past reviews

After review, save to memory:
- New patterns found (type: feedback)
- Recurring issues (type: project)

End with VERDICT: PASS, FAIL, or NEEDS_REVIEW.
```

这个 agent 记住了它上次发现的东西。它知道哪些模式反复出现。经过几次审查，它开始捕捉通用审查员会错过的项目特定问题。

## 综合示例：多层安全网

一个带文件监听的 SessionStart hook 加上 asyncRewake 安全网：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/session-context.sh",
            "statusMessage": "Loading project context..."
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/auto-approve-readonly.sh"
          },
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous.sh",
            "asyncRewake": true,
            "statusMessage": "Safety check..."
          }
        ]
      }
    ]
  }
}
```

`~/.claude/hooks/block-dangerous.sh`：

```bash
#!/bin/bash
CMD=$(jq -r '.tool_input.command' < /dev/stdin)
echo "$CMD" | grep -qE '(rm -rf /|sudo rm|chmod 777|> /dev/)' && exit 2 || exit 0
```

只读命令被立即自动批准。危险命令被阻止。中间的命令走正常权限流程。安全扫描器异步运行，所以在正常路径上不会拖慢任何东西。

## 综合示例：架构审查技能链

一个带模型覆盖、努力控制和 agent 委托的技能：

```yaml
---
name: architecture-review
description: Deep architecture review using max effort, delegated to fresh-eyes agent
agent: fresh-eyes
effort: max
---
Review the architecture of this project. Ignore existing conventions (the agent has omitClaudeMd: true).
Focus on: $ARGUMENTS

Evaluate structural decisions, dependency graph health, separation of concerns, and scalability characteristics.
```

这串联了三个未记录功能：深度思考的 `effort: max`，委托给特定 agent，以及该 agent 使用 `omitClaudeMd: true` 进行无偏见分析。

## 结语

这些未记录的功能揭示了 [[how-i-use-claude-code|Claude Code]] 的现状与 Anthropic 正在构建的未来之间的差距。带事件特定响应字段的 hooks 系统是 AI 工具使用的可编程中间件层，比大多数 CI/CD 管道更灵活。持久 agent 记忆创建了能在会话之间积累真正专业知识的 AI 专家。梦境整合系统是无需模型重新训练的从经验中学习。自动模式分类器接受环境自然语言描述来做出安全决策。

这些不是隐藏设置或彩蛋。它们是持久化、会学习、自主 AI 开发环境的脚手架，而且已经在你机器上的 npm 包中功能完备。文档最终可能会跟上，但如果你想在 Claude Code 真正能做的事情的前沿构建，源代码才是真正的文档所在之处。
