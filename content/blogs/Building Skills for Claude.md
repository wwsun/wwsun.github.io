---
title: Agent Skills 构建指南
tags:
  - agent
  - skills
  - claude
draft: false
description: Claude Agent Skills 构建完全指南
source: https://claude.com/blog/complete-guide-to-building-skills-for-claude
---
## 引言

Skill（技能）是一组指令——以一个简单文件夹的形式打包——用来教 Claude 如何处理特定任务或工作流。Skill 是为你的特定需求定制 Claude 的最强大方式之一。你不必在每次对话中反复解释你的偏好、流程和领域知识；Skill 让你只需教一次，以后每次都能受益。

当你有可重复的工作流时，Skill 尤其强大：例如从规格生成前端设计、以一致的方法做研究、创建符合团队风格指南的文档，或编排多步骤流程。Skill 也能与 Claude 内置能力（如代码执行、文档创建）很好配合。对于构建 MCP 集成的人来说，Skill 还能再加一层强力能力：把“原始的工具访问”变成“可靠、优化的工作流”。

本指南覆盖你构建有效 Skill 所需了解的一切——从规划与结构，到测试与分发。无论你是为自己、团队还是社区构建 Skill，你都能在文中看到实用模式与真实示例。

### 你将学到什么
- Skill 结构的技术要求与最佳实践  
- 独立 Skill 与 MCP 增强型工作流的模式  
- 我们观察到在不同用例中效果良好的模式  
- 如何测试、迭代和分发你的 Skill  

### 适用人群
- 希望 Claude 能持续遵循特定工作流的开发者  
- 希望 Claude 能持续遵循特定工作流的高级用户  
- 希望在组织内标准化 Claude 工作方式的团队  

### 阅读本指南的两条路径

- 构建独立 Skill？重点阅读：**基础**、**规划与设计**，以及**类别 1–2**。  
- 增强 MCP 集成？重点阅读：“**Skills + MCP**”部分与**类别 3**。  
两条路径共享相同技术要求，你可按自身用例选择相关内容。

### 你将获得什么
读完后，你将能在一次坐下来完成一个可用 Skill。用 skill-creator 构建并测试第一个可工作的 Skill，预计约 **15–30 分钟**。

让我们开始。

---

# 第 1 章：基础

## 什么是 Skill？

一个 Skill 是一个文件夹，包含：
- **SKILL.md（必需）**：带 YAML frontmatter 的 Markdown 指令
- **scripts/（可选）**：可执行代码（Python、Bash 等）
- **references/（可选）**：按需加载的文档
- **assets/（可选）**：输出用模板、字体、图标等

## 核心设计原则

### 1）渐进式披露（Progressive Disclosure）
Skills 使用三层系统：
- **第一层（YAML frontmatter）**：始终加载在 Claude 的系统提示中。只提供足够信息，让 Claude 知道何时使用该 Skill，而不把所有内容都加载进上下文。
- **第二层（SKILL.md 正文）**：当 Claude 认为该 Skill 与当前任务相关时加载。包含完整指令与指导。
- **第三层（链接文件）**：Skill 目录中捆绑的额外文件，Claude 仅在需要时自行导航与读取。

这种渐进式披露能在保持专业知识的同时最小化 token 使用。

### 2）可组合性（Composability）
Claude 可以同时加载多个 Skill。你的 Skill 应能与其他 Skill 共存，不要假设它是唯一能力。

### 3）可移植性（Portability）
Skills 在 Claude.ai、Claude Code 与 API 上行为一致。只要运行环境支持 Skill 所需依赖，你只需创建一次即可跨界面使用，无需修改。

---

## 面向 MCP 构建者：Skills + Connectors

> 💡 不用 MCP、只构建独立 Skill？可先跳到“规划与设计”，之后再回来看这一节。

如果你已经有可用的 MCP server，难点已解决。Skill 是其上的“知识层”——把你已掌握的工作流与最佳实践固化下来，让 Claude 能持续一致地应用。

### 厨房类比
- **MCP 提供专业厨房**：工具、食材、设备的访问  
- **Skill 提供食谱**：如何一步步做出有价值结果的指令  

两者结合，让用户无需自己摸索每一步，也能完成复杂任务。

