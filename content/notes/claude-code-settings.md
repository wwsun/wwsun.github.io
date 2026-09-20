---
title: 几分钟内就能自定义的 Claude Code 设置
tags:
  - claude-code
draft: false
description: 未命名
source: https://www.builder.io/blog/claude-code-settings
---

Claude Code 开箱即用就能很好地工作。但你可以做得更好。默认版 Claude Code 和**你的** Claude Code 之间的差距，只是几个设置、几个 hooks，以及大约十分钟的配置。

以下是 10 个我发现最有用的自定义设置。其中大部分不需要编辑配置文件。告诉 Claude 你想要什么，它会帮你处理设置。我会展示每种设置的"提示优先"方法，以及底层的 JSON 配置，方便你在想要理解或手动调整时使用。

---

## 1. 设置 `cc` 别名

这是我每次启动 Claude 会话时的第一件事。打开你的 `~/.zshrc`（如果你用 Bash 则是 `~/.bashrc`）并添加这一行：

```bash
alias cc='claude --dangerously-skip-permissions'
```

或者直接在终端追加，无需打开文件：

```bash
echo "alias cc='claude --dangerously-skip-permissions'" >> ~/.zshrc
```

然后运行 `source ~/.zshrc` 在当前会话中加载它。之后每个新终端窗口都会自动生效。

现在你可以输入 `cc` 而不是 `claude`，并且跳过所有权限提示。你也可以传递 `-c` 进行快速的一次性命令：

```bash
# 快速单行命令：生成提交信息
cc -c "write a commit message for the staged changes"

# 通过管道传入上下文
cat error.log | cc "explain this error and suggest a fix"
```

我还有一些经常使用的别名：

```bash
# 以计划模式启动用于研究（只读，不编辑）
alias ccp='claude --permission-mode plan'

# 恢复上次会话
alias ccr='claude --resume'
```

`--dangerously-skip-permissions` 标志的名称是故意吓人的。它允许 Claude 运行任何命令和编辑任何文件而无需询问。只有在你日常使用了几个月后，完全了解 Claude Code 能做什么和会做什么时，才考虑使用它。我已经用了足够长时间来做这个决定，但请自行承担风险使用。

---

## 2. 在上下文降级前自动压缩

Claude 的上下文窗口是它的工作记忆。随着它填满，Claude 开始丢失之前的细节，质量会下降。默认的自动压缩阈值是 **~95%**。到那时，你已经失去了连贯性。

直接告诉 Claude：

> 在我的用户设置中将自动压缩阈值设置为 75%

Claude 会为你更新 `~/.claude/settings.json`。底层它会添加：

```json
{
  "env": {
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "75"
  }
}
```

对于正确的数字没有共识。60-75% 适用于大多数任务，但如果你在做需要大量上下文的工作，85% 可以在压缩启动前给 Claude 更多空间。尝试一个值，然后根据会话的感觉进行调整。

需要了解的两个上下文命令是 `/clear`（清除所有内容，重新开始）和 `/compact`（总结历史，保留关键细节）。当切换到完全不同的任务时使用 `/clear`。当你正在做某个功能但对话变得很长时使用 `/compact`。

