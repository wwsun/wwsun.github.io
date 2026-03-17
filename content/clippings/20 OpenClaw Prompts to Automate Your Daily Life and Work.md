---
title: 20 个 OpenClaw 提示词：自动化你的日常生活与工作
description: 这是一篇介绍如何使用 **OpenClaw**（一款开源 AI 自动化代理框架）的实用提示词（Prompts）来自动化日常生活和工作任务的文章。文章提供了 20 个具体场景的使用示例
source: https://www.analyticsvidhya.com/blog/2026/03/openclaw-prompts/
author:
  - "[[Sarthak Dogra]]"
tags:
  - clippings
  - openclaw
---

## 什么是 OpenClaw？

### 技术定义
开源、自主 AI 代理框架

### 通俗解释
24/7 数字助理，通过消息应用（WhatsApp、Telegram、Signal、Discord）工作，区别于传统单一界面的 AI 聊天机器人。

### 历史
- **2025年11月**: 作为 "Clawdbot" 周末项目诞生
- 经过 Moltbot 发展为 OpenClaw
- GitHub 超过 **245,000 stars**
- 创始人 Peter Steinberger 已加入 OpenAI
- 现为独立开源基金会项目

### 核心能力
- ✅ 管理日历、分类邮件
- ✅ 运行 shell 命令、控制浏览器
- ✅ 自动化本地/服务器工作流
- ✅ 支持 Claude、GPT、本地 LLM 等模型
- ✅ **完全本地运行，数据自主可控**

---

## 一、个人生产力与日常生活自动化

### 1️⃣ 晨间新闻简报

**功能**: 每天 7:00 自动整理新闻摘要

**Prompt 核心逻辑**:
- 从金融（Moneycontrol、Economic Times）、科技（TechCrunch、Hacker News）、AI 开发等来源抓取 12-18 小时内的新闻
- 扫描 X/Twitter 热门话题（AI、市场、创业、开发者工具）
- 过滤重复、低质量内容，按市场影响、战略重要性排序
- 生成结构化摘要保存到 `/Daily/YYYY-MM-DD-news-briefing.md`
- 发送到聊天频道，阅读时间控制在 3 分钟内

```
Set up a daily automation that runs at 9:00 am every day.

This workflow should:
1. Pull the latest headlines (last 12–18 hours) from:
Finance: Moneycontrol, Economic Times, Bloomberg, 财新, 第一财经, 华尔街见闻 (if accessible)
Tech & Startups: TechCrunch, The Verge, Hacker News
AI & Dev: relevant X/Twitter lists, GitHub trending, selected newsletters
Any additional custom sources I define later
2. Scan X (Twitter) for trending discussions related to:
AI
Markets
Startups
Developer tools
Policy impacting business
3. Filter aggressively:
Remove duplicate coverage of the same story
Ignore low-signal noise
Prioritize impact over virality
4. Rank stories based on:
Market impact
Industry relevance
Long-term strategic importance
Emerging trend signals
Generate a structured summary saved to: /Daily/YYYY-MM-DD-news-briefing.md
Format the briefing into these sections:
头条新闻 (Must Know)
股市和商业动态（美股 + 中国A股）
AI & Tech Developments
Emerging Signals
Actionable Watchlist
Keep total reading time under 5 minutes.
Send a condensed version (bullet highlights only) to me with the generated file.
Tone: concise, sharp, zero fluff. No dramatic language. No filler summaries.
If nothing significant happened, explicitly state: “Low-signal news cycle today.”
Language: 结果始终返回简体中文
```

**核心价值**: 让大脑消费策略性信息，而非滚动垃圾信息

---

### 2️⃣ 每日 AI 艺术："事发前一刻"

**功能**: 每天 5:30 生成黑白历史事件艺术图

**Prompt 核心逻辑**:
- 获取"历史上的今天"事件
- 选择具有历史/文化/科学重要性的事件
- 生成**事件发生前 10 秒**的场景图像（非事件本身）
- 风格：木刻/麻胶版画，纯黑白高对比度
- 分辨率 800×480，适合电子墨水屏

**示例场景**:
- 泰坦尼克号撞击冰山前的冰山
- 著名演讲前聚集的人群
- 突破性发现前的实验室

**核心价值**: 用深度代替多巴胺，开始有意义的一天

---

### 3️⃣ 健康与紧急监控

**功能**: 每 30 分钟运行一次的静默监控（7:00-23:00）

**Prompt 核心逻辑**:

