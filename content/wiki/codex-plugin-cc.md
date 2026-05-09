---
title: Claude Code 的 Codex 插件
tags:
  - codex
  - claude-code
draft: false
description: 在 claude code 中使用 codex 进行 code review
source: https://github.com/openai/codex-plugin-cc*
---

## 你能获得什么

- `/codex:review` - 正常的只读 Codex 代码审查
- `/codex:adversarial-review` - 可引导的挑战性审查
- `/codex:rescue`、`/codex:status`、`/codex:result` 和 `/codex:cancel` - 委托工作和管理后台任务

---

## 安装

在 Claude Code 中添加市场：

```bash
/plugin marketplace add openai/codex-plugin-cc
```

安装插件：

```bash
/plugin install codex@openai-codex
```

重新加载插件：

```bash
/reload-plugins
```

然后运行：

```bash
/codex:setup
```

`/codex:setup` 会告诉你 Codex 是否已准备就绪。如果 Codex 未安装但 npm 可用，它可以帮你安装 Codex。

如果你更喜欢自己安装 Codex，使用：

```bash
npm install -g @openai/codex
```

如果 Codex 已安装但尚未登录，运行：

```bash
!codex login
```

安装完成后，你应该能看到：

- 下面列出的斜杠命令
- `/agents` 中的 `codex:codex-rescue` 子代理

简单的首次运行：

```bash
/codex:review --background
/codex:status
/codex:result
```

---

## 使用

### `/codex:review`

对你当前的工作运行正常的 Codex 审查。它能提供与直接在 Codex 内部运行 `/review` 相同质量的代码审查。

> [!NOTE]
> 代码审查，特别是多文件变更的审查，可能需要一段时间。通常建议在后台运行。

在以下情况使用：

- 审查当前未提交的变更
- 审查你的分支与 `main` 等基础分支的对比