### 它们如何协同
- **MCP（连接性）**：把 Claude 连接到你的服务（Notion、Asana、Linear 等）；提供实时数据访问与工具调用；回答“Claude 能做什么”
- **Skills（知识）**：教 Claude 如何高效使用你的服务；沉淀工作流与最佳实践；回答“Claude 应该怎么做”

### 为什么这对你的 MCP 用户很重要
没有 Skill：
- 用户连上 MCP 但不知道接下来做什么  
- 支持工单：“如何用你的集成做 X？”  
- 每次对话都从零开始  
- 因提示不同导致结果不一致  
- 用户把问题归咎于 connector，但实际缺的是工作流指导  

有 Skill：
- 需要时自动激活预置工作流  
- 工具使用一致且可靠  
- 每次交互都内置最佳实践  
- 降低集成学习成本  

---

# 第 2 章：Planning and design

## 从用例开始
在写任何代码之前，先确定你的 Skill 应支持 **2–3 个具体用例**。

良好的用例定义示例：

**用例：项目 Sprint 规划**  
**触发**：用户说“帮我规划这个 sprint”或“创建 sprint 任务”  
**步骤**：  
1. 通过 MCP 从 Linear 拉取当前项目状态  
2. 分析团队速度与容量  
3. 建议任务优先级  
4. 在 Linear 中创建任务，带正确标签与估算  
**结果**：完成规划的 sprint，任务已创建

自问：
- 用户想完成什么？
- 需要哪些多步骤工作流？
- 需要哪些工具（内置或 MCP）？
- 需要内置哪些领域知识或最佳实践？

## 常见 Skill 用例类别

在 Anthropic，我们观察到三类常见用例：

### 类别 1：文档与资产创建

用于：创建一致、高质量输出（文档、演示、应用、设计、代码等）。  
真实例子：frontend-design skill（另见 docx、pptx、xlsx、ppt 等 Skill）

示例描述：  
“创建独特、可用于生产的前端界面，具有高设计质量。用于构建 Web 组件、页面、制品、海报或应用。”

关键技巧：
- 内嵌风格指南与品牌规范  
- 模板结构保证输出一致  
- 交付前质量检查清单  
- 不需外部工具——利用 Claude 内置能力  

### 类别 2：工作流自动化
用于：收益于一致方法论的多步骤流程，包括跨多个 MCP server 的协调。  
真实例子：skill-creator skill

示例描述：  
“创建新 Skill 的交互式指南：引导用户做用例定义、frontmatter 生成、指令编写与校验。”

关键技巧：
- 带验证关卡的分步流程  
- 常见结构模板  
- 内置审查与改进建议  
- 迭代式精炼循环  

### 类别 3：MCP 增强

用于：为 MCP server 提供的工具访问补充“工作流指导”。  
真实例子：sentry-code-review skill（Sentry）

示例描述：  
“使用 Sentry 的错误监控数据（经其 MCP server）自动分析并修复 GitHub PR 中检测到的 bug。”

关键技巧：
- 顺序协调多个 MCP 调用  
- 内嵌领域专业知识  
- 提供用户原本需要额外说明的上下文  
- 常见 MCP 问题的错误处理  

## 定义成功标准
你如何判断 Skill 在工作？这些是“期望目标/粗略基准”，不是精确阈值。我们正在开发更健壮的度量指南与工具。

### 定量指标
- **Skill 在 90% 相关查询上触发**  
  - 测量：跑 10–20 个应触发的测试查询，统计自动加载 vs 需要手动调用的次数
- **在 X 次工具调用内完成工作流**  
  - 测量：同一任务，比较启用 Skill 与不启用 Skill 的工具调用次数与 token 消耗
- **每个工作流 0 次失败 API 调用**  
  - 测量：测试时监控 MCP server 日志，统计重试率与错误码

### 定性指标
- 用户不需要提示 Claude 下一步该做什么  
  - 测试时记录你需要重定向/澄清的频率，并收集 beta 用户反馈
- 工作流无需用户纠正即可完成  
  - 同一请求跑 3–5 次，比较输出结构一致性与质量
- 跨会话结果一致  
  - 新用户是否能在最少指导下第一次就完成任务？

---

## 技术要求

### 文件结构
```
your-skill-name/
├── SKILL.md # 必需 - 主技能文件
├── scripts/ # 可选 - 可执行代码
│   ├── process_data.py # 示例
│   └── validate.sh # 示例
├── references/ # 可选 - 文档
│   ├── api-guide.md # 示例
│   └── examples/ # 示例
└── assets/ # 可选 - 模板等
    └── report-template.md # 示例
```

