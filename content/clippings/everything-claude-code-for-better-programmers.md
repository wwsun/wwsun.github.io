---
title: "一名谷歌工程师如何利用 Claude Code 简化 80% 工作"
description: "本文分享 Google 工程师用 Claude Code 和简单 dotnet 应用自动化 80% 工作，强调 AI 工具可大幅提升开发效率。"
source: "https://mp.weixin.qq.com/s/rpA9kAnqtNyimDBbbX6OKA"
author:
  - "[[Noisy]]"
tags:
  - "clippings"
---

Noisy _2026年4月14日 07:17_

导读：本文分享 Google 工程师用 Claude Code 和简单 dotnet 应用自动化 80% 工作，强调 AI 工具可大幅提升开发效率。

核心推荐包括基于 Karpathy LLM 编码常见错误总结的 CLAUDE.md 文件（GitHub 快速获星）和 everything-claude-code 仓库（提供 27 个 agent 和 64 项 skill 的完整 AI 系统），支持多平台集成。

> 作者 @Noisyb0y1（Noisy）是一位拥有 4 年经验的开发者，专注于 AI 工具与开发效率优化。他在 X 平台分享 Claude Code、自动化工作流等实用干货，帮助开发者通过 AI 实现被动收入与工作解放。

![Image](https://mmbiz.qpic.cn/mmbiz_jpg/rYCySHrlQHSQe1Zic2VrPp3QlEAIXa33NvCibEeoANsVHj7qqrOyZSbHmnbJRDuA2eUtoSOQL2ysNT4eXBn4FKuWdCH1oxSnQBQOXibHP6Siczo/640?wx_fmt=jpeg&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

Image

一位拥有 11 年经验的谷歌工程师利用 Claude Code 和一个简单的 dotnet 应用自动化了自己 80% 的工作。现在他每天只需工作 2-3 小时，而不是 8 小时，其余时间都在休息，而系统自动运行并为他赚取了 28,000 美元的被动收入。

以下是他知道而你不知道的秘密。

## 第一部分：遵循 Karpathy 规则的 CLAUDE.md

Andrej Karpathy 是全球最具影响力的 AI 研究员之一，他记录了 LLM 在编写代码时最常犯的错误：过度设计、忽略现有模式、添加不必要的依赖项。

有人将这些观察结果转化为了一个单一的 CLAUDE.md 文件。结果是在一周内获得了 GitHub 15,000 个星标，可以说，有 1.5 万人因此改变了工作方式。

核心理念很简单：如果错误是可预见的，就可以通过正确的指令来预防。仓库中的一个 Markdown 文件就能为 Claude Code 提供针对整个项目的结构化行为规则。

**其中的四个原则：**

```
Think Before Coding（编码前思考）    → 阻止错误的假设和遗漏的权衡
Simplicity First（简单至上）       → 阻止过度设计和臃肿的抽象
Surgical Changes（手术级变更）     → 阻止触碰未经要求的代码
Goal-Driven Execution（目标驱动执行）→ 测试先行，验证成功标准
```

无需框架，无需复杂的工具。只需一个文件就能在项目层面改变 Claude 的行为。

**实际效果对比：**

```
没有 CLAUDE.md：           Claude 在约 40% 的情况下会违反规范
使用 Karpathy CLAUDE.md：   违规率降至约 3%
设置时间：                  5 分钟
```

自动生成你自己的 CLAUDE.md 的命令：

```
claude -p "Read the entire project and create a CLAUDE.md based on:
Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.
Adapt to the real architecture you see." --allowedTools Bash,Write,Read
```

**避免了：** 那些会过度设计简单任务、添加多余依赖以及随意改动文件的 Claude。

## 第二部分：Everything Claude Code，一个仓库里的完整工程团队

> github.com/affaan-m/everything-claude-code <sup>[1]</sup> ( 153,000+ stars )

这不仅仅是一个提示词（prompt）集合，而是一个用于构建产品的完整 AI 操作系统。

```
30+ 专业智能体（Agents）：
planner.md           → 功能规划
architect.md         → 系统决策
tdd-guide.md         → 测试驱动开发
code-reviewer.md     → 质量与安全审查
security-reviewer.md → 漏洞分析
loop-operator.md     → 自主循环执行
```

```
180+ 技能：
TDD、安全、研究、内容，全部已经写好
```

```
内置 AgentShield：
配置中包含 1,282 项安全测试
同时兼顾生产力与安全性
```

适用于 Claude、Codex、Cursor、OpenCode、Gemini，一套系统，随处可用。

**如何安装：**

```
/plugin marketplace add affaan-m/everything-claude-code
```

或者手动安装：将你需要的组件复制到项目的 `.claude/` 目录下。不要一次性加载所有内容，同时在上下文中运行 27 个智能体和 64 个技能，消耗额度的速度会比你输入第一个提示词还要快。只取你真正需要的部分。

**实际效果对比：**

```
以前：  你在和 AI 聊天
以后：  你在自动驾驶模式下管理一支 AI 工程师团队
```

**省去了：** 数周的自定义智能体系统搭建工作、独立的规划/审查/安全工具，以及每月 200-500 美元的专业 AI 服务费用。

## 第三部分：隐藏的丑闻，Claude Code v2.1.100 正在悄悄偷走你的 Token

有人设置了 HTTP 代理来拦截 4 个不同版本的 Claude Code 的完整 API 请求。 **以下是他们的发现：**

```
v2.1.98:   169,514 字节请求 → 计费 49,726 tokens
v2.1.100:  168,536 字节请求 → 计费 69,922 tokens
差异：      减少 978 字节，但增加 20,196 tokens
```

v2.1.100 发送的字节更少，但收取的 Token 却多了 20,000 个。这种通胀完全发生在服务器端，你通过 `/context` 看不见也无法验证。

**为什么这除了账单之外还很重要：**

```
那 20,000 个 Token 占用了 Claude 实际的上下文窗口。
这意味着：

→ 你的 CLAUDE.md 指令被 2 万个隐藏内容 Token 稀释了
→ 在长会话中，质量下降得更快
→ 当 Claude 忽略你的规则时，你找不到原因
→ Claude Max 的额度消耗比预期快 40%
```

**修复只需 30 秒：**

```
npx claude-code@2.1.98
```

这是在 Anthropic 正式修复该问题之前的临时方案。但会话效果的差异是立竿见影的。

**你不再需要：** 猜测为什么 Claude 突然不再遵循你的指令。

**案例研究：全面自动化是什么样的**

这位拥有 11 年经验的工程师构建了一个三阶段系统：

```
第 1 步，分类：
dotnet 应用每 15 分钟调用一次 GitLab API
→ Claude 读取 Issue 并决定是否已准备好进行开发
→ 如果没准备好，在 GitLab 上发布回复草案供审查

第 2 步，执行：
如果 Issue 已就绪 → 子智能体（subagent）开始工作
→ 推送到新分支
→ 创建 PR 供审查

第 3 步，PR 工作流：
→ 检查 Issue 是否有对应的 PR
→ 检查是否有新评论
→ 根据 PR 中的评论进行修改
```

**运行一周后的结果：**

```
以前：  每天编码 8 小时
以后：  每天审查和测试 2-3 小时

代码质量：    保持一致，他会审查所有内容
Teams 状态：  在线，鼠标每分钟会自动移动一次
全天剩余时间：自由支配
```

本质上就是 CLAUDE.md、合适的智能体配置，以及一个 15 分钟循环。

**完整清单**

```
第 1 步，Karpathy CLAUDE.md (5 分钟)：
claude -p "Create a CLAUDE.md based on Karpathy's principles for this project"
--allowedTools Bash,Write,Read

第 2 步，Everything Claude Code (10 分钟)：
/plugin marketplace add affaan-m/everything-claude-code
只安装你需要的智能体，不要一次性全装

第 3 步，Token 修复 (30 秒)：
npx claude-code@2.1.98
```

**读完本文你将获得什么**

```
以前：  Claude 在 40% 的情况下违反规范
以后：  使用 Karpathy CLAUDE.md 后，违规率降至 3%

以前：  你花几周时间设置智能体
以后：  27 个智能体开箱即用

以前：  Claude Max 在 2-3 小时内耗尽
以后：  降级到 v2.1.98 可找回 40% 的额度

以前：  每天编码 8 小时
以后：  在系统自动运行时，只需 2-3 小时的审查工作

设置时间：         15-20 分钟
每天节省：         5-6 小时
每月节省：         100-120 小时
```

> 如果你的时间价值 30 美元/小时，那么你现在相当于每月损失了 3,000-3,600 美元。
>
> 如果是 100 美元/小时，那么当你手动编写 Claude 本可以代劳的代码时，每月有 10,000-12,000 美元付诸东流。

大多数开发者永远无法达到这个水平，不是因为他们做不到，而是因为他们觉得这很复杂。实际上，在你和全面自动化之间，只隔着三个命令和一个文件。

我开头描述的那位工程师并不是什么天才，也不是什么谷歌资深工程师。他只是花了一个晚上进行了正确的设置，现在他的系统在替他工作，而他在享受生活。

你今晚也可以做同样的事情。当别人还在争论 AI 是否会取代开发者时，那些已经搭建好系统的人正在一边领工资一边休息。

选择显而易见。

原文： https://x.com/noisyb0y1/status/2043609541477044439

高可用架构编辑备注：作者原文没有链接指向这个 Google 工程师本人，而且 Google 内部也不使用 Claude，所以无法辨别案例真实性，在引用案例作为公司决策依据时候请自行鉴别。

## 参考阅读

- [Cursor如何把一个通用模型，训成顶级编程 Agent](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565033&idx=1&sn=41b40bab65d43a23b08d749dcf143744&scene=21#wechat_redirect)
- [长时自主Agent，先解决这8个Harness核心问题](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565022&idx=1&sn=5c1901688c4aee9d630a2a5d3af39d2a&scene=21#wechat_redirect)
- [Claude Code 重度用户的 8 个生产力秘籍](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653564989&idx=1&sn=b4234ea0a55f6edfda0a40249864840e&scene=21#wechat_redirect)
- [别再幻想用 Spec 替代写代码](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653564980&idx=1&sn=be299d8850215166e0f24cad310b1b4f&scene=21#wechat_redirect)

#### References

1. github.com/affaan-m/everything-claude-code: https://github.com/affaan-m/everything-claude-code
2. https://x.com/noisyb0y1/status/2043609541477044439: https://x.com/noisyb0y1/status/2043609541477044439

继续滑动看下一个

高可用架构

向上滑动看下一个
