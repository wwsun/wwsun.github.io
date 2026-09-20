---
title: GitHub Copilot CLI 自动驾驶模式详解
description: GitHub Copilot CLI 的自动驾驶模式允许它在任务中自主工作，执行多个步骤直到任务完成。
tags:
  - clippings
  - github-copilot
  - cli
  - ai-agent
  - autopilot
source: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot
created: 2026-07-23
---

## GitHub Copilot CLI 自动驾驶模式详解

> 原文：[Allowing GitHub Copilot CLI to work autonomously](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot) 来源：GitHub Docs

## 概述

通常，当你以交互方式使用 Copilot CLI 时，你提交一个提示词，然后等待 Copilot CLI 响应后再给出下一条指令。这种来回的交互持续进行，直到任务完成。

自动驾驶模式允许 Copilot CLI 在不等待每一步输入的情况下完成整个任务。一旦你给出初始指令，Copilot CLI 会自主执行每一步，直到它判定任务已完成。

CLI 标准交互模式与自动驾驶模式之间的区别，就像两种工作方式：一种是你和同事一起完成任务，同事承担大部分工作但会定期向你反馈；另一种是把任务完全交给同事，说"这是我需要的，做完了告诉我。"

在自动驾驶模式下，Copilot 会持续运行，直到以下事件之一发生：

- 智能体判定任务已完成。
- 出现阻止后续进展的问题。
- 你按下 `Ctrl+C` 停止智能体继续。
- 达到最大连续次数限制（如果设置了的话）。

要在交互会话中切换到自动驾驶模式，按 `Shift+Tab` 并循环切换可用模式，直到进入自动驾驶模式，然后输入你的提示词。使用相同的按键组合可以从自动驾驶模式切回标准交互模式。

## 自动驾驶模式的优势

- **无需人工干预的自动化**：Copilot 在初始指令后无需你的输入即可完成任务。
- **高效**：非常适合明确的任务，如编写测试、重构文件或修复 CI 失败。自动驾驶特别适用于需要长时间运行、多步骤会话的大型任务。
- **批量操作**：适用于脚本和 CI 工作流，你希望 Copilot 运行到完成。
- **安全性**：自动驾驶模式允许 Copilot 自主采取多个步骤来完成你的任务。`--max-autopilot-continues` 限制了它在停止之前可以执行的步骤数，以避免无限循环。此外，在自动驾驶模式下，Copilot 无法执行任何需要权限的操作，除非你明确授予它完全权限。

## 需要考虑的事项

- **任务适用性**：自动驾驶模式最适合定义明确的任务。它不适合开放式探索、没有明确目标的功能开发，或者你希望指导持续工作进展的任务。Copilot 会尽力完成任何任务，但对于模糊或含糊不清的指令，或者过程中需要细微判断的任务，可能会感到吃力。这可能导致代码变更结果不是你所期望的，并且无法在没有补修工作的情况下使用。

- **信任**：你需要信任 Copilot 做出合理的决策。自动驾驶模式在你授予所有权限时效果最佳。这相当于以 `--allow-all` 选项运行 Copilot CLI。你应该意识到，这给了 CLI 权限去做任何它认为必要的更改来完成任务，包括修改和删除文件。

- **成本**：每次 Copilot 与 AI 模型交互时，会根据处理的 Token 数量消耗 AI 额度。自动驾驶模式同样如此，只不过 Copilot 会自动发起每次后续交互，因此 AI 额度会在没有你直接参与的情况下被消耗。

## 权限

进入自动驾驶模式时，如果你尚未授予 Copilot 所有权限，会显示一条消息提示你在三个选项中做出选择：

```
1. 启用所有权限（推荐）
2. 以受限权限继续
3. 取消（Esc）
```

如果你启用了所有权限，自动驾驶模式会获得最佳效果。如果选择以受限权限继续，Copilot 将自动拒绝任何需要批准的工具有求，这可能会阻止它完成某些任务。你可以在自动驾驶会话期间改变主意并授予完全权限，通过使用 `/allow-all` 命令（或其别名 `/yolo`）。

## 在任务之间保持自动驾驶模式

默认情况下，自动驾驶模式仅适用于当前任务。一旦 Copilot 判定任务已完成，Copilot CLI 会自动切回标准交互模式。要再次在自动驾驶模式下运行另一个任务，按 `Shift+Tab` 循环切换可用模式，直到重新进入自动驾驶模式，然后输入你的下一个提示词。

如果你经常在自动驾驶模式下运行多个任务，可以通过启用 `stayInAutopilot` 设置来配置 CLI 在每个任务完成后保持在自动驾驶模式。你可以通过以下任一方式实现：