### 关键规则

**SKILL.md 命名：**
- 必须严格为 `SKILL.md`（区分大小写）
- 不接受变体（`SKILL.MD`、`skill.md` 等）

**技能文件夹命名：**
- 使用 kebab-case：`notion-project-setup` ✅  
- 不要空格：`Notion Project Setup` ❌  
- 不要下划线：`notion_project_setup` ❌  
- 不要大写：`NotionProjectSetup` ❌  

**不要在技能文件夹内放 README.md：**
- 技能文件夹内不要包含 `README.md`
- 文档应放在 `SKILL.md` 或 `references/`
- 注：通过 GitHub 分发时，仓库层面的 README 仍然需要（面向人类），见“分发与分享”

---

## YAML frontmatter：最重要的部分
YAML frontmatter 决定 Claude 是否加载你的 Skill。一定要写对。

### 最小必需格式
```yaml
---
name: your-skill-name
description: 它做什么。用于用户询问到 [具体短语] 时。
---
```

### 字段要求

**name（必需）：**
- 只能 kebab-case
- 无空格、无大写
- 应与文件夹名匹配

**description（必需）：**
- 必须同时包含：
  - 该 Skill 做什么
  - 何时使用（触发条件）
- 少于 1024 字符
- 不含 XML 标签（`<` 或 `>`）
- 包含用户可能会说的具体任务表达
- 若相关，请提到文件类型

**license（可选）：**
- 开源时使用
- 常见：MIT、Apache-2.0

**compatibility（可选）：**
- 1–500 字符
- 说明环境要求：目标产品、所需系统包、网络访问需求等

**metadata（可选）：**
- 任意自定义键值对
- 建议包含：author、version、mcp-server
- 示例：
```yaml
metadata:
  author: ProjectHub
  version: 1.0.0
  mcp-server: projecthub
```

### 安全限制
frontmatter 中禁止：
- XML 尖括号（`<` `>`）
- 名称包含 “claude” 或 “anthropic”（保留字）

原因：frontmatter 会进入 Claude 的系统提示，恶意内容可能注入指令。

---

## 编写有效 Skill

### description 字段
根据 Anthropic 工程博客：该元数据“提供足够信息让 Claude 知道何时使用 Skill，而无需把全部内容加载进上下文”。这是渐进式披露的第一层。

结构建议：  
`[做什么] + [何时用] + [关键能力]`

好的描述示例：

1）具体和可执行
```yaml
description: 分析 Figma 设计文件并生成开发交接文档。用于用户上传 .fig 文件、要求“设计规格”“组件文档”或“设计到代码交接”时。
```

2）包含触发时机
```yaml
description: 管理 Linear 项目工作流，包括 sprint 规划、任务创建与状态跟踪。用于用户提到 “sprint”“Linear 任务”“项目规划”或要求“创建工单”时。
```

3）清晰的价值主张
```yaml
description: PayFlow 的端到端客户入驻工作流，处理账户创建、支付设置与订阅管理。用于用户说“入驻新客户”“设置订阅”或“创建 PayFlow 账户”时。
```

差的描述示例：

- 过于笼统：
```yaml
description: 帮助做项目。
```

- 缺触发条件：
```yaml
description: 创建复杂的多页面文档系统。
```

- 过技术化，没有用户触发：
```yaml
description: 实现具有层级关系的 Project 实体模型。
```

---

### 编写主指令（SKILL.md 正文）
frontmatter 后用 Markdown 写具体指令。

推荐结构（模板）：
````markdown
---
name: your-skill
description: [...]
---
# 你的 Skill 名称

# 指令

# 第 1 步：[第一个主要步骤]

清晰说明会发生什么。

示例：

```bash
python scripts/fetch_data.py --project-id PROJECT_ID
```

预期输出：[描述成功时是什么样]
````

（需要的话继续添加步骤）

# 示例
示例 1：[常见场景]
用户说：“为我设置一个新的营销活动”
动作：
1. 通过 MCP 获取现有活动
2. 按提供参数创建新活动
结果：活动创建成功并返回确认链接可添加更多示例）

# 故障排除
错误：[常见错误信息]
原因：[为何发生]
解决：[如何修复]
（添加更多错误场景）

#### 指令最佳实践
**具体且可执行**