你也可以告诉 Claude 在压缩期间保留什么。在你的 [CLAUDE.md](http://claude.md/) 中添加：

```markdown
压缩时，始终保留：

- 当前正在编辑的文件路径
- 测试失败消息
- 本次会话做出的架构决策
```

这样，当 `/compact` 运行（手动或自动）时，重要的上下文会保留下来。

---

## 3. 编写你的个人 CLAUDE.md

CLAUDE.md 对 Claude 行为的影响超过任何其他自定义。它是你告诉 Claude 你关心什么的方式，并且在每个会话中持续有效。

你的个人 CLAUDE.md 位于 `~/.claude/CLAUDE.md`，适用于每个项目。直接告诉 Claude 你想要什么。例如：

> 在 ~/.claude/CLAUDE.md 创建我的个人 CLAUDE.md。我更喜欢 pnpm 而不是 npm，types 而不是 interfaces，Vitest 而不是 Jest，以及简洁的 PR 描述。

Claude 会创建文件。大致你会得到：

```markdown
# 全局偏好

- 使用 pnpm，不是 npm
- 优先使用 types 而不是 interfaces
- 写测试时，使用 Vitest 而不是 Jest
- 保持 PR 描述简洁 —— 仅摘要 + 测试计划
```

**保持在 50 行以内**。指令遵循率会随着长度急剧下降。具体、简洁的规则（"使用 pnpm，不是 npm"）有约 89% 的遵循率，而模糊的指令（"编写干净的代码"）只有约 35%。

对于项目级指令，你可以运行 `/init` 在你的仓库中生成 CLAUDE.md。输出往往比较臃肿，所以要大幅修剪，只保留重要的内容。关于作用域、规则目录和团队共享约定的完整深入指南，参见[如何编写优秀的 CLAUDE.md 文件](https://www.builder.io/blog/claude-md-guide)。

---

## 4. 添加实时状态行

状态行是一个**shell 脚本**，在每次 Claude 回合后运行。它在终端底部显示实时信息，就像你会话的仪表板。

设置状态行最快的方法是在 Claude Code 内部运行 `/statusline`。它会询问你想要显示什么并为你生成脚本。

如果你想自己构建，这是我使用的脚本。它显示当前目录、带脏状态（dirty status）的 git 分支，以及按窗口填充程度颜色编码的上下文使用情况（绿色 < 50%，黄色 50-80%，红色 > 80%）：

```bash
#!/bin/bash
input=$(cat)

# 从 JSON 提取数据
cwd=$(echo "$input" | jq -r '.workspace.current_dir')
input_tokens=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // 0')
cache_creation=$(echo "$input" | jq -r '.context_window.current_usage.cache_creation_input_tokens // 0')
cache_read=$(echo "$input" | jq -r '.context_window.current_usage.cache_read_input_tokens // 0')
context_window_size=$(echo "$input" | jq -r '.context_window.context_window_size // empty')
current_dir=$(basename "$cwd")

# Git 分支 + 脏状态
git_info=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -C "$cwd" --no-optional-locks branch --show-current 2>/dev/null)
    if [ -n "$branch" ]; then
        if [ -n "$(git -C "$cwd" --no-optional-locks status --porcelain 2>/dev/null)" ]; then
            git_info=" git:($branch)✗"
        else
            git_info=" git:($branch)"
        fi
    fi
fi

# 带颜色编码的上下文使用情况
context_info=""
ctx_color=""
total_input=$((input_tokens + cache_creation + cache_read))

if [ "$total_input" -gt 0 ] && [ -n "$context_window_size" ] && [ "$context_window_size" -gt 0 ]; then
    input_k=$(printf "%.0f" "$(echo "$total_input / 1000" | bc -l)")
    window_k=$(printf "%.0f" "$(echo "$context_window_size / 1000" | bc -l)")
    percentage=$(( (total_input * 100 + context_window_size / 2) / context_window_size ))
    context_info=" ctx:${input_k}k/${window_k}k (${percentage}%)"

    if [ "$percentage" -lt 50 ]; then
        ctx_color="\\033[32m"
    elif [ "$percentage" -lt 80 ]; then
        ctx_color="\\033[33m"
    else
        ctx_color="\\033[31m"
    fi
fi

printf "\\033[36m%s\\033[0m" "$current_dir"
[ -n "$git_info" ] && printf "\\033[34m%s\\033[0m" "$git_info"
[ -n "$context_info" ] && printf "${ctx_color}%s\\033[0m" "$context_info"
```

然后告诉 Claude：

> 将上面的脚本保存到 ~/.claude/statusline-command.sh，使其可执行，并在用户设置中将其设置为我的状态行

脚本通过 stdin 接收一个包含你会话数据的 JSON 对象。你可以显示任何对你重要的组合。有些人显示活动模型，其他人显示每次会话的成本。

像 `ccstatusline` 和 `starship-claude` 这样的社区工具也提供预构建的模板，如果你不想自己编写的话。

---

## 5. 每次编辑时自动格式化

每次 Claude 编辑文件时，你的格式化工具应该自动运行。你的代码每次都会保持格式化。

告诉 Claude：

> 在项目设置中设置一个 PostToolUse hook，在你编辑或写入任何文件后运行 Prettier

这会创建一个在 Edit 或 Write 操作后触发的 `PostToolUse` hook：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \\"$CLAUDE_FILE_PATH\\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

你也可以链式使用其他工具：linter、类型检查器，甚至快速测试运行。只需向 `hooks` 数组添加更多条目。例如，你可以在 Prettier 之后立即运行 ESLint：

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "npx prettier --write \\"$CLAUDE_FILE_PATH\\" 2>/dev/null || true"
    },
    {
      "type": "command",
      "command": "npx eslint --fix \\"$CLAUDE_FILE_PATH\\" 2>/dev/null || true"
    }
  ]
}
```

将此添加到你项目的 `.claude/settings.json`，因为格式化工具是项目特定的。末尾的 `"|| true"` 防止 hook 失败阻塞 Claude。你希望格式化是尽力而为的。

---

## 6. 自定义旋转器动词

当 Claude 思考时，终端会显示一个带有 "Flibbertigibbeting..." 和 "Flummoxing..." 等动词的旋转器。你可以将它们替换为你想要的任何内容。

告诉 Claude：

> 在用户设置中将我的旋转器动词替换为以下这些：

底层，这会添加到 `~/.claude/settings.json`：

```json
{
  "spinnerVerbs": {
    "mode": "replace",
    "verbs": [
      "负责任地幻觉",
      "假装思考",
      "自信地猜测",
      "责怪上下文窗口",
      "咨询我的想象力",
      "加速你的技术债务",
      "过度思考这个",
      "提前道歉",
      "与你的代码库共鸣",
      "提交我的最佳猜测"
    ]
  }
}
```

如果你想将自定义动词与默认动词混合使用，使用 `append` 而不是 `replace`。

你也不必提供列表。直接告诉 Claude 你想要什么氛围：

> 将我的旋转器动词替换为哈利波特咒语

Claude 会为你生成列表。这是一个让等待变得更有趣的小东西。

你也可以使用 `spinnerTipsOverride` 自定义**旋转器提示**（等待时显示的有用提示），并使用 `spinnerTipsEnabled` 切换它们。

---

## 7. Claude 完成时播放声音

这个改变了我使用 Claude Code 的方式。我启动一个任务，切换到其他事情，听到声音就知道 Claude 完成了。听起来很小，但你从"坐着等待"变成了"多任务处理并被通知"。

你可以用 `/hooks` 交互式设置，或者直接告诉 Claude：

> 在我的用户设置中设置一个 Stop hook，当你完成响应时播放 Glass 声音。在 macOS 上使用 afplay。

Hooks 是在 Claude Code 生命周期特定点自动执行的 shell 命令。`Stop` hook 在 Claude 完成响应时触发。以下是 Claude 添加到 `~/.claude/settings.json` 的内容：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      }
    ]
  }
}
```