#### 📧 邮件扫描
检查过去 30 分钟收件箱，标记以下类别：
- 支付失败
- 安全警报
- 订阅到期
- 会议改期或取消
- 客户升级
- 今日需处理的任何事项

**严格草稿模式**:
- 以用户语气起草回复
- 保存在草稿箱
- **不自动发送**
- 通知用户并标记紧急程度：
  - `[紧急]` → 1 小时内需处理
  - `[提醒]` → 今日需关注

#### 📅 日历检查
扫描未来 2 小时事件，仅提醒：
- 需要准备的会议
- 有视频链接的会议
- 尚未确认的会议

#### 🔧 基础设施健康
检查：
- Coolify API 状态
- 服务器健康（CPU、内存、磁盘）
- 服务正常运行时间

仅在以下情况报警：服务宕机、资源使用超过阈值、检测到意外重启

**核心价值**: 将潜在混乱转化为可控意识

---

### 4️⃣ 智能待办优先级排序

**功能**: 每天 7:15 分析任务并确定今日重点（在晨间简报后立即运行）

**Prompt 核心逻辑**:
- 从任务管理器（Notion/Todoist/Obsidian）、邮件、日历、GitHub Issues/Jira 拉取任务
- 识别今日到期、逾期、未来 3 天截止、高影响力项目相关任务
- 根据以下因素评分：
  - 截止日期紧迫性
  - 战略重要性
  - 收入/职业影响
  - 依赖风险（是否阻塞他人）
- 选择今日最重要的 **3 个任务（MITs）**
- 生成 `/Daily/YYYY-MM-DD-priority-plan.md`

**输出格式**:
- 今日 Top 3
- 为什么重要
- 次要任务（如有时间）
- 委托或推迟建议

**核心价值**: 忙碌不等于高效，强制专注，减少分心

---

### 5️⃣ 每日反思与每周回顾

**功能**: 每日 21:30 反思 + 每周日 18:00 回顾

#### 每日反思工作流程
**输入**:
- 已完成的任务
- 今日 Git 提交
- 参加的会议
- 知识系统中创建的笔记
- 草稿但未发送的邮件

**识别**:
- 已完成事项
- 进行中事项
- 计划但未执行事项

**生成 `/Daily/YYYY-MM-DD-reflection.md`**:
- 今日胜利
- 取得的进展
- 未完成事项
- 意外事件
- 1 个教训
- 明日首要任务

#### 每周回顾工作流程
**聚合**:
- 过去 7 天所有每日反思
- 任务完成率
- 主要项目里程碑
- 日历分布（深度工作 vs 会议）

**分析**:
- 真正推动进展的事项
- 重复干扰
- 瓶颈
- 精力模式

**生成 `/Weekly/YYYY-WW-review.md`**:
- 重大胜利
- 阻碍因素
- 战略进展
- 习惯与一致性评分
- 应停止做的事
- 下周 3 个重点

**核心价值**: 不让日子白白流逝，记录每个成长点

---

### 6️⃣ 会议准备助手

**功能**: 会议前 30 分钟自动准备简报

**Prompt 核心逻辑**:
- 拉取会议标题、时间、参与者、描述、附件
- 对每个参与者：
  - 识别角色和组织（通过 LinkedIn 或内部目录）
  - 检索过往会议记录
  - 拉取近期邮件往来（30天内）
  - 标记未解决话题
- 扫描相关文档、项目笔记、关联任务
- 识别待决策事项、风险/阻碍、敏感话题、机会

**生成 `/Meetings/YYYY-MM-DD-[meeting-slug]-prep.md`**:
- 会议目标
- 参与者与背景
- 相关历史
- 未完成事项
- 风险/张力
- 机会
- 3 个明智问题

**核心价值**: 带着充分准备走进会议室，建立坚实可信度

---

### 7️⃣ 自动专注时间块调度

**功能**: 每周日 19:00 安排 + 每日 8:00 调整

**Prompt 核心逻辑**:

#### 每周调度（周日）
扫描下周日历，识别：
- 现有会议
- 重复承诺
- 通勤时间块
- 个人事件

**检测可用时间窗口**:
- 60-120 分钟
-  preferably 9:00-12:00
- 避免深夜（除非必要）

**交叉参考**:
- 前 3 个战略优先级
- 高影响力项目
- 即将到来的截止日期

**安排 3-5 个深度工作时间块**: "Focus Block – [项目名称]"
- 标记为忙碌
- 禁止会议
- 启用提醒