✅ 好：
```
运行 `python scripts/validate.py --input {filename}` 检查数据格式  

若验证失败，常见问题：  
- 缺必填字段（补到 CSV）  
- 日期格式无效（用 YYYY-MM-DD）
```

❌ 差：
```
在继续前验证数据。
```


**包含错误处理**

```
## Common Issues

### MCP Connection Failed
If you see "Connection refused":
1. Verify MCP server is running: Check Settings > Extensions
2. Confirm API key is valid
3. Try reconnecting: Settings > Extensions > [Your Service] > Reconnect
```

**清晰引用捆绑资源**

```
编写查询前，先看 `references/api-patterns.md` 获取：
- 限流指导
- 分页模式
- 错误码与处理
```

**使用渐进式披露**
- 让 SKILL.md 聚焦核心指令；详细文档移到 `references/` 并链接。

---

# 第 3 章：测试与迭代

Skills 的测试严谨度可按需要选择：

- **Claude.ai 手动测试**：直接运行查询观察行为。迭代快、无需搭建。
- **Claude Code 脚本化测试**：自动化测试用例，便于反复验证变更。
- **通过 skills API 的程序化测试**：构建评估套件，对定义好的测试集系统运行。

选择与质量要求、Skill 可见性匹配的方法：小团队内部用的 Skill 与面向上千企业用户的 Skill，测试需求不同。

## 专家提示：先在单一任务上迭代再扩展

最有效的 Skill 创建者往往先在一个具有挑战的任务上迭代，直到 Claude 成功，再把有效方法抽成 Skill。这能利用 Claude 的上下文学习，比泛泛测试更快得到信号。基础打牢后，再扩展更多测试用例覆盖。

## 推荐测试方法（3 个方面）

### 1）触发测试
目标：确保 Skill 在正确时机加载。

测试用例：
- ✅ 明显任务能触发
- ✅ 改写/同义表达能触发
- ❌ 无关话题不触发

示例测试集：

```
Should trigger：
- “帮我设置一个新的 ProjectHub workspace”
- “我需要在 ProjectHub 创建一个项目”
- “为 Q4 规划初始化一个 ProjectHub 项目”

Should NOT trigger：
- “旧金山天气怎么样？”
- “帮我写 Python 代码”
- “创建一个电子表格”（除非该 Skill 处理表格）
```

### 2）功能测试
目标：验证 Skill 输出正确。
测试点：
- 输出有效
- API 调用成功
- 错误处理可用
- 覆盖边缘情况

示例：
```
- Test：创建含 5 个任务的项目  
- Given：项目名 “Q4 Planning”，5 条任务描述  
- When：Skill 执行工作流  
- Then：
  - ProjectHub 中项目已创建  
  - 5 个任务已创建且属性正确  
  - 任务与项目正确关联  
  - 无 API 错误  
```

### 3）性能对比（Performance comparison）
目标：证明 Skill 相比基线更好。使用“成功标准”里的指标做对比。

示例对比：

```
Without Skill：
- 用户每次都要重复说明
- 15 次来回消息
- 3 次失败 API 调用需要重试
- 12,000 tokens

With Skill：
- 自动执行工作流
- 仅 2 个澄清问题
- 0 次失败 API 调用
- 6,000 tokens
```

---

## 使用 skill-creator skill
skill-creator skill（Claude.ai 插件目录可用，也可下载用于 Claude Code）能帮助你构建和迭代 Skill。若你有 MCP server 且知道最重要的 2–3 个工作流，通常可在一次坐下来（15–30 分钟）做出可用 Skill。

它能做什么：

**创建 Skills：**
- 从自然语言描述生成 Skill  
- 产出带 frontmatter 的规范 SKILL.md  
- 建议触发短语与结构  

**审查 Skills：**
- 标记常见问题（描述含糊、缺触发、结构问题）  
- 识别过触发/欠触发风险  
- 基于目的建议测试用例  

**迭代改进：**
- 使用 Skill 遇到边缘失败时，把案例带回给 skill-creator  
- 示例：“用本次对话识别的问题与解决方案，改进 Skill 如何处理[特定边缘情况]”

使用方式：

```
使用 skill-creator skill 帮我为 [你的用例] 构建一个 skill
```

注意：skill-creator 帮你设计与精炼 Skill，但**不执行自动化测试套件**，也**不产出定量评估结果**。

