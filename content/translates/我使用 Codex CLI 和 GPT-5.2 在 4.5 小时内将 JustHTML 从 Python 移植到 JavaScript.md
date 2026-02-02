---
description: "作者使用 Codex CLI 和 GPT-5.2 在 4.5 小时内成功将 Emil Stenström 的 JustHTML（Python HTML5 解析器）移植到 JavaScript，展示了前沿大型语言模型在复杂任务中的高级功能。"
source: "https://www.bestblogs.dev/article/e6f6dbcc"
author:
  - "[[Simon Willison]]"
created: 2026-01-21
tags:
  - "clippings"
---
15th December 2025 2025 年 12 月 15 日

I [wrote about JustHTML yesterday](https://simonwillison.net/2025/Dec/14/justhtml/) —Emil Stenström’s project to build a new standards compliant HTML5 parser in pure Python code using coding agents running against the comprehensive html5lib-tests testing library. Last night, purely out of curiosity, I decided to try **porting JustHTML from Python to JavaScript** with the least amount of effort possible, using Codex CLI and GPT-5.2. It worked beyond my expectations.  

我昨天写过 JustHTML——Emil Stenström 的项目，旨在用纯 Python 代码构建一个符合新标准的 HTML5 解析器，借助编码代理运行在全面的 html5lib-tests 测试库上。昨晚，纯粹出于好奇，我决定尝试用最少的精力，将 JustHTML 从 Python 移植到 JavaScript，使用 Codex CLI 和 GPT-5.2。结果远超我的预期。

#### TL;DR

I built [simonw/justjshtml](https://github.com/simonw/justjshtml), a dependency-free HTML5 parsing library in JavaScript which passes 9,200 tests from the html5lib-tests suite and imitates the API design of Emil’s JustHTML library.  
我构建了 simonw/justjshtml，这是一个无依赖的 JavaScript HTML5 解析库，通过了 html5lib-tests 套件中的 9,200 个测试，并模仿了 Emil 的 JustHTML 库的 API 设计。

只用了两个初始提示和几次很小的后续操作。运行在 Codex CLI 上的 GPT-5.2 持续工作了数小时，处理了 1,464,295 个输入 token、97,122,176 个缓存输入 token 和 625,563 个输出 token，最终在 43 次提交中生成了 9,000 行经过完整测试的 JavaScript 代码。

从项目构想到完成库的时间：大约 4 小时。在这期间，我还和家人一起买了圣诞树并装饰，还看了最新的《利刃出鞘》电影。

#### 一些背景

十年前，HTML5 规范最重要的贡献之一，就是它精确规定了无效 HTML 应该如何解析。世界上充满了无效的文档，而有了覆盖这些情况的规范，浏览器就可以以相同的方式处理它们——开发解析软件时再也不用担心“未定义行为”了。

Unsurprisingly, those invalid parsing rules are pretty complex! The free online book [Idiosyncrasies of the HTML parser](https://htmlparser.info/) by Simon Pieters is an excellent deep dive into this topic, in particular [Chapter 3. The HTML parser](https://htmlparser.info/parser/).  
毫不奇怪，这些无效的解析规则非常复杂！Simon Pieters 的免费在线书籍《HTML 解析器的特殊性》对这个主题进行了深入探讨，尤其是第三章《HTML 解析器》。

The Python [html5lib](https://github.com/html5lib/html5lib-python) project started the [html5lib-tests](https://github.com/html5lib/html5lib-tests) repository with a set of implementation-independent tests. These have since become the gold standard for interoperability testing of HTML5 parsers, and are used by projects such as [Servo](https://github.com/servo/servo) which used them to help build [html5ever](https://github.com/servo/html5ever), a “high-performance browser-grade HTML5 parser” written in Rust.  
Python 的 html5lib 项目启动了 html5lib-tests 代码仓库，提供了一套与实现无关的测试用例。这些测试用例后来成为 HTML5 解析器互操作性测试的黄金标准，被 Servo 等项目采用，Servo 利用这些测试帮助构建了 html5ever——一个用 Rust 编写的“高性能浏览器级 HTML5 解析器”。

Emil Stenström’s [JustHTML](https://github.com/EmilStenstrom/justhtml) project is a pure-Python implementation of an HTML5 parser that passes the full html5lib-tests suite. Emil [spent a couple of months](https://friendlybit.com/python/writing-justhtml-with-coding-agents/) working on this as a side project, deliberately picking a problem with a comprehensive existing test suite to see how far he could get with coding agents.  
Emil Stenström 的 JustHTML 项目是一个纯 Python 实现的 HTML5 解析器，能够通过完整的 html5lib-tests 测试套件。Emil 花了几个月的业余时间开发这个项目，特意选择了一个拥有完善测试套件的问题，想看看自己能用编码代理做到什么程度。

At one point he had the agents rewrite it based on a close inspection of the Rust html5ever library. I don’t know how much of this was direct translation versus inspiration (here’s Emil’s [commentary on that](https://news.ycombinator.com/item?id=46264195#46267059))—his project has 1,215 commits total so it appears to have included a huge amount of iteration, not just a straight port.  
有一次，他让代理们根据对 Rust 的 html5ever 库的仔细检查重写了它。我不清楚这其中有多少是直接翻译，多少是借鉴灵感（这里有 Emil 的相关评论）——他的项目总共有 1,215 次提交，显然经历了大量的迭代，而不仅仅是简单的移植。

我的项目则是一次直接的移植。我让 Codex CLI 将 Emil 的 Python 代码构建成 JavaScript 版本。

#### 详细过程

I started with a bit of mise en place. I checked out two repos and created an empty third directory for the new project:  
我先做了一些准备工作。我检出了两个代码仓库，并为新项目创建了一个空的第三目录：

```
cd ~/dev
git clone https://github.com/EmilStenstrom/justhtml
git clone https://github.com/html5lib/html5lib-tests
mkdir justjshtml
cd justjshtml
```

Then I started Codex CLI for GPT-5.2 like this:  
然后我像这样启动了 GPT-5.2 的 Codex CLI：

```
codex --yolo -m gpt-5.2
```

That `--yolo` flag is a shortcut for `--dangerously-bypass-approvals-and-sandbox`, which is every bit as dangerous as it sounds.  
那个 `--yolo` 标志是 `--dangerously-bypass-approvals-and-sandbox` 的快捷方式，这和它听起来一样危险。

My first prompt told Codex to inspect the existing code and use it to build a specification for the new JavaScript library:  
我的第一个提示让 Codex 检查现有代码，并用它来构建新 JavaScript 库的规范：

> `We are going to create a JavaScript port of ~/dev/justhtml - an HTML parsing library that passes the full ~/dev/html5lib-tests test suite. It is going to have a similar API to the Python library but in JavaScript. It will have no dependencies other than raw JavaScript, hence it will work great in the browser and node.js and other environments. Start by reading ~/dev/justhtml and designing the user-facing API for the new library - create a spec.md containing your plan.`

I reviewed the spec, which included a set of proposed milestones, and told it to add another:  
我审查了规范，其中包括一组建议的里程碑，并让它再添加一个：

> `Add an early step to the roadmap that involves an initial version that parses a simple example document that is valid and returns the right results. Then add and commit the spec.md file.`

Here’s [the resulting spec.md file](https://github.com/simonw/justjshtml/blob/19b8eb1f2ca80f428a3c40862d5ec05d36e5166b/spec.md). My request for that initial version became “Milestone 0.5” which looked like this:  
这是生成的 spec.md 文件。我的最初请求成为了“里程碑 0.5”，内容如下：

> **Milestone 0.5 — End-to-end smoke parse (single valid document)  
> 里程碑 0.5 —— 端到端冒烟解析（单个有效文档）**
> 
> - Implement the smallest end-to-end slice so the public API is real early:  
> 	实现最小的端到端流程，这样公共 API 能尽早投入使用：
> 	- `new JustHTML("<html><head></head><body><p>Hello</p></body></html>")` returns a tree with the expected tag structure and text nodes.  
> 		`new JustHTML("<html><head></head><body><p>Hello</p></body></html>")` 返回一个具有预期标签结构和文本节点的树。
> 	- `doc.toText()` returns `"Hello"` and `doc.errors` is empty for this valid input.  
> 		`doc.toText()` 返回 `"Hello"` ，并且对于这个有效输入， `doc.errors` 是空的。
> - Add `scripts/smoke.js` (no deps) that runs the example and asserts the expected structure/output.  
> 	添加 `scripts/smoke.js` （无依赖），运行示例并断言预期的结构/输出。
> - Gate: `node scripts/smoke.js` passes.Gate： `node scripts/smoke.js` 通过。

Then I told it:  
然后我告诉它：

> `Implement Milestone 0.5`

And off it went. The resulting code appeared to work so I said:  
它就这样开始了。生成的代码看起来可以正常运行，于是我说：

> `Configure GitHub Actions test.yml to run that on every commit, then commit and push`

I ran `git init` and created a private GitHub repository for this project at this point, and set up the local directory to push to that remote.  
我运行了 `git init` ，并为这个项目创建了一个私有的 GitHub 代码仓库，同时将本地目录设置为推送到该远程仓库。

Here’s [that initial push](https://github.com/simonw/justjshtml/commit/48497cbd05584c88af757a0736a2ee447468b6b3). Then I told it:  
这是最初的推送。然后我告诉它：

> `OK do the rest, commit and push often`

And that was almost it!  
几乎就这样完成了！

I set my laptop to not fall asleep and left it to its devices while we went off to buy a Christmas tree. The “commit and push often” meant I could monitor its progress on my phone by refreshing [the commit log on GitHub](https://github.com/simonw/justjshtml/commits/main).  
我把笔记本电脑设置为不休眠，然后让它自己运行，我们则去买圣诞树。“频繁提交和推送”让我可以通过在手机上刷新 GitHub 的提交日志来监控进度。

I was running this against my $20/month ChatGPT Plus account, which has a five hour token allowance window for Codex CLI. That ran out at 6:35pm and Codex paused, so I waited until the reset point at 7:14pm and typed:  
我是在每月 20 美元的 ChatGPT Plus 账户上运行这个操作的，该账户为 Codex CLI 提供了五小时的令牌配额窗口。这个配额在下午 6:35 用完了，Codex 暂停了，所以我等到晚上 7:14 重置后输入：

> `Keep going`

At 9:30pm it declared itself done with the following summary message:  
在晚上 9:30，它用以下总结信息宣布任务完成：

```
• What’s Done

  - html5lib-tests now run in CI and pass: tokenizer 6810/6810, tree 1770/1782
    (12 skipped: #script-on), serializer 230/230, encoding 82/83 (1 skipped:
    scripted) (.github/workflows/test.yml:1).
  - Public API expanded: stream() (src/stream.js:1), CSS selectors query()/
    matches() (src/selector.js:1), and toMarkdown() (src/markdown.js:1), all
    exported via src/index.js:1.
  - Added no-deps unit scripts for selectors/stream/markdown (scripts/run-
    selector-tests.js:1, scripts/run-stream-tests.js:1, scripts/run-markdown-
    tests.js:1) and wired them into CI.
  - Fixed TreeBuilder so <br> no longer closes <p> (src/treebuilder.js:647).
```

As a finishing touch, I had it add a playground interface so I could try out the new library in my browser. I prompted:  
作为最后的润色，我让它添加了一个 playground 界面，这样我就可以在浏览器中试用这个新库。我输入了提示：

> `Add a playground.html in the top level folder which loads the necessary ES modules from ./src/... and implements the exact same functionality as seen on https://tools.simonwillison.net/justhtml but using the JavaScript library instead of Pyodide`

It fetched my [existing JustHTML playground page](https://tools.simonwillison.net/justhtml) ([described here](https://simonwillison.net/2025/Dec/14/justhtml/#first-impressions-of-justhtml)) using `curl` and built a new `playground.html` file that loaded the new JavaScript code instead. This worked *perfectly*.  
它使用 `curl` 获取了我现有的 JustHTML playground 页面（如这里所述），并构建了一个新的 `playground.html` 文件，加载了新的 JavaScript 代码。这个过程非常顺利。

I enabled GitHub Pages for my still-private repo which meant I could access the new playground at this URL:  
我为我的仍处于私有状态的仓库启用了 GitHub Pages，这意味着我可以通过这个 URL 访问新的 playground：

[https://simonw.github.io/justjshtml/playground.html](https://simonw.github.io/justjshtml/playground.html)

All it needed now was some documentation:  
现在只需要一些文档：

> `Add a comprehensive README with full usage instructions including attribution plus how this was built plus how to use in in HTML plus how to use it in Node.js`

You can [read the result here](https://github.com/simonw/justjshtml/blob/f3a33fdb29bf97846fd017185edc8cf82783032e/README.md).  
你可以在这里阅读结果。

We are now at eight prompts total, running for just over four hours and I’ve decorated for Christmas and watched [Wake Up Dead Man](https://en.wikipedia.org/wiki/Wake_Up_Dead_Man) on Netflix.  
到目前为止，我们总共用了八个提示，花了刚刚超过四个小时的时间，我还装饰了圣诞节并在 Netflix 上看了《Wake Up Dead Man》。

根据 Codex CLI：

> `Token usage: total=2,089,858 input=1,464,295 (+ 97,122,176 cached) output=625,563 (reasoning 437,010)`

My [llm-prices.com calculator](https://www.llm-prices.com/#it=2089858&cit=97122176&ot=625563&sel=gpt-5.2) estimates that at $29.41 if I was paying for those tokens at API prices, but they were included in my $20/month ChatGPT Plus subscription so the actual extra cost to me was zero.  
我的 llm-prices.com 计算器估算，如果我按 API 价格支付这些 tokens，费用为 29.41 美元，但它们包含在我每月 20 美元的 ChatGPT Plus 订阅中，所以我实际的额外花费为零。

#### 我们能从中学到什么？

我分享这个项目，是因为我认为它展示了 2025 年 12 月 LLM 发展现状中的许多有趣之处。

- Frontier LLMs really can perform complex, multi-hour tasks with hundreds of tool calls and minimal supervision. I used GPT-5.2 for this but I have no reason to believe that Claude Opus 4.5 or Gemini 3 Pro would not be able to achieve the same thing—the only reason I haven’t tried is that I don’t want to burn another 4 hours of time and several million tokens on more runs.  
	前沿大语言模型确实能够在极少监督的情况下，完成包含数百次工具调用的复杂、多小时任务。我这次用的是 GPT-5.2，但我没有理由认为 Claude Opus 4.5 或 Gemini 3 Pro 无法做到同样的事情——我之所以没去尝试，只是不想再花 4 个小时和几百万个 token 去多跑几次。
- If you can reduce a problem to a robust test suite you can set a coding agent loop loose on it with a high degree of confidence that it will eventually succeed. I called this [designing the agentic loop](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/) a few months ago. I think it’s the key skill to unlocking the potential of LLMs for complex tasks.  
	如果你能将一个问题简化为一个健壮的测试套件，你就可以让一个编码代理循环自由运行，并且高度自信它最终会成功。我几个月前把这称为设计代理循环。我认为这是释放 LLM 在复杂任务中潜力的关键技能。
- Porting entire open source libraries from one language to another via a coding agent works extremely well.  
	通过编码代理将整个开源库从一种语言移植到另一种语言效果非常好。
- Code is so cheap it’s practically free. Code that *works* continues to carry a cost, but that cost has plummeted now that coding agents can check their work as they go.  
	代码的成本低得几乎可以忽略不计。虽然可用的代码仍然有成本，但随着编码代理能够边写边检查，这个成本已经大幅下降。
- We haven’t even *begun* to unpack the etiquette and ethics around this style of development. Is it responsible and appropriate to churn out a direct port of a library like this in a few hours while watching a movie? What would it take for code built like this to be trusted in production?  
	我们甚至还没有开始探讨这种开发方式的礼仪和伦理。边看电影边在几小时内快速移植一个库，这样做是否负责任、是否合适？用这种方式构建的代码要获得生产环境的信任，需要达到什么标准？

最后，我想提出一些开放性问题：

- 这个库是否侵犯了 Rust 库或 Python 库的版权？
- 即使这在法律上是允许的，以这种方式构建一个库在道德上是否合适？
- 这种开发模式是否会损害开源生态系统？
- 鉴于这项工作的大部分内容是由 LLM 生成的，我甚至能对其主张版权吗？
- 以这种方式构建的软件库发布出来是否负责任？
- 如果由一个专家团队在几个月的时间里精心打造，这个库会好多少？