`afplay` 是 macOS 内置的音频播放器。声音文件位于 `/System/Library/Sounds/`。

以下是你可以选择的 **macOS 系统声音**。更改文件名以使用不同的声音。

- `Glass.aiff` — 干净、微妙
- `Submarine.aiff` — 深沉、令人满意
- `Purr.aiff` — 轻柔
- `Funk.aiff` — 俏皮
- `Pop.aiff` — 快速、干脆
- `Frog.aiff` — 令人难忘
- `Hero.aiff` — 胜利感

你也不限于系统声音。该 hook 只是运行 `afplay`，它可以播放你机器上的任何 `.aiff`、`.mp3` 或 `.wav` 文件。下载任何音效，保存到 `~/.claude/sounds/`，然后使用该路径代替。

关于更多模式和注意事项的完整 hooks 参考，参见 Claude Code hooks。

---

## 8. 设置你的输出风格

输出风格控制 Claude 如何格式化其响应。运行 `/config` 并选择你喜欢的风格，或者告诉 Claude：

> 将我的输出风格设置为 Concise

内置选项有：

- **Explanatory** — 详细、逐步的响应（适合学习）
- **Concise** — 简短、以行动为中心的响应（适合交付）
- **Technical** — 精确、术语友好的响应（适合深度工作）

你也可以在 `~/.claude/output-styles/` 中创建**自定义输出风格**作为文件。你可以创建一个 "code-review" 风格，简洁且以发现问题为重点，或者一个 "documentation" 风格，全面且结构化。创建一个带有 YAML frontmatter 定义风格的 markdown 文件，它会作为选项出现在 `/config` 中。

另外两个值得了解的设置。`showTurnDuration` 显示每次响应花费的时间（有助于发现何时可能需要切换模型），`prefersReducedMotion` 为无障碍性降低动画效果。

---

## 总结

从解决你最大烦恼的一个自定义开始。`cc` 别名（#1）是一个流行的起点。然后当你遇到摩擦时，逐步完成其余部分。

其中大部分只是一个提示的距离。告诉 Claude 你想要什么，它会帮你设置。底层，所有内容都位于三个地方：你的 shell 配置文件（别名）、`~/.claude/settings.json`（全局设置和 hooks）和 `~/.claude/CLAUDE.md`（指令）。就是这样。

一旦你把基础设置调好，[MCP 服务器](https://www.builder.io/blog/claude-code-mcp) 值得下一步探索。它们将 Claude 连接到外部工具，如数据库和浏览器自动化（[Playwright MCP 服务器](https://www.builder.io/blog/claude-code-playwright-mcp-server) 是一个很好的第一个尝试）。但这 10 个自定义涵盖了你每天会使用的内容。

---

## 常见问题

**Claude Code 设置存储在哪里？**

三个位置：`~/.claude/settings.json` 用于你的个人全局设置，项目根目录的 `.claude/settings.json` 用于团队共享设置（提交到 git），`.claude/settings.local.json` 用于个人项目覆盖（gitignored）。运行 `/status` 查看哪些层是激活的。

**如何跟踪 Claude Code 成本？**

在会话中使用 `/cost` 查看 API 支出（API 密钥用户）或 `/stats` 查看订阅配额使用情况（Claude Max/Pro 订阅者）。对于跨会话的分析，`ccusage`（`npx ccusage@latest`）从本地 JSONL 文件提供按模型、项目和时间段细分的成本。像 [Usagebar](https://usagebar.com/) 这样的菜单栏应用提供始终可见的跟踪。

**如何将 Claude Code 重置为默认设置？**

删除或重命名你的设置文件：`~/.claude/settings.json`（用户）、`.claude/settings.json`（项目）、`.claude/settings.local.json`（本地）。Claude Code 会在下次会话时加载内置默认值。如果你只想重置一个作用域，只需删除该文件。

**我可以与我的团队共享我的自定义吗？**

可以。将 `.claude/settings.json` 和 `.claude/skills/` 提交到你的仓库以进行项目级共享。对于更广泛的分发，创建一个插件，将你的设置、技能和 hooks 打包，然后通过市场共享。使用 `/plugin` 浏览和安装现有插件。

---

_原文链接：https://www.builder.io/blog/claude-code-settings_
