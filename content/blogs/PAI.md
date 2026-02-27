---
title: Personal AI infrastructure
tags:
  - github
  - agent
draft: true
description: Personal AI infrastructure
source: http://wogithub.com/danielmiessler/Personal_AI_Infrastructure
---
## 项目简介

**PAI 的宗旨是解决世界上的“P0 问题”：**

> 只有极少数人的创造力被激发，大多数人认为自己并没有什么价值，认为有“特殊”的人，而自己不是其中之一。

我们的目标是通过 AI 激发每个人的潜能：

1. **激活更多人** —— 帮助每个人通过 AI 增强自我认知，识别并追求自己的目标和人生目的。
2. **让最好的 AI普惠众人** —— 不让高质量的 AI 只属于富人或技术精英。

这也是为什么 PAI 选择开源，而非私人项目。

---

## 新手入门

你可能已经用过 ChatGPT 或 Claude。它们就是基本的聊天机器人：问→答→遗忘。

AI 系统可以分成三层：

- **聊天机器人层**：只回答问题，没有记忆和个性。
- **Agent 平台层**：如 Claude Code，可以实际“做事”，如写代码、运行命令，但仍然不了解你。
- **PAI 层**：你的 AI 会“学习和进步”，捕捉每一条反馈，分析失败，强化成功，实现自我升级。它了解你的目标、喜好和历史。

关键区别：**PAI 能持续学习和改进，每一次交互都让它更懂你。**

![[Pasted image 20260225153350.png]]

---

## PAI 是什么？

PAI 是一套个性化 AI 平台，旨在提升你的能力。
不论是个人、团队还是公司，都可以用它达成目标。

### 适用人群

- 小企业主：让 AI 处理发票、日程、客户跟进、营销；
- 公司：理解数据、优化运营、决策更优；
- 管理者：高效管理团队、跟进项目、准备评审；
- 艺术家和创意人士：发现和展示机会；
- 任何想改善生活的人：如健身、社交、理财或整理生活；
- 开发者：需要有持续记忆和自定义工作流的 AI 助手；
- 高阶用户：希望 AI 记住你的目标和上下文；
- 团队：建设共享、统一能力的 AI 基础设施；
- AI 系统设计者、实验爱好者等。

### 核心差异

PAI 与传统 agent 系统（如 Claude Code）不同：

1. **目标导向**：始终以用户——你——的目标为中心，而非工具优先。
2. **追求最佳输出**：系统始终努力根据当前所有上下文给出最优答案。
3. **持续学习**：自动记录每次行为、变化、输出及你的反馈，不断优化。

---

## PAI 原则