- 在交互会话期间，输入 `/settings stayInAutopilot true`。
- 将 `"stayInAutopilot": true` 添加到你的用户配置文件（`~/.copilot/settings.json`）中。更多信息请参见 [GitHub Copilot CLI 配置目录](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference#user-settings-copilotsettingsjson)。

当此设置启用时，Copilot 在任务完成后保持在自动驾驶模式，因此你输入的下一个提示词也会在自动驾驶模式下处理。你可以随时按 `Shift+Tab` 切回交互模式。

> **注意**：此设置仅控制任务完成*之后*你处于哪种模式。它不会使 Copilot 在判定任务完成后继续工作。自动驾驶模式仍然会在任务完成、出现问题、你按下 `Ctrl+C` 或达到最大连续次数限制时停止。

## 比较自动驾驶模式、`--allow-all` 和 `--no-ask-user`

`--allow-all`（及其别名 `--yolo`）是权限相关的选项，你可以在启动交互会话时传递给 `copilot` 命令。完整选项列表请参见 [GitHub Copilot CLI 命令参考](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#command-line-options)。

`--allow-all` 和 `--yolo` 选项允许 CLI 智能体使用所有工具、路径和 URL。你也可以在交互会话期间通过 `/allow-all` 或 `/yolo` 斜杠命令设置这些权限。

> **注意**：输入 `/allow-all` 和 `/yolo` 会为当前会话启用权限。再次输入这些斜杠命令不会禁用权限——换句话说，这些命令不会切换权限的开关状态。

使用 `--allow-all` 时，你仍然处于正常的交互流程中。Copilot 在到达决策点时会停下来询问你希望它做什么。不过，当 Copilot CLI 需要执行通常需要批准的操作时（如使用工具、路径或 URL），它将直接执行而不请求许可。

`--no-ask-user` 选项会抑制 Copilot 通常会询问的澄清性问题。智能体必须自行做出决策，而不是向你询问。这提供了一定程度的自主性。然而，与自动驾驶模式不同，`--no-ask-user` 不允许智能体在与 AI 模型交互所需的连续步骤中继续工作任务。使用此选项时，CLI 不会在没有你参与的情况下使用额外的 GitHub AI 额度。

## 使用自动驾驶模式的典型工作流

自动驾驶模式非常适合实施大型、详细的工作计划。通常，在与 Copilot 使用计划模式创建实施计划后切换到自动驾驶模式会很有用。有关计划模式的更多信息，请参见 [GitHub Copilot CLI 最佳实践](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices#2-plan-before-you-code)。

例如：

- 启动一个交互式 Copilot CLI 会话。可选地，你可以包含 `--allow-all` 选项来授予权限，以及 `--max-autopilot-continues` 选项来为会话期间的自动驾驶模式设置最大连续次数限制。例如，你可以用 `copilot --allow-all --max-autopilot-continues 10` 启动会话，以授予智能体使用所有工具、路径和 URL 的权限，并将自动驾驶的最大连续次数设置为 10。

- 交互会话启动后，如果系统提示你信任当前文件夹中的文件，接受此选项。

- 按 `Shift+Tab` 切换到计划模式，输入描述你想实现的目标的提示词，然后与 Copilot 共同创建一个详细计划。

- 当你有一个满意的计划后，使用 CLI 提供的"接受计划并以自动驾驶模式构建"选项。

- 如果系统提示你关于权限的问题，选择启用所有权限的选项。

- 让 Copilot 去实现计划。你可以定期检查其进度。

## 通过编程方式使用自动驾驶模式

你可以在以编程方式运行 Copilot CLI 时使用自动驾驶模式，例如在命令行上向 Copilot 传递提示词，或将 CLI 作为脚本或 CI 工作流的一部分使用。这样做可以让你端到端地自动执行任务，而无需在初始命令后与 CLI 交互。

使用 `--allow-all`（或 `--yolo`）选项授予 Copilot 使用所有工具、路径和 URL 的权限。你可以包含 `--max-autopilot-continues` 选项来设置最大连续次数限制，以防止失控循环。这在编程环境中尤其重要，因为如果出现问题，你不会在旁进行干预。

示例用法：

```shell
copilot --autopilot --yolo --max-autopilot-continues 10 -p "你的提示词"
```

## 总结

当你希望 Copilot 接管一个任务并在没有你参与的情况下直接运行时，使用自动驾驶模式。它最适合清晰、定义明确且你信任 Copilot 能做出合理决策的任务。

## 延伸阅读

- [使用 GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli#get-copilot-to-work-autonomously)
- [使用 /fleet 命令并行运行任务](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli)

---

> **译者注**：GitHub Copilot CLI 的 autopilot 模式本质上是一种完全自主的智能体运行模式，与标准交互模式的来回对话不同，它让 AI 从"协作型助手"变为"可委派任务的队友"。配合计划模式使用效果最佳：先制定方案，再交给自动驾驶执行。适合 CI/CD 流水线、批量重构等场景。
