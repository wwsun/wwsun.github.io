---
title: Claude-Agent-SDK
tags:
  - claude
  - sdk
description: 对比 systemPrompt 与 CLAUDE.md 在 Claude Agent SDK 中的职责分工：systemPrompt 定义平台层身份与约束，CLAUDE.md 定义知识层行为流程与领域知识。
source:
---

## systemPrompt vs CLAUDE.md

systemPrompt 的职能：平台层（Platform Layer）—— 定义"当前是谁、在哪里、有什么"

- 身份定义（Who）：角色声明、核心能力边界
- 安全约束（Constraints）：Tier-1 规则、数据信任模型
- 运行时上下文（Where/Now）：CWD、工作区状态、版本历史、模板信息
- 当前能力（What）：已连接的 MCP 工具、条件功能、模式信号

CLAUDE.md 的职能：知识层（Knowledge Layer）—— 定义"怎么做"

- 行为流程：路由逻辑、阶段执行、Plan 确认流程
- 领域知识：submit_plan 参数规范、PRD 格式、活动中台流程
- 工具约定：并行调用规则、TodoWrite 规范、Skill 使用方式
- 错误恢复、最佳实践
