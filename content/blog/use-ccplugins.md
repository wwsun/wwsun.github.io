---
title: 使用 CCPlugins - Claude Code 插件集
tags:
  - agent-skill
  - claude-code
draft: false
description: 为 Claude Code CLI 提供的专业命令集，每周可节省 2-3 小时的重复开发任务时间。
source: "https://github.com/brennercruvinel/CCPlugins"
date: 2026-03-31T06:02:38.753Z
---

为 Claude Code CLI 提供的专业命令集，每周可节省 2-3 小时的重复开发任务时间。

### 问题所在

😊 让 Claude 修复一个 bug → 得到 15 个测试文件

😤 请求简单的重构 → 收到关于整洁代码的论文

🤪 "请添加一个按钮" → 完整的 UI 框架重写

😭 每次对话 → "表现得像一个不过度设计的高级工程师"

**积极开发通知**：CCPlugins 基于实际使用持续演进。我们彻底测试每个命令，并在发现差距和机会时不断改进。这确保你始终获得经过实战测试、可用于生产环境的工具，解决实际开发者问题。

CCPlugins 是一套精心策划的 24 个专业命令，为 Claude Code CLI 提供企业级开发工作流。这些命令利用 Claude 的上下文理解能力，同时提供结构化、可预测的结果，针对 Opus 4 和 Sonnet 4 模型进行了优化。

---

## 命令

24 个专业命令，针对 Claude Code CLI 的原生能力进行了优化，具有增强的验证和优化阶段。

### 开发工作流

| 命令                          | 描述                                 |
| ----------------------------- | ------------------------------------ |
| `/cleanproject`               | 使用 git 安全机制移除调试产物        |
| `/commit`                     | 智能约定式提交，带分析功能           |
| `/format`                     | 自动检测并应用项目格式化工具         |
| `/scaffold feature-name`      | 从模式生成完整功能                   |
| `/test`                       | 运行测试，智能分析失败原因           |
| `/implement url/path/feature` | 从任何来源导入并适配代码，带验证阶段 |
| `/refactor`                   | 智能代码重构，带验证和段落映射       |

### 代码质量与安全

| 命令               | 描述                                 |
| ------------------ | ------------------------------------ |
| `/review`          | 多代理分析（安全、性能、质量、架构） |
| `/security-scan`   | 扩展思考模式的漏洞分析，带修复跟踪   |
| `/predict-issues`  | 主动问题检测，带时间线估算           |
| `/remove-comments` | 清理明显注释，保留有价值的文档       |
| `/fix-imports`     | 修复重构后损坏的导入                 |
| `/find-todos`      | 定位和整理开发任务                   |
| `/create-todos`    | 基于分析结果添加上下文 TODO 注释     |
| `/fix-todos`       | 智能实现 TODO 修复，带上下文         |

### 高级分析

| 命令                   | 描述                         |
| ---------------------- | ---------------------------- |
| `/understand`          | 分析整个项目架构和模式       |
| `/explain-like-senior` | 高级水平的代码解释，带上下文 |
| `/contributing`        | 完整的贡献就绪分析           |
| `/make-it-pretty`      | 改进可读性，不改变功能       |

### 会话与项目管理

| 命令               | 描述                              |
| ------------------ | --------------------------------- |
| `/session-start`   | 开始带 CLAUDE.md 集成的文档化会话 |
| `/session-end`     | 总结并保留会话上下文              |
| `/docs`            | 智能文档管理和更新                |
| `/todos-to-issues` | 将代码 TODO 转换为 GitHub issues  |
| `/undo`            | 使用 git 检查点安全回滚           |

---

## 增强功能

### 🔍 验证与优化

复杂命令现在包含验证阶段以确保完整性：

```bash
/refactor validate   # 查找剩余旧模式，验证 100% 迁移
/implement validate  # 检查集成完整性，查找遗漏
```

### 扩展思考

复杂场景的高级分析：

- **重构**：大规模更改的深层架构分析
- **安全**：复杂的漏洞检测，带链式分析

### 实用命令集成

自然工作流建议，不过度设计：