---

## 基于反馈迭代

Skill 是“活文档”，应计划迭代：

**欠触发（Undertriggering）信号：**
- 该加载时不加载
- 用户需要手动启用
- 支持问题：什么时候该用？
解决：在 description 增加更多细节与细微差别（尤其技术术语关键词）。

**过触发（Overtriggering）信号：**
- 对无关查询也加载
- 用户禁用
- 对用途感到困惑
解决：加入负向触发、描述更具体。

**执行问题：**
- 结果不一致
- API 调用失败
- 需要用户纠正
解决：改进指令、补充错误处理。

---

# 第 4 章：分发与分享

Skills 让你的 MCP 集成更完整。用户比较 connectors 时，带 Skills 的方案能更快产出价值，相比只有 MCP 的替代方案更有优势。

## 当前分发模型（2026 年 1 月）
个人用户获取 Skills 的方式：
1. 下载 skill 文件夹  
2. （如需要）把文件夹压缩为 zip  
3. 在 Claude.ai：Settings > Capabilities > Skills 上传  
4. 或放入 Claude Code 的 skills 目录  

组织级 Skills：
- 管理员可在 workspace 全员部署（2025 年 12 月 18 日发布）
- 自动更新
- 集中管理

## 开放标准
我们把 Agent Skills 作为开放标准发布。像 MCP 一样，我们相信 Skills 应在工具与平台间可移植：同一个 Skill 应能在 Claude 或其他 AI 平台工作。当然，有些 Skill 会充分利用特定平台能力；作者可在 compatibility 字段注明。我们正与生态伙伴协作推进该标准，并看到早期采用。

## 通过 API 使用 Skills
对于程序化用例（应用、agents、自动化工作流），API 提供对 Skill 管理与执行的直接控制。

关键能力：
- `/v1/skills` 端点：列出与管理 skills
- 在 Messages API 请求中通过 `container.skills` 参数添加 skills
- 通过 Claude Console 进行版本控制与管理
- 可与 Claude Agent SDK 配合构建自定义 agents

何时用 API vs Claude.ai：
- 终端用户直接使用：Claude.ai / Claude Code
- 开发期手动测试迭代：Claude.ai / Claude Code
- 个人临时工作流：Claude.ai / Claude Code
- 应用程序化调用：API
- 规模化生产部署：API
- 自动化流水线与 agent 系统：API

注意：API 中的 Skills 需要 **Code Execution Tool beta**（为运行 Skills 提供安全环境）。

