---
title: 高效管理成本 - Claude Code 文档翻译
description: Claude Code 成本管理指南中文翻译，涵盖用量追踪、团队成本管理和降低 Token 消耗的策略
tags:
  - claude-code
  - cost-management
  - clippings
source: https://code.claude.com/docs/en/costs
---

# 高效管理成本

> 原文：[Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)

跟踪 Token 用量、设置团队支出限制，并通过上下文管理、模型选择、扩展思考设置和预处理 Hook 来降低 Claude Code 成本。

> [!note]- 文档索引
> 获取完整文档索引: [https://code.claude.com/docs/llms.txt](https://code.claude.com/docs/llms.txt)
> 使用该文件可在进一步探索之前发现所有可用页面。

Claude Code 按 API Token 消耗计费。关于订阅计划定价（Pro、Max、Team、Enterprise），请参阅 [claude.com/pricing](https://claude.com/pricing)。每位开发者的成本因模型选择、代码库大小以及使用模式（如运行多个实例或自动化）而有很大差异。在企业部署中，**每位开发者每个活跃日的平均成本约为 $13，每月约 $150-250**，其中 90% 的用户每日成本低于 $30。如要预估自己团队的开支，建议先从小规模的试点团队开始，使用下面的追踪工具建立基线，然后再逐步推广。

本页面涵盖如何 [追踪你的成本](#追踪你的成本)、[管理团队成本](#管理团队成本) 以及 [降低 Token 消耗](#降低-token-消耗)。

## 追踪你的成本

### 使用 `/usage` 命令

`/usage` 中的 Session 块显示 API Token 使用量，面向 API 用户。Claude Max 和 Pro 订阅用户的用量已包含在订阅中，因此会话成本数字与账单无关。订阅用户在同一界面可看到套餐用量条和活动统计数据。

`/usage` 命令提供当前会话的详细 Token 用量统计。美元金额是根据 Token 数量本地估算的，可能与实际账单有所出入。权威账单请查看 [Claude Console](https://platform.claude.com/usage) 中的 Usage 页面。

```
Total cost:            $0.55
Total duration (API):  6m 19.7s
Total duration (wall): 6h 33m 10.2s
Total code changes:    0 lines added, 0 lines removed
```

## 管理团队成本

使用 Claude API 时，你可以对 Claude Code 工作区的总支出 [设置工作区支出限制](https://platform.claude.com/docs/en/build-with-claude/workspaces#workspace-limits)。管理员可在 Console 中 [查看成本和使用报告](https://platform.claude.com/docs/en/build-with-claude/workspaces#usage-and-cost-tracking)。

当你首次用 Claude Console 账户认证 Claude Code 时，系统会自动为你创建一个名为 "Claude Code" 的工作区。该工作区为组织中所有 Claude Code 使用提供集中的成本追踪和管理。你无法为此工作区创建 API 密钥；它专用于 Claude Code 认证和使用。

对于有自定义速率限制的组织，该工作区中的 Claude Code 流量计入组织总体 API 速率限制。你可以在 Claude Console 中对该工作区的 Limits 页面设置 [工作区速率限制](https://platform.claude.com/docs/en/api/rate-limits#setting-lower-limits-for-workspaces)，以限制 Claude Code 的份额并保护其他生产工作负载。

在 Bedrock、Vertex 和 Foundry 上，Claude Code 不会从你的云端发送指标。要获取成本指标，多家大型企业报告使用了 [LiteLLM](https://code.claude.com/docs/en/llm-gateway#litellm-configuration)——这是一个开源工具，可帮助公司 [按密钥追踪支出](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend)。该项目与 Anthropic 无关，且未经安全审计。

### 速率限制建议

在为团队设置 Claude Code 时，请参考以下基于组织规模的每用户 TPM（每分钟 Token 数）和 RPM（每分钟请求数）建议：

| 团队规模   | 每用户 TPM | 每用户 RPM |
| ---------- | ---------- | ---------- |
| 1-5 人     | 200k-300k  | 5-7        |
| 5-20 人    | 100k-150k  | 2.5-3.5    |
| 20-50 人   | 50k-75k    | 1.25-1.75  |
| 50-100 人  | 25k-35k    | 0.62-0.87  |
| 100-500 人 | 15k-20k    | 0.37-0.47  |
| 500+ 人    | 10k-15k    | 0.25-0.35  |

例如，如果你有 200 个用户，可以为每个用户请求 20k TPM，即总计 400 万 TPM（200×20,000 = 4,000,000）。**每用户 TPM 随团队规模增大而降低**，因为大型组织中同时使用 Claude Code 的用户往往较少。这些速率限制适用于组织级别，而非单个用户级别，这意味着在其他用户不活跃使用时，单个用户可以临时消费超过其计算份额。

如果你预计会出现异常高的并发使用场景（如大规模团队的现场培训），可能需要更高的每用户 TPM 分配。

### Agent 团队 Token 成本

[Agent 团队](https://code.claude.com/docs/en/agent-teams) 会生成多个 Claude Code 实例，每个实例都有自己独立的上下文窗口。Token 使用量随活跃团队成员数量和每个成员的运行时长而扩展。

控制 Agent 团队成本的建议：

- **为团队成员使用 Sonnet**。它在能力和成本之间取得平衡，适合协调任务。
- **保持团队规模小**。每个成员运行自己的上下文窗口，因此 Token 使用量大致与团队规模成正比。
- **保持生成提示（spawn prompts）聚焦**。成员会自动加载 CLAUDE.md、MCP 服务器和技能，但生成提示中的所有内容从一开始就会添加到其上下文中。
- **工作完成后清理团队**。即使空闲，活跃的团队成员仍然会继续消耗 Token。
- **Agent 团队默认禁用**。在你的 [settings.json](https://code.claude.com/docs/en/settings) 或环境变量中设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 来启用。参见 [启用 Agent 团队](https://code.claude.com/docs/en/agent-teams#enable-agent-teams)。

## 降低 Token 消耗

Token 成本与上下文大小成正比：Claude 处理的上下文越多，你使用的 Token 就越多。Claude Code 通过 **提示缓存**（减少重复内容如系统提示的成本）和 **自动压缩**（在接近上下文限制时总结对话历史）自动优化成本。

以下策略可帮助你保持较小的上下文并降低每条消息的成本。

### 主动管理上下文

使用 `/usage` 检查当前 Token 使用量，或 [配置状态栏](https://code.claude.com/docs/en/statusline#context-window-usage) 持续显示。

- **任务之间清理上下文**：切换到无关工作时使用 `/clear` 重新开始。过时的上下文会在每条后续消息中浪费 Token。清理前先用 `/rename` 重命名，方便后续找到会话，然后用 `/resume` 恢复。
- **添加自定义压缩指令**：`/compact Focus on code samples and API usage` 告诉 Claude 在总结时保留什么内容。

你也可以在 CLAUDE.md 中自定义压缩行为：

```
# Compact instructions

When you are using compact, please focus on test output and code changes
```

### 选择合适的模型

Sonnet 能很好地处理大多数编码任务，且成本低于 Opus。将 Opus 留给复杂的架构决策或多步推理。使用 `/model` 在会话中切换模型，或在 `/config` 中设置默认模型。对于简单的子代理任务，在 [子代理配置](https://code.claude.com/docs/en/sub-agents#choose-a-model) 中指定 `model: haiku`。

### 降低 MCP 服务器开销

MCP 工具定义 [默认延迟加载](https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search)，因此只有工具名称进入上下文，直到 Claude 实际使用某个工具。运行 `/context` 查看什么在占用空间。

- **优先使用 CLI 工具（如果可用）**：`gh`、`aws`、`gcloud`、`sentry-cli` 等工具比 MCP 服务器更节省上下文，因为它们不添加每个工具的列表项。Claude 可以直接运行 CLI 命令。
- **禁用未使用的服务器**：运行 `/mcp` 查看已配置的服务器，并禁用在当前工作中不使用的。

### 为类型化语言安装代码智能插件

[代码智能插件](https://code.claude.com/docs/en/discover-plugins#code-intelligence) 为 Claude 提供精确的符号导航，而非基于文本的搜索，在探索不熟悉的代码时减少不必要的文件读取。一次 "跳转到定义" 调用就能替代原本的 grep 搜索加阅读多个候选文件的流程。安装的语言服务器还能在编辑后自动报告类型错误，Claude 无需运行编译器即可捕获错误。

### 将处理工作卸载到 Hook 和 Skill

自定义 [Hook](https://code.claude.com/docs/en/hooks) 可以在 Claude 看到数据之前进行预处理。与其让 Claude 读取 10,000 行的日志文件来查找错误，一个 Hook 可以 grep 搜索 `ERROR` 并只返回匹配行，将上下文从数万 Token 减少到数百。

[Skill](https://code.claude.com/docs/en/skills) 可以为 Claude 提供领域知识，使其无需探索。例如，一个 "codebase-overview" Skill 可以描述项目的架构、关键目录和命名约定。Claude 调用该 Skill 时，立即获得这些上下文，而不是花费 Token 读取多个文件来理解结构。

以下是一个 PreToolUse Hook 示例，用于过滤测试输出仅显示失败：

**settings.json:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/filter-test-output.sh"
          }
        ]
      }
    ]
  }
}
```

**filter-test-output.sh:**

```bash
#!/bin/bash
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')

# 如果正在运行测试，只显示失败结果
if [[ "$cmd" =~ ^(npm test|pytest|go test) ]]; then
  filtered_cmd="$cmd 2>&1 | grep -A 5 -E '(FAIL|ERROR|error:)' | head -100"
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\",\"updatedInput\":{\"command\":\"$filtered_cmd\"}}}"
else
  echo "{}"
fi
```

### 将指令从 CLAUDE.md 迁移到 Skill

你的 [CLAUDE.md](https://code.claude.com/docs/en/memory) 文件会在会话启动时加载到上下文中。如果它包含针对特定工作流（如 PR 审查或数据库迁移）的详细指令，那么即使你在做无关的工作，这些 Token 也会一直存在。[Skill](https://code.claude.com/docs/en/skills) 仅在调用时按需加载，因此将专门化的指令迁移到 Skill 中可以保持较小的基础上下文。目标是将 CLAUDE.md 保持在 **200 行以内**，只包含核心内容。

### 调整扩展思考

扩展思考（Extended Thinking）默认启用，因为它显著提升复杂规划和推理任务的性能。思考 Token 按输出 Token 计费，默认预算可达每次请求数万 Token，具体取决于模型。对于不需要深度推理的简单任务，你可以通过以下方式降低成本：

- 使用 `/effort` 或在 `/model` 中降低 [努力级别](https://code.claude.com/docs/en/model-config#adjust-effort-level)
- 在 `/config` 中禁用思考
- 设置 `MAX_THINKING_TOKENS=8000` 降低预算

### 将冗长操作委托给子代理

运行测试、获取文档或处理日志文件可能会消耗大量上下文。将这些操作委托给 [子代理](https://code.claude.com/docs/en/sub-agents#isolate-high-volume-operations)，让冗长的输出留在子代理的上下文中，只将摘要返回给主对话。

### 管理 Agent 团队成本

当团队成员以计划模式运行时，Agent 团队使用的 Token 约为标准会话的 **7 倍**，因为每个成员维护自己的上下文窗口并作为独立的 Claude 实例运行。保持团队任务小而自包含，以限制每个成员的 Token 使用量。详见 [Agent 团队](https://code.claude.com/docs/en/agent-teams)。

### 编写具体明确的提示

模糊的请求如 "改进这个代码库" 会触发广泛的扫描。具体的请求如 "为 auth.ts 中的登录函数添加输入验证" 让 Claude 以最少的文件读取高效工作。

### 高效处理复杂任务

对于较长或较复杂的工作，以下习惯有助于避免因走错方向而浪费 Token：

- **对复杂任务使用计划模式**：按 Shift+Tab 进入 [计划模式](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)，在实现之前先让 Claude 探索代码库并提出方案供你批准，避免初始方向错误导致的昂贵返工。
- **尽早纠偏**：如果 Claude 开始走向错误方向，按 Escape 立即停止。使用 `/rewind` 或双击 Escape 将会话和代码恢复到上一个检查点。
- **提供验证目标**：在提示中包含测试用例、粘贴截图或定义预期输出。当 Claude 可以验证自己的工作时，它会在你要求修复之前发现问题。
- **增量测试**：写一个文件，测试它，然后继续。这能在问题修复成本还很低的时候及早发现。

## 后台 Token 使用

Claude Code 在空闲时也会为某些后台功能消耗 Token：

- **对话总结**：为 `claude --resume` 功能总结之前对话的后台任务
- **命令处理**：某些命令如 `/usage` 可能会生成请求来检查状态

这些后台过程消耗少量 Token（通常每次会话不超过 $0.04），即使没有主动交互也会产生。

## 理解 Claude Code 行为的变更

Claude Code 会定期接收更新，可能会改变功能的运作方式，包括成本报告。运行 `claude --version` 检查当前版本。对于具体的账单问题，请通过 [Console 账户](https://platform.claude.com/login) 联系 Anthropic 支持。

---

_翻译日期: 2026-05-15_
