---
title: Superpowers 6
tags:
  - superpowers
  - agents
  - coding
  - claude
  - codex
  - fable
  - optimization
source: https://blog.fsck.com/2026/06/15/Superpowers-6/
date: 2026-06-15
---

# Superpowers 6：性能翻倍，成本大幅降低

原文：[Superpowers 6](https://blog.fsck.com/2026/06/15/Superpowers-6/)

## 核心总结 (TL;DR)

Superpowers 6 显著提升了运行速度并大幅减少了 Token 消耗，同时保持了相同的高质量结果。构建速度最高提升 50%，成本最高降低 60%。

## 背景

团队原本准备发布包含许多新特性（如支持 Pi, Antigravity, Kimi Code，改进模型兼容性，重写技能等）的 5.2 版本，但随着 Anthropic 推出 Fable 模型，他们决定利用新模型来优化 Subagent Driven Development（基于子智能体驱动的开发）的成本和效率问题。

由于 Superpowers 强制执行严格的 TDD（测试驱动开发）和细致的代码及需求合规审查，导致其运行相对缓慢且消耗大量 Token。团队决定使用 Fable 来尝试解决这个问题。

## 关键优化点

1. **改进协调员到审查员的交接 (Coordinator to Reviewer Handoff)**:
   将基于文本的查找提交指令，改为使用 Shell 脚本预生成包含良好格式的 diff 以及元数据的审查包。这使得审查智能体极少需要自行运行 git 命令，从而节省了约 10% 的 Token 消耗和时间。

2. **合并审查智能体**:
   将代码审查 (Code Reviewer) 和规范合规性审查 (Spec Compliance Reviewer) 两个子智能体合并为一个，额外节省了约 15% 的时间与成本。

3. **智能体角色匹配**:
   调整了给协调员 (Orchestrator) 的指导原则，以便为特定任务分配更适合的智能体。

## 自动化研究 (Autoresearch) 成果

Fable 模型构建并运行了一个完整的自动化研究循环（25 个实验），并得出以下结论：

- **有效优化**: “精简的审查契约 (terse reviewer contract)” 减少了 41% 的审查输出且不影响判断；“叙述配方 (narration recipe)” 和“条件型实施者分层 (conditional implementer tiering)” 进一步降低了成本。
- **无效尝试**: 限制协调员 (Controller) 的思考反而会适得其反，导致输出翻倍；削减计划字数预算会大幅减少测试内容。
- **风险发现**: 仅提供 diff 审查包给审查员，可能会导致他们自行重新定义“规范”，而忽略了原本的需求简报。

## 结论

经过各种优化，Superpowers 6 在 Anthropic 评估基准上实现了 **运行时间缩短 50%，Token 消耗降低 60%**。相关的评估套件也已开源至 [GitHub](https://github.com/prime-radiant-inc/superpowers-evals)，Superpowers 6 也可以在 [GitHub](https://github.com/obra/superpowers) 上获取。
