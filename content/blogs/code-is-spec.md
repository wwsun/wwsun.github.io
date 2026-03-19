---
title: 足够详细的规范就是代码
tags:
  - sdd
draft: false
description: AI 的价值在于辅助编码（Pair Programmer），而非完全替代；试图用规范消除编码工作注定失败。
source: https://haskellforall.com/2026/03/a-sufficiently-detailed-spec-is-code
---

AI 的价值在于辅助编码（Pair Programmer），而非完全替代；试图用规范消除编码工作注定失败。
![[Gemini_Generated_Image_r4znl2r4znl2r4zn.png]]

1. 规范 ≠ 代码的简化版 — 足够详细的规范本质上就是代码（或伪代码）
2. 以 OpenAI Symphony 为例 — 其 SPEC.md 长达 2000+ 行，包含数据库模式、算法伪代码、甚至直接是代码
3. 实践验证失败 — 作者用 Claude Code 按规范实现 Haskell 版本，结果 Bug 频出且无法正常工作
4. 引用 Dijkstra — 历史上希腊数学和阿拉伯代数因坚持使用文字描述而陷入困境，直到形式化符号体系出现才突破
5. 博尔赫斯寓言 — 如果地图和领土一样大，地图就毫无用处；规范如果和代码一样详细，也就失去了意义
