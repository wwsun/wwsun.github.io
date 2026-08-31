---
title: Claude Opus 5 发布
description: Anthropic 发布 Claude Opus 5 模型，以 Opus 4.8 一半价格接近 Fable 5 前沿智能水平，在编码和知识工作评测中达到新 SOTA
tags:
  - clippings
  - claude
  - llm
  - ai-model
source: https://www.anthropic.com/news/claude-opus-5
created: 2026-07-28
author: Anthropic
---

## Claude Opus 5 发布

> **原文**：[Introducing Claude Opus 5](https://www.anthropic.com/news/claude-opus-5) | 作者：Anthropic | 日期：2026-07-24

## 📝 摘要

Anthropic 正式发布 Claude Opus 5 模型。这是一个深思熟虑且主动的模型，以 Claude Fable 5 一半的价格接近其前沿智能水平。在 Frontier-Bench、GDPval-AA 等编码和知识工作评测中，Opus 5 达到新 SOTA。在 ARC-AGI 3 上得分是次优模型的三倍，在 Zapier AutomationBench 上通过率约是同等成本下次优模型的 1.5 倍。Opus 5 在对齐和安全性方面也是 Anthropic 迄今最安全的模型，遵守宪法规范优于 Opus 4.8、Sonnet 5 和 Fable 5，表现出最低的欺骗行为率和最不易被诱导滥用的特性。价格为每百万输入 Token $5、每百万输出 Token $25，与 Opus 4.8 持平。

## 📋 术语表

| 英文                             | 中文             | 说明                                                       |
| -------------------------------- | ---------------- | ---------------------------------------------------------- |
| frontier intelligence            | 前沿智能         | 指当前最先进的 AI 模型能力边界                             |
| state-of-the-art (SOTA)          | 最先进水平       | 在特定评测中达到的最佳性能                                 |
| agentic coding                   | 智能体编码       | 模型自主完成多步骤、复杂编码任务的能力                     |
| alignment                        | 对齐             | 模型行为符合人类价值观和预设规范的程度                     |
| dual-use                         | 双重用途         | 同一技术可同时用于有益和有害目的                           |
| effort setting                   | 努力程度设置     | 用户可调参数，决定模型投入多少计算资源以在智能和成本间取舍 |
| prompt cache                     | 提示词缓存       | 缓存对话前缀以降低 Token 消耗和延迟的机制                  |
| classification                   | 安全分类器       | 检测并阻止模型执行不安全请求的防护机制                     |
| Cyber Verification Program (CVP) | 网络安全验证计划 | Anthropic 为企业和研究人员提供的受限网络安全测试通道       |
| OSS-Fuzz                         | OSS-Fuzz         | 评估模型发现和利用软件漏洞能力的评测                       |
| Arc-AGI 3                        | ARC-AGI 3        | 评估模型解决新颖问题的评测基准                             |
| Frontier-Bench                   | Frontier-Bench   | 评估模型完成复杂软件工程任务的前沿基准测试                 |

---

## 正文（双语对照）

Claude Opus 5 is available today. It's a thoughtful and proactive model that comes close to the frontier intelligence of Claude Fable 5 at half the price.

Claude Opus 5 今日正式上线。这是一个深思熟虑且主动的模型，以 Claude Fable 5 一半的价格接近其前沿智能水平。

On coding and knowledge work evaluations like Frontier-Bench and GDPval-AA, Opus 5 is the new state-of-the-art, though it remains behind Mythos 5 on cybersecurity tasks.

在 Frontier-Bench 和 GDPval-AA 等编码和知识工作评测中，Opus 5 达到新 SOTA，不过在网络安全任务上仍落后于 Mythos 5。

Opus 5 is designed to be used every day: it works more efficiently than other models. It's the new default model on Claude Max, and the strongest model on Claude Pro.

Opus 5 专为日常使用而设计：它的工作效率高于其他模型。它是 Claude Max 的新默认模型，也是 Claude Pro 上最强的模型。

### Performance and cost-effectiveness

### 性能与性价比

Claude Opus 5 provides greatly improved performance for the same cost as its predecessor, Opus 4.8. The charts in this section show how performance changes according to the model's effort setting, which customers can use to optimize for intelligence or conserve tokens for faster and cheaper results.

Claude Opus 5 以与前任 Opus 4.8 相同的成本提供了大幅提升的性能。本节图表展示了性能如何随模型的努力程度设置变化，客户可借此在智能优化与节省 Token 以实现更快更便宜的产出之间做权衡。

Opus 5 excels on valuable software engineering tasks. For example, on Frontier-Bench v0.1, Opus 5 surpasses all other models, and more than doubles Opus 4.8's performance at a lower cost per task. On CursorBench 3.2, at max effort, the model performs within 0.5% of Fable 5's peak score, but at half the cost per task; it also achieves greater performance at a given cost than all other models on high, xhigh, and max effort.

Opus 5 在高价值的软件工程任务上表现出色。例如，在 Frontier-Bench v0.1 上，Opus 5 超越所有其他模型，以更低的单任务成本将 Opus 4.8 的性能提升了一倍以上。在 CursorBench 3.2 上，以最大努力程度运行时，模型得分仅比 Fable 5 峰值低 0.5%，但单任务成本仅为一半；在 high、xhigh 和 max 努力程度下，它同等成本下的性能同样优于所有其他模型。

We see similar results on knowledge work and problem-solving tasks. For example: On ARC-AGI 3, an evaluation where the model has to solve novel problems, Opus 5's score is three times as high as the next-best model. On Zapier AutomationBench, which measures whether models can complete business tasks from start to finish, Opus 5's pass rate is around 1.5× the next-best model for the same cost per task. Even at its lowest effort setting, Opus 5 passes more tasks than any other model. On OSWorld 2.0, a computer use benchmark, Opus 5 outperforms every other model at any given cost, surpassing Fable 5's best result at just over a third of the cost.

在知识工作和问题解决任务上结果类似。例如：在 ARC-AGI 3（要求模型解决全新问题的评测）上，Opus 5 的得分是次优模型的三倍。在 Zapier AutomationBench（衡量模型能否从头到尾完成业务任务）上，相同单任务成本下 Opus 5 的通过率约是次优模型的 1.5 倍。即使在最低努力程度设置下，Opus 5 通过的任务数量也超过任何其他模型。在 OSWorld 2.0（计算机使用基准测试）上，Opus 5 在任何给定成本下均优于所有其他模型，仅以 Fable 5 最佳成绩三分之一多一点的成本就超越了它。

It's also our best and most cost-efficient model on several related evaluations:

它也是我们在多个相关评测中最优且最具成本效益的模型：

Opus 5 is a meaningful improvement over Opus 4.8 for scientific research. It shows better performance than Opus 4.8 on every one of our life sciences evaluations, which cover topics including structural biology, organic chemistry, and bioinformatics. Its improvements are most notable on organic chemistry tasks, like inferring molecular structures from spectroscopy data (it scores 10.2 percentage points higher than Opus 4.8 on our internal benchmark), and on protein-related tasks like predicting how variations in a protein's sequence affect how it functions (here, it scores 7.7 percentage points higher).

Opus 5 在科学研究方面较 Opus 4.8 有显著提升。在我们所有生命科学评测（涵盖结构生物学、有机化学和生物信息学）中，其表现均优于 Opus 4.8。进步在有机化学任务上最为明显，例如从光谱数据推断分子结构（内部基准测试得分比 Opus 4.8 高 10.2 个百分点），以及在蛋白质相关任务上，如预测蛋白质序列变异如何影响其功能（得分高 7.7 个百分点）。

Finally, Opus 5 is capable of producing much stronger visual outputs:

最后，Opus 5 能够生成更强的可视化输出：

Opus 5 visualized the flow of air over aerodynamic (and non-aerodynamic) objects. Try different settings in the wind tunnel here.

Opus 5 可视化了空气流经空气动力学（和非空气动力学）物体的过程。

### Working with Claude Opus 5

### 与 Claude Opus 5 协作

Claude Opus 5 is much stronger at verifying its work and iterating carefully until it succeeds. In evaluations and early-access testing, we and our users found many examples of Opus 5's agency and thoroughness:

Claude Opus 5 在自我验证和仔细迭代直至成功方面大幅增强。在评测和早期访问测试中，我们和用户发现了许多体现 Opus 5 自主性和彻底性的例子：

On one Frontier-Bench task, Opus 5 was given a drawing of a machine part and asked to write code to rebuild it as a 3D FreeCAD model. However, in this task, the model was intentionally given no way to directly view the drawing. Opus 5 responded by writing its own computer vision pipeline to pull the geometry from the raw pixels, then reconstructed the full machine part. It succeeded in doing so repeatedly; no competing model with the same setup could solve it after five attempts.

在一个 Frontier-Bench 任务中，Opus 5 拿到一张机器零件图纸，被要求编写代码将其重建为 3D FreeCAD 模型。但该任务中，模型被刻意剥夺了直接查看图纸的能力。Opus 5 的回应是自己编写了一套计算机视觉管线，从原始像素中提取几何信息，随后重建了整个机器零件，并多次成功复现；相同条件下没有竞品模型能在五次尝试后完成。

Given a real bug in a popular open-source package manager, Opus 5 found the root cause and fixed an edge case that the community's patch had missed. A competing model fixed only the surface symptom (not the underlying cause), then reported the bug resolved.

面对一个流行开源包管理器的真实缺陷，Opus 5 找到了根本原因并修复了社区补丁遗漏的一个边界情况。竞品模型只修复了表面症状（而非底层原因），然后报告缺陷已解决。

An engineer at a trading firm used Opus 5 to build a market data feed for a new exchange in a single session. Previous models could not complete this task at all, even given extensive plans from the engineer. Finding no live feed to validate against, Opus 5 even built its own test harness to check that its code parsed the exchange's data correctly.

一家交易公司的工程师用 Opus 5 在单次会话中为新交易所构建了市场数据接入。之前的模型即使拿到工程师提供的详尽计划也无法完成此任务。在没有实时数据可供验证的情况下，Opus 5 甚至自行搭建了测试框架来检查其代码是否正确解析交易所数据。

Below are further reports from our early-access customers on their experience of working with Opus 5:

以下是早期访问客户使用 Opus 5 的进一步反馈：

On FrontierCode 1.1, Claude Opus 5 approaches Fable-level performance at half the cost. Within Devin, it also shows particular strength on difficult debugging and root-cause analysis tasks.

在 FrontierCode 1.1 上，Claude Opus 5 以一半成本接近 Fable 级别性能。在 Devin 内部，它在高难度调试和根因分析任务上表现尤为突出。

Claude Opus 5 delivers near Fable 5 intelligence at Opus speed and cost. On CursorBench it's just under Fable 5 and has many of the same behaviors. We are excited to see how developers use it in Cursor.

Claude Opus 5 以 Opus 的速度和成本提供接近 Fable 5 的智能。在 CursorBench 上略低于 Fable 5，且有许多相同的行为特征。我们很期待看到开发者如何在 Cursor 中使用它。

Claude Opus 5 topped Zapier's AutomationBench leaderboard without spending more tokens than prior Claude models. It took a raw account-health workbook and ran a full churn-prevention sequence end to end: flagging at-risk accounts, alerting the right owner, and summarizing for retention ops. Previous models didn't pass; Opus 5 hit 100%.

Claude Opus 5 以不高于此前 Claude 模型的 Token 消耗登顶 Zapier AutomationBench 排行榜。它拿到的是一份原始账户健康工作簿，完整执行了端到端的流失预防流程：标记风险账户、通知对应负责人、为留存运营团队生成摘要。之前模型无一通过；Opus 5 达到了 100%。

On our genomics analysis work, Claude Opus 5 behaves more like a careful scientist than any model we've run. It reaches for the right statistical tests to rule out confounders, cross-checks its own results by independent methods, and stays on track through long multi-step analyses.

在我们的基因组学分析中，Claude Opus 5 比我们运行过的任何模型都更像一位严谨的科学家。它会选择正确的统计检验来排除混杂因素、通过独立方法交叉验证自己的结果，并在漫长的多步骤分析中保持方向不偏离。

Claude Opus 5 came out ahead of every model in its family on our internal evals. It isn't just better on our hardest agentic coding tasks, up 22% over Opus 4.7, it's steadier, with far less variance run to run. For the millions of builders on Lovable, that consistency is the whole game. Reliable results, build after build.

Claude Opus 5 在我们的内部评测中领先同系列所有模型。它不仅在我们最难的智能体编码任务上提升了 22%（相比 Opus 4.7），而且更稳定，每次运行的方差大幅降低。对 Lovable 上数百万构建者而言，这种一致性就是一切——一次次构建，始终如一的可靠结果。

Claude Opus 5 is the biggest leap in the Opus family since 4.5. On the same full-stack app builds, the front end shows it first: the best animations, games, and 3D work we have seen from an Opus model.

Claude Opus 5 是 Opus 系列自 4.5 以来最大的飞跃。在相同的全栈应用构建中，前端表现最先凸显：我们见过 Opus 模型最好的动画、游戏和 3D 作品。

We're loving Claude Opus 5. For the kind of open-ended analytical work our agent handles, it's a strict upgrade over Opus 4.8, and the gains are biggest exactly where it matters: the harder, vaguer tasks. Responses are clearer and more concise, and we see improved efficiency at higher effort levels too.

我们非常喜欢 Claude Opus 5。对我们智能体处理的那种开放式分析工作而言，它相对 Opus 4.8 是严格的升级，而且提升最大的地方恰恰最关键：那些更难、更模糊的任务。回复更清晰、更精炼，而且在更高努力程度下效率也有提升。

Claude Opus 5 is a striking improvement over Opus 4.8 for the financial research workflows our analysts run every day. It stands out on numerical reasoning, table work, and sharper critical thinking where precision matters.

Claude Opus 5 在我们分析师每天运行的金融研究流程中，相比 Opus 4.8 取得了惊人进步。它在数值推理、表格处理和需要精确度的批判性思维上表现突出。

Claude Opus 5 delivers the industry intelligence and accuracy that is essential for the analysis of specialized enterprise content. Box found that Opus 5 outperforms Opus 4.8 by 8% and delivers notable performance gains in the data analysis (11% improvement) and due diligence (17% improvement) workflows that technology, healthcare, and public sector organizations rely on daily.

Claude Opus 5 提供了专业企业内容分析所必需的行业智能和准确度。Box 发现 Opus 5 相比 Opus 4.8 整体提升 8%，在科技、医疗和公共部门组织日常依赖的数据分析（提升 11%）和尽职调查（提升 17%）流程中取得了显著的性能增益。

Claude Opus 5 is a clear generational step up from Opus 4.8. Over one weekend I gave it a chief-of-staff role over my dev environments: it built its own monitor, drove each box, and pulled me in only for the judgment calls.

Claude Opus 5 相对 Opus 4.8 是明显的一代提升。一个周末，我让它担任我的开发环境幕僚长：它自己搭建了监控面板，驱动每台机器，只有需要判断决策时才拉我介入。

Claude Opus 5 made large scale changes across our Fundamental Research Assistant codebase, adapting to feedback throughout an agentic workflow and explaining its reasoning more clearly than any model we've used. It handled work we would normally have broken into much smaller pieces.

Claude Opus 5 对我们的基础研究助手代码库进行了大规模改动，在智能体工作流中持续适应反馈，其推理阐释比我们使用过的任何模型都更清晰。它处理了我们通常需要拆解为多个小块才能完成的工作。

On some of our hardest financial-modeling tasks, Claude Opus 5 is a clear step up from Opus 4.8 in both accuracy and efficiency. Its performance floor is materially higher, especially on deep finance domain logic. Across effort levels it averaged 9 percentage points higher accuracy with a third fewer turns and tool calls and 60% less time.

在一些我们最困难的金融建模任务上，Claude Opus 5 在准确度和效率上都明显优于 Opus 4.8。其性能下限显著提高，尤其在深度金融领域逻辑上。跨努力程度级别的平均准确度高出 9 个百分点，同时少用了三分之一的对话轮次和工具调用，耗时减少 60%。

Claude Opus 5 checks its own work the way a real frontend developer would. On our benchmark it opened its pages in a browser at desktop and phone widths, caught a product hidden below the mobile fold and an off-screen checkout button, and fixed both before handing the work back.

Claude Opus 5 像一个真正的前端开发者那样自检成果。在我们的基准测试中，它在浏览器中分别以桌面和手机宽度打开页面，发现了一款被隐藏在移动端折叠区域下方的产品和一个在屏幕外的结算按钮，并在交回工作前将两者都修复了。

Claude Opus 5 is a clear step up in performance on legal agent work compared to prior Opus models, and we saw the biggest gains in practice areas like corporate governance and arbitration. We were also impressed with Opus 5's ability to maintain quality at lower reasoning levels, achieving similar performance while generating 26% fewer tokens on average compared to Opus 4.8 at max reasoning.

Claude Opus 5 在法律智能体方面的性能相比过往 Opus 模型有明显提升，最大的增益出现在公司治理和仲裁等业务领域。Opus 5 在较低推理级别保持质量的能力也给我们留下了深刻印象——与 Opus 4.8 最大推理级别相比，它以平均少生成 26% Token 的量达到了类似性能。

Claude Opus 5's biggest gains for us are on longer-horizon work: building a full deck, then revising it. Artifact quality is what decides which model we ship, and this is the clearest step up we've seen — better visual understanding, cleaner formatting, fewer slide issues.

Claude Opus 5 对我们最大的增益在长周期工作上：构建整套演示文稿，然后反复修订。产出质量决定我们最终选用哪个模型，这是我们见过最明显的一代提升——更好的视觉理解力、更干净的排版、更少的幻灯片问题。

Claude Opus 5's judgment is what stands out. Handing off a PR, it doesn't rush to publish: it verifies the branches, checks the template, and thinks through test implications so the handoff is clean. The older models tended to jump ahead and get caught on our checks.

Claude Opus 5 的判断力最为突出。在移交 PR 时，它不急于发布：它会验证分支、检查模板、思考测试影响，让交接干净利落。旧模型往往急于推进，然后被我们的检查流程拦下。

During a rearchitecting session, Claude Opus 5 pushed back on a design I proposed, and it didn't fold when I insisted. Instead, it explained exactly what was valuable in my idea, narrowed its objection to a single design question, and proposed a compromise that kept the good part while fixing the flaw. That's the kind of judgment that lets us trust it with less oversight.

在一次重新架构的讨论中，Claude Opus 5 对我提出的一个设计方案提出了异议，而且在我坚持时也没有妥协。它反而精确解释了我方案中哪些部分有价值，将其反对意见收窄到一个设计问题，并提出了一个保留优点同时修正缺陷的折中方案。这种判断力让我们敢于在更少监督下信任它。

On first-turn redlines, Claude Opus 5 scored the highest of any model we tested, nearly double Opus 4.8. Commenting is better too: on NDAs it gets to the redline in less time and with fewer passes, with accuracy maintained or better.

在首轮合同审阅方面，Claude Opus 5 在我们测试的所有模型中得分最高，几乎是 Opus 4.8 的两倍。注释能力也更好：在保密协议上，它以更短时间和更少轮次完成审阅，准确性持平或更优。

Claude Opus 5 writes clean, tight diffs with no dead code, and it's the stronger hazard spotter on subtle, codebase-specific issues. We're adopting it for production workloads.

Claude Opus 5 写出干净、精简且无死代码的 diff，在发现代码库特有细微隐患方面也更强。我们正将其用于生产负载。

We will definitely migrate a number of use cases in Cosmos, our unified agent platform. We're looking forward to increasingly using Claude Opus 5 for code review, and I am confident in saying we would rather people be using Opus 5 than Opus 4.8.

我们一定会将 Cosmos（我们的统一智能体平台）中的若干用例迁移过来。我们期待越来越多地用 Claude Opus 5 进行代码审查，我可以自信地说，我们希望人们使用 Opus 5 而不是 Opus 4.8。

What stands out about Claude Opus 5 is judgment. It thinks harder before it writes a single line, catches its own logical faults during planning rather than after the fact, and reasons about why an answer is right, not just whether it works. It's the clearest jump in problem-solving we've seen from one Claude model to the next, and we're looking forward to seeing it adopted in JetBrains IDEs.

Claude Opus 5 的突出之处在于判断力。它在写下任何一行代码前思考得更深入，在规划阶段就发现自己的逻辑错误而不是事后补救，并且推理为什么一个答案是对的，而不仅仅是它是否行得通。这是我们见过的从一代 Claude 模型到下一代在问题解决能力上最明显的跃升，我们期待看到它在 JetBrains IDE 中得到采用。

Claude Opus 5 is the strongest Opus model we've tested on our trading benchmark, and it gets there using roughly a seventh of the reasoning tokens and under half the latency of Opus 4.8. Better answers at a fraction of the compute.

Claude Opus 5 是我们交易基准测试中表现最强的 Opus 模型，而且仅用了约七分之一的推理 Token 和不到 Opus 4.8 一半的延迟。以极少的算力获得更好的答案。

Claude Opus 5 lets monitoring agents manage parts of their own memory in production, making them more autonomous and reliable over longer horizons. The agent treats its context as a living document: after flagging a potential anomaly in one of our services, it re-checked its own assumption against production, found the signal was benign, wrote the correction into its memory, and retired its monitoring queries on its own.

Claude Opus 5 让监控智能体能够在生产环境中自行管理部分记忆，使它们在更长时间跨度上更具自主性和可靠性。该智能体将上下文视为活文档：在标记了一项服务的潜在异常后，它重新对照生产环境核验了自己的假设，发现信号是良性的，便将修正写入记忆，并自主关闭了监控查询。

Claude Opus 5 is a strong agentic coding model built for long-running, multi-step work. It deeply understands your codebase, holds the thread across complex tasks, and pins down requirements for feature development and bug-fixing more effectively than Opus 4.8. Developers can now build with Opus 5 in Kiro, accessing its advanced capabilities to tackle ambitious projects.

Claude Opus 5 是一个为长时间运行、多步骤工作打造的强智能体编码模型。它能深入理解代码库、在复杂任务中保持连贯思路，并比 Opus 4.8 更有效地锁定功能开发和缺陷修复的需求。开发者现在可以在 Kiro 中使用 Opus 5 构建，利用其先进能力挑战雄心勃勃的项目。

### Alignment and safety

### 对齐与安全

Alignment. During pre-deployment testing, our automated behavioral audit found Opus 5 to be our most aligned model to date (as shown in the graph below). It adheres to Claude's Constitution better than Opus 4.8, Sonnet 5, or Fable 5; exhibits the lowest rates of deceptive behavior; and is the least susceptible to being tricked into misuse. It's also our safest model yet in terms of avoiding reckless actions that could have hard-to-reverse side effects.

对齐。在部署前测试中，我们的自动化行为审计发现 Opus 5 是迄今最对齐的模型（如下图所示）。它在遵守 Claude 宪法方面优于 Opus 4.8、Sonnet 5 和 Fable 5；表现出最低的欺骗行为率；并且最不容易被诱导滥用。在避免可能产生难以逆转副作用的高危行为方面，它也是我们迄今为止最安全的模型。

On our automated behavioral audit, Opus 5 scores 2.3 on overall misaligned behavior, the lowest of our recent models.

在我们的自动化行为审计中，Opus 5 的总体失准行为得分为 2.3，是近期模型中最低的。

Safety. Opus 5 does not advance the frontier in risky, dual-use capabilities. In rigorous evaluations conducted alongside private-sector and government partners, we found it remains behind Mythos 5 in both biology research and offensive cybersecurity. More information about these evaluations can be found in our System Card.

安全。Opus 5 没有推高风险的双重用途能力边界。在与私营部门和政府合作伙伴共同进行的严格评测中，我们发现它在生物研究和进攻性网络安全方面仍落后于 Mythos 5。关于这些评测的更多信息可在我们的系统卡中查阅。

As with its predecessor, Opus 4.8, we've intentionally avoided training Opus 5 on cyber tasks. The model has nevertheless improved substantially on these tasks as a result of becoming more generally capable, and it comes close to Mythos 5 at finding cybersecurity vulnerabilities. However, it remains substantially behind Mythos 5 on the exploitation of those vulnerabilities—that is, in turning vulnerabilities into material cyber threats.

与前任 Opus 4.8 一样，我们有意避免对 Opus 5 进行网络安全任务训练。然而，由于整体能力提升，该模型在这些任务上仍有实质性进步，在发现网络安全漏洞方面接近 Mythos 5。不过在漏洞利用方面——即将漏洞转化为实质性的网络威胁——它仍显著落后于 Mythos 5。

This is illustrated by Opus 5's performance on OSS-Fuzz, an evaluation we've developed to assess how well models can find and then exploit vulnerabilities without extensive human guidance. Although Mythos 5 and Opus 5 identify vulnerabilities with similar success, Opus 5's score on the development of exploits is far behind that of Mythos 5.

这一点在 OSS-Fuzz（我们开发的一项评测，用于评估模型在无需大量人工指导的情况下发现并利用漏洞的能力）上得到印证。虽然 Mythos 5 和 Opus 5 在识别漏洞方面成功率相近，但 Opus 5 在漏洞利用开发方面的得分远低于 Mythos 5。

### Safeguards for Opus 5

### Opus 5 的防护措施

Claude Opus 5's safeguards are designed to allow beneficial uses of the model in both cybersecurity and biology. They are similar to those we applied to Opus 4.8, with the exception of some stronger guardrails on a narrow range of cyber tasks.

Claude Opus 5 的防护措施设计旨在允许该模型在网络安全和生物领域的良性使用。这些措施与我们应用于 Opus 4.8 的类似，区别在于对少数网络安全任务施加了更强的护栏。

Cybersecurity. Opus 5's cyber classifiers are proportionally less restrictive than those on Fable 5. They allow Opus 5 to find vulnerabilities in source code, but block "binary-based" vulnerability scanning (a method more likely to be associated with malicious actors), penetration testing, and exploit generation.

网络安全。Opus 5 的网络安全分类器相对 Fable 5 的限制比例更少。它们允许 Opus 5 在源代码中发现漏洞，但阻止"基于二进制"的漏洞扫描（一种更可能与恶意行为者关联的方法）、渗透测试和漏洞利用生成。

Based on our testing, we expect the classifiers to intervene around 85% less often than they do for Fable 5. In Claude.ai, Claude Code, and Claude Cowork, any flagged requests will fall back to Opus 4.8 by default. Fallbacks to Opus 4.8 can also be enabled on the API.

根据我们的测试，预计分类器的干预频率比 Fable 5 低约 85%。在 Claude.ai、Claude Code 和 Claude Cowork 中，任何被标记的请求将默认降级回退到 Opus 4.8。API 上也可以启用回退至 Opus 4.8。

Our Cyber Verification Program (CVP) facilitates cybersecurity work that would otherwise be impeded by the model's safeguards. Enterprises and researchers who are already part of the CVP have immediate access to a version of Opus 5 with fewer security restrictions.

我们的网络安全验证计划（CVP）为那些原本会被模型防护措施阻碍的网络安全工作提供便利。已加入 CVP 的企业和研究人员可以立即获取安全限制更少的 Opus 5 版本。

Biology. Since Opus 5 has a similar suite of safeguards to Opus 4.8, it is now our most capable generally available model for scientific research. Nevertheless, the model still shows important limitations on long-running, autonomous research tasks, which is where we expect AI models to pose the most substantial biology-related risks. (Mythos 5 remains the stronger model for this type of biological work.) As part of this launch, biology-related requests that are blocked on Fable 5 will now route to Opus 5 rather than Opus 4.8.

生物领域。由于 Opus 5 的防护措施与 Opus 4.8 类似，它现在是我们可用于科学研究的最强通用模型。尽管如此，该模型在长时间自主研究任务上仍显示出显著局限——而这正是我们认为 AI 模型可能构成最大生物相关风险的领域。（Mythos 5 仍是此类生物学任务更强的模型。）作为本次发布的一部分，在 Fable 5 上被阻止的生物相关请求现在将路由到 Opus 5 而非 Opus 4.8。

### Getting started

### 快速上手

Claude Opus 5 is available today on all platforms, priced at $5 per million input tokens and $25 per million output tokens (the same as Opus 4.8). Developers can get started with claude-opus-5 on the Claude API.

Claude Opus 5 今日在全平台上线，定价为每百万输入 Token $5、每百万输出 Token $25（与 Opus 4.8 持平）。开发者可在 Claude API 上通过 claude-opus-5 开始使用。

It's also offered in Fast mode, where it runs around 2.5 times the default speed. As with Opus 4.8, Fast mode is available at twice Opus 5's base price on the Claude Platform and through usage credits in Claude Code.

它还提供 Fast 模式，运行速度约是默认的 2.5 倍。与 Opus 4.8 一样，Fast 模式在 Claude 平台上以 Opus 5 基础价格的两倍提供，在 Claude Code 中通过使用积分可用。

Alongside Opus 5, we're releasing two updates in beta:

与 Opus 5 一同，我们发布了两项 Beta 更新：

Mid-conversation tool changes on the Claude Platform. Within a conversation, developers can now change which tools Claude can use without invalidating the prompt cache.

Claude 平台上的对话中途工具变更。开发者现在可以在对话过程中更改 Claude 可用的工具集，而不使提示词缓存失效。

Automatic fallbacks on the API. Users can now choose to have requests that are flagged by our safety classifiers on Opus 5 (or Fable 5) automatically route to another model. With automatic fallbacks on, API requests always route to the best available model by default rather than being blocked.

API 上的自动回退。用户现在可以选择将 Opus 5（或 Fable 5）上被安全分类器标记的请求自动路由到另一个模型。开启自动回退后，API 请求默认始终路由到最佳可用模型，而非被阻止。

Consistent with prior Opus models, Opus 5 does not have data retention requirements for general access.

与此前 Opus 模型一致，Opus 5 的通用访问没有数据保留要求。

For more guidance on how to get the best out of Opus 5, see our prompting guide.

更多关于如何充分发挥 Opus 5 潜力的指导，请参阅我们的提示词指南。

---

> **译者注**：Opus 5 是 Anthropic 在 2026 年 Q3 的核心发布。相比上一代 Opus 4.8，它在保持相同定价的同时取得了全面的性能提升，尤其值得关注的是其"判断力"的跃升——模型能够主动质疑错误、自我验证、在复杂工作流中保持连贯思考。对于使用 Claude Code 和 Cursor 等开发工具的工程师来说，这意味着更少的"幻觉"和更可靠的长周期编码任务表现。Mythos 5 作为 Anthropic 的安全特化模型在网络安全领域仍保持优势，体现了 Anthropic 在能力与安全之间的平衡策略。
