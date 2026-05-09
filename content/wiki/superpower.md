---
title: Superpowers - 流行的 Claude 插件包
tags:
  - agent
  - agent-plugin
  - claude-code
draft: false
description: 未命名
source: https://github.com/obra/superpowers
---

Superpowers 是为你的编码智能体构建的完整软件开发工作流程，基于一套可组合的“技能”和一些初始指令，确保你的智能体能够使用这些技能。

## 工作原理

它的流程从你启动编码智能体那一刻起。在智能体识别到你在构建某个东西时，它**不会**直接开始写代码，而是先退一步，询问你的目标是什么，你希望做成什么样子。

当它通过会话收集到具体的规范后，会将内容分段展示，确保你可以逐步阅读和消化。

在你确认设计之后，智能体会制定一个清晰的实现计划，即便是缺乏经验和判断、没有项目上下文、品味不佳的初级开发者都能明白。

接下来，当你下达“开始”指令，系统会启动一个**subagent-driven-development**（子代理驱动开发）流程，让智能体针对每一个工程任务进行协作、检查和审核，并持续推进。这不仅仅是自动化，而是有方法、有流程地完成开发。

系统功能远不止这些，但这就是核心流程。由于技能会自动触发，你无需做任何额外的操作，你的编码智能体就拥有了 Superpowers。

## 基础工作流程

1. **brainstorming（头脑风暴）** —— 在开始写代码前激活。通过提问完善想法、探索方案，将设计分段展示并得到用户确认。保存设计文档。

2. **using-git-worktrees（使用 git 分支工作区）** —— 在设计确认后激活。创建独立分支工作区，执行项目初始化，确保测试基线干净。

3. **writing-plans（制定计划）** —— 在设计获批后激活。将任务拆分为 2-5 分钟的小块，每个任务包含准确的文件路径、完整的代码、验证步骤。

4. **subagent-driven-development 或 executing-plans（子代理驱动开发或执行计划）** —— 有了计划后启动。每个任务分配全新子代理，进行两阶段审核（规范符合、代码质量）；或批量执行并检查。

5. **test-driven-development（测试驱动开发）** —— 在实现过程中激活。执行红-绿-重构（RED-GREEN-REFACTOR）：先写失败测试，验证失败，再写最小代码直到通过并提交。删除之前写的无效代码。

6. **requesting-code-review（请求代码审查）** —— 任务间激活。依据计划审查，按严重程度报告问题，严重问题阻止继续。

7. **finishing-a-development-branch（完成开发分支）** —— 全部任务完成激活。验证测试，提供合并/PR/保留/丢弃选项，清理工作区。

**智能体会在每个任务前确认相关技能。** 这些流程是强制执行，不只是建议。

## 技能库

### **测试**

- **test-driven-development** —— 红-绿-重构循环；包含测试反模式参考

### **调试**

- **systematic-debugging** —— 4阶段根因分析（包含根因追踪、防御深入、基于条件等待技术）
- **verification-before-completion** —— 确保问题真正修复

### **协作**

- **brainstorming** —— 苏格拉底式设计完善
- **writing-plans** —— 详细实现计划
- **executing-plans** —— 检查点批量执行
- **dispatching-parallel-agents** —— 并行子代理工作流
- **requesting-code-review** —— 预审查清单
- **receiving-code-review** —— 反馈响应
- **using-git-worktrees** —— 并行开发分支
- **finishing-a-development-branch** —— 合并/PR决策流程
- **subagent-driven-development** —— 快速迭代，双阶段审核（规范合规、代码质量）

### **元技能**

- **writing-skills** —— 创建新技能的方法（含测试方法）
- **using-superpowers** —— 技能系统简介

## 哲学理念

- **测试驱动开发** —— 始终先写测试
- **系统化优于临时** —— 过程优先于猜测
- **降低复杂度** —— 简单是首要目标
- **证据优于承诺** —— 验证通过前不宣称成功

详情阅读：[Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## 更新

插件更新后技能会自动同步：

```bash
/plugin update superpowers
```

## 实现

由于其“纯指令”的设计哲学，核心库几乎**零依赖**。

- **JS 逻辑**：仅使用 Node.js 原生模块（path, fs, os）以保证在不同环境下的极速启动。
- **CLI 工具**：依赖宿主平台（如 Claude Code, Gemini CLI）提供的基础工具（read, write, grep, bash）。

### 整体架构

Superpowers 采用了**分层指令架构**，通过引导层将通用 AI 转化为具备特定流程意识的工程代理：

```
[引导层 (Bootstrap)]
  session-start / using-superpowers → 激活流程意识

[策略层 (Strategy)]
  brainstorming / writing-plans → 将 Idea 转化为可执行的 Plan

[执行层 (Execution)]
  subagent-driven-development / TDD / verification-before-completion → 生产高质量代码

[协作/质量层 (Quality)]
  requesting-code-review / receiving-code-review → 闭环反馈
```

### 核心数据流

该项目的数据流主要是**指令流**和**过程产物**的流转：

```
用户提出需求
  → using-superpowers: 识别任务类型，引导至相应技能
  → brainstorming: 协作对话 → 生成设计规约
    → docs/superpowers/specs/YYYY-MM-DD-feature-design.md
  → writing-plans: 基于规约分解任务 → 生成实施计划
    map out files → create tasks → [YYYY-MM-DD-feature-plan.md]
  → subagent-driven-development: 循环执行计划中的每个 Task
    → 调度 Implementer 子代理 (TDD 循环: test → run → implement → run → commit)
    → 调度 Spec Reviewer 子代理 (核对代码与设计规约的一致性)
    → 调度 Code Quality Reviewer 子代理 (代码风格与模式审查)
  → finishing-a-development-branch: 清理与交付
```
