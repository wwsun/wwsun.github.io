---
title: Blog
draft: false
description: 这里存放长期思考、完整且有深度的文章与个人博客。
date: 2026-03-31 06:02:38.498000+00:00
---

# Blog — 索引

> 这里存放长期思考、完整且有深度的文章与个人博客。

- [[Building Skills for Claude|Agent Skills 构建指南]] — 引言Skill（技能）是一组指令——以一个简单文件夹的形式打包——用来教 Claude 如何处理特定任务或工作流。Skill 是为你的特定需求定制 Claude 的最强大方式之一。你不必在每次对话中反复解释你的偏好、流程和领域知识；Skill 让你只需教一次，以后每次都能受益。当你有可重复的工作流时
- [[Quartz + Obsidian to build personal blog|使用 Quartz + Obsidian 构建个人博客]] — 使用 Quartz 和 Obsidian 构建个人博客的分步指南，包括 GitHub Pages 部署和工作流优化。
- [[Rock-Max-In-Action|Rork Max 使用体验：使用 5 轮提示词手撮一个原生音乐 App]] — 这次我把目标限定得很明确：只用 5 轮提示词，做出一个可运行的 iOS 音乐 App 原型。功能边界包括：媒体库列表、全屏播放器、播放状态管理，以及灵动岛/Live Activity 的信息展示。
- [[agent-skill-sub-agent-pattern|用 Sub-Agent 设计复杂 Skill]] — 复杂 Skill 最容易失败的地方，不是步骤写得不够细，而是主 agent 在收集信息、执行任务、处理中间状态时把上下文搅在一起。把 Skill 拆成信息收集、sub-agent 执行和结果接收三段，可以显著降低上下文污染，让复杂工作流更稳定、也更容易维护。
- [[claude-code-best-practice|Claude Code 最佳实践]] — --- 🚫👶 = 不要过度干预
- [[claude-code-deep-usage-summary|claude-code 深度使用总结]] — Claude Code 不是 ChatBot，而是一个反复循环的代理系统。与其写长 Prompt，不如理解它的六层架构：
- [[claude-code-java-skills-guide|Java 开发者必备的 Claude Code 技巧]] — 深度探讨如何利用 Claude Code 的 Skill 机制提升 Java 开发效率，介绍 18 个专用 Skill 集、Spring Boot/JPA 最佳实践以及通用的多 Agent 工作流，助力 Java 开发者步入 AI 编程新范式。
- [[how-i-use-openclaw|OpenClaw 实战：工作流与8个真实案例]] — OpenClaw 不仅仅是一个 AI 助手，它更像是一个可以深度定制的数字同事。在这篇博客中，我将分享如何通过精心设计的配置体系（人格、记忆、规则）、明确的协作边界以及具体的高频实践场景，将 OpenClaw 调教成真正懂你的数字伙伴。
- [[how-to-read-a-book|如何阅读一本书]] — 阅读一本书不仅仅是“看字”的过程，而是一个主动获取信息、理解观点并将其转化为自身知识储备的过程。莫提默·艾德勒（Mortimer J. Adler）在经典著作《如何阅读一本书》中，将阅读分为四个由浅入深的层次。以下是针对非虚构类书籍（如历史、哲学、科学等）的核心阅读策略：1. 基础阅读这是最基本的阅
- [[infomation-history-to-personal-learning|从信息简史到 AI 时代的个人学习]] — LLM 本质上是基于概率的“预测机”，它们通过处理海量数据来降低文本的“熵”（不确定性）。个人学习与发展建议一、 应对“信息洪流”（The Flood）：重构注意力过滤器书末提到的“巴别图书馆”困境在今天已成现实。信息不再稀缺，注意力和意义才是稀缺资源。1. 从“信息囤积者”转变为“高信噪比”筛选者
- [[macOS for web dev|macOS Web 开发环境配置指南]] — 2026 年 macOS Web 开发环境配置综合指南，涵盖 Homebrew, Node.js, Zsh 及核心开发工具。
- [[thinking-fast-slow-ai|思考——快、慢与 AI]] — TLDR 1. 在卡尼曼的快/慢思考双系统理论基础上，增加了...
- [[use ccplugins|使用 CCPlugins - Claude Code 插件集]] — 为 Claude Code CLI 提供的专业命令集，每周可节省 2-3 小时的重复开发任务时间。
- [[vercel-sandbox-using-claude-agent-sdk|使用 Vercel Sandbox 运行 Claude Agent SDK]] — Claude Agent SDK 是一个长期运行的进程，用于执行命令、管理文件并维护对话状态。由于 SDK 会代表 AI 代理运行 shell 命令和修改文件，因此将其隔离在沙盒容器中非常重要。这可以防止代理访问您的生产系统、消耗无限资源或干扰其他进程。
- [[what-is-product-sense|What is product sense?]] — 对开发者而言，产品意识是从“如何实现”向“为什么实现”转变的关键。[!info] 产品意识（Product Sense）通常被定义为在不确定性中发现用户问题，并将其转化为商业价值和用户体验平衡点的能力。它并非某种不可捉摸的天赋，而是一套可以被训练的思维框架。一、 什么是产品意识产品意识的核心在于回答
- [[write-agent-skill|How to write good agent skills]] — 只写 "When" 而完全不写 "What"，当有多个相似 skill 时，agent 无法区分该选哪个。