- 重大更改后建议 `/test`
- 在逻辑检查点推荐 `/commit`
- 保持用户控制，不自动执行

---

## 真实示例

### `/cleanproject` 之前：

```
src/
├── UserService.js
├── UserService.test.js
├── UserService_backup.js    # 旧版本
├── debug.log               # 调试输出
├── test_temp.js           # 临时测试
└── notes.txt              # 开发笔记
```

### `/cleanproject` 之后：

```
src/
├── UserService.js          # 干净的生产代码
└── UserService.test.js     # 保留实际测试
```

---

## 工作原理

### 高层架构

CCPlugins 通过复杂而优雅的架构将 Claude Code CLI 转变为智能开发助手：

```
开发者 → /command → Claude Code CLI → 命令定义 → 智能执行
    ↑                                                       ↓
    ←←←←←←←←←←←←←←←←← 清晰的反馈与结果 ←←←←←←←←←←←←←←←←←←
```

### 执行流程

当你输入命令时：

1.  **命令加载**：Claude 从 `~/.claude/commands/` 读取 markdown 定义
2.  **上下文分析**：分析你的项目结构、技术栈和当前状态
3.  **智能规划**：根据你的具体情况创建执行策略
4.  **安全执行**：执行操作，自动检查点和验证
5.  **清晰反馈**：提供结果、下一步和任何警告

### 核心架构组件

**智能指令**

- 第一人称对话设计激活协作推理
- 战略思考部分 (`<think>`) 用于复杂决策
- 无需硬编码假设的上下文感知适应

**原生工具集成**

- **Grep**：跨代码库的闪电般快速模式匹配
- **Glob**：智能文件发现和项目映射
- **Read**：全面上下文理解的内容分析
- **Write**：自动备份的安全文件修改
- **TodoWrite**：进度跟踪和任务管理
- **Task**：专业分析的子代理编排

**安全第一设计**

- 破坏性操作前自动 git 检查点
- 跨上下文连续性的会话持久化
- 清晰恢复路径的回滚能力
- 提交或生成内容中无 AI 署名

**通用兼容性**

- 智能自动检测的框架无关性
- 跨平台支持（Windows、Linux、macOS）
- 适用于任何编程语言或技术栈
- 适应项目的约定和模式

### 高级功能

**会话连续性** `/implement` 和 `/refactor` 等命令在 Claude 会话之间保持状态：

```
refactor/                  # 由 /refactor 命令创建
├── plan.md               # 重构路线图
└── state.json            # 已完成的转换

implement/                 # 由 /implement 命令创建
├── plan.md               # 实现进度
└── state.json            # 会话状态和决策

fix-imports/              # 由 /fix-imports 命令创建
├── plan.md               # 导入修复计划
└── state.json            # 解决进度

security-scan/            # 由 /security-scan 命令创建
├── plan.md               # 漏洞和修复
└── state.json            # 修复进度

scaffold/                 # 由 /scaffold 命令创建
├── plan.md               # 脚手架计划
└── state.json            # 创建的文件跟踪
```

**多代理架构** 复杂命令编排专门的子代理：

- 安全分析代理用于漏洞检测
- 性能优化代理用于瓶颈识别
- 架构审查代理用于设计模式分析
- 代码质量代理用于可维护性评估

**性能优化**

- 减少冗长，提高高级开发者效率
- 智能缓存项目分析结果
- 大型代码库的增量处理
- 独立任务的并行执行

---

## 技术说明

### 设计理念

**为什么这种方法有效**（基于 Anthropic 的研究）：

- **对话式命令**：第一人称语言（"我将帮助..."）激活 Claude 的协作推理
- **构建无关指令**：无硬编码工具 = 随处可用
- **思考工具集成**：战略思考将决策提高 50% 以上（Anthropic，2025）
- **仅原生工具**：使用 Claude Code 的实际能力，不是虚构的 API

**核心原则：**

- **简单 > 复杂**：从简单开始，仅在证明必要时添加
- **上下文感知**：命令适应 YOUR 项目，而不是相反
- **安全第一**：任何破坏性操作前的 Git 检查点
- **模式识别**：从你的代码库学习，不是假设

### 技术架构

