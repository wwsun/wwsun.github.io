---
title: Kimi K3 时刻
description: 开发者 Stephen Bochinski 实测比较 Kimi K3 与 Claude，认为开源中国模型在编码质量上已与闭源前沿模型持平，而价格仅为其几分之一，美国 AI 限制政策反而伤害了本国用户。
tags:
  - clippings
  - kimi-k3
  - claude
  - open-source-ai
  - ai-economics
source: https://stephen.bochinski.dev/blog/2026/07/18/the-kimi-k3-moment/
created: 2026-07-21
---

## Kimi K3 时刻

> 原文：[The Kimi K3 Moment](https://stephen.bochinski.dev/blog/2026/07/18/the-kimi-k3-moment/) 作者：Stephen Bochinski 日期：2026-07-18

我一直在日常编码工作中同时使用 [Kimi K3](https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems) 和 Claude，就实际效果而言，我已经分不出它们之间的区别了。相同的任务、相同质量的输出，连完成工作所需的 Token 数量也几乎一模一样。我本以为开源模型会更草率，或者在得出相同答案的路上会消耗更多 Token，结果这两样都没发生。

价格却天差地别。K3 的 API 是每百万输入 Token 3 美元、输出 15 美元。Claude 的顶级模型同样的单位要 10 美元和 50 美元。订阅端更是悬殊。Kimi 的付费计划起步 19 美元/月，39 美元的编码套餐在任何接近的价格段都远比 Claude 慷慨。Claude 的套餐计量得非常紧，一个正常天的智能体工作量就能在午饭前把额度吃光。

还有细则。Claude 在二十美元套餐上维持不了 Fable 访问，于是他们把它关了，套餐悄悄降级到 Opus。当你套餐里的主打模型可以因为经济上不划算而被关掉时，这个套餐从一开始就根本没真正卖给你那个主打模型。Kimi 的套餐可没有这种星号备注。

退一步看，更大的叙事是美国 AI 政策是多么彻底的失败。政府压住了 Fable，最终放出来的是一个缩水版本，拒绝处理整类整类的工作。与此同时，一个没有任何限制的前沿水准模型随手就能下载到，它来自一个美国政府根本管不到的中国实验室。无论限制美国模型的这套理论是什么，它显然没想清楚，因为这些限制唯一困住的只有美国用户。[Semgrep 发现 GLM 5.2 在网络攻防基准测试上超越 Claude](https://semgrep.dev/blog/2026/we-have-mythos-at-home-glm-52-beats-claude-in-our-cyber-benchmarks/)，原因就在这里——受限模型拒绝执行任务，而开源模型直接做了。

而且不只是 Kimi。GLM 5.2 以 MIT 许可证发布，在实际工作上击败了最新版 Opus，甚至都没声称自己是前沿级别，价格也只要几分之一。OpenAI 同样被推过政府审查的关卡，推出 [GPT-5.6](https://www.cnbc.com/2026/07/08/openai-expanding-gpt-5point6-ai-model-release-ending-government-limits.html)，但最终得以在二十美元套餐上搭载旗舰模型。不管你对 OpenAI 怎么看，他们在这方面有 Anthropic 明显不具备的腾挪空间。

我觉得我能看到接下来的走向。政府会试图监管 AI，尤其是开源，而且会重演他们对汽车工业那一套。几十年的补贴、救助和保护性关税，产出的美国汽车在国内卖卡车，在全世界其他地方几乎没有存在感。我预计现任政府会在 AI 领域祭出同样的工具：公私合作伙伴关系，撑起只在美国国内使用的本土模型，在国际上毫无竞争力。那将是一个可悲的未来——美国成了唯一一个无法以最优价格获得最佳模型的国家，买到的模型深度绑定腐败的特朗普政府，既不是最高质量也不是最便宜的。至少在那一天到来之前，我找不到任何继续为 Claude 付费的理由。

---

> **译者注**：本文写于 2026 年 7 月，Kimi K3 由月之暗面（Moonshot AI）发布，是当时最大的开源模型。文中的 Fable 指 Anthropic 的 Claude 系列旗舰模型，作者认为美国政府对本土 AI 公司的安全审查反而削弱了其市场竞争力，而中国开源模型的崛起正在改变全球 AI 格局。
