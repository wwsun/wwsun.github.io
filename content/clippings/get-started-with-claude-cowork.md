---
title: Claude Cowork 入门指南
description: Anthropic 官方支持文档的完整中文翻译，涵盖 Claude Cowork 的可用性、核心能力、任务执行机制、安装设置、权限安全、使用限制及故障排查等内容。
tags:
  - claude-cowork
  - ai-agent
  - claude-desktop
  - clippings
  - anthropic
source: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
created: 2026-06-02
---

本文介绍如何使用 **[[Claude Cowork]]**，它将 Claude Code 的智能体能力引入 Claude Desktop，用于编程之外的知识工作。

## 可用性

Claude Cowork 对付费计划用户（Pro、Max、Team、Enterprise）在以下平台开放：

- **Claude Desktop for macOS** — [点此下载](https://claude.com/download)
- **Claude Desktop for Windows** — Cowork 需要最新版本的 Claude for Windows，请在 [claude.com/download](https://claude.com/download) 下载或更新

### 我的电脑是否支持 Claude Cowork？

如果你尚未安装 Claude Desktop，想检查你的电脑是否支持 Cowork，可以点击与你系统对应的链接，下载一个简单的检查程序：

- macOS
- Windows arm64
- Windows x64

下载后打开该程序运行 Cowork 就绪检查。如果看到 "This computer is ready for Cowork"，就可以继续。

## 什么是 Claude Cowork？

Claude Cowork 采用与 Claude Code 相同的智能体架构，现在可直接在 Claude Desktop 中使用，无需打开终端。Claude 不再逐个回复提示，而是能够承接复杂的多步骤任务并替你执行。

借助 Cowork，你可以描述一个预期结果，然后离开，回来时工作已经完成——格式化文档、整理好的文件、综合研究报告等等。通过定时任务，Claude 可以自动为你完成工作，这是 Cowork 之外的普通对话无法实现的。随着 Cowork 中项目功能的引入，你可以将相关任务组织到持久化、自包含的工作空间中，每个工作空间都有各自独立的文件、链接、指令和记忆，让 Cowork 在重复性或长期工作中更加强大。

> [!warning] 重要
>
> - Cowork 由于其智能体性质和互联网访问权限，存在独特的风险。
> - Cowork 遵循你当前的网络出口权限设置。
> - **注意**：网络出口权限不适用于网页抓取（web fetch）、网页搜索（web search）工具或 MCP，包括 Claude in Chrome。网页抓取在服务端运行，仅限于搜索结果和你分享的 URL。
> - Team 或 Enterprise 计划管理员可以在「组织设置 > 功能」中关闭 Cowork 和 Chat 的网页搜索，或在「组织设置 > Claude in Chrome」中关闭 Claude in Chrome。
> - 你可以完全掌控你的 Cowork 任务，并随时使用 Claude Desktop 应用中的"删除"选项删除任务（点击任务旁的"⋮"，或从任务列表中选中任务后点击垃圾桶图标）。你的 Cowork 任务将立即从任务历史中移除，并在 30 天内根据我们的数据保留期限从后端存储系统中删除。
> - Cowork 活动目前不会被 Compliance API 捕获。
> - 如果你是 Team 或 Enterprise 计划管理员，可以使用 OpenTelemetry（OTel）监控整个组织内的 Claude Cowork 活动。
> - 请参阅 [安全使用 Cowork](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely) 了解更多信息。

有关 Team 和 Enterprise 组织使用 Cowork 的重要限制和注意事项，请参阅 Cowork for Team and Enterprise plans。

### 核心能力

- **直接本地文件访问**：Claude 可以直接读取和写入你的本地文件，无需手动上传或下载。
- **子智能体协调**：Claude 将复杂工作分解为更小的任务，并协调并行工作流来完成。
- **专业输出**：生成精美的交付成果，如带可用公式的 Excel 电子表格、PowerPoint 演示文稿和格式化文档。
- **长时运行任务**：在复杂任务上长时间工作，不会受到对话超时或上下文限制的中断。
- **定时任务**：创建并保存任务，让 Claude 按需运行，或按你选择的节奏自动运行。
- **电子表格和演示文稿**：Cowork 可以生成电子表格和幻灯片，并可通过 Claude for Excel 和 PowerPoint 进一步编辑。
- **项目**：将相关任务分组到独立的、拥有独立文件、上下文、指令和记忆的工作空间中。参见 [用项目组织 Cowork 任务](https://support.claude.com/en/articles/related-article)。
- **Pro 和 Max 移动访问**：从手机向 Claude 发送消息，结果将返回同一对话。Claude 在桌面上使用你的本地文件和连接器工作——你只是不必坐在它面前。参见 [在 Cowork 中从任何地方分配任务给 Claude](https://support.claude.com/en/articles/13947068-assign-tasks-from-anywhere-in-claude-cowork)。

## Claude Cowork 如何执行你的任务

Cowork 直接在你的计算机上运行，让 Claude 能够访问你选择共享的文件。代码在隔离空间中安全运行，但 Claude 可以对你的文件进行实际更改。

当你通过 Cowork 启动一个任务时，Claude 会：

- 分析你的请求并创建执行计划
- 必要时将复杂工作分解为子任务
- 在你计算机上的隔离虚拟机（VM）中运行代码和 shell 命令
- 在适当的时候并行协调多个工作流
- 将完成的输出直接交付到你的文件系统

整个过程你都能看到 Claude 的规划和执行步骤，你可以在关键时刻参与掌控方向，也可以让 Claude 独立运行。

## 开始使用

### 系统要求

- **Claude Desktop 应用**：Cowork 需要 macOS 或 Windows 桌面应用，不支持网页版或移动端。
- **付费 Claude 订阅**：Cowork 仅限 Claude 付费计划用户（Pro、Max、Team、Enterprise）。
- **活跃的互联网连接**：整个会话期间都需要网络连接。

### 访问 Claude Cowork

1. 打开 Claude Desktop
2. 查看模式选择器，包含 "Chat" 和 Cowork 标签页
3. 点击 "Cowork" 标签页切换到 "Tasks" 模式
4. 描述你想让 Claude 完成的任务
5. 审查 Claude 的执行方案，然后让它运行

> [!note] 注意
> Claude 工作时 Claude Desktop 应用必须保持打开状态。如果关闭应用，会话将结束。

## 任务执行过程中的预期体验

当 Claude 在 Cowork 中处理任务时：

- **进度指示器**：显示 Claude 每一步的执行状态
- **透明性**：Claude 会展示其推理和方法，你可以全程跟随
- **掌控力**：你可以中途介入纠正方向或提供额外指导
- **并行工作**：对于复杂任务，Claude 可能会协调多个子智能体同时工作
- **删除保护**：在 Cowork 中，Claude 永久删除任何文件前都需要你的明确许可。你将看到一个权限提示，需选择"允许"后 Claude 才能执行删除操作

根据任务复杂度，任务可能会运行较长时间。你可以监控进度，也可以暂时离开，等 Claude 完成后再回来。

## 添加全局和文件夹指令

### 全局指令

你可以为 Claude 设置适用于每个 Cowork 会话的固定指令。用它来指定你偏好的语气、输出格式或你的角色背景。

设置全局指令的步骤：

1. 在 Claude Desktop 中，前往 **设置 > Cowork**
2. 点击**全局指令**旁边的"编辑"
3. 在文本框中输入你的指令，然后点击"保存"

### 文件夹指令

文件夹指令在你选择本地文件夹时，为 Cowork 添加项目专属的上下文。Claude 也可以在会话期间自行更新这些指令。

## Claude Cowork 插件

插件可以自定义 Claude 在 Cowork 中为你、团队和公司的运作方式。每个插件将技能、连接器和子智能体打包在一起。有关查找、安装和自定义插件的详细信息，请参见 [在 Cowork 中使用插件](https://support.claude.com/en/articles/13837440-use-plugins-in-cowork)。

## 定时重复任务

你可以设置让 Claude 自动或按需运行的任务。要安排任务，在任何 Cowork 任务中输入 `/schedule`。你也可以点击左侧边栏中的"定时任务"来查看、创建和管理定时任务。

> [!warning] 注意
> 定时任务仅在计算机处于唤醒状态且 Claude Desktop 应用打开时运行。

更多详细信息，请参见 [在 Cowork 中安排定时重复任务](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)。

## 用量限制

在 Cowork 中执行任务比与 Claude 聊天消耗更多用量配额。这是因为复杂的多步骤任务计算密集，需要更多 token 来执行。

如果你在使用 Cowork 时频繁达到用量限制，可以考虑：

- 将相关工作合并到单个会话中
- 对不需要文件访问或长时间执行的简单任务使用标准聊天
- 在 **设置 > 用量** 中监控个人用量

更多信息请参见用量限制最佳实践。

## 示例用例

Cowork 专为得益于文件访问和延长执行时间的复杂多步骤工作而设计。以下是一些示例：

### 文件和文档管理

- **整理文件**："按类型和日期整理我的 Downloads 文件夹"——Claude 可以将数百个文件归类到分类文件夹中
- **处理收据**：将收据放入文件夹，让 Claude 创建格式化的费用报告
- **批量重命名**：使用一致的命名模式（如 `YYYY-MM-DD` 格式）重命名文件

### 调查与分析

- **调研综合**：将来自网页搜索、文章、论文和笔记的信息合并为连贯的报告或摘要
- **转录分析**：从会议记录、访谈或讲座录音中提取主题、关键点和行动项
- **个人知识综合**：分析你的笔记、日记或研究文件，发现你可能忽略的模式、主题和关联

### 文档创作

- **带公式的电子表格**：生成带有可用 VLOOKUP、条件格式和多标签页的 Excel 文件——而不仅仅是需要修复的 CSV
- **演示文稿**：从粗略笔记或会议转录稿创建幻灯片
- **从杂乱输入生成报告**：将语音备忘录和散乱的笔记转化为精美的文档

### 数据分析

- **统计分析**：对数据文件进行异常检测、交叉分析表和时间序列分析
- **数据可视化**：使用你的数据生成图表
- **数据转换**：清理、转换和处理数据集

## 权限与安全

Cowork 在你的计算机上以分层保护机制运行：

- **代码执行隔离**：Claude 编写的 shell 命令和代码在你计算机上的隔离虚拟机（VM）中运行，与主操作系统分离
- **受控文件和网络访问**：Claude 只能读写你所连接文件夹中的文件，网络访问遵循你配置的出口设置

> [!warning] 重要
> Claude 可以访问你授权访问的本地文件，并可以代表你执行实际操作。在允许 Claude 继续之前，特别是处理敏感文件时，请审查 Claude 计划的执行操作。

### 权限

权限机制与聊天相同。你可以控制：

- 哪些 MCP 连接到 Claude，以及它们请求权限的频率
- Claude 的互联网访问权限

在超出 Claude 默认设置扩展访问权之前，请仔细评估你对某个 MCP 或网站的信任程度。

### 权限模式

Cowork 有一个模式选择器，控制 Claude 在会话期间处理审批的方式：

- **执行前询问（Ask before acting）**：Claude 暂停以便你可以批准每个操作。建议在操作新工具、处理不熟悉的文件或需要密切关注时使用。
- **无需询问直接执行（Act without asking）**：Claude 工作时不暂停请求批准。速度更快，但风险更高。仅在你积极监督且处理可信文件和网站时使用。

两种模式中，Claude 在永久删除文件前仍会请求确认。关于何时使用每种模式，详见 [安全使用 Claude Cowork](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely)。

## 当前限制

部分 Cowork 功能尚不可用：

- **记忆仅在项目中可用**：记忆在项目内部受支持，但不会在独立的 Cowork 会话之间保留
- **不支持聊天或作品分享**：会话无法与他人分享
- **需要桌面应用**：Cowork 通过 Claude Desktop 应用在你的桌面计算机上运行。Pro 和 Max 用户也可以在桌面保持活跃时通过移动应用向 Claude 发送消息。详见 [在 Claude Cowork 中从任何地方分配任务](https://support.claude.com/en/articles/13947068-assign-tasks-from-anywhere-in-claude-cowork)
- **会话持久性**：Claude Desktop 应用必须保持打开且计算机必须处于唤醒状态，Claude 才能处理任务。如果你关闭应用或计算机进入睡眠状态，活跃任务将停止

我们正在根据反馈持续迭代 Cowork。如果遇到问题或有建议，请使用应用中的反馈按钮向团队提交反馈。

## 故障排查

### 启动 Cowork 时看到 "Setting up Claude's workspace"，这是什么意思？

这是正常提示，表示 Cowork 正在更新到最新版本以应用修复和改进。

### Claude 停止处理我的任务

确保 Claude Desktop 应用在整个任务期间都处于打开状态。如果应用被关闭或计算机进入睡眠，会话可能已结束。

### 用量消耗过快

Cowork 比标准聊天消耗更多用量。建议对简单任务使用标准聊天，将 Cowork 留给得益于文件访问的复杂多步骤工作。

### 文件没有出现在预期位置

检查你是否已授予 Claude 适当的文件访问权限。查看 Claude 完成任务时指定的输出位置。

### 在 Windows 上启动 Cowork 时看到 "VM service not running"，这是什么意思？如何修复？

"VM service not running" 表示 Claude VM 服务（CoworkVMService）不可用。如果通过旧的 `.exe`/Squirrel 安装程序而非 MSIX 安装了 Cowork，或 Windows 服务停止了，可能会出现此问题。要修复，请从[我们的下载页面](https://claude.com/download)重新安装，或在 `services.msc` 中启动 "Claude VM Service"，或执行 `sc start CoworkVMService`（Microsoft Store 安装版本使用 `CoworkVMServiceStore`）。

### 在 Windows 上启动 Cowork 时看到 "EXDEV: cross-device link not permitted"，这是什么意思？如何修复？

这是因为 VM 镜像下载跨越了驱动器边界。最常见的原因是 **设置 > 系统 > 存储 > "新内容的保存位置"** 指向 `D:\` 而不是 `C:\`，导致 Windows 将 MSIX 包文件夹跨驱动器建立符号链接。也可能是因为 AppData 通过漫游配置文件重定向到网络共享。要修复，请将存储位置设置回 `C:\`，卸载然后重新安装 Cowork，并更新到最新桌面版本（该版本会直接下载到目标驱动器）。

---

## 相关文章

- [安全使用 Claude Cowork](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely)
- [在 Claude Cowork 中安排定时重复任务](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)
- [在 Claude Cowork 中从任何地方分配任务](https://support.claude.com/en/articles/13947068-assign-tasks-from-anywhere-in-claude-cowork)
- [让 Claude 在 Cowork 中操作你的计算机](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork)
- [Claude Cowork 桌面架构概述](https://support.claude.com/en/articles/14479288-claude-cowork-desktop-architecture-overview)