**原生工具集成：** 所有命令利用 Claude Code CLI 的原生能力：

- Grep 工具用于高效模式匹配
- Glob 工具用于文件发现
- Read 工具用于内容分析
- TodoWrite 用于进度跟踪
- 子代理用于专业分析

**安全第一设计：**

```bash
git add -A
git commit -m "Pre-operation checkpoint" || echo "No changes to commit"
```

**对话界面：** 命令使用第一人称协作语言（"我将分析你的代码..."）而不是命令式指令，创建自然的伙伴关系交互，提高模型性能。

**框架无关：** 无硬编码假设的智能检测，实现跨技术栈的通用兼容性。

### 用户命令指示器

自定义命令在 Claude Code CLI 中显示 `(user)` 标签，以区分内置命令。这是正常的，表示你的命令已正确安装。

```
/commit
    Smart Git Commit (user)    ← 你的自定义命令
/help
    Show help                  ← 内置命令
```

---

## 性能指标

| 任务       | 手动时间   | 使用 CCPlugins | 节省时间 |
| ---------- | ---------- | -------------- | -------- |
| 安全分析   | 45-60 分钟 | 3-5 分钟       | ~50 分钟 |
| 架构审查   | 30-45 分钟 | 5-8 分钟       | ~35 分钟 |
| 功能脚手架 | 25-40 分钟 | 2-3 分钟       | ~30 分钟 |
| Git 提交   | 5-10 分钟  | 30 秒          | ~9 分钟  |
| 代码清理   | 20-30 分钟 | 1 分钟         | ~25 分钟 |
| 导入修复   | 15-25 分钟 | 1-2 分钟       | ~20 分钟 |
| 代码审查   | 20-30 分钟 | 2-4 分钟       | ~20 分钟 |
| 问题预测   | 60+ 分钟   | 5-10 分钟      | ~50 分钟 |
| TODO 解决  | 30-45 分钟 | 3-5 分钟       | ~35 分钟 |
| 代码适配   | 40-60 分钟 | 3-5 分钟       | ~45 分钟 |

**总计：每周节省 4-5 小时，专业级分析**

---

## 要求

- Claude Code CLI
- Python 3.6+（用于安装程序）
- Git（用于版本控制命令）

---

## 高级用法

### 创建自定义命令

通过添加 markdown 文件到 `~/.claude/commands/` 创建你自己的命令：

```markdown
# 我的自定义命令

我将帮助你处理特定的工作流。

[你的指令在这里]
```

### 使用参数

命令通过 `$ARGUMENTS` 支持参数：

```bash
/mycommand some-file.js
# $ARGUMENTS 将包含 "some-file.js"
```

### CI/CD 集成

在自动化工作流中使用命令：

```bash
# 质量管道
claude "/security-scan" && claude "/review" && claude "/test"

# 预提交验证
claude "/format" && claude "/commit"

# 功能开发
claude "/scaffold api-users" && claude "/test"

# 完整工作流
claude "/security-scan" && claude "/create-todos" && claude "/todos-to-issues"

# TODO 解决工作流
claude "/find-todos" && claude "/fix-todos" && claude "/test"
```

### 手动工作流集成

非常适合开发例行程序：

```bash
# 晨间例行
claude "/session-start"
claude "/security-scan"

# 开发期间
claude "/scaffold user-management"
claude "/review"
claude "/format"

# 结束一天
claude "/commit"
claude "/session-end"
```

---

## 安全与 Git 指令

所有与 git 交互的命令都包含安全指令以防止 AI 署名：

**受 git 保护的命令：**

- `/commit`, `/scaffold`, `/make-it-pretty`, `/cleanproject`, `/fix-imports`, `/review`, `/security-scan`
- `/contributing`, `/todos-to-issues`, `/predict-issues`, `/find-todos`, `/create-todos`, `/fix-todos`

这些命令永远不会：

- 添加 "Co-authored-by" 或 AI 签名
- 包含 "Generated with Claude Code" 消息
- 修改 git 配置或凭据
- 在提交/issues 中添加 AI 署名

如有需要，你可以在单个命令文件中修改这些指令。
