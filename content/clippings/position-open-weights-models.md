---
title: Anthropic 关于开源权重模型的立场
description: Anthropic CEO Dario Amodei 就开源权重模型争议发表正式声明，澄清公司从未主张禁止开源模型，并提出三项应对国家安全风险的措施
tags:
  - clippings
  - ai
  - open-source
  - policy
  - safety
source: https://www.anthropic.com/news/position-open-weights-models
created: 2026-07-28
author: Dario Amodei
---

## Anthropic 关于开源权重模型的立场

> **原文**：[Our position on open-weights models](https://www.anthropic.com/news/position-open-weights-models) | 作者：Dario Amodei，Anthropic CEO | 日期：2026-07-27

## 📝 摘要

Anthropic CEO Dario Amodei 就近期围绕开源权重模型（尤其是中国模型）的争议发表正式声明，明确表示 Anthropic 从未主张禁止开源权重模型。文章阐述了 Amodei 的两大核心安全担忧：威权政权利用 AI 获取军事优势和进行深度镇压，以及强大 AI 被滥用于网络攻击和生物攻击。他支持三项具体措施——芯片出口管制、打击工业级蒸馏行为、对所有足够强大的模型进行强制性安全测试——而非一刀切地禁止开源模型。

## 📋 术语表

| 英文                          | 中文           | 说明                                                 |
| ----------------------------- | -------------- | ---------------------------------------------------- |
| open-weights models           | 开源权重模型   | 公开模型权重参数但可能不公开训练数据或代码的 AI 模型 |
| distillation                  | 蒸馏           | 用小模型学习大模型输出的技术，可大幅降低训练计算成本 |
| guardrails                    | 护栏           | AI 系统的安全防护机制，用于限制有害输出              |
| alignment                     | 对齐           | 确保 AI 系统行为符合人类意图和价值观的研究领域       |
| scaling laws                  | 缩放定律       | 描述模型规模、数据量和计算量对性能影响的经验规律     |
| frontier models               | 前沿模型       | 当前能力最强的 AI 模型                               |
| attacker-defender asymmetry   | 攻防不对称     | 攻击方与防御方在成本和难度上的结构性差距             |
| industrial-scale distillation | 工业级蒸馏     | 大规模、系统性地通过蒸馏复制先进模型能力的行为       |
| biological threats            | 生物威胁       | AI 被用于设计或制造生物武器的风险                    |
| modular training strategies   | 模块化训练策略 | Anthropic 提出的提高开源权重模型安全性的训练方法     |

---

## 正文（双语对照）

Over the last few days there has been a lot of discussion about open-weights models, especially those from China. Reports suggest that some US officials are considering banning the use of Chinese open-weights models by US companies. In response, many tech companies have signed a letter supporting open-weights models, and some people have even accused Anthropic of wanting to ban open-weights models as a means of protecting our business. Anyone who has read my past writing should know that I don't regard such bans as a useful measure, but let me state it clearly so that there is no doubt: Anthropic has never advocated for a ban on open-weights models.

过去几天，围绕开源权重模型——尤其是来自中国的开源权重模型——展开了大量讨论。有报道称，一些美国官员正在考虑禁止美国公司使用中国的开源权重模型。作为回应，许多科技公司签署了一封支持开源权重模型的公开信，甚至有人指责 Anthropic 想以保护自身业务为由禁止开源权重模型。读过我以往文章的人都应该知道，我不认为这种禁令是有效措施。但为了消除疑虑，让我明确表态：Anthropic 从未主张禁止开源权重模型。

Open-weights models that don't have dangerous capabilities are a public good: they don't cost anything besides the compute needed to run them, and they provide value to businesses, developers, and researchers.

不具备危险能力的开源权重模型是一种公共产品：除了运行所需的算力外，它们没有任何成本，为商业、开发者和研究人员提供了价值。

Protectionist bans would not address my most serious national security concerns. Specifically, I am worried about two nightmare scenarios. I laid these out in my essay The Adolescence of Technology six months ago, and have held these positions consistently for many years:

保护主义的禁令无法解决我最严重的国家安全担忧。具体来说，我担心两种噩梦情景。六个月前，我在文章《技术的青春期》中阐述了这些担忧，多年来也一直持有这些立场：

1. My primary concern is the risk that authoritarian governments—not solely the Chinese Communist Party (CCP), although the CCP is clearly the most capable threat—build AI models that are more powerful than those built by the US, and use them to achieve permanent military superiority or perpetrate incredibly deep repression of their own people. This concern is widely shared within the US government: Vice President Vance warned in Paris last year that "authoritarian regimes have stolen and used AI to strengthen their military, intelligence, and surveillance capabilities," and the Intelligence Community's 2026 Annual Threat Assessment found that "other global powers' robust progress in AI is challenging US economic competitiveness and national security advantages." It is irrelevant whether these models are released with open weights, and certainly irrelevant whether they are used by US businesses. In fact, the most dangerous model may be one that is trained in secret and handed only to the People's Liberation Army for use in drones and the Ministry of State Security for surveillance and repression.

1. 我最大的担忧是，威权政府——不仅限于中国共产党（CCP），尽管 CCP 显然是最具能力的威胁——构建出比美国更强大的 AI 模型，并利用它们获取永久军事优势或对本国人民实施极度深入的镇压。这一担忧在美国政府内部广泛存在：副总统 Vance 去年在巴黎警告说"威权政权已经窃取并利用 AI 来增强军事、情报和监视能力"，情报界的 2026 年度威胁评估也指出"其他全球大国在 AI 领域的强劲进展正在挑战美国的经济竞争力和国家安全优势"。这些模型是否以开源权重形式发布无关紧要，它们是否被美国企业使用也肯定无关紧要。事实上，最危险的模型可能是秘密训练出来、仅交给中国人民解放军用于无人机以及国家安全部用于监视和镇压的模型。

1. My secondary concern is the risk that powerful AI models may be misused to carry out cyberattacks or biological attacks, and may have serious alignment problems. Open-weights models—it does not matter whether they come from China or anywhere else—do potentially present a higher risk than closed models, because it is very difficult to apply guardrails to them or monitor their usage, and once weights are released they cannot be withdrawn. But banning the use of these models by US businesses does nothing to address this risk, because bad actors are unlikely to be legitimate US businesses. It would protect US AI companies from competition, but that has never been my goal.

1. 我的第二个担忧是，强大的 AI 模型可能被滥用于发动网络攻击或生物攻击，而且可能存在严重的对齐问题。开源权重模型——无论来自中国还是其他地方——确实可能比闭源模型带来更高的风险，因为很难对其施加护栏或监控使用情况，而且权重一旦发布就无法撤回。但是，禁止美国企业使用这些模型并不能解决这一风险，因为恶意行为者不太可能是合法的美国企业。这样做可以保护美国 AI 公司免受竞争，但这从来不是我的目标。

To address these concerns, I do support the following three measures, which I and Anthropic have consistently advocated for:

为了应对这些担忧，我确实支持以下三项措施，这也是我和 Anthropic 一贯所倡导的：

- We should not sell powerful chips or chipmaking equipment to China, and we should crack down on the rampant smuggling and workarounds used to obtain access to such chips. China has limited domestic production capacity, and therefore, due to the scaling laws, cannot build more powerful models than the US without US chips. This is the most efficient and direct way to block threat #1, and by hampering the training of models that are out of reach of US law, it also indirectly helps with threat #2.

- 我们不应向中国出售强大的芯片或芯片制造设备，并应打击为获取这些芯片而进行的猖獗走私和变通手段。中国的国内产能有限，因此，根据缩放定律，没有美国芯片，中国就无法构建比美国更强大的模型。这是阻止第一种威胁最有效、最直接的方式，同时通过阻碍那些超出美国法律管辖范围的模型训练，也间接有助于应对第二种威胁。

- We should crack down on industrial-scale distillation operations. Distillation is a much more compute-efficient process than training models from scratch. It allows China to build much better models than its number of chips would ordinarily enable, and thus partially evade chip bans. Distillation does not allow the CCP to obtain equivalent or superior AI capabilities to the US, but it can bring the Chinese frontier to within a few months of the US frontier. It is true that many of the companies carrying out these operations release open-weights models—but the open weights are far less relevant than the fact that the operations are backed by an authoritarian state seeking to overtake the US at the frontier. We should have policy interventions to deter this behavior. A blanket ban on open-weights models is neither the correct remedy nor something we have called for.

- 我们应打击工业级蒸馏行为。蒸馏是从头训练模型的远为更高效的计算方式。它使中国能够构建远超其芯片数量所允许的水平的模型，从而部分规避芯片禁令。蒸馏不能让 CCP 获得与美国同等或更优的 AI 能力，但它可以将中国的前沿水平拉近到与美国相差几个月之内。进行这些操作的公司中，确实有许多在发布开源权重模型——但开源权重远不如这样一个事实重要：这些操作背后是一个试图在 AI 前沿超越美国的威权国家。我们应有政策干预来遏制这种行为。一刀切禁止开源权重模型既不是正确的补救措施，也不是我们呼吁过的措施。

- All sufficiently capable models, open and closed, should go through mandatory safety testing. The best way to address threat #2 is to just directly test models for cyber, biological, and alignment risks before release. I think this idea is actually close to a consensus: I have been heartened both that the Trump administration has moved in this direction in recent months, and by recent industry proposals that would apply such testing to the most capable models regardless of their country of origin or whether they are open or closed (while exempting less capable models, such as those from startups and academia, entirely). Whether open models do or don't pose an increased risk, and whether that risk can be mitigated, is something that should emerge from testing, rather than be decided in advance—and there may be promising methods for improving the safety of open-weights models, including recent research from Anthropic on modular training strategies. Note that to be effective, testing would need to be global, which means even the CCP would need to be on board. I think this may actually be possible: as I wrote in The Adolescence of Technology, limited cooperation around preventing AI biological weapons may be possible because it is in China's interest too.

- 所有足够强大的模型，无论开源还是闭源，都应经过强制性安全测试。应对第二种威胁的最佳方式就是在发布前直接测试模型的网络、生物和对齐风险。我认为这一观点实际上已接近共识：我既对特朗普政府近几个月来朝这一方向迈进感到鼓舞，也对近期行业提案感到欣慰——这些提案将对最强大的模型进行此类测试，无论其来源国或是否开源（同时完全豁免能力较低的模型，如来自初创公司和学术界的模型）。开源模型是否确实带来更高的风险，以及这种风险是否可以缓解，应该通过测试来揭示，而非预先决定——而且可能存在提高开源权重模型安全性的有前景的方法，包括 Anthropic 最近关于模块化训练策略的研究。需要注意的是，为使测试有效，需要全球参与，这意味着即便是 CCP 也需要加入。我认为这实际上是可能的：正如我在《技术的青春期》中所写，围绕防止 AI 生物武器的有限合作是可能的，因为这同样符合中国的利益。

This brings me to the open letter. I agree with much of it: open weights expand access to the AI economy, they strengthen competition at least for some use cases, and they give customers greater control. Concerns about distillation should be addressed through targeted legal and commercial frameworks—the same measure I described above. But I don't agree with the letter's assertions that open-weights models necessarily make it easier to develop safeguards or that broad access to capabilities necessarily helps defenders more than attackers. It seems at least as likely to me that the opposite will be true. For example, I worry that biology will have a strong attacker-defender asymmetry, where sufficiently capable models may be able to quickly weaponize pandemic-level viruses with widely available materials, whereas defense against these agents is a multi-year operational task in the best case (as we saw with Operation Warp Speed). Questions like this should be empirically answered by rigorous pre-release testing, not assumed in advance.

回到那封公开信。我同意其中的大部分内容：开源权重扩展了 AI 经济中的参与机会、至少在某些用例中加强了竞争、并赋予客户更大的控制权。对蒸馏的担忧应通过有针对性的法律和商业框架来解决——这正是我上面描述的措施。但我不同意公开信中声称的开源权重模型必然更容易开发安全防护，或者能力的广泛获取必然对防御方比对攻击方更有利的说法。在我看来，相反的情形至少同样可能。例如，我担心生物学领域存在强烈的攻防不对称：足够强大的模型可能能够用广泛可得的材料快速将流行病毒武器化，而防御这些威胁在最好的情况下也是一项多年的操作性任务（正如我们在"曲速行动"中所见）。这类问题应通过严格的发布前测试来得到经验性的答案，而非预先假定的结论。

To summarize my and Anthropic's position, we have not and are not advocating for a ban on open-weights models as a category. We should instead focus on keeping powerful chips out of authoritarian hands, stopping industrial-scale distillation, and requiring safety testing of all sufficiently capable models, open and closed.

总结我和 Anthropic 的立场：我们没有、也不会倡导对开源权重模型作为一个类别实施禁令。我们应当专注于不让强大芯片落入威权政权手中、阻止工业级蒸馏，以及要求所有足够强大的模型（无论开源闭源）进行安全测试。

---

> **译者注**：这篇声明是 Dario Amodei 对近期 OpenAI 等公司联名支持开源权重模型公开信的回应。核心论点是区分了"模型能力扩散"和"权重公开"这两个不同维度的问题：芯片管制和反蒸馏瞄准前者，而安全测试机制覆盖所有的强大模型。他在生物学领域的攻防不对称论述值得关注——这不是传统意义上的开源vs闭源争论，而是对"能力达到某个阈值后，发布方式改变不了根本风险"的警示。
