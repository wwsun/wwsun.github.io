---
title: Claude Code Artifacts — 将会话输出发布为可交互页面
description: Claude Code Artifacts 功能完整中文翻译，涵盖创建/更新/共享 Artifact、设计系统定制、页面约束、可用性要求及组织管理
tags:
  - claude-code
  - artifacts
  - clippings
  - ai-tools
source: https://code.claude.com/docs/en/artifacts
---

## 概述

Artifact 是 Claude Code 从你的会话中发布到 claude.ai 私有 URL 的实时交互式网页。你在浏览器中打开它，它会随着会话的继续而就地更新。当你希望团队成员也能看到它时，从页面顶栏分享。例如，使用 Artifact 带注释化的 diff 引导审查者完成 PR 审查、从会话数据构建仪表盘、或者维护一个随着 Claude 工作而不断填充的调查时间线。

本文涵盖以下内容：

- 判断[何时使用 Artifact](https://code.claude.com/docs/en/artifacts#when-to-use-an-artifact)
- [创建](https://code.claude.com/docs/en/artifacts#create-an-artifact)、[更新](https://code.claude.com/docs/en/artifacts#update-an-artifact)和[分享](https://code.claude.com/docs/en/artifacts#share-an-artifact) Artifact
- 应用[提示词模式](https://code.claude.com/docs/en/artifacts#what-you-can-build)构建更丰富的页面
- [应用你自己的设计系统](https://code.claude.com/docs/en/artifacts#improve-the-visual-design)，使 Artifact 与产品品牌保持一致
- 了解[页面约束](https://code.claude.com/docs/en/artifacts#page-constraints)和[可用性要求](https://code.claude.com/docs/en/artifacts#availability)
- [禁用](https://code.claude.com/docs/en/artifacts#disable-artifacts)或[为组织管理](https://code.claude.com/docs/en/artifacts#manage-artifacts-for-your-organization) Artifacts

## 何时使用 Artifact

当终端文本不适合展示 Claude 的输出时使用 Artifact：这些输出更适合浏览和交互，而不是逐行阅读。Claude 使用会话可访问的任何内容来构建页面，包括你的代码库和通过[已连接工具](https://code.claude.com/docs/en/mcp)获取的数据，因此页面可以展示用段落文字难以描述的内容。例如，让 Claude：

- 用注释化的 diff 引导审查者完成 PR 审查
- 用会话已拉取的数据渲染仪表盘
- 并排展示多个设计或实现方案
- 在长时间任务运行期间，维护一个不断填充的调查时间线
- 给队友发送链接，而不是将输出粘贴到 Slack

参见[你可以构建什么](https://code.claude.com/docs/en/artifacts#what-you-can-build)获取与上述场景匹配的提示词。

### Artifact 不是什么

Artifact 是工作的快照，不是应用程序。它是一个独立的页面，没有后端，因此无法存储表单输入、在查看时调用 API 或提供多个路由。如需带后端的托管内部工具，请部署到你自己的基础设施上。参见[页面约束](https://code.claude.com/docs/en/artifacts#page-constraints)了解完整限制列表。

## 创建 Artifact

Claude 可能在输出适合页面展示时自行发布 Artifact，你也可以直接请求。要请求，请用自然语言描述你需要的功能或视觉输出。适合的场景包括任何看比读更直观的内容，如注释化 diff、图表或一组待比较的选项。以下提示词是两个示例；更多模式请参见[你可以构建什么](https://code.claude.com/docs/en/artifacts#what-you-can-build)。

```
创建一个 Artifact，用内联注释的 diff 走查这个 PR。
```

```
构建上周各服务部署失败的仪表盘 Artifact，并在你继续调查时保持更新。
```

Claude 将页面写入项目中的 HTML 或 Markdown 文件，然后发布。在发布新 Artifact 之前，Claude Code 会请求许可；它可能会提示类似 `Claude 想要将"各服务部署失败"（deploy-failures.html）发布到 claude.ai 的私有页面`。重新发布你已批准的 Artifact 不会再次提示。选择**Yes**发布。Claude 打印 URL，浏览器会打开新页面。随时按 `Ctrl+]` 从终端重新打开最近的 Artifact。

Claude 为 Artifact 选择标题和为浏览器标签图标选择 emoji。两者都会出现在你在 claude.ai 的[Artifact 画廊](https://code.claude.com/docs/en/artifacts#share-an-artifact)以及分享链接中，因此如果需要，请让 Claude 使用特定的标题或图标。

要阻止浏览器在新 Artifact 发布时自动打开，请在环境中设置 `CLAUDE_CODE_ARTIFACT_AUTO_OPEN=0`。

如果 Claude 回复无法发布，或只写了本地 HTML 文件而没有链接，说明该工具对你的会话不可用。请检查[可用性](https://code.claude.com/docs/en/artifacts#availability)要求。

## 更新 Artifact

让 Claude 修改页面，或在长时间运行任务取得进展时重新发布。Claude 编辑底层文件并再次发布到同一 URL。

```
在摘要图表下方添加按区域分类的明细，然后重新发布。
```

任何打开该页面的人都会看到就地更新。每次发布成为一个版本，从页面顶栏的**分享**控件中，你可以选择查看者看到哪个版本。

要从不同的会话更新 Artifact，给 Claude 该 Artifact 的 URL 并请求修改。没有 URL，新会话始终创建新的 Artifact 而非更新现有内容。

```
用今天的数据更新 https://claude.ai/code/artifact/5fbea6f3-... 。
```

新 Artifact 仅对你可见。在浏览器中打开它，使用页面顶栏的**分享**控件向组织中的特定人员或所有人授权访问。顶栏将你列为 Artifact 的作者，所以你分享的任何人都能看到是谁发布了该页面。它还链接到你在 [claude.ai/code/artifacts](https://claude.ai/code/artifacts) 的画廊，画廊列出了你创建的所有 Artifact。

分享仅限于你的组织内。查看者必须作为发布 Artifact 的同一组织成员登录 claude.ai，且没有选项使 Artifact 在组织外可见。要向组织外部人员发送底层内容，请向 Claude 索要 HTML 文件并直接分享该文件。

Artifact 是只读的，不支持协作编辑。你分享的人可以看到你发布的每个版本，但不能修改页面；你是唯一的编写者。

## 你可以构建什么

Artifact 是一个单一的 HTML 页面，因此 HTML、CSS 和内联 JavaScript 能表达的任何内容都在范围内。以下是最常见的模式。

### 走查变更

请求一个渲染 diff 或设计变更的页面，在相关行旁边附上注释，这样审查者可以阅读你的推理而不必从描述中重构。

```
创建一个 Artifact 走查这个 PR。渲染带边注的 diff，按严重程度对发现进行颜色编码。
```

### 对比备选方案

请求在一个页面上展示多个变体，以便你对比评估。这适用于布局、文案、API 形态或实现计划。

```
创建一个 Artifact，为设置面板展示四个明显不同的布局。改变密度和分组方式，以网格形式排列，每个方案下附一行权衡说明。
```

### 用交互控件调参

请求滑块、开关或绑定到你要调整内容的输入字段，这样你可以直接探索参数值而不必描述它们。

```
构建一个 Artifact，为缓动曲线、时长和延迟提供滑块，让我可以在这个过渡上尝试各种值。在我滑动时实时展示动画效果。
```

### 将结果带回会话

Artifact 可以充当轻量级编辑器，让你做出决定后交还给 Claude。请求一个导出控件，生成你可以粘贴到终端的文本，这样与页面交互的结果就能回流到会话中，而不是停留在页面上。

```
创建一个分类看板 Artifact，将每个未解决的 Issue 作为可拖拽的卡片，分别放入 Now、Next、Later 和 Cut 列。添加一个"复制为提示词"按钮，让我获得最终排序以粘贴回这里。
```

### 跟踪进行中的工作

让 Claude 在长时间任务运行期间保持 Artifact 更新，这样任何有链接的人都可以跟进而不必阅读终端输出。

```
将这个迁移计划转换为清单 Artifact。完成一项就勾掉一项，跳过的项目添加备注。
```

## 改进视觉设计

Claude 在构建 Artifact 时会应用内置的设计技能，因此页面无需额外提示就能获得精心选择的调色板、字体和布局。该技能也会在选择自己的设计之前查找你项目中已有的设计系统。要保持 Artifact 与产品的品牌一致性，在 Claude 能找到的地方记录你的设计 token，例如项目的 [CLAUDE.md](https://code.claude.com/docs/en/memory) 或仓库中的主题文件：

```
## 设计系统

- 颜色: 主色 #1a4d8f，强调色 #f59e0b，表面色 #f8fafc
- 排版: Inter 用于正文，JetBrains Mono 用于代码
- 间距: 8px 刻度，6px 圆角
```

Claude 将你的设计系统视为高于其自身选择，而你的提示词高于两者。上述标题和格式仅为示例；任何清晰的颜色、字体和间距列表都可以。

## 页面约束

每个 Artifact 是一个独立的页面。Claude Code 将你发布的文件包装在 HTML 文档外壳中，并在严格的内容安全策略（CSP）下提供服务，这限制了页面的能力。

| 约束       | 影响                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 无外部请求 | CSP 阻止从任何其他主机加载的脚本、样式表、字体和图片，以及 `fetch`、XHR 和 WebSocket 调用。Claude 内联 CSS 和 JavaScript，并以 data URI 格式嵌入图片，使页面无需任何外部请求即可渲染。 |
| 无后端     | Artifact 是静态页面。它不能存储表单提交的数据、自身认证查看者或在查看时调用 API。                                                                                                      |
| 单页面     | 相对链接不会解析，因为没有与页面一起部署的任何内容。对于多节内容，Claude 使用页内锚点而非独立文件。                                                                                    |
| 源文件类型 | 发布的文件必须是 `.html`、`.htm` 或 `.md`。Markdown 文件渲染为样式化的 HTML。                                                                                                          |
| 渲染大小   | 渲染后的页面必须为 16 MiB 或更小。发布失败通常是由于嵌入式大图片导致的尺寸问题。                                                                                                       |

生成 Artifact 和其他响应一样消耗输出 token，而样式化的页面比相同内容的终端文本更消耗 token。内联 CSS、交互控件的 JavaScript，尤其是以 data URI 格式嵌入的图片是主要的消耗来源。减少 Artifact 的 token 成本的方法：

- 优先使用 SVG，或 HTML 和 CSS，而非嵌入光栅图片来绘制图表
- 省略不需要的交互功能
- 让页面汇总大型数据集，而非完整内联

## 可用性

Artifacts 需要满足以下所有条件。当某个条件不满足时，Claude 会写入本地 HTML 文件，或表示无法发布。

| 要求       | 可用条件                                                                                                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 套餐       | Team 或 Enterprise。在 Team 套餐上，Artifacts 默认开启。在 Enterprise 套餐上，管理员在 claude.ai 管理设置中[启用](https://code.claude.com/docs/en/artifacts#manage-artifacts-for-your-organization)它们。                                                                         |
| 认证       | 通过 `/login` 登录 claude.ai。使用 API key、[网关 token](https://code.claude.com/docs/en/llm-gateway) 或云提供商凭证的会话无法发布。                                                                                                                                              |
| 模型提供商 | Anthropic API。在 [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)、[Google Cloud Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) 或 [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) 上不可用。                               |
| 组织策略   | 组织未启用客户管理的加密密钥（CMEK）、HIPAA 或[零数据保留](https://code.claude.com/docs/en/zero-data-retention)。                                                                                                                                                                 |
| 终端       | Claude Code CLI，或 Claude 桌面应用 1.13576.0 或更高版本。在 [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)、GitHub Action 和 MCP 服务器上下文中默认关闭，以及设置了 [`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`](https://code.claude.com/docs/en/env-vars) 时。 |

## 禁用 Artifacts

要为自己禁用 Artifacts（无论组织设置如何），使用以下任一方式：

| 方式                                                    | 设置                                    |
| ------------------------------------------------------- | --------------------------------------- |
| [设置文件](https://code.claude.com/docs/en/settings)    | `"disableArtifact": true`               |
| [环境变量](https://code.claude.com/docs/en/env-vars)    | `CLAUDE_CODE_DISABLE_ARTIFACT=1`        |
| [权限规则](https://code.claude.com/docs/en/permissions) | 将 `Artifact` 添加到 `permissions.deny` |

## 为组织管理 Artifacts

Team 和 Enterprise 套餐的管理员通过 [claude.ai 管理设置](https://claude.ai/admin-settings/claude-code)控制 Artifacts。Artifact 内容存储在 Anthropic 运营的基础设施上，仅对发布组织的已认证成员可见。

### 启用或禁用 Artifacts

要为整个组织启用或禁用 Artifacts，前往**设置 > Claude Code > 功能**，使用**Artifacts**开关。在支持基于角色的访问控制的 Enterprise 套餐上，你还可以将 Artifacts 限定到特定角色：前往**设置 > 角色**，编辑角色，在**Claude Code**组下设置**Artifacts**权限。

### 设置保留策略

要设置 Artifact 在自动删除前的保留时间，前往**设置 > 数据与隐私控制**。你可以为仍对作者私有的 Artifact 和已分享的 Artifact 分别设置保留期。

### 查看审计日志

Artifact 的发布、共享和删除各操作都会出现在组织审计日志中，事件类型为 `claude_artifact_*`，与 claude.ai 对话中创建的 Artifact 使用相同的事件类型族。

### 将查看器域名加入白名单

claude.ai 上的查看器从沙箱化的 `*.claudeusercontent.com` 源加载每个 Artifact。如果你的组织限制出站网络访问，请将该域名与 `claude.ai` 一起加入白名单。参见[网络访问要求](https://code.claude.com/docs/en/network-config#network-access-requirements)获取完整列表。

### 使用合规 API 列出和删除 Artifacts

[合规 API](https://docs.claude.com/en/api/compliance) 提供端点来列出组织的 Artifacts、检索特定版本的内容以及删除 Artifact：

| 方法     | 端点                                                                |
| -------- | ------------------------------------------------------------------- |
| `GET`    | `/v1/compliance/code/artifacts`                                     |
| `GET`    | `/v1/compliance/code/artifacts/{artifact_id}/versions/{version_id}` |
| `DELETE` | `/v1/compliance/code/artifacts/{artifact_id}`                       |

请求和响应模式参见[合规 API 参考](https://docs.claude.com/en/api/compliance/code/artifacts)。

- 浏览与 Artifacts 配合的[提示词模式和工作流](https://code.claude.com/docs/en/prompt-library)
- 将你复用的 Artifact 提示词转换为[技能](https://code.claude.com/docs/en/skills)，以便作为命令调用
- [连接 MCP 服务器](https://code.claude.com/docs/en/mcp)让 Claude 将实时数据拉入 Artifact