（部分原则摘录，详情建议查看[官方博客](https://danielmiessler.com/blog/personal-ai-infrastructure)）

1. 用户至上：关注你的目标和偏好；
2. 基础算法：依照科学方法思考和解决问题；
3. 思维清晰优先，后有好 prompt；
4. 系统架构重要于模型；
5. 基础设施要可预测、可重复；
6. 能用脚本解决就别用 AI；
7. 先写规范和测试；
8. UNIX 哲学：做一件事做好，工具可组合；
9. 工程原则：自动化、监控、版本管理；
10. 命令行优先；
11. 从目标到代码、CLI，再到 prompt、再到 agent；
12. 技能管理：按上下文动态路由能力；
13. 记忆系统：历史成未来上下文；
14. Agent 个性化；
15. 科学循环：假设—实验—测量—迭代；
16. 允许失败：明确“我不知道”防止胡乱回答。

---

## PAI 基础体系（Primitives）

哲学归原则，架构归 Primitives，主要包括：

- 深度目标理解（TELOS）
- 用户与系统分离，升级不动你的定制文件
- 六层细粒度定制（身份、偏好、工作流、技能、钩子、接口）
- 技能系统（强调可确定的结果，优先用代码、CLI、prompt、再到技能）
- 记忆系统（三层热/温/冷架构，持续学习与反馈）
- 钩子系统（响应各种生命周期事件，如会话开始、任务完成等）
- 安全体系（默认安全策略、命令校验）
- AI 安装器（GUI自动安装配置，无需手动）
- 通知系统（如 ntfy、Discord，自动推送并智能路由通知）
- 语音系统（如 ElevenLabs TTS，AI有自己的声音）
- 基于终端的 UI（动态状态栏、信号展示等）

![[Pasted image 20260225153447.png]]

---

## 安装方法

> **项目处于快速开发中。结构、接口会频繁变化。**

```bash
# 克隆仓库
git clone https://github.com/danielmiessler/Personal_AI_Infrastructure.git
cd Personal_AI_Infrastructure/Releases/v3.0

# 复制发布内容并运行安装器
cp -r .claude ~/ && cd ~/.claude && bash PAI-Install/install.sh
```

**安装器将自动：**
- 检测你的系统并安装 Bun、Git、Claude Code；
- 询问你的名字、AI 助手名、时区；
- 克隆配置仓库到 `~/.claude`；
- 配置语音功能（可选）；
- 配置 shell 别名，校验安装。

**安装后：** 执行 `source ~/.zshrc && pai` 启动 PAI。

---

## 常见问题（FAQ）

### PAI 与 Claude Code 有什么不同？

PAI 基于 Claude Code，但进一步扩展了个性化和记忆能力。例如：

- 持久记忆：记住你的会话、决策、学习内容；
- 自定义技能：定制你常用能力；
- 你的上下文：目标、联系人等，无需多次解释；
- 智能路由：如“研究这个”，自动选择合适工作流；
- 自我完善：系统可根据反馈自我改进。

Claude Code 是引擎，PAI 是完整的“你的专属 AI”。

### PAI 只能用 Claude Code 吗？

目前 PAIT 设计为 Claude Code 原生平台，但架构（技能、记忆、算法）可以扩展到其它平台。代码支持 TypeScript、Python 和 Bash，可社区适配。

### 与 fabric 的区别？

fabric 是 AI prompt 模式集合，主要关注“问什么”。PAI 则是“你的 DA 怎么工作”，包括记忆、技能、路由、上下文、自我改进。两者可互补。

### 如果弄坏了怎么办？

- Git 版本控制，一切可回退；
- 记忆、历史不会丢失；
- DA 能帮你修复系统；
- 重装即可恢复干净状态。

---

## 路线图

- 支持本地模型（如 Ollama、llama.cpp）提升隐私和成本控制
- 细粒度模型路由，根据任务智能选择模型
- 远程访问（手机、网页等）
- AI 语音电话功能
- 通知系统接入 Email、Discord、Telegram、Slack 等

---

## 社区

- [GitHub 讨论区](https://github.com/danielmiessler/Personal_AI_Infrastructure/discussions)
- Discord 社区：[Unsupervised Learning](https://danielmiessler.com/upgrade)
- Twitter/X: [@danielmiessler](https://twitter.com/danielmiessler)
- 博客: [danielmiessler.com](https://danielmiessler.com)

---

## 贡献方式

欢迎任何贡献，包括 bug 修复、新技能、文档改进等。

1. Fork 仓库
2. 修改代码
3. 测试（建议全新环境安装验证）
4. 提交 PR，包括示例和测试证据

---

## 开源许可证

MIT License，详情见 LICENSE 文件。

---

## 致谢

- Anthropic 与 Claude Code 团队
- [IndyDevDan](https://www.youtube.com/@indydevdan)
- fayerman-source：Google Cloud TTS 集成等
- Matt Espinoza：测试与建议


## 推荐阅读

- [真正的物联网](https://danielmiessler.com/blog/real-internet-of-things)
- [AI 的可预测路径：7 大组件](https://danielmiessler.com/blog/ai-predictable-path-7-components-2024)
- [构建个人 AI 基础设施](https://danielmiessler.com/blog/personal-ai-infrastructure)
