---
created: 2026-01-26 17:45
url: https://github.com/Fission-AI/OpenSpec
tags:
  - SDD
  - AI-Code
---
# 快速上手

本指南介绍了在安装并初始化 OpenSpec 之后如何使用它。安装说明请参阅[主 README](../README.md#quick-start)。

安装完成后首先执行 `openspec init`

## 工作原理

OpenSpec 帮助你和 AI 编码助手在编写任何代码之前就达成共识:要构建什么。工作流程遵循一个简单的模式:

```
┌────────────────────┐
│ 开始变更           │  /opsx:new
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 创建工件           │  /opsx:ff 或 /opsx:continue
│ (提案、规格、      │
│  设计、任务)       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 实现任务           │  /opsx:apply
│ (AI 编写代码)      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 归档和合并         │  /opsx:archive
│ 规格               │
└────────────────────┘
```

## OpenSpec 创建的内容

运行 `openspec init` 之后,你的项目将具有以下结构:

```
openspec/
├── specs/              # 真实来源(你的系统行为)
│   └── <domain>/
│       └── spec.md
├── changes/            # 提议的更新(每个变更一个文件夹)
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规格(正在变更的内容)
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置(可选)
```

**两个关键目录:**

- **`specs/`** - 真实来源。这些规格描述了你的系统当前的行为方式。按领域组织(例如 `specs/auth/`、`specs/payments/`)。

- **`changes/`** - 提议的修改。每个变更都有自己的文件夹,包含所有相关的工件。当变更完成时,其规格会合并到主 `specs/` 目录中。

## 理解工件

每个变更文件夹包含指导工作的工件:

| 工件 | 用途 |
|----------|---------|
| `proposal.md` | "为什么"和"是什么" - 捕获意图、范围和方法 |
| `specs/` | 显示 ADDED/MODIFIED/REMOVED 需求的增量规格 |
| `design.md` | "如何做" - 技术方法和架构决策 |
| `tasks.md` | 带复选框的实现检查清单 |

**工件相互构建:**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            在学习中更新
```

在实现过程中了解更多信息后,你始终可以返回并优化早期的工件。

## 增量规格的工作原理

增量规格是 OpenSpec 的核心概念。它们显示相对于当前规格的变更内容。

### 格式

增量规格使用章节来指示变更类型:

```markdown
# Auth 的增量

## ADDED Requirements

### Requirement: 双因素认证
系统必须在登录期间要求第二因素。

#### Scenario: 需要 OTP
- GIVEN 启用了 2FA 的用户
- WHEN 用户提交有效凭证
- THEN 显示 OTP 挑战

## MODIFIED Requirements

### Requirement: 会话超时
系统应在 30 分钟无活动后使会话过期。
(之前: 60 分钟)

#### Scenario: 空闲超时
- GIVEN 已认证的会话
- WHEN 经过 30 分钟无活动
- THEN 会话失效

## REMOVED Requirements

### Requirement: 记住我
(已弃用,改用 2FA)
```

### 归档时发生的事情

当你归档一个变更时:

1. **ADDED** 需求被追加到主规格中
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主规格中删除

变更文件夹移动到 `openspec/changes/archive/` 以保留审计历史。

## 示例: 你的第一个变更

让我们演示如何为应用程序添加暗黑模式。

### 1. 开始变更

```
You: /opsx:new add-dark-mode

AI:  创建了 openspec/changes/add-dark-mode/
     准备创建: proposal
```

### 2. 创建 Artifacts

使用 `/opsx:ff` (快进) 一次性创建所有规划工件:

```
You: /opsx:ff

AI:  为 add-dark-mode 创建工件...
     ✓ proposal.md — 我们为什么做这件事,变更了什么
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方法
     ✓ tasks.md     — 实现检查清单
     准备实现!
```

### 3. 创建的内容

**proposal.md** - 捕获意图:

```markdown
# Proposal: 添加暗黑模式

## Intent
用户要求提供暗黑模式选项,以减少夜间使用时的眼睛疲劳。

## Scope
- 在设置中添加主题切换
- 支持系统偏好检测
- 在 localStorage 中持久化偏好

## Approach
使用 CSS 自定义属性进行主题设置,并使用 React context 进行状态管理。
```

**specs/ui/spec.md** - 显示新需求的增量:

```markdown
# UI 的增量

## ADDED Requirements

### Requirement: 主题选择
系统应允许用户在浅色和暗黑主题之间进行选择。

#### Scenario: 手动切换
- GIVEN 用户在任何页面上
- WHEN 用户点击主题切换
- THEN 主题立即切换
- AND 偏好在会话之间持久化

#### Scenario: 系统偏好
- GIVEN 没有保存偏好的用户
- WHEN 应用程序加载
- THEN 使用系统的首选配色方案
```

**tasks.md** - 实现检查清单:

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 创建带有浅色/暗黑状态的 ThemeContext
- [ ] 1.2 为颜色添加 CSS 自定义属性
- [ ] 1.3 实现 localStorage 持久化

## 2. UI Components
- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 在设置页面添加切换
- [ ] 2.3 更新 Header 以包含快速切换

## 3. Styling
- [ ] 3.1 定义暗黑主题调色板
- [ ] 3.2 更新组件以使用 CSS 变量
```

### 4. 实现

```
You: /opsx:apply

AI:  执行任务...
     ✓ 1.1 创建了带有浅色/暗黑状态的 ThemeContext
     ✓ 1.2 向 globals.css 添加了 CSS 自定义属性
     ✓ 1.3 实现了 localStorage 持久化
     ✓ 2.1 创建了 ThemeToggle 组件
     ...
     所有任务完成!
```

在实现过程中,如果你发现设计需要调整,只需更新工件并继续。

### 5. 归档

```
You: /opsx:archive

AI:  归档 add-dark-mode...
     ✓ 将规格合并到 openspec/specs/ui/spec.md
     ✓ 移动到 openspec/changes/archive/2025-01-24-add-dark-mode/
     完成! 准备下一个功能。
```

你的增量规格现在是主规格的一部分,记录了你的系统的工作方式。

## 验证和审查

使用 CLI 检查你的变更:

```bash
# 列出活动变更
openspec list

# 查看变更详细信息
openspec show add-dark-mode

# 验证规格格式
openspec validate add-dark-mode

# 交互式仪表板
openspec view
```


# 概念

OpenSpec 建立在四个原则之上:

- **流畅而非僵化。** 传统规格系统将你锁定在各个阶段:首先规划,然后实现,然后完成。OpenSpec 更加灵活 — 你可以按任何有意义的顺序创建产物。
- **迭代而非瀑布。** 需求会变化。理解会加深。一开始看起来不错的方法在你看到代码库后可能站不住脚。OpenSpec 拥抱这一现实。
- **简单而非复杂。** 一些规格框架需要大量设置、僵化格式或繁重流程。OpenSpec 不会挡你的路。几秒钟内初始化,立即开始工作,随时自定义。
- **存量场景优先。** 大多数软件工作不是从零开始构建 — 而是修改现有系统。OpenSpec 基于增量(delta)的方法使得指定对现有行为的更改变得容易,而不仅仅是新行为。

## 全局视图

OpenSpec 将你的工作组织到两个主要区域:

```
┌──────────────────────────────────────────────────────────────────┐
│                        openspec/                                 │
│                                                                  │
│   ┌─────────────────────┐      ┌──────────────────────────────┐ │
│   │       specs/        │      │         changes/              │ │
│   │                     │      │                               │ │
│   │  真实来源            │◄─────│  提议的修改                    │ │
│   │  你的系统            │ merge│  每个变更 = 一个文件夹          │ │
│   │  当前如何工作        │      │  包含产物 + 增量               │ │
│   │                     │      │                               │ │
│   └─────────────────────┘      └──────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Specs** 是真实来源 — 它们描述你的系统当前的行为方式。

**Changes** 是提议的修改 — 它们存在于单独的文件夹中,直到你准备好合并它们。

这种分离是关键。你可以并行处理多个变更而不会冲突。你可以在变更影响主 specs 之前审查它。当你归档变更时,其增量会干净地合并。

## Specs

Specs 使用结构化的需求和场景描述你的系统行为。

```
openspec/specs/
├── auth/
│   └── spec.md           # 认证行为
├── payments/
│   └── spec.md           # 支付处理
├── notifications/
│   └── spec.md           # 通知系统
└── ui/
    └── spec.md           # UI 行为和主题
```

按领域组织 specs — 对你的系统有意义的逻辑分组。常见模式:

- **按功能区域**: `auth/`、`payments/`、`search/`
- **按组件**: `api/`、`frontend/`、`workers/`
- **按限界上下文**: `ordering/`、`fulfillment/`、`inventory/`

### Spec 格式

一个 spec 包含需求,每个需求都有场景:

```markdown
# 认证规格

## 目的
应用程序的认证和会话管理。

## 需求

### 需求: 用户认证
系统应当在成功登录时颁发 JWT 令牌。

#### 场景: 有效凭证
- 给定 一个拥有有效凭证的用户
- 当 用户提交登录表单
- 那么 返回一个 JWT 令牌
- 并且 用户被重定向到仪表板

#### 场景: 无效凭证
- 给定 无效凭证
- 当 用户提交登录表单
- 那么 显示错误消息
- 并且 不颁发令牌

### 需求: 会话过期
系统必须在 30 分钟不活动后使会话过期。

#### 场景: 空闲超时
- 给定 一个已认证的会话
- 当 30 分钟没有活动
- 那么 会话被失效
- 并且 用户必须重新认证
```

**关键元素:**

| 元素 | 目的 |
|------|------|
| `## 目的` | 此 spec 领域的高级描述 |
| `### 需求:` | 系统必须具备的特定行为 |
| `#### 场景:` | 需求实际运行的具体示例 |
| SHALL/MUST/SHOULD | RFC 2119 关键字,表示需求强度 |

### 为什么这样构建 Specs

**需求是"什么"** — 它们陈述系统应该做什么,而不指定实现。

**场景是"何时"** — 它们提供可以验证的具体示例。好的场景:
- 可测试的(你可以为它们编写自动化测试)
- 涵盖正常路径和边界情况
- 使用 Given/When/Then 或类似的结构化格式

**RFC 2119 关键字**(SHALL、MUST、SHOULD、MAY)传达意图:
- **MUST/SHALL** — 绝对要求
- **SHOULD** — 推荐,但存在例外
- **MAY** — 可选

## Changes

变更是对系统的提议修改,打包为一个文件夹,包含理解和实现它所需的一切。

```
openspec/changes/add-dark-mode/
├── proposal.md           # 为什么和什么
├── design.md             # 如何(技术方法)
├── tasks.md              # 实现清单
├── .openspec.yaml        # 变更元数据(可选)
└── specs/                # Delta specs
    └── ui/
        └── spec.md       # ui/spec.md 中正在变更的内容
```

每个变更都是自包含的。它有:
- **产物** — 捕获意图、设计和任务的文档
- **Delta specs** — 关于正在添加、修改或删除内容的规格
- **元数据** — 此特定变更的可选配置

### 为什么变更是文件夹

将变更打包为文件夹有几个好处:

1. **所有东西在一起。** 提案、设计、任务和 specs 都在一个地方。无需在不同位置搜索。
2. **并行工作。** 多个变更可以同时存在而不会冲突。在 `fix-auth-bug` 也在进行时处理 `add-dark-mode`。
3. **清晰的历史。** 归档后,变更移至 `changes/archive/`,完整上下文得以保留。你可以回顾并理解不仅是什么改变了,还有为什么。
4. **易于审查。** 变更文件夹易于审查 — 打开它,阅读提案,检查设计,查看 spec 增量。

## Artifacts

产物（artifact）是变更中指导工作的文档。

### 产物流程

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   为什么          什么          如何           要采取
  + 范围          变更          方法           的步骤
```

产物相互构建。每个产物为下一个提供上下文。

### 产物类型

#### 提案 (`proposal.md`)

提案在高层次捕获**意图**、**范围**和**方法**。

```markdown
# 提案: 添加深色模式

## 意图
用户要求提供深色模式选项,以减少夜间使用时的眼睛疲劳
并匹配系统偏好。

## 范围
在范围内:
- 设置中的主题切换
- 系统偏好检测
- 在 localStorage 中持久化偏好

不在范围内:
- 自定义颜色主题(未来工作)
- 每页主题覆盖

## 方法
使用 CSS 自定义属性进行主题化,使用 React context
进行状态管理。在首次加载时检测系统偏好,
允许手动覆盖。
```

**何时更新提案:**
- 范围变化(缩小或扩大)
- 意图澄清(对问题有更好的理解)
- 方法根本转变

#### Specs (在 `specs/` 中的 delta specs)

Delta specs 描述**相对于当前 specs 正在变更的内容**。参见下面的 [[#Delta Specs]]。

#### 设计 (`design.md`)

设计捕获**技术方法**和**架构决策**。

````markdown
# 设计: 添加深色模式

## 技术方法
通过 React Context 管理主题状态以避免属性钻取。
CSS 自定义属性实现运行时切换而无需类切换。

## 架构决策

### 决策: Context 而非 Redux
使用 React Context 管理主题状态,因为:
- 简单的二进制状态(亮/暗)
- 没有复杂的状态转换
- 避免添加 Redux 依赖

### 决策: CSS 自定义属性
使用 CSS 变量而非 CSS-in-JS,因为:
- 与现有样式表兼容
- 没有运行时开销
- 浏览器原生解决方案

## 数据流
```
ThemeProvider (context)
       │
       ▼
ThemeToggle ◄──► localStorage
       │
       ▼
CSS Variables (应用到 :root)
```

## 文件变更
- `src/contexts/ThemeContext.tsx` (新)
- `src/components/ThemeToggle.tsx` (新)
- `src/styles/globals.css` (修改)
```

**何时更新设计:**
- 实现显示方法不可行
- 发现更好的解决方案
- 依赖或约束变化

#### 任务 (`tasks.md`)

任务是**实现清单** — 带复选框的具体步骤。

```markdown
# 任务

## 1. 主题基础设施
- [ ] 1.1 创建带亮/暗状态的 ThemeContext
- [ ] 1.2 为颜色添加 CSS 自定义属性
- [ ] 1.3 实现 localStorage 持久化
- [ ] 1.4 添加系统偏好检测

## 2. UI 组件
- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 在设置页面添加切换
- [ ] 2.3 更新 Header 以包含快速切换

## 3. 样式
- [ ] 3.1 定义深色主题颜色调色板
- [ ] 3.2 更新组件以使用 CSS 变量
- [ ] 3.3 测试可访问性的对比度
````

**任务最佳实践:**
- 在标题下分组相关任务
- 使用分层编号(1.1、1.2 等)
- 保持任务足够小以在一个会话中完成
- 完成任务时勾选

## Delta Specs

Delta specs 是使 OpenSpec 适用于存量需求开发的关键概念。它们描述**正在变更的内容**而不是重述整个 spec。

### 格式

```markdown
# Auth 的 Delta

## ADDED 需求

### 需求: 双因素认证
系统必须支持基于 TOTP 的双因素认证。

#### 场景: 2FA 注册
- 给定 一个未启用 2FA 的用户
- 当 用户在设置中启用 2FA
- 那么 显示用于认证器应用设置的 QR 码
- 并且 用户必须在激活前使用代码验证

#### 场景: 2FA 登录
- 给定 一个启用了 2FA 的用户
- 当 用户提交有效凭证
- 那么 出现 OTP 挑战
- 并且 仅在有效 OTP 后完成登录

## MODIFIED 需求

### 需求: 会话过期
系统必须在 15 分钟不活动后使会话过期。
(之前: 30 分钟)

#### 场景: 空闲超时
- 给定 一个已认证的会话
- 当 15 分钟没有活动
- 那么 会话被失效

## REMOVED 需求

### 需求: 记住我
(已弃用,改用 2FA。用户应在每个会话重新认证。)
```

### Delta 部分

| 部分 | 含义 | 归档时发生什么 |
|------|------|----------------|
| `## ADDED 需求` | 新行为 | 追加到主 spec |
| `## MODIFIED 需求` | 变更的行为 | 替换现有需求 |
| `## REMOVED 需求` | 弃用的行为 | 从主 spec 删除 |

### 为什么用 Deltas 而非完整 Specs

- **清晰度。** delta 准确显示正在变更的内容。阅读完整 spec,你必须在脑海中将其与当前版本进行比较。
- **避免冲突。** 两个变更可以触及同一个 spec 文件而不冲突,只要它们修改不同的需求。
- **审查效率。** 审查者看到变更,而不是未变更的上下文。专注于重要的事情。
- **适合存量需求(Brownfield fit)。** 大多数工作修改现有行为。Deltas 使修改成为一等公民,而非事后想法。

> [!tip] Brownfield fit
> 在软件开发和系统工程的文档中，**“Brownfield”**（棕地项目）是一个非常核心的概念，它通常用来描述**在现有系统、旧代码库或已运行的基础设施之上进行开发**的情况。
> 与此对应的是 **Greenfield (绿地):**  想象一片荒废的草地，你可以从零开始建造任何东西。没有历史包袱，没有兼容性问题，可以使用最新的技术栈。

## Schemas

模式定义工作流程的产物类型及其依赖关系。

### 模式如何工作

```yaml
# openspec/schemas/spec-driven/schema.yaml
name: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # 无依赖,可以首先创建

  - id: specs
    generates: specs/**/*.md
    requires: [proposal]      # 创建前需要提案

  - id: design
    generates: design.md
    requires: [proposal]      # 可以与 specs 并行创建

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # 首先需要 specs 和 design
```

**产物形成依赖图:**

```
                    proposal
                   (根节点)
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
      specs                       design
   (requires:                  (requires:
    proposal)                   proposal)
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
                    tasks
                (requires:
                specs, design)
```

**依赖是赋能者,而非门槛。** 它们展示可以创建什么,而不是接下来必须创建什么。如果不需要,你可以跳过设计。你可以在设计之前或之后创建 specs。

### 内置模式

**spec-driven**(默认)

规格驱动开发的标准工作流程:

```
proposal → specs → design → tasks → implement
```

最适合: 大多数希望在实现前就 specs 达成一致的功能工作。

**tdd**

测试驱动开发工作流程:

```
spec → tests → implementation → docs
```

最适合: 在实现前编写测试的实践 TDD 的团队。

### 自定义模式

为你的团队工作流程创建自定义模式:

```bash
# 从头创建
openspec schema init research-first

# 或复制现有模式
openspec schema fork spec-driven research-first
```

**自定义模式示例:**

```yaml
# openspec/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: []           # 首先做研究

  - id: proposal
    generates: proposal.md
    requires: [research]   # 基于研究的提案

  - id: tasks
    generates: tasks.md
    requires: [proposal]   # 跳过 specs/design,直接到任务
```

有关创建和使用自定义模式的完整详情,请参阅[自定义](customization.md)。

## Archives

归档通过将其 delta specs 合并到主 specs 中并为历史保留变更来完成变更。

### 归档时发生什么

```
归档前:

openspec/
├── specs/
│   └── auth/
│       └── spec.md ◄────────────────┐
└── changes/                         │
    └── add-2fa/                     │
        ├── proposal.md              │
        ├── design.md                │ merge
        ├── tasks.md                 │
        └── specs/                   │
            └── auth/                │
                └── spec.md ─────────┘


归档后:

openspec/
├── specs/
│   └── auth/
│       └── spec.md        # 现在包括 2FA 需求
└── changes/
    └── archive/
        └── 2025-01-24-add-2fa/    # 为历史保留
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/
                └── auth/
                    └── spec.md
```

### 归档流程

1. **合并 deltas。** 每个 delta spec 部分(ADDED/MODIFIED/REMOVED)应用到相应的主 spec。
2. **移至归档。** 变更文件夹移至 `changes/archive/`,带日期前缀以按时间顺序排列。
3. **保留上下文。** 所有产物在归档中保持完整。你总是可以回顾以理解为什么做出变更。

### 为什么归档重要

**清晰状态。** 活跃变更(`changes/`)仅显示进行中的工作。已完成的工作移出。

**审计跟踪。** 归档保留每个变更的完整上下文 — 不仅是什么改变了,还有解释为什么的提案、解释如何的设计以及显示所做工作的任务。

**Spec 演进。** 随着变更的归档,Specs 有机增长。每次归档合并其 deltas,随着时间推移建立全面的规格。

## 它们如何结合在一起

```
┌──────────────────────────────────────────────────────────────────┐
│                          OPENSPEC 流程                            │
│                                                                  │
│   ┌────────────────┐                                             │
│   │  1. 开始       │  /opsx:new 创建变更文件夹                    │
│   │     变更       │                                             │
│   └───────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌────────────────┐                                             │
│   │  2. 创建       │  /opsx:ff 或 /opsx:continue                 │
│   │     产物       │  创建 proposal → specs → design → tasks     │
│   │                │  (基于模式依赖)                              │
│   └───────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌────────────────┐                                             │
│   │  3. 实现       │  /opsx:apply                                │
│   │     任务       │  完成任务,勾选它们                           │
│   │                │◄──── 边学习边更新产物                       │
│   └───────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌────────────────┐                                             │
│   │  4. 验证       │  /opsx:verify (可选)                        │
│   │     工作       │  检查实现是否匹配 specs                      │
│   └───────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌────────────────┐     ┌──────────────────────────────────┐   │
│   │  5. 归档       │────►│  Delta specs 合并到主 specs       │   │
│   │     变更       │     │  变更文件夹移至 archive/          │   │
│   └────────────────┘     │  Specs 现在是更新的真实来源       │   │
│                          └──────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**良性循环:**

1. Specs 描述当前行为
2. Changes 提议修改(作为 deltas)
3. 实现使变更成为现实
4. 归档将 deltas 合并到 specs
5. Specs 现在描述新行为
6. 下一个变更基于更新的 specs 构建

## 术语表

| 术语 | 定义 |
|------|------|
| **产物 (Artifact)** | 变更中的文档(proposal、design、tasks 或 delta specs) |
| **归档 (Archive)** | 完成变更并将其 deltas 合并到主 specs 的过程 |
| **变更 (Change)** | 对系统的提议修改,打包为带产物的文件夹 |
| **Delta spec** | 描述相对于当前 specs 的变更(ADDED/MODIFIED/REMOVED)的 spec |
| **领域 (Domain)** | specs 的逻辑分组(例如 `auth/`、`payments/`) |
| **需求 (Requirement)** | 系统必须具备的特定行为 |
| **场景 (Scenario)** | 需求的具体示例,通常采用 Given/When/Then 格式 |
| **模式 (Schema)** | 产物类型及其依赖关��的定义 |
| **Spec** | 描述系统行为的规格,包含需求和场景 |
| **真实来源 (Source of truth)** | `openspec/specs/` 目录,包含当前商定的行为 |

## 下一步

- [快速开始](getting-started.md) - 实用的第一步
- [工作流程](workflows.md) - 常见模式以及何时使用每种模式
- [命令](commands.md) - 完整命令参考
- [自定义](customization.md) - 创建自定义模式并配置你的项目

# Workflow

https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md

## 理念:行动,而非阶段

传统工作流程强制你按阶段进行:规划、实现、完成。但真实的工作并不会整齐地装进盒子里。

OPSX 采用了不同的方法:

```text
传统方式(阶段锁定):

  规划 ────────► 实现 ────────► 完成
      │              │
      │ "无法回退"    │
      └──────────────┘

OPSX (流畅的行动):

  提案 ──► 规格 ──► 设计 ──► 任务 ──► 实现
```

**核心原则:**

- **行动,而非阶段** - 命令是你可以执行的操作,而不是你被困住的阶段
- **依赖是赋能者** - 它们展示什么是可能的,而不是接下来必须做什么

> **自定义:** OPSX 工作流程由定义产物序列的模式驱动。有关创建自定义模式的详细信息,请参阅[自定义](customization.md)。

## 工作流程模式

### 快速功能

当你明确知道要构建什么并只需执行时:

```text
/opsx:new ──► /opsx:ff ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

**示例对话:**

```text
你:  /opsx:new add-logout-button

AI:  已创建 openspec/changes/add-logout-button/
     准备创建: proposal

你:  /opsx:ff

AI:  正在创建所有规划产物...
     ✓ proposal.md
     ✓ specs/
     ✓ design.md
     ✓ tasks.md
     准备好实现了!

你:  /opsx:apply

AI:  正在处理任务...
     ✓ 在 header 中添加了登出按钮
     ✓ 实现了会话清除
     ✓ 添加了确认对话框
     所有任务完成!

你:  /opsx:archive

AI:  ✓ 已合并 specs
     ✓ 已归档变更
```

**最适合:** 中小型功能、bug 修复、简单直接的变更。

### 探索式

当需求不明确或需要先调研时:

```text
/opsx:explore ──► /opsx:new ──► /opsx:continue ──► ... ──► /opsx:apply
```

**示例对话:**

```text
你:  /opsx:explore

AI:  你想探索什么?

你:  我想改善页面加载性能,但不确定瓶颈在哪里。

AI:  让我帮你调查一下...
     [分析打包大小、识别慢查询、审查组件渲染模式]

     我发现了三个主要瓶颈:
     1. 未优化的大图片
     2. ProductList 中的同步数据获取
     3. 上下文变更导致的重新渲染

     你想先解决哪个?

你:  我们先解决数据获取的问题。

你:  /opsx:new optimize-product-list-fetching

AI:  已创建变更。准备创建: proposal

你:  /opsx:continue

AI:  基于我们的探索创建提案...
     [编写包含调查见解的提案]

     准备创建: specs, design
     接下来你想要哪个?

你:  /opsx:continue

AI:  正在创建 specs...
```

**最适合:** 性能优化、调试、架构决策、不明确的需求。

### 并行变更

同时处理多个变更:

```text
变更 A: /opsx:new ──► /opsx:ff ──► /opsx:apply (进行中)
                                         │
                                    切换上下文
                                         │
变更 B: /opsx:new ──► /opsx:ff ──────► /opsx:apply
```

**示例对话:**

```text
你:  我正在处理 add-dark-mode 但被拉去修 bug

你:  /opsx:new fix-login-redirect

AI:  已创建 openspec/changes/fix-login-redirect/

你:  /opsx:ff

AI:  ✓ 已创建规划产物

你:  /opsx:apply

AI:  正在处理 fix-login-redirect...
     [实现修复]
     所有任务完成!

你:  /opsx:archive

AI:  ✓ 已归档 fix-login-redirect

你:  让我们回到深色模式

你:  /opsx:apply add-dark-mode

AI:  恢复 add-dark-mode...
     从任务 2.3 继续: 更新 Header...
```

**最适合:** 并行工作流、紧急中断、团队协作。

当你有多个已完成的变更时,使用 `/opsx:bulk-archive`:

```text
你:  /opsx:bulk-archive

AI:  发现 3 个已完成的变更:
     - add-dark-mode (所有任务完成)
     - fix-login-redirect (所有任务完成)
     - update-footer (所有任务完成)

     检查 spec 冲突...
     ⚠ add-dark-mode 和 update-footer 都涉及 specs/ui/

     检查代码库以解决...
     两个变更都已实现。将按时间顺序应用。

     归档所有 3 个变更?

你:  是

AI:  ✓ 已归档 add-dark-mode
     ✓ 已归档 fix-login-redirect
     ✓ 已归档 update-footer
     按顺序合并 specs: add-dark-mode → update-footer
```

批量归档会检测多个变更是否触及相同的 specs,并通过检查实际实现内容来解决冲突。

### 完成变更

推荐的完成流程:

```text
/opsx:apply ──► /opsx:verify ──► /opsx:archive
                    │                 │
              验证实现          如需要则提示
                               同步
```

#### Verify: 检查你的工作

`/opsx:verify` 从三个维度验证实现是否符合产物:

```text
你:  /opsx:verify

AI:  正在验证 add-auth...

     完整性
     ✓ tasks.md 中的所有 12 个任务都已勾选
     ✓ specs 中的所有需求都有对应代码
     ⚠ 场景 "Session timeout after inactivity" 未测试

     正确性
     ✓ 实现符合 spec 意图
     ✓ 已处理场景中的边界情况
     ✓ 错误状态符合 spec 定义

     一致性
     ✓ 设计决策体现在代码结构中
     ✓ 命名约定与 design.md 一致
     ⚠ 设计提到 "事件驱动" 但实现使用轮询

     总结
     ─────────────────────────────
     严重问题: 0
     警告: 2
     准备归档: 是 (有警告)

     建议:
     1. 为会话超时场景添加测试
     2. 考虑重构为事件驱动以符合设计,或更新 design.md
```

**verify 检查内容:**

| 维度 | 验证内容 |
|------|---------|
| 完整性 | 所有任务完成、所有需求已实现、场景已覆盖 |
| 正确性 | 实现符合 spec 意图、边界情况已处理 |
| 一致性 | 设计决策体现在代码中、模式保持一致 |

Verify 不会阻止归档,但会暴露你可能想先解决的问题。

#### Archive: 完成变更

`/opsx:archive` 完成变更并将其移至归档:

```text
你:  /opsx:archive

AI:  正在归档 add-auth...

     产物状态:
     ✓ proposal.md 存在
     ✓ specs/ 存在
     ✓ design.md 存在
     ✓ tasks.md 存在 (12/12 任务完成)

     Delta specs: 尚未同步到主分支
     → 你想现在同步吗?

你:  是

AI:  ✓ 已同步 specs 到 openspec/specs/auth/spec.md
     ✓ 已移至 openspec/changes/archive/2025-01-24-add-auth/

     变更已成功归档。
```

如果 specs 未同步,Archive 会提示。它不会因未完成的任务而阻止,但会警告你。

## 何时使用什么

### `/opsx:ff` vs `/opsx:continue`

| 情况 | 使用 |
|------|------|
| 需求明确,准备构建 | `/opsx:ff` |
| 探索中,想审查每一步 | `/opsx:continue` |
| 想在 specs 之前迭代提案 | `/opsx:continue` |
| 时间紧迫,需要快速推进 | `/opsx:ff` |
| 复杂变更,想要控制 | `/opsx:continue` |

**经验法则:** 如果你能预先描述完整范围,使用 `/opsx:ff`。如果你在过程中摸索,使用 `/opsx:continue`。

### 何时更新 vs 重新开始

一个常见问题:何时更新现有变更可以,何时应该开始新变更?

**更新现有变更的情况:**

- 相同意图,优化执行
- 范围缩小 (先 MVP,其余稍后)
- 学习驱动的修正 (代码库不是你预期的样子)
- 基于实现发现的设计调整

**开始新变更的情况:**

- 意图根本改变
- 范围扩大到完全不同的工作
- 原始变更可以独立标记为 "完成"
- 补丁会造成混淆而非澄清

```text
                     ┌─────────────────────────────────────┐
                     │     这是相同的工作吗?                │
                     └──────────────┬──────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          相同意图?          >50% 重叠?         原始变更能否
          相同问题?          相同范围?          在没有这些改动
                 │                  │          的情况下 "完成"?
                 │                  │                  │
       ┌────────┴────────┐  ┌──────┴──────┐   ┌───────┴───────┐
       │                 │  ���             │   │               │
      是                否  是            否  否              是
       │                 │  │             │   │               │
       ▼                 ▼  ▼             ▼   ▼               ▼
    更新              新变更 更新        新变更 更新          新变更
```

**示例: "添加深色模式"**

- "还需要支持自定义主题" → 新变更 (范围扩大)
- "系统偏好检测比预期困难" → 更新 (相同意图)
- "先发布切换功能,稍后添加偏好设置" → 更新后归档,然后新变更

## 最佳实践

### 保持变更专注

每个变更对应一个逻辑工作单元。如果你在做 "添加功能 X 同时重构 Y",考虑分成两个独立的变更。

**为什么重要:**
- 更容易审查和理解
- 更清晰的归档历史
- 可以独立发布
- 需要时回滚更简单

### 对不明确的需求使用 `/opsx:explore`

在承诺进行变更之前,先探索问题空间:

```text
你:  /opsx:explore

AI:  你想探索什么?

你:  我们应该如何为 API 处理速率限制?

AI:  让我调查一下你当前的设置和选项...
     [研究代码库,考虑模式]

     我看到可以采用三种方法:
     1. 基于中间件 (简单,每个端点)
     2. 基于 Redis (可扩展,共享状态)
     3. 每个用户的令牌桶 (公平,复杂)

     你当前的技术栈建议 #1 或 #2。你的规模是多大?
```

探索在创建产物之前澄清思路。

### 归档前验证

使用 `/opsx:verify` 检查实现是否符合产物:

```text
你:  /opsx:verify

AI:  正在验证 add-dark-mode...

     ✓ tasks.md 中的所有任务都已勾选
     ✓ specs 中的需求有对应代码
     ✓ 设计决策体现在实现中

     准备归档!
```

在关闭变更之前捕获不匹配。

### 清晰命名变更

好的命名使 `openspec list` 更有用:

```text
好的:                          避免:
add-dark-mode                  feature-1
fix-login-redirect             update
optimize-product-query         changes
implement-2fa                  wip
```

## 命令快速参考

完整的命令详情和选项,请参阅[命令](commands.md)。

| 命令 | 目的 | 何时使用 |
|------|------|----------|
| `/opsx:explore` | 思考想法 | 需求不明确、调研 |
| `/opsx:new` | 开始变更 | 开始任何新工作 |
| `/opsx:continue` | 创建下一个产物 | 逐步创建产物 |
| `/opsx:ff` | 创建所有规划产物 | 范围明确,准备构建 |
| `/opsx:apply` | 实现任务 | 准备编写代码 |
| `/opsx:verify` | 验证实现 | 归档前,捕获不匹配 |
| `/opsx:sync` | 合并 delta specs | 可选—归档时会在需要时提示 |
| `/opsx:archive` | 完成变更 | 所有工作完成 |
| `/opsx:bulk-archive` | 归档多个变更 | 并行工作,批量完成 |
# 自定义


OpenSpec 提供三个级别的自定义:

| 级别 | 作用 | 最适合 |
|------|------|--------|
| **项目配置** | 设置默认值,注入上下文/规则 | 大多数团队 |
| **自定义模式** | 定义你自己的工作流程产物 | 具有独特流程的团队 |
| **全局覆盖** | 在所有项目间共享模式 | 高级用户 |

---

## 项目配置

`openspec/config.yaml` 文件是为团队自定义 OpenSpec 的最简单方法。它允许你:

- **设置默认模式** - 在每个命令上跳过 `--schema`
- **注入项目上下文** - AI 了解你的技术栈、约定等
- **添加每个产物的规则** - 针对特定产物的自定义规则

### 快速设置

```bash
openspec init
```

这会引导你交互式地创建配置。或手动创建:

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  技术栈: TypeScript, React, Node.js, PostgreSQL
  API 风格: RESTful, 记录在 docs/api.md
  测试: Jest + React Testing Library
  我们重视所有公共 API 的向后兼容性

rules:
  proposal:
    - 包含回滚计划
    - 识别受影响的团队
  specs:
    - 使用 Given/When/Then 格式
    - 在发明新模式之前参考现有模式
```

### 它如何工作

**默认模式:**

```bash
# 没有配置
openspec new change my-feature --schema spec-driven

# 有配置 - 模式自动
openspec new change my-feature
```

**上下文和规则注入:**

生成任何产物时,你的上下文和规则会被注入到 AI 提示中:

```xml
<context>
技术栈: TypeScript, React, Node.js, PostgreSQL
...
</context>

<rules>
- 包含回滚计划
- 识别受影响的团队
</rules>

<template>
[模式的内置模板]
</template>
```

- **上下文**出现在所有产物中
- **规则**仅出现在匹配的产物中

### 模式解析顺序

当 OpenSpec 需要模式时,它按此顺序检查:

1. CLI 标志: `--schema <name>`
2. 变更元数据(变更文件夹中的 `.openspec.yaml`)
3. 项目配置(`openspec/config.yaml`)
4. 默认(`spec-driven`)

---

## 自定义模式

当项目配置不够时,创建你自己的模式以拥有完全自定义的工作流程。自定义模式存在于项目的 `openspec/schemas/` 目录中,并与代码一起进行版本控制。

```text
your-project/
├── openspec/
│   ├── config.yaml        # 项目配置
│   ├── schemas/           # 自定义模式存放在这里
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── changes/           # 你的变更
└── src/
```

### 复制现有模式

最快的自定义方式是复制内置模式:

```bash
openspec schema fork spec-driven my-workflow
```

这会将整个 `spec-driven` 模式复制到 `openspec/schemas/my-workflow/`,你可以自由编辑它。

**你得到的内容:**

```text
openspec/schemas/my-workflow/
├── schema.yaml           # 工作流程定义
└── templates/
    ├── proposal.md       # proposal 产物的模板
    ├── spec.md           # specs 的模板
    ├── design.md         # design 的模板
    └── tasks.md          # tasks 的模板
```

现在编辑 `schema.yaml` 来更改工作流程,或编辑模板来更改 AI 生成的内容。

### 从头创建模式

对于完全全新的工作流程:

```bash
# 交互式
openspec schema init research-first

# 非交互式
openspec schema init rapid \
  --description "快速迭代工作流程" \
  --artifacts "proposal,tasks" \
  --default
```

### 模式结构

模式定义工作流程中的产物及它们之间的依赖关系:

```yaml
# openspec/schemas/my-workflow/schema.yaml
name: my-workflow
version: 1
description: 我团队的自定义工作流程

artifacts:
  - id: proposal
    generates: proposal.md
    description: 初始提案文档
    template: proposal.md
    instruction: |
      创建一个解释为什么需要此变更的提案。
      关注问题,而不是解决方案。
    requires: []

  - id: design
    generates: design.md
    description: 技术设计
    template: design.md
    instruction: |
      创建一个解释如何实现的设计文档。
    requires:
      - proposal    # 在 proposal 存在之前无法创建 design

  - id: tasks
    generates: tasks.md
    description: 实现清单
    template: tasks.md
    requires:
      - design

apply:
  requires: [tasks]
  tracks: tasks.md
```

**关键字段:**

| 字段 | 目的 |
|------|------|
| `id` | 唯一标识符,用于命令和规则 |
| `generates` | 输出文件名(支持如 `specs/**/*.md` 的 glob) |
| `template` | `templates/` 目录中的模板文件 |
| `instruction` | 创建此产物的 AI 指令 |
| `requires` | 依赖 - 必须首先存在哪些产物 |

### 模板

模板是指导 AI 的 markdown 文件。它们在创建该产物时被注入到提示中。

```markdown
<!-- templates/proposal.md -->
## 为什么

<!-- 解释此变更的动机。这解决了什么问题? -->

## 变更内容

<!-- 描述将发生什么变化。具体说明新功能或修改。 -->

## 影响

<!-- 受影响的代码、API、依赖、系统 -->
```

模板可以包括:
- AI 应填写的部分标题
- 带有 AI 指导的 HTML 注释
- 显示预期结构的示例格式

### 验证你的模式

在使用自定义模式之前,验证它:

```bash
openspec schema validate my-workflow
```

这会检查:
- `schema.yaml` 语法是否正确
- 所有引用的模板是否存在
- 没有循环依赖
- 产物 ID 是否有效

### 使用你的自定义模式

创建后,使用你的模式:

```bash
# 在命令中指定
openspec new change feature --schema my-workflow

# 或在 config.yaml 中设置为默认
schema: my-workflow
```

### 调试模式解析

不确定正在使用哪个模式? 检查:

```bash
# 查看特定模式从哪里解析
openspec schema which my-workflow

# 列出所有可用模式
openspec schema which --all
```

输出显示它是来自你的项目、用户目录还是包:

```text
Schema: my-workflow
Source: project
Path: /path/to/project/openspec/schemas/my-workflow
```

---

> **注意:** OpenSpec 还支持位于 `~/.local/share/openspec/schemas/` 的用户级模式,用于跨项目共享,但建议使用 `openspec/schemas/` 中的项目级模式,因为它们会进行版本控制。

---

## 示例

### 快速迭代工作流程

用于快速迭代的最小工作流程:

```yaml
# openspec/schemas/rapid/schema.yaml
name: rapid
version: 1
description: 最小开销的快速迭代

artifacts:
  - id: proposal
    generates: proposal.md
    description: 快速提案
    template: proposal.md
    instruction: |
      为此变更创建简短提案。
      关注什么和为什么,跳过详细 specs。
    requires: []

  - id: tasks
    generates: tasks.md
    description: 实现清单
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### 添加审查产物

复制默认模式并添加审查步骤:

```bash
openspec schema fork spec-driven with-review
```

然后编辑 `schema.yaml` 添加:

```yaml
  - id: review
    generates: review.md
    description: 实现前审查清单
    template: review.md
    instruction: |
      基于设计创建审查清单。
      包括安全性、性能和测试考虑。
    requires:
      - design

  - id: tasks
    # ... 现有 tasks 配置 ...
    requires:
      - specs
      - design
      - review    # 现在 tasks 也需要 review
```