#### 每日调整检查（8:00）
- 检查专注块是否被覆盖
- 如被取消或双重预订：
  - 在同一周内重新安排
  - 每周最少保持 3 个时间块
- 仅当重新安排失败时通知用户

**核心价值**: 在繁忙日程中保护深度工作时间

---

### 8️⃣ 订阅与费用监控

**功能**: 每周六 9:00 运行

**Prompt 核心逻辑**:
扫描：
- 银行对账单（通过安全 API 或导出 CSV）
- 信用卡交易
- UPI/数字钱包活动
- 订阅管理平台

**识别重复收费**:
- 商家名称相似性
- 月/季频率模式
- 相同金额重复支付

**检测**:
- 新的重复订阅
- 与之前相比的价格上涨
- 免费试用转正
- 未使用的订阅（无活跃使用模式）

**生成 `/Weekly/YYYY-WW-expense-watchdog.md`**:
- 新订阅
- 价格上涨
- 未使用/遗忘的订阅
- 本月总订阅支出
- 建议取消

**核心价值**: 发现隐性价格上涨和遗忘的订阅

---

## 二、开发者与技术工作流自动化

### 9️⃣ 代码审查助手

**功能**: 提交 PR 时自动审查代码

**Prompt 核心逻辑**:
- 分析 PR 中的代码变更
- 检查代码风格、潜在 bug、安全漏洞
- 对比项目编码规范
- 生成结构化审查报告
- 标记需要人工审查的关键问题

---

### 🔟 自动化测试运行器

**功能**: 代码提交后自动运行测试套件

**Prompt 核心逻辑**:
- 监听 Git 提交或 PR 创建
- 自动运行单元测试、集成测试
- 生成测试报告
- 失败时通知开发者并附上日志

---

### 1️⃣1️⃣ 文档同步助手

**功能**: 代码变更时自动更新相关文档

**Prompt 核心逻辑**:
- 监控代码库变更
- 识别 API 变更、函数签名修改
- 自动更新 README、API 文档
- 标记需要人工审查的文档变更

---

### 1️⃣2️⃣ 依赖更新监控

**功能**: 每周检查依赖项安全更新

**Prompt 核心逻辑**:
- 扫描项目依赖（npm/pip/maven 等）
- 检查安全漏洞数据库
- 识别可更新的包
- 生成更新建议报告

---

## 三、数据、ML 与工程智能

### 1️⃣3️⃣ 数据管道健康检查

**功能**: 每小时检查数据管道状态

**Prompt 核心逻辑**:
- 监控 ETL 作业状态
- 检查数据质量指标
- 检测异常数据模式
- 失败时立即报警

---

### 1️⃣4️⃣ 模型性能监控

**功能**: 每日检查 ML 模型性能指标

**Prompt 核心逻辑**:
- 拉取模型预测日志
- 计算准确率、召回率、F1 等指标
- 与基线性能对比
- 检测性能漂移
- 生成每日模型健康报告

---

### 1️⃣5️⃣ 实验跟踪自动化

**功能**: ML 实验自动记录到跟踪系统

**Prompt 核心逻辑**:
- 监听训练作业完成
- 提取超参数、指标、模型文件
- 自动记录到 MLflow/Weights & Biases
- 生成实验对比报告

---

## 使用建议

### 开始使用 OpenClaw

1. **安装**: 根据官方文档安装 OpenClaw
2. **配置**: 设置消息应用集成（Telegram/WhatsApp/Discord）
3. **选择提示词**: 从 1-2 个最需要的场景开始
4. **自定义**: 根据个人/团队需求调整 Prompt
5. **迭代优化**: 根据运行结果持续改进

### 最佳实践

- **从小开始**: 不要一次性启用所有自动化
- **测试模式**: 先以草稿/只读模式运行，确认无误后再启用执行
- **定期审查**: 每周检查自动化输出质量
- **保持控制**: 始终保留最终决策权给人类

---

## 总结

OpenClaw 将 AI 从"聊天工具"转变为"个人操作系统"。通过这 20 个提示词，你可以：

- 📰 每天早上获得精选新闻简报
- 🎨 用艺术作品开始有意义的一天
- 🔔 静默监控紧急事项
- ✅ 智能优先级排序
- 📝 自动记录和反思
- 🤝 充分准备每场会议
- 🧠 保护深度工作时间
- 💰 监控订阅和费用
- 💻 自动化开发工作流
- 📊 监控数据和 ML 系统

**关键优势**: 数据完全本地，模型自主可控，24/7 不间断运行。

---

*本文翻译整理于 2026年3月16日*
