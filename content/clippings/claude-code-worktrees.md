---
title: 使用 Worktree 并行运行会话 — Claude Code 文档
description: Claude Code 利用 Git Worktree 实现会话隔离，多个并行会话互不干扰地编辑文件。涵盖 --worktree 标志、子代理隔离、.worktreeinclude、清理策略和非 Git 版本控制。
tags:
  - clippings
  - claude-code
  - git-worktree
  - agent
  - devtools
source: https://code.claude.com/docs/en/worktrees
created: 2026-07-24
---

## 使用 Worktree 并行运行会话

> 原文：[Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) 来源：Claude Code Docs

[Git Worktree](https://git-scm.com/docs/git-worktree) 是一个独立的工作目录，拥有自己的文件和分支，与主工作区共享相同的仓库历史和远程。将每个 Claude Code 会话运行在各自的 Worktree 中，意味着一个会话中的编辑永远不会触及另一个会话的文件——一个会话构建新功能时，第二个可以同时修 Bug。

> [!NOTE]
> Worktree 需要 Git 仓库；对于其他版本控制系统，请[配置 Hook 替代 Git 逻辑](#非-git-版本控制)。在[桌面应用](/docs/en/desktop#work-in-parallel-with-sessions)中，每个新会话都会自动获得自己的 Worktree。

Worktree 是 Claude 多种并行运行方式之一。它们隔离文件编辑，而[子代理](/docs/en/sub-agents)和[代理团队](/docs/en/agent-teams)负责协调工作本身。参见[并行运行代理](/docs/en/agents)对比各种方案，或跳至[用 Worktree 隔离子代理](#用-worktree-隔离子代理)了解两者结合使用的方式。

大多数会话只需要前两节：[在 Worktree 中启动 Claude](#在-worktree-中启动-claude)，然后[退出时清理](#清理-worktree)。其余内容在需要[恢复会话](#恢复-worktree-会话)、[自定义 Worktree 创建方式](#自定义-worktree-创建)或[排查问题](#故障排查)时再回来看。

## 在 Worktree 中启动 Claude

使用 `--worktree` 或 `-w` 并指定一个名称，Claude 会创建一个隔离的 Worktree 并在其中启动：

```bash
claude --worktree feature-auth
```

默认情况下，Worktree 创建在仓库根目录的 `.claude/worktrees/<name>/` 下，基于新分支 `worktree-<name>`。在另一个终端中以不同名称再次运行该命令，即可启动第二个隔离会话。如果省略名称，Claude 会自动生成一个，如 `bright-running-fox`。

交互式运行需要[工作区信任](/docs/en/security)：如果之前没有在该目录下运行过 Claude，先 `claude` 一次接受信任对话框，否则 `--worktree` 会报错退出。非交互式运行（`-p`）跳过信任检查，所以 `claude -p --worktree` 可以直接继续。

> [!TIP]
> 将 `.claude/worktrees/` 添加到 `.gitignore`，避免 Worktree 内容在主工作区中显示为未跟踪文件。

### 设置 Worktree 环境

Worktree 是一个全新的检出，所以需要在其中初始化开发环境：让 Claude 安装依赖，或自己在 `.claude/worktrees/` 下的 Worktree 目录中运行项目设置。要自动将 `.env` 等被 Git 忽略的文件带入每个新 Worktree，添加 [`.worktreeinclude` 文件](#将-git-忽略文件复制到-worktree)。

### 让 Claude 创建 Worktree

你也可以在会话中让 Claude "在 Worktree 中工作"，它会通过 [`EnterWorktree`](/docs/en/tools-reference) 工具创建一个。进入 Worktree 后，Claude 可以直接通过 `EnterWorktree` 并指定目标路径切换到 `.claude/worktrees/` 下的另一个 Worktree，之前的 Worktree 保持原样留在磁盘上。

当 Claude 进入仓库 `.claude/worktrees/` 目录之外的路径时，Claude Code 会先请求你的批准——因为这会将会话的工作目录、写入权限以及 `CLAUDE.md` 和设置等项目配置带到该位置。`EnterWorktree` [权限规则](/docs/en/permissions)或选择「不再询问」无法抑制此提示，只有 `bypassPermissions` 模式可以跳过。在 v2.1.206 之前，Claude 可以不询问就直接进入任何已存在的 Worktree 路径。

## 清理 Worktree

当退出交互式 Worktree 会话时，Claude 会检查 Worktree 中是否有移除会丢失的工作内容：已更改或未跟踪的文件，以及新提交。

- **Worktree 是干净的**：对于未命名会话，Claude 自动删除 Worktree 及其分支。[已命名](/docs/en/sessions#name-your-sessions)会话会先提示你，以便保留 Worktree 供以后使用。
- **Worktree 中有工作内容**：Claude 提示你保留或删除 Worktree。保留会保留目录和分支以便稍后返回。删除会删除 Worktree 目录及其分支以及其中的所有工作。

非交互式运行（`-p`）没有退出提示，所以 Claude 不会清理它们的 Worktree。使用 `git worktree remove` 手动删除。

在 Windows 上，删除 Worktree 不会删除其外部的文件。如果 Worktree 内的文件夹实际上是指向别处的链接（如 NTFS 交接点或目录符号链接），Claude Code 只删除链接本身，保留其指向的文件夹。v2.1.205 之前，删除包含子目录嵌套链接的 Worktree 可能会删除其指向的文件夹。

## 恢复 Worktree 会话

当你恢复一个曾在 Worktree 内的会话时，Claude Code 会将会话返回到该 Worktree。这适用于交互式恢复、`-p` [非交互模式](/docs/en/headless)下的 `--continue` 和 `--resume`，以及 Agent SDK。回到 Worktree 后，Claude 仍然可以通过 [`ExitWorktree`](/docs/en/tools-reference) 工具退出。

`--fork-session` 分支恢复会从你启动 Claude 的目录开始，原会话的 Worktree 保持不变。如果 Worktree 目录不再存在，会话会恢复到你启动 Claude 的目录中。

> [!NOTE]
> v2.1.212 之前，非交互式恢复会留在启动目录，`ExitWorktree` 会报告没有活跃的 Worktree 会话可退出。

当 Claude 进入或退出一个由 Claude Code 通过 Git 创建的 Worktree 时，转录会跟随：Claude Code 将会话记录在会话的新工作目录下，与 [`/cd`](/docs/en/commands) 的行为一致，因此 `/desktop` 和 `--resume` 可以在那里找到它。退出时以同样方式移回。由 [`WorktreeCreate` Hook](#非-git-版本控制)创建的 Worktree，其转录保留在启动目录下。需要 Claude Code v2.1.198 或更高版本。

## 用 Worktree 隔离子代理

子代理可以在自己的 Worktree 中运行，以便并行编辑不冲突。让 Claude "为你的代理使用 Worktree"，或通过在[自定义子代理](/docs/en/sub-agents#supported-frontmatter-fields)的 frontmatter 中添加 `isolation: worktree` 来永久启用隔离。

`.claude/agents/` 中的这个子代理始终在自己的 Worktree 中运行：

```markdown
---
name: refactorer
description: Applies mechanical refactors across many files
isolation: worktree
---

Apply the requested refactor across every affected file, then run the tests
and report the results.
```

每个子代理获得一个临时 Worktree，Claude Code 在子代理完成后无更改时自动删除；有更改的 Worktree 会在磁盘上保留，直到[下述定期清扫](#清理子代理和后台会话的-worktree)在不丢失工作内容的前提下移除它。

子代理 Worktree 使用与 `--worktree` 相同的[基准分支](#选择基准分支)，因此除非 `worktree.baseRef` 设置为 `"head"`，否则它们从仓库的默认分支分支出去。

### 清理子代理和后台会话的 Worktree

定期清扫会移除 Claude 为子代理和[后台会话](/docs/en/agent-view#how-file-edits-are-isolated)创建的 Worktree，一旦它们超过 [`cleanupPeriodDays`](/docs/en/settings#available-settings) 设置的天数。清扫会跳过仍有工作内容的 Worktree：已更改或未跟踪的文件，或未推送的提交。它永远不会移除你通过 `--worktree` 创建的 Worktree。

代理运行时，Claude 在其 Worktree 上执行 `git worktree lock`，防止并发清理误删。锁在代理完成时释放。清扫也会释放进程已退出的会话上由 Claude Code 设置的锁，因此被杀掉的后台会话不会永久锁定其 Worktree。清扫永远不会释放你自己通过 `git worktree lock` 设置的锁。v2.1.210 之前，被杀会话留下的锁会一直存在，直到你手动 `git worktree unlock`。

要清理清扫不处理的 Worktree，运行 `git worktree remove`，如果 Worktree 有未提交更改或未跟踪文件则加 `--force`。

## 自定义 Worktree 创建

Claude Code 创建 Worktree 的默认设置覆盖大多数场景：创建在 `.claude/worktrees/` 下，从仓库默认分支分支，仅检出已跟踪文件。本节选项可修改这些默认值。

### 选择基准分支

新 Worktree 从仓库的默认分支分支，大多数会话不需要调整此设置。在[设置](/docs/en/settings#worktree-settings)中将 `worktree.baseRef` 设为从当前工作分支分支。该设置接受两个值：

- `"fresh"`（默认）：从远程仓库的默认分支分支，通常是 `main`，使 Worktree 从一个与远程一致的干净树开始。
- `"head"`：从当前本地 `HEAD` 分支，因此 Worktree 携带未推送提交和功能分支状态。用于需要操作进行中工作的子代理隔离。在 Worktree 内部时，`"head"` 解析为该 Worktree 的 `HEAD`，而非主工作区的。

不能将 `worktree.baseRef` 设置为具体分支名。要从特定已有分支启动 Worktree，请[直接用 Git 创建](#手动管理-worktree)。

对于 `"fresh"` 基准，Claude Code 会保持 `origin/HEAD` 最新：当仓库最近 24 小时未 fetch 时，会 fetch 默认分支（最多 5 秒），失败则使用本地缓存引用。如果未配置远程，或本地没有缓存的 `origin/HEAD` 且无法 fetch，则回退到当前本地 `HEAD`。v2.1.208 之前，fresh Worktree 直接使用本地已有的 `origin/HEAD`。

以下示例让每个新 Worktree 从当前工作分支：

```json
{
  "worktree": {
    "baseRef": "head"
  }
}
```

### 从 Pull Request 分支

要从特定 Pull Request 分支，将 `#` 前缀的 PR 编号或完整的 GitHub PR URL 传给 `--worktree`。Claude Code 从 `origin` fetch `pull/<number>/head`，在 `.claude/worktrees/pr-<number>` 创建 Worktree。用引号包裹参数以避免 shell 将 `#` 视为注释：

```bash
claude --worktree "#1234"
```

### 将 Git 忽略文件复制到 Worktree

Worktree 是全新检出，因此主仓库中的未跟踪文件（如 `.env` 或 `.env.local`）不存在。要在 Claude 创建 Worktree 时自动复制它们，在项目根目录添加 `.worktreeinclude` 文件。

该文件使用 `.gitignore` 语法。只有匹配模式且被 Git 忽略的文件才会被复制，因此已跟踪文件绝不会被重复。

以下 `.worktreeinclude` 将两个环境变量文件和密钥配置复制到每个新 Worktree：

```text .worktreeinclude
.env
.env.local
config/secrets.json
```

这适用于 Claude Code 通过 Git 创建的所有 Worktree：`--worktree` Worktree、[子代理 Worktree](#用-worktree-隔离子代理)以及[桌面应用](/docs/en/desktop#work-in-parallel-with-sessions)的并行会话。使用 [`WorktreeCreate` Hook](#非-git-版本控制)时，在 Hook 脚本中自行复制。

### 重用 Worktree 名称

传入 `--worktree` 一个目录已存在的名称时，会打开已有 Worktree 而非创建新的。

在默认 `"fresh"` [基准](#选择基准分支)下，同时满足以下所有条件时，重新打开的 Worktree 会重置到仓库默认分支而非在旧位置继续：

- 没有未提交更改或未跟踪文件。
- 仍在 Claude Code 为其创建的分支上。
- 没有自己的提交，或其 PR 已合并且远程分支已删除。

Claude Code 仅从 Git 状态检测已合并情况：Worktree 推送到的远程分支已不存在，且 Worktree 中的所有提交都已在默认分支上。

任何其他情况都在旧位置重新打开：不满足上述任一条件的 Worktree、状态无法验证的 Worktree，以及 `worktree.baseRef` 为 `"head"` 或名称为 PR 编号时的任何重用。v2.1.208 之前，重用名称始终在旧 Worktree 的旧位置重新打开。

### 用 Hook 替代 Worktree 创建

配置 [`WorktreeCreate` Hook](/docs/en/hooks#worktreecreate) 以完全替换默认的 `git worktree` 逻辑，包括将 Worktree 放在 `.claude/worktrees/` 之外的其他位置。完整示例见[非 Git 版本控制](#非-git-版本控制)。

## Worktree 与主工作区共享的内容

Worktree 拥有自己的文件和分支，但它与主工作区共享仓库的 `.git` 目录、项目级插件和保存的权限批准：

- **仓库的 `.git` 目录**：Worktree 中的 Git 命令写入主仓库的共享 `.git` 目录，[沙盒](/docs/en/sandboxing#filesystem-isolation)允许这些写入，因此 `git commit` 等命令可以在启用沙盒的 Worktree 内正常运行。
- **插件**：从主工作区安装的[项目级作用域](/docs/en/plugins-reference#plugin-installation-scopes)插件在同一个仓库的 Worktree 中也会加载，无需在每个 Worktree 中重新安装。需要 Claude Code v2.1.200 或更高版本。
- **权限批准**：在 Worktree 会话中对 Bash 命令选择「是，不再询问」时，规则保存到主工作区的 `.claude/settings.local.json`，因此在主工作区和该仓库的所有其他 Worktree 中都生效，且即使 Worktree 被删除也仍然存在。v2.1.211 之前，在 Worktree 中授予的批准保存在该 Worktree 内部，不在其他地方生效，且 Worktree 删除时会丢失。参见[批准保存位置](/docs/en/permissions#permission-system)。

以上三项无论你是通过 `--worktree`、`git worktree add` 还是[桌面应用](/docs/en/desktop#work-in-parallel-with-sessions)创建 Worktree 都适用。

## 手动管理 Worktree

当你需要检出特定的已有分支或将 Worktree 放在仓库之外时，直接用 Git 创建 Worktree。

在新分支上创建 Worktree：

```bash
git worktree add ../project-feature-a -b feature-a
```

从已有分支创建 Worktree：

```bash
git worktree add ../project-bugfix bugfix-123
```

在该 Worktree 中启动 Claude：

```bash
cd ../project-feature-a
claude
```

列出所有 Worktree：

```bash
git worktree list
```

完成后删除：

```bash
git worktree remove ../project-feature-a
```

完整命令参考见 [Git Worktree 文档](https://git-scm.com/docs/git-worktree)。

## 非 Git 版本控制

Worktree 隔离默认可使用 Git。对于 SVN、Perforce、Mercurial 或其他系统，配置 [`WorktreeCreate` 和 `WorktreeRemove` Hook](/docs/en/hooks#worktreecreate)以提供自定义创建和清理逻辑。由于 Hook 替换了默认 Git 行为，使用 `--worktree` 时 [`.worktreeinclude`](#将-git-忽略文件复制到-worktree)不会被处理。在 Hook 脚本中自行复制本地配置文件。

以下 `WorktreeCreate` Hook 通过 `jq` 从 stdin 的 JSON 中读取 Worktree 名称，检出全新的 SVN 工作副本，并打印目录路径供 Claude Code 用作会话工作目录。将配置添加到 [`settings.json`](/docs/en/settings#settings-files)：

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```

搭配 `WorktreeRemove` Hook 在会话结束时清理。输入 Schema 和删除示例见 [Hooks 参考](/docs/en/hooks#worktreecreate)。

## 故障排查

以下错误发生在 Claude Code 创建 Worktree 或在启动时进入 Worktree 时。

### Claude Code 在启动时无法进入 Worktree

当 Claude Code 在启动时无法进入 Worktree 目录时，会打印包含路径的错误并以退出码 1 退出。这可能发生在 [`WorktreeCreate` Hook](/docs/en/hooks#worktreecreate)打印的不是它创建的目录，或者目录在设置后被删除。v2.1.205 之前，这会导致会话崩溃，使用 `-p` 时会停顿约 30 秒后以退出码 0 退出。

### 符号链接路径上 Worktree 创建失败

当 `.claude`、`.claude/worktrees` 或 Worktree 目录本身是符号链接时，Claude Code 拒绝创建 Worktree，错误信息会指明符号链接路径。删除符号链接后重试。v2.1.212 之前，如果仓库在这些路径之一已提交了符号链接，Worktree 创建会跟随它，可能创建仓库外部的文件。

## 延伸阅读

Worktree 处理文件隔离。以下相关页面介绍如何将工作委托到这些隔离的检出中，以及在创建的会话之间切换：

- [子代理](/docs/en/sub-agents)：在会话内将工作委托给隔离的代理
- [代理团队](/docs/en/agent-teams)：自动协调多个 Claude 会话
- [管理会话](/docs/en/sessions)：命名、恢复和切换对话
- [桌面并行会话](/docs/en/desktop#work-in-parallel-with-sessions)：桌面应用中基于 Worktree 的会话

---

> **译者注**：本文介绍的是 Claude Code 的 `--worktree` 机制，通过 Git Worktree 实现了多个 AI 会话之间的文件编辑隔离。这个设计非常实用——当你有多个 Claude Code 窗口同时工作时，不用担心文件冲突。对于日常开发，最有用的几个点是：`--worktree` 快速创建隔离环境、`.worktreeinclude` 自动带入 .env 等本地配置、以及子代理的 `isolation: worktree` 配置。