实现细节参考：
- [Skills API Quickstart](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/quickstart)
- [Create Custom skills](https://docs.claude.com/en/api/skills/create-skill)
- [Skills in the Agent SDK](https://docs.claude.com/en/docs/agent-sdk/skills)

## 当前推荐做法
先在 GitHub 上用公共仓库托管 Skill（提供清晰 README 给人类读者——注意与 skill 文件夹不同，skill 文件夹内不要有 README.md），并提供示例用法与截图。然后在 MCP 文档中链接该 Skill，说明二者结合的价值，并提供快速上手。

1）托管在 GitHub  
- 开源 Skills 用 public repo  
- 清晰 README（安装说明）  
- 示例用法与截图  

2）在 MCP 仓库中记录  
- 从 MCP 文档链接到 Skills  
- 解释组合价值  
- 提供 quick-start  

3）安装指南示例
```markdown
# 安装 [Your Service] skill
1. 下载 skill：
 - 克隆仓库：`git clone https://github.com/yourcompany/skills`
 - 或从 Releases 下载 ZIP
2. 在 Claude 安装：
 - 打开 Claude.ai > Settings > skills
 - 点击 "Upload skill"
 - 选择（压缩后的）skill 文件夹
3. 启用 skill：
 - 打开 [Your Service] skill 开关
 - 确保 MCP server 已连接
4. 测试：
 - 问 Claude：“在 [] 里帮我创建一个新项目”
```

## Skill 的定位

你如何描述 Skill 将决定用户是否理解价值并愿意尝试。写 README、文档或营销材料时，注意：

**强调结果而非特性：**
✅ 好：  
```
“ProjectHub skill 让团队几秒内完成项目工作区搭建（页面、数据库、模板齐全），而不是手动花 30 分钟。”
```

❌ 差：  
```
“ProjectHub skill 是一个包含 YAML frontmatter 和 Markdown 指令并调用 MCP 工具的文件夹。”
```

**讲清 MCP + Skills 的组合故事：**  

```
“我们的 MCP server 让 Claude 访问你的 Linear 项目；我们的 Skills 教 Claude 你团队的 sprint 规划工作流。二者结合，实现 AI 驱动的项目管理。”
```

---

# 第 5 章：模式与故障排除

这些模式来自早期采用者与内部团队创建的 Skills。它们是常见有效做法，不是强制模板。

## 选择方法：问题优先 vs 工具优先

像逛 Home Depot：
- 你带着问题来：“我要修橱柜”→ 员工指你该用的工具  
- 或你先拿了电钻再问：“用它怎么做？”  

Skills 同理：
- **问题优先（Problem-first）**：用户描述目标（如“搭建项目工作区”），Skill 负责按顺序编排 MCP 调用。用户说结果，Skill 处理工具。
- **工具优先（Tool-first）**：用户已接入 Notion MCP 等，Skill 教最佳工作流与实践。用户有访问权限，Skill 提供专业方法。

多数 Skill 会偏向其中一种。明确你的用例适合哪种，有助于选择下面模式。

---

## 模式 1：顺序工作流编排

适用：用户需要严格按顺序执行的多步骤流程。

示例结构：
```
工作流：新客户入驻  
- 第 1 步：创建账户（调用 `create_customer`，参数：name、email、company）  
- 第 2 步：设置支付（调用 `setup_payment_method`；等待支付方式验证）  
- 第 3 步：创建订阅（调用 `create_subscription`；参数：plan_id、customer_id（来自第 1 步））  
- 第 4 步：发送欢迎邮件（调用 `send_email`；模板：welcome_email_template）
```

关键技巧：
- 明确步骤顺序  
- 处理步骤间依赖  
- 每步验证  
- 失败时回滚指引  

## 模式 2：多 MCP 协同
适用：工作流跨多个服务。

示例：设计到开发交接
```
- 阶段 1：设计导出（Figma MCP）
  1. 导出设计资产
  2. 生成设计规格
  3. 创建资产清单

- 阶段 2：资产存储（Drive MCP）
  1. 在 Drive 创建项目文件夹
  2. 上传全部资产
  3. 生成可分享链接

- 阶段 3：任务创建（Linear MCP）
  1. 创建开发任务
  2. 将资产链接附到任务
  3. 分配给工程团队

- 阶段 4：通知（Slack MCP）
  1. 在 #engineering 发布交接摘要
  2. 附上资产链接与任务引用
```

关键技巧：
- 阶段清晰分隔  
- MCP 间数据传递  
- 进入下一阶段前先验证  
- 集中式错误处理  

## 模式 3：迭代式精炼（Iterative refinement）
适用：通过迭代能显著提升质量的输出。

示例：报告生成
```
## Interative Report Creation

### 初稿：

  1. 通过 MCP 拉取数据
  2. 生成报告初稿
  3. 保存到临时文件

### 质量检查：

  1. 运行校验脚本：`scripts/check_report.py`
  2. 识别问题：缺章节、格式不一致、数据校验错误

### 精炼循环：

  1. 逐项修复问题
  2. 重生成受影响部分
  3. 重新校验
  4. 达到阈值后停止

### 定稿：

  1. 应用最终格式
  2. 生成摘要
  3. 保存最终版本
```

关键技巧：
- 明确质量标准  
- 迭代改进  
- 校验脚本  
- 知道何时停止  

## 模式 4：上下文感知的工具选择

适用：同一目标在不同上下文下应选不同工具。

示例：文件存储（决策树）

```
## Smart File Storage

### Decision Tree
1. 检查文件类型与大小  
2. 选择最佳存储位置：  
   - 大文件（>10MB）：云存储 MCP  
   - 协作文档：Notion/Docs MCP  
   - 代码文件：GitHub MCP  
   - 临时文件：本地存储  
### 执行存储
Based on decision:
- 调用对应 MCP 工具
- 应用服务特定元数据
- 生成访问链接  

### 告知用户
解释为何做该选择
```

关键技巧：
- 明确决策标准  
- 回退方案  
- 透明解释选择原因  

## 模式 5：领域特定智能
适用：Skill 除工具访问外还能提供专业知识。

示例：金融合规
```
## Payment Processing with Compliance

### 处理前（合规检查）：
  1. 通过 MCP 获取交易详情
  2. 应用合规规则：制裁名单、司法辖区允许性、风险等级
  3. 记录合规决策

### 处理：
  - 若通过：调用支付处理 MCP 工具、应用反欺诈检查、处理交易  
  - 否则：标记审核、创建合规 case

### 审计追踪：
  - 记录所有合规检查
  - 记录处理决策
  - 生成审计报告
```

关键技巧：
- 领域知识固化进逻辑  
- 先合规后行动  
- 完整文档化  
- 清晰治理  

---

## 故障排除

### Skill 无法上传
#### 错误：“Could not find SKILL.md in uploaded folder”  
原因：文件名不是严格的 `SKILL.md`  
解决：
- 重命名为 `SKILL.md`（区分大小写）
- 用 `ls -la` 确认确实存在

#### 错误：“Invalid frontmatter”  
原因：YAML 格式问题  
常见错误：
```yaml
# 错 - 缺分隔符
name: my-skill
description: Does things

# 错 - 引号未闭合
name: my-skill
description: "Does things

# 对
---
name: my-skill
description: Does things
---
```

#### 错误：“Invalid skill name”  
原因：name 含空格或大写  
```yaml
# 错
name: My Cool Skill
# 对
name: my-cool-skill
```

### Skill 不触发
现象：从不自动加载  
修复：修改 description 字段（见“description 字段”好/坏示例）

快速检查：
- 是否太泛（“帮助做项目”不行）
- 是否包含用户会说的触发短语？
- 若适用，是否提到相关文件类型？

调试方法：
问 Claude：“你会在什么时候使用 [skill name] skill？”Claude 会引用 description。根据缺失项调整。

### Skill 触发过于频繁
现象：对不相关查询也加载  

解决：
1）加入负向触发  
```yaml
description: 面向 CSV 的高级数据分析：统计建模、回归、聚类。不要用于简单数据探索（改用 data-viz skill）。
```
2）更具体  
```yaml
# 太宽
description: 处理文档

# 更具体
description: 处理 PDF 法律文档用于合同审查
```
3）明确边界  
```yaml
description: PayFlow 电商支付处理。仅用于线上支付工作流，不用于一般金融问题。
```

### MCP 连接问题
现象：Skill 加载了但 MCP 调用失败  
检查清单：
1. 确认 MCP server 已连接  
   - Claude.ai：Settings > Extensions > [Your Service]（应显示 Connected）
2. 检查认证  
   - API key 有效未过期  
   - 权限/Scope 正确  
   - OAuth token 已刷新  
3. 独立测试 MCP（不通过 Skill）  
   - “用 [Service] MCP 拉取我的项目”  
   - 若失败，问题在 MCP 而不是 Skill  
4. 确认工具名  
   - Skill 引用的 MCP tool 名称正确  
   - 工具名区分大小写  

### 指令未被遵循
现象：Skill 加载了但 Claude 不按指令做  

常见原因：
**1）指令太冗长  **
- 保持简洁  
- 多用项目符号/编号  
- 细节放 references/  

**2）关键指令被埋得太深  **
- 把关键点放顶部  
- 用 `## Important` / `## Critical`  
- 必要时重复关键点  

**3）语言含糊  **
```markdown
# Bad
确保正确验证

# Good
CRITICAL：在调用 create_project 前验证：
- 项目名非空
- 至少分配 1 名成员
- 开始日期不早于今天
```
高级技巧：对关键验证可捆绑脚本做程序化检查，而不要只依赖语言指令。代码是确定性的，语言解释不是。（可参考 Office skills 的模式。）

4）模型“偷懒”  
添加明确鼓励：
```markdown
## Performance Notes

- 慢慢来，认真做
- 质量比速度更重要
- 不要跳过验证步骤
```
注意：把这类鼓励加到**用户提示词**里比写在 SKILL.md 更有效。

### 大上下文问题
现象：Skill 变慢或响应质量下降  
原因：
- Skill 内容过大  
- 同时启用太多 Skills  
- 未使用渐进式披露，导致内容全部加载  

解决：
1）优化 SKILL.md 体积  
- 详细文档移到 references/  
- 用链接替代内嵌  
- SKILL.md 尽量 < 5,000 词

2）减少启用的 Skills 数量  
- 如果同时启用超过 20–50 个，评估是否需要  
- 建议选择性启用  
- 可考虑相关能力打包成 “skill packs”

---

# 第 6 章：资源与参考

如果你正在构建第一个 Skill，先从 Best Practices Guide 开始，然后按需查 API 文档。

## 官方文档

Anthropic 资源：
- [Best Practices Guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Skills Documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [API Reference](https://platform.claude.com/docs/en/api/overview)
- [MCP Documentation](https://modelcontextprotocol.io)

博客文章：
- [Introducing Agent Skills](https://claude.com/blog/skills)
- [Engineering Blog: Equipping Agents for the Real World](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Explained](https://www.claude.com/blog/skills-explained)
- [How to Create Skills for Claude](https://www.claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples)
- [Building Skills for Claude Code](https://www.claude.com/blog/building-skills-for-claude-code)
- [Improving Frontend Design through Skills](https://www.claude.com/blog/improving-frontend-design-through-skills)

## 示例 Skills
公共 skills 仓库：
- GitHub：[anthropics/skills](https://github.com/anthropics/skills)
- 包含 Anthropic 创建的 Skills，可自定义

## 工具与实用程序
skill-creator skill：
- 内置于 Claude.ai，也可用于 Claude Code
- 可从描述生成 skills
- 可审查并给出建议
- 用法：“Help me build a skill using skill-creator”

校验：
- skill-creator 可评估你的 skills
- 问：“Review this skill and suggest improvements”

## 获取支持
技术问题：
- 通用问题：[Claude Developers Discord 社区论坛](https://discord.com/invite/6PPFFzqPDZ)

Bug 报告：
- GitHub Issues：[anthropics/skills/issues](https://github.com/anthropics/skills/issues)
- 请包含：Skill 名称、错误信息、复现步骤

---

# 参考 A：快速检查清单

用此清单在上传前后验证 Skill。想更快开始，可先用 skill-creator 生成初稿，再用此清单查漏补缺。

## 开始前
- 已识别 2–3 个具体用例  
- 已确定工具（内置或 MCP）  
- 已阅读本指南与示例 skills  
- 已规划文件夹结构  

## 开发中
- 文件夹为 kebab-case  
- 存在 `SKILL.md`（精确拼写）  
- YAML frontmatter 有 `---` 分隔符  
- name：kebab-case、无空格、无大写  
- description 同时包含 WHAT 与 WHEN  
- 全文无 XML 标签（`< >`）  
- 指令清晰可执行  
- 包含错误处理  
- 提供示例  
- references 引用清晰  

## 上传前
- 测试明显任务会触发  
- 测试改写请求会触发  
- 验证无关主题不触发  
- 功能测试通过  
- 工具集成可用（如适用）  
- 压缩为 .zip  

## 上传后
- 在真实对话中测试  
- 监控欠触发/过触发  
- 收集用户反馈  
- 迭代 description 与指令  
- 在 metadata 更新版本号  

---

# 参考 B：YAML frontmatter

## 必需字段
```yaml
---
name: skill-name-in-kebab-case
description: 它做什么以及何时使用。包含具体触发短语。
---
```

## 全部可选字段（示例）
```yaml
name: skill-name
description: [required description]
license: MIT # 可选：开源协议
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch" # 可选：限制工具访问
metadata: # 可选：自定义字段
  author: Company Name
  version: 1.0.0
  mcp-server: server-name
  category: productivity
  tags: [project-management, automation]
  documentation: https: /example.com/docs
  support: support@example.com
```

## 安全说明
允许：
- 标准 YAML 类型（字符串、数字、布尔、列表、对象）
- 自定义 metadata 字段
- 长 description（最多 1024 字符）

禁止：
- XML 尖括号（`< >`）——安全限制
- 在 YAML 中执行代码（使用安全 YAML 解析）
- Skill 名称以 “claude” 或 “anthropic” 开头（保留）

---

# 参考 C：完整技能示例

如需完整、可用于生产的 Skills（展示本指南中的模式），参见：
- 文档类 Skills：PDF、DOCX、PPTX、XLSX 创建
- 示例 Skills：多种工作流模式
- 合作伙伴 Skills 目录：来自 Asana、Atlassian、Canva、Figma、Sentry、Zapier 等伙伴

这些仓库会保持更新，包含超出本文范围的更多示例。你可以克隆它们，按自己的用例修改，作为模板使用。
