---
title: 基于 AI Agent 的日常编码实践与思考
description: AI Agent 日常编码最佳实践、典型 prompt 与工具配置
tags:
  - ai-coding
  - agent
source: https://docs.devin.ai/essential-guidelines/good-vs-bad-instructions
date: 2026-10-14
draft: true
---

## 大纲

1. 总结最佳实践，典型的 case
2. 提供一些典型的 prompt 案例
3. 配合 instructions files

## 参考

- [Devin：好的指令与不好的指令](https://docs.devin.ai/essential-guidelines/good-vs-bad-instructions)

## 提供工具和脚本

许多平台都支持将 Agent 与外部工具连接（在 Devin 中，这类功能被称为 MCPs）。但很多人忽略了另一个简单有效的方法：为 Agent 编写一些自定义的命令行（CLI）小工具。比如，你可以给它一个脚本，只需输入工单 ID 就能拉取该工单的详细信息。或者，为它提供一个能一键重启本地开发环境的工具，让它在搞乱环境后能自行恢复。

## 提供代码审查清单

在 Cognition 内部，我们维护了一个“常见代码错误清单”，并将其保存在代码库中。我们没有为这些错误编写传统的 lint 规则（因为很多场景难以用规则描述），而是配置了一个 Agent，让它在每个新的 PR 上运行，自动检查是否存在这些常见错误。
