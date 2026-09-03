---
title: LLM Benchmark——如何衡量一个模型有多强
tags:
  - learning
  - llm-benchmark
  - llm
  - benchmark
description: 学习主页：LLM 基准测试的知识库索引与 3D 模拟入口。覆盖评测的动机、考试式基准、竞技场与 Elo、污染与 Goodhart 陷阱、智能体与效率基准、读榜与自测方法。
---

# LLM Benchmark——如何衡量一个模型有多强

> 学习主页 | 方法论参考：[[我是如何用大语言模型学习复杂主题的]]

每家模型发布都说自己「史上最强」，每张对比表里自家都是第一名。但真相只能靠测量：LLM 是几千亿参数的统计黑箱，谁也拆不开，只能向它提问、看它怎么答、让别人投票、让它去干活。

这个学习项目把「LLM 评测」拆成六章，每章一篇笔记，最后有一个可以动手玩的 [3D 模拟](/static/learning/llm-benchmark/simulation.html)，带你扮演一个「待测模型」，走完从进考场到上排行榜的全程。

## 知识库章节

- [[why-benchmark|第 1 章：为什么需要评测]] — 给黑箱打分：不可检视、宣传不可信、评测从 GLUE 到 LLM 时代的演化。
- [[knowledge-benchmarks|第 2 章：考试式基准]] — MMLU、GPQA、HumanEval、MATH、ARC 五张考卷各测什么，pass@k 怎么读。
- [[arena-and-preference|第 3 章：竞技场与人类偏好]] — 匿名投票、Elo 评分、置信区间，为什么偏好能测出考卷测不到的东西。
- [[benchmark-traps|第 4 章：基准的陷阱]] — 数据污染、饱和、Goodhart 定律：任何基准必然经历的三个阶段。
- [[agentic-and-efficiency|第 5 章：智能体与效率基准]] — SWE-bench 修真实 issue、PinchBench 跑完整任务、LLM 当裁判、成本与 token 效率入榜。
- [[reading-leaderboards|第 6 章：如何读榜与自测]] — 读榜五问 + 固定任务集自测，在噪声中做决定。

## 怎么玩模拟

打开 [3D 模拟](/static/learning/llm-benchmark/simulation.html)，跟随一个「待测模型」走完五个阶段：进考场答题 → 竞技场匿名投票 → 陷阱检查站（污染/饱和）→ 智能体真实任务 → 排行榜放榜。每个阶段都有暂停/继续控件、阶段跳转和文字解说，对应上方各篇笔记。

## 已核实来源

知识库撰写后经过网络交叉验证，关键事实与出处如下（每章文末另有「来源」小节）：

- MMLU：2020-09-07 发布（Hendrycks 等），15,908 道四选一、57 科目；发布时 GPT-3 175B 仅 43.9%、人类专家约 89.8%、2024 年中头部模型约 88% —— 维基百科 MMLU 条目
- GPQA：448 道题；非专家上网 30 分钟 34%、博士专家 65%、GPT-4 基线 39%（2023-11）—— arXiv 2311.12022 摘要
- HumanEval：OpenAI Codex 论文（2021）提出，功能正确性判分、重复采样显著提分 —— arXiv 2107.03374 摘要
- MATH：12,500 道竞赛数学题（2021）—— arXiv 2103.03874 摘要；ARC：Chollet 2019 提出 —— arXiv 1911.01547
- Chatbot Arena：2023-04-24 上线（UC Berkeley 的 LMSYS 团队），匿名双模型投票 —— 维基百科 LMArena 条目
- Elo 系统：Arpád Elo 为国际象棋设计，1960 年起被美国棋联采用，是 Bradley-Terry 模型的特例 —— 维基百科 Elo rating system 条目
- Goodhart 定律：Charles Goodhart 1975 年提出 —— 维基百科 Goodhart's law 条目
- SWE-bench：2023-10 发布，2,294 个 issue、12 个 Python 仓库；当时最佳模型 Claude 2 仅解决 1.96% —— arXiv 2310.06770 摘要
- GLUE（2018）/ SuperGLUE（约一年后）：多任务基准打包 —— arXiv 1804.07461 / 1905.00537 摘要
- MMLU 错题研究：约 6.5% 题目有误（2024）—— arXiv 2406.04127（维基 MMLU 条目引述）
- Arena 被操纵案例：Llama 4 Maverick 特调版刷榜（The Verge，2025-04）、数百张操纵投票可扭曲排名（Fast Company，2025-02）—— 维基百科 LMArena 条目引述

**置信边界**：SWE-bench Verified「约 500 题」为官方站点常见口径，本次审查未能直接访问（OpenAI 页面 403、维基无条目），标待验证；GPT-4 发布时 MMLU 86.4% 出自 GPT-4 技术报告，属常识级数字但原报告未直接复核；「LLM 裁判偏爱冗长与自身风格」为行业共识性结论，未逐条核实。HumanEval「164 道题」为常识级数字，论文摘要未直接列出。

## 相关剪报与笔记

- [[llm|大语言模型——从预测下一个词到对话助手]] — 本项目的前置知识库
- [[PinchBench]] — 智能体基准的开源实例（第 5 章重点参考）
- [[Kimi K3 与鹈鹕基准测试的启示]] — 厂商自报与独立评测落差的实录
- [[DeepSeek V4 Flash 0731 — 智能、性能与价格分析]] — 智能指数与效率维度的实例
- [[AI 论文精读：GPT-4 技术报告]] — 只报评测不报架构的典型案例
- [[GLM-5.2 vs Claude Opus：亲手跑了一次 3D 游戏构建对比]] — 自报分数与实测的差距