使用 `--base <ref>` 进行分支审查。它还支持 `--wait` 和 `--background`。它不可引导，不接受自定义焦点文本。当你想挑战特定决策或风险区域时，使用 [`/codex:adversarial-review`](#codexadversarial-review)。

示例：

```bash
/codex:review
/codex:review --base main
/codex:review --background
```

此命令是只读的，不会执行任何更改。在后台运行时，你可以使用 [`/codex:status`](#codexstatus) 检查进度，使用 [`/codex:cancel`](#codexcancel) 取消正在进行的任务。

---

### `/codex:adversarial-review`

运行**可引导**的审查，质疑所选的实现和设计。

可用于压力测试假设、权衡、失败模式，以及不同的方法是否会更安全或更简单。

它使用与 `/codex:review` 相同的审查目标选择，包括 `--base <ref>` 进行分支审查。
它也支持 `--wait` 和 `--background`。与 `/codex:review` 不同，它可以在标志后接受额外的焦点文本。

在以下情况使用：

- 发布前的审查，挑战方向而不仅仅是代码细节
- 专注于设计选择、权衡、隐藏假设和替代方法的审查
- 针对特定风险区域的压力测试，如认证、数据丢失、回滚、竞态条件或可靠性

示例：

```bash
/codex:adversarial-review
/codex:adversarial-review --base main challenge whether this was the right caching and retry design
/codex:adversarial-review --background look for race conditions and question the chosen approach
```

此命令是只读的。它不会修复代码。

---

### `/codex:rescue`

通过 `codex:codex-rescue` 子代理将任务交给 Codex。

在以下情况使用：

- 调查 bug
- 尝试修复
- 继续之前的 Codex 任务
- 使用更小的模型进行更快或更便宜的尝试

> [!NOTE]
> 根据任务和你选择的模型，这些任务可能需要很长时间，通常建议强制任务在后台运行或将代理移到后台。

它支持 `--background`、`--wait`、`--resume` 和 `--fresh`。如果你省略 `--resume` 和 `--fresh`，插件可以建议继续此仓库的最新救援线程。

示例：

```bash
/codex:rescue investigate why the tests started failing
/codex:rescue fix the failing test with the smallest safe patch
/codex:rescue --resume apply the top fix from the last run
/codex:rescue --model gpt-5.4-mini --effort medium investigate the flaky integration test
/codex:rescue --model spark fix the issue quickly
/codex:rescue --background investigate the regression
```

你也可以直接要求将任务委托给 Codex：

```text
Ask Codex to redesign the database connection to be more resilient.
```

**注意：**

- 如果你不传递 `--model` 或 `--effort`，Codex 会选择自己的默认值
- 如果你说 `spark`，插件会将其映射为 `gpt-5.3-codex-spark`
- 后续救援请求可以继续仓库中的最新 Codex 任务

---

### `/codex:status`

显示当前仓库的运行中和最近的 Codex 任务。

示例：

```bash
/codex:status
/codex:status task-abc123
```

用于：

- 检查后台工作的进度
- 查看最新完成的任务
- 确认任务是否仍在运行

---

### `/codex:result`

显示已完成任务的最终存储的 Codex 输出。

如果可用，它还包括 Codex 会话 ID，因此你可以使用 `codex resume <session-id>` 直接在 Codex 中重新打开该运行。

示例：

```bash
/codex:result
/codex:result task-abc123
```

---

### `/codex:cancel`

取消活动的后台 Codex 任务。

示例：

```bash
/codex:cancel
/codex:cancel task-abc123
```

---

### `/codex:setup`

检查 Codex 是否已安装和认证。

如果 Codex 缺失且 npm 可用，它可以帮你安装 Codex。

你也可以使用 `/codex:setup` 管理可选的审查门控。

#### 启用审查门控

```bash
/codex:setup --enable-review-gate
/codex:setup --disable-review-gate
```

当审查门控启用时，插件使用 `Stop` 钩子基于 Claude 的响应运行目标 Codex 审查。如果该审查发现问题，停止会被阻塞，以便 Claude 先解决它们。

> [!WARNING]
> 审查门控可能创建长时间运行的 Claude/Codex 循环，并可能快速消耗使用限额。只有在你计划主动监控会话时才启用它。

---

## 典型流程

### 发布前审查

```bash
/codex:review
```

### 将问题交给 Codex

```bash
/codex:rescue investigate why the build is failing in CI
```

### 启动长时间运行的任务

```bash
/codex:adversarial-review --background
/codex:rescue --background investigate the flaky test
```

然后检查：

```bash
/codex:status
/codex:result
```

---

## Codex 集成

Codex 插件包装了 [Codex 应用服务器](https://developers.openai.com/codex/app-server)。它使用你环境中安装的全局 `codex` 二进制文件，并[应用相同的配置](https://developers.openai.com/codex/config-basic)。

### 常见配置

如果你想更改插件使用的默认推理力度或默认模型，可以在用户级或项目级的 `config.toml` 中定义。例如，要始终对特定项目使用 `gpt-5.4-mini` 的 `high` 模式，你可以在启动 Claude 的目录根部的 `.codex/config.toml` 文件中添加：

```toml
model = "gpt-5.4-mini"
model_reasoning_effort = "high"
```

你的配置将基于以下选择：

- 用户级配置在 `~/.codex/config.toml`
- 项目级覆盖在 `.codex/config.toml`
- 项目级覆盖仅在[项目受信任](https://developers.openai.com/codex/config-advanced#project-config-files-codexconfigtoml)时加载

查看 Codex 文档了解更多[配置选项](https://developers.openai.com/codex/config-reference)。

### 将工作转移到 Codex

委托的任务和任何[停止门控](#what-does-the-review-gate-do)运行也可以通过运行 `codex resume` 直接在 Codex 中恢复，可以使用从运行 `/codex:result` 或 `/codex:status` 获得的特定会话 ID，或从列表中选择。

这样你可以审查 Codex 的工作或在那里继续工作。
