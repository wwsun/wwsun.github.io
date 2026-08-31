---
title: 让 Claude 持续向目标推进 — Claude Code /goal 命令
description: Claude Code /goal 命令官方文档完整中文翻译，介绍了如何设置完成条件让 Claude 自主多轮工作直至目标达成
tags:
  - claude-code
  - clippings
  - agent
  - automation
source: https://code.claude.com/docs/en/goal
---

## 让 Claude 持续向目标推进 — Claude Code /goal 命令

`/goal` 命令用于设置一个完成条件，Claude 会持续工作直到条件满足，无需你每步都手动提示。每轮结束后，一个小型快速模型会检查条件是否成立。如果不成立，Claude 会开始新一轮工作，而不是将控制权交还给你。一旦条件满足，目标会自动清除。

适用场景：有可验证终态的实质性工作——

- 将模块迁移到新 API，直到所有调用点编译通过且测试通过
- 按设计文档实现功能，直到所有验收标准满足
- 将大文件拆分为聚焦的小模块，直到每个模块都在体积预算内
- 处理标记的 Issue 积压，直到队列清空

本页面涵盖以下内容：

- [对比保持会话运行的各种方式](#对比保持会话运行的各种方式)：`/loop`、Stop hooks 与 auto mode
- [设置目标](#设置目标)以及[编写有效的条件](#编写有效的条件)
- [查看状态](#查看状态)、[提前清除](#清除目标)和[非交互式运行](#非交互式运行)
- [评估机制](#评估机制)和[系统要求](#系统要求)

## 对比保持会话运行的各种方式

有三种方式可以在两次提示之间保持当前会话持续运行。根据「什么触发下一轮」来选择：

| 方式      | 下一轮触发时机     | 停止条件                           |
| --------- | ------------------ | ---------------------------------- |
| `/goal`   | 上一轮完成后       | 模型确认条件已满足                 |
| `/loop`   | 预设时间间隔到达后 | 你手动停止，或 Claude 判定工作完成 |
| Stop hook | 上一轮完成后       | 你自定义的脚本或提示决定           |

`/goal` 和 Stop hook 都在每轮之后触发。`/goal` 是一个会话级快捷方式：你输入一个条件，它只在当前会话中生效。Stop hook 住在你的配置文件中，适用于其作用域内的每个会话，可以运行脚本来做确定性检查或运行提示来做模型评估。

[Auto mode](https://code.claude.com/docs/en/auto-mode-config) 本身只会在单轮内自动批准工具调用，但不会开始新的一轮。Claude 在判定工作完成时会自动停止。`/goal` 额外增加了一个评估器，在每轮后检查你的条件，因此完成的判定由一个独立的模型来做，而非由执行工作的模型决定。两者是互补的：auto mode 消除了每步工具的提示，而 `/goal` 消除了每轮的提示。

## 使用 `/goal`

每个会话只能有一个活跃目标。同一命令根据参数不同可以设置、查看和清除目标。

### 设置目标

运行 `/goal` 后跟你想满足的条件。如果已有活跃目标，新目标会替换旧目标。

```
/goal test/auth 中的所有测试都通过，并且 lint 步骤干净无警告
```

设置目标后会立即启动一轮工作，条件本身即为工作指令。你不需要再发送一个单独的提示。目标活跃期间，`◎ /goal active` 指示器会显示目标已运行了多长时间。

每轮之后，评估器会返回一个简短的原因，说明条件是否满足。最新的原因会显示在状态视图和对话记录中，让你看到 Claude 接下去要朝什么方向努力。

### 编写有效的条件

[评估器](#评估机制)根据 Claude 在对话中暴露出的内容来判断你的条件。它不会独立运行命令或读取文件，因此条件必须是 Claude 自己的输出能够证明的东西。「`test/auth` 中的所有测试都通过」是有效的，因为 Claude 会运行测试，结果会出现在对话记录中供评估器读取。

一个能经得起多轮检验的条件通常具备：

- **一个可度量的终态**：测试结果、构建退出码、文件数量、空队列
- **一个明确的检查方式**：Claude 如何证明它，例如「`npm test` 退出码为 0」或「`git status` 干净」
- **必要的约束**：在达成目标过程中不能变化的东西，例如「不修改其他测试文件」

条件最长可写 4000 字符。要限制目标的运行时长，可以在条件中加入轮次或时间子句，例如 `或者在 20 轮后停止`。Claude 每轮都会报告相对于该子句的进展，评估器也会据此判断。

### 查看状态

不带参数运行 `/goal` 查看当前状态：

```
/goal
```

如果有活跃目标，状态会显示：

- 条件内容
- 已运行时长
- 已评估轮次
- 当前 Token 消耗
- 评估器最新给出的理由

如果没有活跃目标但之前在会话中达成过目标，状态会显示已达成条件以及其运行时长、轮次数和 Token 消耗。

### 清除目标

运行 `/goal clear` 在条件满足前移除活跃目标：

```
/goal clear
```

`stop`、`off`、`reset`、`none`、`cancel` 都是 `clear` 的别名。运行 `/clear` 开始新对话也会移除任何活跃目标。

### 恢复会话中的活跃目标

当会话结束时目标仍在活跃状态，使用 `--resume` 或 `--continue` 恢复该会话时，目标会被恢复。条件会保留，但轮次计数、计时器和 Token 消耗基准都会重置。已达成或已清除的目标不会被恢复。

### 非交互式运行

`/goal` 支持[非交互模式](https://code.claude.com/docs/en/headless)、[桌面应用](https://code.claude.com/docs/en/desktop)以及[远程控制](https://code.claude.com/docs/en/remote-control)。配合 `-p` 设置目标时，会在单次调用中运行整个循环直到完成：

```
claude -p "/goal CHANGELOG.md 中包含本周合并的每个 PR 的条目"
```

在非交互式目标中，使用 Ctrl+C 可以在条件满足前中断进程。

## 评估机制

`/goal` 本质上是一个会话级的[基于提示的 Stop hook](https://code.claude.com/docs/en/hooks#prompt-based-hooks) 封装。每次 Claude 完成一轮后，条件和到目前为止的对话会被发送到你配置的[小型快速模型](https://code.claude.com/docs/en/model-config)（默认是 Haiku）。模型返回一个「是/否」的判断和一个简短的原因。如果结果是「否」，Claude 会继续工作，并将原因作为下一轮的指导。如果是「是」，目标被清除，并在对话记录中记录一条达成记录。

评估器在你会话所配置的提供商上运行。它不调用工具，因此只能判断 Claude 已经在对话中暴露出的内容。

## 系统要求

`/goal` 仅在你已接受信任对话框的工作区中运行，因为评估器是 hooks 系统的一部分。当在任何配置级别设置了 [`disableAllHooks`](https://code.claude.com/docs/en/hooks#disable-or-remove-hooks)，或在托管设置中设置了 [`allowManagedHooksOnly`](https://code.claude.com/docs/en/settings#hook-configuration) 时，`/goal` 也不可用。在这些情况下，命令会告知原因，而非静默失效。

## 相关文档

- [使用 `/loop` 重复运行提示](https://code.claude.com/docs/en/scheduled-tasks#run-a-prompt-repeatedly-with-%2Floop)：按时间间隔重复运行，而非直到条件满足
- [基于提示的 hooks](https://code.claude.com/docs/en/hooks-guide#prompt-based-hooks)：当你需要自定义评估逻辑时编写自己的 Stop hook
- [Auto mode](https://code.claude.com/docs/en/auto-mode-config)：自动批准工具调用，使每个目标轮次无需值守
- [调度方式对比](https://code.claude.com/docs/en/scheduled-tasks#compare-scheduling-options)：独立于任何打开会话的定时执行工作
