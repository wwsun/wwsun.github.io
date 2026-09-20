---
title: Claude Code 最佳实践
tags:
  - claude-code
draft: false
description: "\U0001F6AB\U0001F476 不要过度干预"
source: "https://github.com/shanraisshan/claude-code-best-practice"
date: 2026-03-31T06:02:38.277Z
---

## ⚙ 开发工作流

### 🔥 热门

- 跨模型工作流（Claude Code + Codex）
- [RPI 工作流](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/rpi/rpi-workflow.md)
- Ralph Wiggum 循环
- [Garry Tan（YC CEO）- gstack](https://github.com/garrytan/gstack) ★15k

### 其他知名工作流

- obra/superpowers ★87k
- Github Speckit ★77k
- get-shit-done (GSD) ★31k
- OpenSpec OPSX ★31k
- Andrej Karpathy（OpenAI 创始成员）工作流
- Boris Cherny（Claude Code 创作者）- 2026年2月工作流
- Peter Steinberger（OpenClaw 创作者）工作流

---

## 💡 技巧与窍门

🚫👶 = 不要过度干预

### ■ 提示词技巧（4条）

- **挑战 Claude**："从各种角度质疑这些改动，在我通过你的测试前不要创建 PR" / "证明给我看这能用"
- ==**面对平庸的修复**："现在你知道了所有背景，推翻重来，实现最优雅的方案"
- **Claude 大多数 bug 能自己修**：粘贴报错，说"修一下"，别微管理 🚫👶
- **说"用子代理"**：给复杂问题投入更多算力，保持主上下文干净聚焦 🚫👶

### ■ 规划/规格（5条）

- 始终从**计划模式**开始
- ==从最小规格起步，让 Claude 用 AskUserQuestion 工具访谈你，再开新会话执行规格
- 始终制定**分阶段的门控计划**，每个阶段包含多种测试（单元、自动化、集成）
- ==启动**第二个 Claude** 以架构师视角审查你的计划，或用跨模型方式做审查
- 写**详细规格，减少歧义**：交出工作前越具体，输出越好

### ■ 工作流（15条）

- CLAUDE.md 每个文件保持在 **200 行**以内，60 行以内效果更佳
- 单体仓库使用**多个 CLAUDE.md**，支持祖先+后代加载
- 使用 `.claude/rules/` 拆分大型指令
- 工作流用**命令（commands）**，而非子代理
- 设置**功能专属的子代理**配合**技能**，而非通用的 QA/后端代理
- `memory.md` / `constitution.md` 不能保证百分百遵守
- 避免"代理傻区"：上下文达到 **50%** 时手动 `/compact`；切换新任务时用 `/clear`
- 小任务直接用原版 Claude Code 比复杂工作流更好
- 单体仓库使用**技能子文件夹**
- 用 `/model` 选模型，`/context` 查上下文，`/usage` 查计划限制，`/config` 配置设置
- ==始终开启**思维模式**（true）和**输出样式**（解释型）
- ==提示词中使用 **ultrathink** 触发高强度推理
- `/rename` 重要会话，之后用 `/resume` 恢复
- 用 **`Esc Esc` 或 `/rewind`** 撤销偏离轨道的操作
- **频繁提交** —— 每小时至少提交一次

### ■ 高级工作流（6条）

- 大量使用 **ASCII 图表**理解架构
- 用**代理团队 + tmux** 和 **git worktrees** 进行并行开发
- 用 `/loop` 做循环监控（最长运行 3 天）
- 用 **Ralph Wiggum 插件**处理长时间自主任务
- `/permissions` 使用通配符语法，而非危险的跳过权限
- `/sandbox` 用文件和网络隔离减少权限提示

### ■ 调试（5条）

- 遇到问题时，**养成截图分享给 Claude** 的习惯
- 使用 MCP（Claude in Chrome、Playwright、Chrome DevTools）让 Claude 自主查看控制台日志
- ==始终让 Claude 以**后台任务**运行需要查看日志的终端
- `/doctor` 诊断安装、认证和配置问题
- 压缩出错时，用 `/model` 选择 1M token 模型，再运行 `/compact`

### ■ 实用工具

- iTerm / Ghostty / tmux 终端代替 IDE（VS Code / Cursor）
- Wispr Flow：语音提示，生产力提升 10 倍
- claude-code-voice-hooks：Claude 语音反馈
- 状态栏：感知上下文状态，快速压缩

### ■ 日常习惯

- 每天更新 Claude Code，每天开始时阅读更新日志
- 关注 r/ClaudeAI、r/ClaudeCode
- 关注 Boris、Thariq、Cat、Lydia、Noah 等核心团队成员

## Boris Cherny + 团队精华语录

- 始终使用计划模式，给 Claude 一种验证方法，使用 /code-review（Boris）| 2025/12/27
- 让 Claude 用 AskUserQuestion 工具访谈你（Thariq）| 2025/12/28
- [如何使用 Claude Code —— 来自我朴素设置的13条技巧](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-13-tips-03-jan-26.md)（Boris）| 2026/01/03
- [来自团队的10条 Claude Code 使用技巧](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-10-tips-01-feb-26.md)（Boris）| 2026/02/01
- [人们自定义 Claude 的12种方式](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-12-tips-12-feb-26.md)（Boris）| 2026/02/12
- Git Worktrees —— Boris 的5种用法 | 2026/02/21
- 像代理一样看世界 —— 构建 Claude Code 的经验（Thariq）| 2026/02/28
- /loop —— 调度最长3天的循环任务（Boris）| 2026/03/07
- /btw —— Claude 工作时的侧链对话（Thariq）| 2026/03/10

---

## 💰 价值十亿的问题

**记忆与指令（4个）**

1. CLAUDE.md 究竟该放什么，不该放什么？
2. 如果已有 CLAUDE.md，还需要单独的 constitution.md 或 rules.md 吗？
3. 多久更新一次 CLAUDE.md，怎么判断它已经过时？
4. 为什么 Claude 仍然会忽略 CLAUDE.md 的指令 —— 即使用全大写写了"必须"？

**代理、技能与工作流（6个）**

1. 什么时候用命令 vs 代理 vs 技能 vs 直接原版 Claude Code？
2. 随着模型更新，代理、命令和工作流应该多久更新一次？
3. 给子代理设置详细人设能提升质量吗？
4. 应该依赖内置计划模式，还是自建计划命令/代理？
5. 个人技能和社区技能冲突时谁赢？
6. 能否将代码库转成规格后删代码，让 AI 从规格重新生成完全相同的代码？

**规格与文档（3个）**

1. 仓库里每个功能都需要一个 markdown 规格文件吗？
2. 实现新功能后，规格文件多久需要更新？
3. 实现新功能时，如何处理对其他功能规格的连锁影响？

---

## 使用方法

1. 像学课程一样阅读这个仓库，先搞清楚命令、代理、技能和 hooks 分别是什么
2. 克隆仓库，玩转示例，试试 /weather-orchestrator，感受实际效果
3. 去自己的项目，让 Claude 基于这个仓库建议应该加入哪些最佳实践

_原文：https://github.com/shanraisshan/claude-code-best-practice_
