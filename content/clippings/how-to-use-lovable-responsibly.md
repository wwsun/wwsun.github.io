---
title: 如何负责任地使用 Lovable
description: freeCodeCamp 指南：用 AI 应用构建器 Lovable 时，如何兼顾安全、隐私、无障碍与用户安全——从写清楚提示词到上线前检查清单
tags:
  - clippings
  - ai-coding
  - security
  - lovable
  - accessibility
source: https://www.freecodecamp.org/news/how-to-use-lovable-responsibly/
date: 2026-09-18
author: Eva J Patel
---

## 如何负责任地使用 Lovable

> **原文**：[How to Use Lovable Responsibly](https://www.freecodecamp.org/news/how-to-use-lovable-responsibly/) | 作者：Eva J Patel | 日期：2026-09-10

## 摘要

Lovable 这类 AI 应用构建器能把一句自然语言变成可运行的 Web 应用，速度惊人，但速度不能替代思考——生成出来的应用可能带着安全漏洞、糟糕的交互、错误信息，或者只在演示时能跑通。本文给出了一套实用的负责任用法：先想清楚要解决什么问题再动笔写提示词；不要把密码、密钥、客户数据粘进提示词，用环境变量或占位符代替；认证与授权要分开测试；输入必须在服务端二次校验；警惕生成出来的依赖和无障碍问题；别做暗黑模式；如实标注 AI 生成内容；用假数据测试；上线前过一遍 15 项清单。核心一句话：如果某个 AI 生成的功能会影响别人，就按「你就是那个被影响的人」的标准去审查它。

## 术语表

| 英文                       | 中文        | 说明                                                   |
| -------------------------- | ----------- | ------------------------------------------------------ |
| Lovable                    | Lovable     | AI 驱动的应用构建平台，用自然语言描述即可生成 Web 应用 |
| prompt                     | 提示词      | 向 AI 工具描述需求的自然语言指令                       |
| environment variable       | 环境变量    | 运行时注入的配置值，用于避免把密钥硬编码在代码里       |
| placeholder                | 占位符      | 开发阶段用来替代真实密钥/数据的假值                    |
| authentication             | 认证        | 回答「你是谁」，例如登录                               |
| authorization              | 授权        | 回答「你能做什么」，例如权限校验                       |
| sanitize                   | 净化 / 转义 | 过滤用户输入中的危险内容，降低 XSS 等风险              |
| cross-site scripting (XSS) | 跨站脚本    | 攻击者把恶意脚本注入页面并执行的漏洞类型               |
| dark pattern               | 暗黑模式    | 诱导用户做出违背本意的选择的设计手法                   |
| accessibility              | 无障碍      | 让残障用户也能顺畅使用产品的设计与工程实践             |
| dependency                 | 依赖        | 项目引用的第三方库、包或外部服务                       |
| synthetic data             | 合成数据    | 专门为测试编造的假数据，不含真实个人信息               |
| production-ready           | 生产就绪    | 达到可面向真实用户正式上线的标准                       |
| edge case                  | 边界情况    | 罕见但会暴露缺陷的极端输入或状态                       |

---

## 正文（双语对照）

Building an app used to feel like assembling furniture without instructions, while missing half the screws. Today, AI-powered tools such as Lovable can help you turn an idea into a working web application by describing what you want in plain language.

过去做应用，感觉像在没有说明书、还少了一半螺丝的情况下拼家具。如今，Lovable 这类 AI 工具能让你用大白话描述需求，就把一个想法变成能跑起来的 Web 应用。

That's exciting. It's also a responsibility.

这很令人兴奋，同时也是一份责任。

Lovable can help you move quickly, experiment with ideas, and create useful software. But speed shouldn't replace careful thinking. A generated app can contain security problems, confusing user experiences, inaccurate information, or code that works in a demonstration but falls apart in real life.

Lovable 能帮你快速推进、试验想法、做出有用的软件。但速度不该取代审慎思考。生成出来的应用可能带有安全问题、令人困惑的体验、不准确的信息，或者只是在演示时能跑、一到真实场景就散架的代码。

In this guide, you'll learn practical ways to use Lovable while keeping security, privacy, accessibility, and user safety in mind. We'll cover how to write clearer prompts, protect sensitive information, test authentication and authorization, validate user input, work with realistic test data, review AI-generated code, and decide when an application is ready to share.

本指南将教你一些实用做法，让你在用 Lovable 的同时，把安全、隐私、无障碍和用户安全放在心上。我们会覆盖：如何写出更清晰的提示词、如何保护敏感信息、如何测试认证与授权、如何校验用户输入、如何用贴近真实的测试数据、如何审查 AI 生成的代码，以及如何判断一个应用是否到了可以分享的程度。

By the end, you'll have a simple workflow for building with Lovable more responsibly without giving up the speed and creativity that make AI-powered development useful.

读完之后，你会拥有一套简单的工作流，在更负责任地使用 Lovable 的同时，不牺牲那些让 AI 开发真正有用的速度与创造力。

## 本文涵盖

- What Is Lovable?
- Why Responsible Use Matters
- Start With a Clear and Straightforward Idea
- Do Not Enter Sensitive Information Unnecessarily
- Protect Secrets With Environment Variables
- Understand What Your App Does
- Build Security Into Your Prompts
- Test Authentication and Authorization Separately
- Validate All User Input
- Be Careful With Generated Dependencies
- Design for Accessibility
- Avoid Dark Patterns
- Handle Errors Effectively
- Be Honest About AI-Generated Features
- Protect Personal Data
- Respect Copyright and Ownership
- Test With Realistic but Fake Data
- Test Before You Share the App
- Ask Lovable to Review Its Own Work
- Learn From the Generated Code
- Use Lovable for Prototyping Without Pretending It Is Production-Ready
- Create a Simple Responsible Development Workflow
- A Responsible Prompt Template
- The Golden Rule of AI App Building
- Final Thoughts

- 什么是 Lovable？
- 为什么负责任地使用很重要
- 从一个清晰、直白的想法开始
- 不要不必要地输入敏感信息
- 用环境变量保护密钥
- 搞清楚你的应用到底做了什么
- 把安全要求写进提示词
- 分别测试认证与授权
- 校验所有用户输入
- 谨慎对待生成出来的依赖
- 为无障碍而设计
- 避免暗黑模式
- 妥善处理错误
- 对 AI 生成的功能保持诚实
- 保护个人数据
- 尊重版权与所有权
- 用贴近真实但伪造的数据测试
- 分享应用之前先测试
- 让 Lovable 审查它自己的产出
- 从生成的代码中学习
- 用 Lovable 做原型，但别假装它能直接上生产
- 建立一套简单的负责任开发工作流
- 一份负责任的提示词模板
- AI 应用构建的黄金法则
- 结语

## 什么是 Lovable？

Lovable is an AI-powered app-building platform that allows you to describe an application using natural language. Instead of writing every line of code manually, you can explain what you want and let the tool generate parts of the interface, functionality, and application structure.

Lovable 是一个 AI 驱动的应用构建平台，允许你用自然语言描述一个应用。你不需要手写每一行代码，只要说清楚想要什么，让工具去生成界面、功能和整体结构的一部分。

For example, you might write:

例如，你可以这样写：

```text
Create a task manager with user accounts, a dashboard, task categories, due dates, and a button for marking tasks as complete.
```

Lovable may then generate a starting point that you can review, test, and improve.

然后 Lovable 可能会生成一个起点，供你审查、测试和改进。

The key phrase is "starting point." AI-generated software isn't automatically finished software. Think of Lovable as a very fast coding partner that needs clear instructions, thoughtful reviews, and occasional reminders not to put a banana-shaped button in the middle of your login form.

关键词是「起点」。AI 生成的软件并不等于完成品。把 Lovable 当作一位速度极快的编码搭档——它需要清晰的指令、认真的审查，以及时不时提醒它别把登录表单正中央放一个香蕉形状的按钮。

## 为什么负责任地使用很重要

AI app builders make software development more accessible, but accessibility comes with responsibility. When you create an app, you're making decisions that can affect real people.

AI 应用构建器让软件开发变得更容易上手，但门槛降低也意味着责任。你创建一个应用时，做出的每个决定都可能影响真实的人。

Your application might collect names, email addresses, messages, payment details, health information, or location data. It might make recommendations, display important information, or control access to something valuable.

你的应用可能会收集姓名、邮箱地址、消息内容、支付信息、健康数据或位置信息；它可能会给出推荐、展示重要信息，或者控制对某些有价值资源的访问权限。

A small mistake can create large problems.

一个小失误就可能酿成大问题。

Responsible development helps you:

负责任的开发能帮你：

- Protect user information
- Reduce security risks
- Avoid misleading users
- Create accessible experiences
- Respect copyright and ownership
- Test your application before sharing it
- Understand the code and services your app uses
- Make decisions that are fair and explainable

- 保护用户信息
- 降低安全风险
- 避免误导用户
- 打造无障碍的体验
- 尊重版权与所有权
- 分享之前先测试
- 搞清楚应用用到的代码和服务
- 做出公平、可解释的决策

You don't need to be a security expert to use Lovable responsibly. But you do need to slow down long enough to ask good questions.

负责任地用 Lovable，并不要求你是安全专家。但你确实需要放慢一点节奏，问出几个好问题。

## 从一个清晰、直白的想法开始

Before asking Lovable to build an app, describe the problem you want to solve.

在让 Lovable 构建应用之前，先描述你想解决的问题。

A vague prompt such as this:

像这样含糊的提示词：

```plaintext
Build a cool productivity app.
```

leaves a lot of room for confusion.

留下了大量让人误解的空间。

A clearer prompt might look like this:

更清晰的提示词可能是这样：

```plaintext
Build a simple productivity app for students. Users should be able to create tasks, assign a due date, mark tasks as complete, and filter tasks by status. Use plain language, a calm color palette, and a layout that works well on phones and desktop screens.
```

A strong prompt usually explains:

一份好的提示词通常会讲清楚：

- Who the app is for
- What problem it solves
- What users should be able to do
- What information the app stores
- What the interface should feel like
- What the app should not do
- What platform or screen sizes it should support

- 应用面向谁
- 它解决什么问题
- 用户应该能做哪些事
- 应用存储哪些信息
- 界面应该给人什么感觉
- 应用不应该做什么
- 需要支持哪些平台或屏幕尺寸

Clear instructions make it easier to review the result. They also reduce the chance that the AI invents unnecessary features that make your project more complicated than a group project with twelve shared spreadsheets.

清晰的指令让结果更好审查，也能降低 AI 凭空发明多余功能的风险——否则你的项目会比一个有十二张共享表格的小组作业还要复杂。

## 不要不必要地输入敏感信息

When working with an AI-powered development tool, avoid including sensitive information in prompts unless it's genuinely necessary and handled through an appropriate process.

使用 AI 开发工具时，除非确实必要且走了合适的流程，不要在提示词里包含敏感信息。

Don't paste in:

不要粘贴这些内容：

- Passwords
- Private API keys
- Authentication tokens
- Credit card numbers
- Personal identification numbers
- Private customer records
- Confidential business documents
- Unreleased product details
- Medical records
- Private conversations

- 密码
- 私有 API 密钥
- 认证 Token
- 信用卡号
- 个人身份证件号
- 客户私密记录
- 保密商业文档
- 未发布的产品细节
- 医疗记录
- 私密对话

Use placeholders instead:

改用占位符：

```plaintext
Use a placeholder for the payment provider API key.
```

Or:

或者：

```plaintext
Connect to an email service using an environment variable named EMAIL_API_KEY. Do not hardcode the key in the source code.
```

A placeholder keeps your project easier to share, review, and maintain. It also prevents the classic "I accidentally published a secret to the internet" plot twist.

占位符让你的项目更容易分享、审查和维护，也能避免经典剧情反转——「我不小心把密钥发布到网上了」。

## 用环境变量保护密钥

Secrets shouldn't be placed directly in frontend code or committed to a public repository.

密钥不应该直接写在前端代码里，也不应该提交到公开仓库。

A safer pattern is to use environment variables:

更安全的做法是使用环境变量：

```javascript
const apiKey = process.env.API_KEY
```

For a client-side application, be especially careful. Environment variables used in browser code may be visible to users. A secret that must remain private should usually be used on a secure server or through a protected backend service.

对于客户端应用要格外小心：浏览器代码里用到的环境变量对用户可能是可见的。必须保密的密钥通常应该放在安全的服务端，或通过受保护的后端服务使用。

Never use this pattern:

永远不要这样写：

```javascript
const apiKey = "your-real-secret-key"
```

Use a placeholder during development:

开发阶段用占位符：

```javascript
const apiKey = process.env.API_KEY || ""
```

Then configure the real value through the appropriate secret-management system for your hosting platform.

真实值则通过你所用托管平台对应的密钥管理机制来配置。

Before deploying, search your project for common secret patterns such as:

部署之前，在项目里搜索常见的密钥特征串，例如：

```plaintext
API_KEY
SECRET
TOKEN
PASSWORD
PRIVATE_KEY
```

Finding a suspicious value doesn't always mean it's a secret, but it's worth checking.

搜到可疑的值不一定就是密钥，但值得核查一下。

## 搞清楚你的应用到底做了什么

Don't publish an application that you can't explain at a basic level.

不要发布一个你连基本逻辑都说不清楚的应用。

You should know:

你应该知道：

- What data the app collects
- Where that data is stored
- Which external services receive the data
- Who can view or modify the data
- How users delete their accounts or information
- Which parts of the app require authentication
- What happens when a request fails
- What happens when a user enters unexpected input

- 应用收集哪些数据
- 数据存在哪里
- 哪些外部服务会拿到这些数据
- 谁能查看或修改这些数据
- 用户如何删除自己的账号或信息
- 应用的哪些部分需要认证
- 请求失败时会发生什么
- 用户输入意外内容时会发生什么

You don't need to understand every line immediately. But you should understand the major building blocks.

你不需要立刻看懂每一行代码，但应该理解主要的构件。

If Lovable generates code that you don't understand, ask it to explain a specific section:

如果 Lovable 生成了你看不懂的代码，可以让它解释某个具体部分：

```plaintext
Explain how user authentication works in this project. Identify where sessions are created, how access is checked, and what could go wrong if authentication is misconfigured.
```

You can also ask:

你也可以问：

```plaintext
List all external services used by this application and explain what data each service receives.
```

Explanations are useful, but they aren't proof that the code is safe. Treat them as a map, not a magical safety certificate.

解释很有用，但它并不构成代码安全的证明。把它当成一张地图，而不是一张神奇的安全合格证。

## 把安全要求写进提示词

Security should be part of the original request, not an emergency patch added after someone discovers that every user can view every account.

安全应该是原始需求的一部分，而不是等有人发现「任何用户都能查看所有账号」之后才打上的紧急补丁。

Include security requirements in your prompts:

把安全要求写进提示词：

```plaintext
Only authenticated users should be able to access the dashboard. Users must only be able to view and edit their own tasks. Validate all form inputs, display safe error messages, and never expose secrets in frontend code.
```

For an administrative area, you might write:

如果是管理后台，可以这样写：

```plaintext
Create an admin section that is available only to users with an admin role. Check authorization on the server for every admin action instead of relying only on hiding buttons in the interface.
```

For user-generated content:

对于用户生成内容：

```plaintext
Allow users to submit comments, but sanitize and safely render the content to reduce cross-site scripting risks. Limit comment length and reject empty submissions.
```

Detailed prompts help the generated application start from better assumptions.

写得详细的提示词，能让生成的应用从更好的前提假设出发。

## 分别测试认证与授权

Authentication answers the question, "Who are you?", while authorization answers the question, "What are you allowed to do?"

认证回答的是「你是谁」，授权回答的是「你被允许做什么」。

These are different.

这两者是不同的。

A user may be successfully logged in but still not be allowed to view another user's private records. A responsible application checks both.

一个用户可能成功登录了，但仍然不应该被允许查看他人的私密记录。负责任的应用两者都要检查。

Test cases should include:

测试用例应该包括：

1. A logged-out visitor tries to open a private page.
2. A regular user tries to open an administrator page.
3. A user tries to access another user's record by changing an identifier in the URL.
4. A user submits a request without the required session information
5. A user logs out and them presses the browser's back button.

6. 未登录的访客尝试打开私有页面
7. 普通用户尝试打开管理员页面
8. 用户通过修改 URL 中的标识符，尝试访问他人的记录
9. 用户在不带必要会话信息的情况下提交请求
10. 用户登出后按下浏览器的返回按钮

Don't rely only on hiding navigation links. A hidden button isn't a security system. If a user can still call a backend endpoint directly, the application may be vulnerable.

不要只靠隐藏导航链接。隐藏的按钮不是安全系统。如果用户仍能直接调用后端接口，应用可能就有漏洞。

For example, suppose your application has a page at /admin that should only be available to administrators. You could test authentication and authorization separately like this:

例如，假设你的应用有一个 `/admin` 页面，只应对管理员开放。你可以这样把认证和授权分开测：

#### 认证测试

Log out of the application and then try to open `/admin` directly. The application should redirect you to the login page or return an appropriate unauthorized response.

登出应用，然后直接尝试打开 `/admin`。应用应当把你重定向到登录页，或返回恰当的未授权响应。

Then log in with a valid account and confirm that the application recognizes the authenticated session.

然后用一个有效账号登录，确认应用能识别该已认证会话。

#### 授权测试

Log in with a normal user account that doesn't have an admin role. Then try to open `/admin` directly instead of using the navigation menu. The application should deny access.

用一个没有管理员角色的普通账号登录，然后不走导航菜单、直接尝试打开 `/admin`。应用应当拒绝访问。

Try the same test against the backend endpoint used by an admin action. Confirm that the server also rejects the request.

对管理员操作所调用的后端接口做同样的测试，确认服务端同样会拒绝该请求。

You can also test whether changing an identifier in a URL or request allows one user to access another user's information. The important part is to verify the behavior from the user's perspective and, where possible, confirm that the server is enforcing the permission rather than simply hiding parts of the interface.

你还可以测试：改动 URL 或请求中的标识符，是否会让一个用户访问到另一个用户的信息。关键是从用户视角验证实际行为，并尽可能确认权限是由服务端真正强制执行的，而不只是界面上把入口藏了起来。

## 校验所有用户输入

Users will enter unexpected information. Sometimes this happens by accident. Sometimes it happens because users are testing the boundaries of your application. Occasionally, it happens because someone has decided that a username should be 4,000 characters long and contain seventeen emojis.

用户总会输入意料之外的内容。有时是出于疏忽，有时是用户在试探应用的边界，偶尔则是因为有人认定用户名就该有 4,000 个字符长、还带十七个 emoji。

Validate input on the client for a better user experience and on the server for security.

客户端校验是为了更好的体验，服务端校验是为了安全。

Examples of validation include:

校验的例子包括：

- Required fields
- Maximum and minimum lengths
- Valid email formats
- Allowed file types
- Maximum file sizes
- Valid dates
- Acceptable numeric ranges
- Safe content handling

- 必填字段
- 最大 / 最小长度
- 合法的邮箱格式
- 允许的文件类型
- 文件大小上限
- 合法的日期
- 可接受的数值范围
- 安全的内容处理

A frontend check might look like this:

前端检查可能长这样：

```javascript
if (username.trim().length < 3) {
  showError("Username must be at least 3 characters long.")
  return
}
```

But don't assume that frontend validation is enough. A user can bypass browser checks by sending requests directly to your backend.

但别以为前端校验就够了。用户完全可以绕过浏览器检查，直接向后端发请求。

The server should validate the data again before storing or processing it.

服务端在存储或处理数据之前，应当再校验一遍。

Server-side validation means treating everything received from the browser as untrusted input. The server should check that the submitted data has the expected type, format, length, and range before using it. It should also reject unexpected fields or values when appropriate.

服务端校验意味着把浏览器传来的一切都当作不可信输入。服务器在使用之前，应当检查提交数据的类型、格式、长度和范围是否符合预期，并在适当时候拒绝意外的字段或取值。

For example, if an API accepts a username and age, the server could verify that the username is a non-empty string within the allowed length and that the age is a number within the application's acceptable range. If the request fails validation, the server should reject it rather than storing or processing the invalid data.

例如，如果某个 API 接收用户名和年龄，服务端可以校验用户名是非空字符串且长度在允许范围内，年龄是落在应用可接受范围内的数字。一旦校验失败，服务端应当拒绝该请求，而不是把非法数据存下来或拿去处理。

You can ask Lovable to help create these checks and generate test cases:

你可以让 Lovable 帮忙写这些校验，并生成测试用例：

- Add server-side validation for every field in this form.
- Reject missing, incorrectly formatted, oversized, or out-of-range values before they're stored or processed.
- Then create tests for valid input, missing fields, invalid formats, boundary values, and unexpected input.

- 为这个表单的每个字段加上服务端校验。
- 在存储或处理之前，拒绝缺失、格式错误、超长或超出范围的值。
- 然后为合法输入、缺失字段、非法格式、边界值和意外输入分别创建测试。

AI-generated tests can be useful, but don't rely on them as the only verification. Run the tests yourself and manually try important edge cases as well. The goal is to use AI to speed up the work while keeping human judgment involved in checking whether the validation actually protects the application.

AI 生成的测试可能有用，但不要把它当作唯一的验证手段。自己跑一遍测试，也手动试试重要的边界情况。目标是用 AI 提速，同时让人的判断参与到「这些校验是否真的保护了应用」的确认中。

## 谨慎对待生成出来的依赖

AI-generated projects may use libraries, packages, plugins, and external services. These tools can be helpful, but each dependency adds another piece to understand and maintain.

AI 生成的项目可能会用到各种库、包、插件和外部服务。这些工具有帮助，但每一个依赖都增加了一块需要理解和维护的内容。

Ask Lovable:

可以问 Lovable：

```plaintext
List the main packages used in this project and explain why each one is needed.
```

You can also ask:

也可以问：

```plaintext
Identify dependencies that are unnecessary for the current features and suggest a simpler alternative.
```

Fewer dependencies can mean:

更少的依赖意味着：

- Less code to maintain
- Fewer security updates
- Smaller application size
- Fewer compatibility problems
- Easier debugging

- 要维护的代码更少
- 安全更新更少
- 应用体积更小
- 兼容性问题更少
- 调试更容易

You don't need to remove every package. Just avoid collecting dependencies like digital souvenirs.

你不必把所有包都删掉，只要别把依赖当成数字纪念品一样往收藏夹里囤。

## 为无障碍而设计

An application isn't truly successful if many people can't use it.

如果很多人用不了，一个应用就谈不上真正成功。

Ask Lovable to include accessibility from the beginning:

从一开始就让 Lovable 把无障碍考虑进去：

```plaintext
Make the interface accessible. Use semantic HTML, keyboard navigation, visible focus states, descriptive labels, sufficient color contrast, and accessible error messages.
```

Check whether:

检查以下几点：

- Buttons have clear names
- Form inputs have labels
- Keyboard users can reach every interactive element
- Focus indicators are visible
- Text has enough contrast
- Images have useful alternative text
- Error messages explain how to fix a problem
- The layout works at different screen sizes
- Content remains usable when text is enlarged

- 按钮有清晰的名称
- 表单输入有对应的标签
- 键盘用户能触达每一个可交互元素
- 焦点指示清晰可见
- 文字对比度足够
- 图片有有用的替代文本
- 错误信息说明了如何修复问题
- 布局在不同屏幕尺寸下都正常
- 文字放大后内容依然可用

Avoid using color as the only way to communicate meaning. For example, don't show errors only with a red border. Add text such as:

避免把颜色当作传达含义的唯一手段。例如，不要只用红色边框表示错误，还要加上文字，比如：

```plaintext
Email address is required.
```

Accessibility isn't just a compliance task. It usually makes the application easier for everyone to use.

无障碍不只是合规任务。它通常会让应用对所有人都更好用。

## 避免暗黑模式

A responsible app should help users make informed choices. It shouldn't trick them into doing something they didn't intend.

负责任的应用应当帮助用户做出知情选择，而不是诱骗他们做出本不打算做的事。

Avoid:

避免以下做法：

- Preselected marketing consent
- Hidden cancellation links
- Confusing double negatives
- Misleading buttons
- Fake countdown timers
- Notifications that look like system warnings
- Subscriptions that are easy to start but difficult to stop
- Important information hidden in tiny text

- 默认勾选的营销授权
- 藏起来的取消入口
- 令人困惑的双重否定
- 有误导性的按钮
- 伪造的倒计时
- 看起来像系统警告的通知
- 好开难退的订阅
- 把重要信息藏在极小的字号里

Use clear labels:

使用明确的标签：

```plaintext
Delete account
```

is better than:

要好于：

```plaintext
Continue
```

when the action permanently deletes an account.

当这个操作会永久删除账号时尤其如此。

For destructive actions, provide a confirmation step that clearly explains what will happen:

对于破坏性操作，要有一步确认，并清楚说明会发生什么：

```plaintext
This will permanently delete your account and all saved tasks. This action cannot be undone.
```

Good design respects the user's ability to choose.

好的设计尊重用户做出选择的能力。

## 妥善处理错误

Every application experiences errors. Networks fail. Services go offline. Users close tabs at inconvenient moments. Servers occasionally decide to take an unscheduled vacation.

每个应用都会出错。网络会断，服务会下线，用户会在最不方便的时候关掉标签页，服务器偶尔也会决定放个不请自来的假。

Don't display vague or misleading messages such as:

在能给出有用指引时，不要展示含混或误导的信息，比如：

```plaintext
Something went wrong.
```

when you can provide useful guidance.

而应该给出有用的指引。

```plaintext
We could not save your task because the connection was interrupted. Check your internet connection and try again.
```

For developers, log enough information to investigate the problem without exposing sensitive data:

面向开发者，要记录足以排查问题的信息，同时不暴露敏感数据：

```javascript
try {
  await saveTask(task)
} catch (error) {
  console.error("Task save failed", {
    operation: "create_task",
    message: error.message,
  })
  showError("Your task could not be saved. Please try again.")
}
```

Avoid sending passwords, tokens, private messages, or personal records into logs.

不要把密码、Token、私密消息或个人记录写进日志。

## 对 AI 生成的功能保持诚实

If your application uses AI to generate text, recommendations, summaries, images, or decisions, users should understand that the output may be wrong.

如果你的应用用 AI 来生成文本、推荐、摘要、图像或决策，用户就应当知道这些输出可能是错的。

Use clear language:

用清楚的语言说明：

```plaintext
This summary was generated automatically and may contain mistakes. Review it before sharing.
```

Avoid presenting AI-generated information as guaranteed fact, especially in areas such as:

不要把关 AI 生成的信息当作板上钉钉的事实，尤其是在这些领域：

- Health
- Finance
- Education
- Employment
- Legal information
- Safety
- Personal identity
- News and public information

- 健康
- 金融
- 教育
- 就业
- 法律信息
- 安全
- 个人身份
- 新闻与公共信息

Give users ways to correct, reject, or report problematic output. If an AI feature affects important decisions, provide human review whenever possible.

要给用户纠正、拒绝或举报问题输出的途径。如果某个 AI 功能会影响重要决策，只要可能，就要安排人工复核。

## 保护个人数据

Collect only the information your app actually needs.

只收集应用真正需要的信息。

If a task manager only needs an email address for account recovery, it probably doesn't need a user's home address, phone number, favorite color, and childhood nickname.

如果一个任务管理工具只需要邮箱地址来做账号找回，那它大概不需要用户的家庭住址、电话号码、最喜欢的颜色和童年绰号。

Before adding a data field, ask:

在新增一个数据字段之前，先问：

```plaintext
Why do we need this information?
```

Then ask:

然后再问：

```plaintext
What could happen if this information were exposed?
```

Good data practices include:

良好的数据实践包括：

- Collecting less information
- Explaining why information is needed
- Restricting access
- Deleting information when it's no longer necessary
- Avoiding unnecessary analytics
- Protecting data during transmission and storage
- Giving users meaningful control over their information

- 少收集信息
- 说明为什么需要这些信息
- 限制访问
- 信息不再需要时予以删除
- 避免不必要的埋点分析
- 在传输和存储过程中保护数据
- 让用户对自己的信息拥有实际的控制权

Data isn't free just because a form field is free to add.

数据并不是免费的——不会因为它只是表单里多加一个字段，就没有成本。

## 尊重版权与所有权

Don't ask Lovable to copy an existing product exactly, reproduce copyrighted artwork, or imitate a brand in a way that could confuse users.

不要要求 Lovable 一比一照抄某个现有产品、复刻受版权保护的作品，或者以可能误导用户的方式模仿某个品牌。

Instead, describe the qualities you want:

改为描述你想要的特性：

```plaintext
Create a clean project-management interface with a left sidebar, clear status labels, and a spacious layout. Use original styling and avoid copying any specific company's branding.
```

Be careful with:

要小心的素材包括：

- Images
- Logos
- Icons
- Fonts
- Code snippets
- Written content
- Product names
- Brand colors
- User-generated material

- 图片
- Logo
- 图标
- 字体
- 代码片段
- 文字内容
- 产品名称
- 品牌配色
- 用户生成的材料

Use assets that you created, licensed, or are allowed to use. When in doubt, choose an original design.

只使用你自己创作的、已获得授权的或有权使用的素材。拿不准的时候，就选原创设计。

## 用贴近真实但伪造的数据测试

Use fictional data during development:

开发阶段使用虚构数据：

```plaintext
Name: Jordan Example
Email: jordan@example.test
Order ID: TEST-1001
```

Don't use real customer records just because they're convenient.

不要仅仅因为顺手，就拿真实的客户记录来用。

Create test cases for:

为以下情况创建测试用例：

- Empty states
- Long names
- Very long text
- Invalid email addresses
- Duplicate records
- Missing images
- Slow connections
- Failed requests
- Expired sessions
- Multiple users
- Different screen sizes
- Keyboard-only navigation

- 空状态
- 超长姓名
- 超长文本
- 非法邮箱地址
- 重复记录
- 缺失图片
- 慢速网络
- 请求失败
- 会话过期
- 多用户并发
- 不同屏幕尺寸
- 仅用键盘导航

Fake data helps you test realistic behavior without exposing real people's information.

假数据让你能测试贴近真实的行为，同时不暴露真实用户的信息。

You can create fake data yourself by using clearly fictional names, addresses, email addresses, identifiers, and other values that can't be mistaken for real customer information. For larger datasets, you can also use a reputable fake-data generator or ask Lovable to create a dataset specifically for testing.

你可以自己造假数据，用明显虚构的姓名、地址、邮箱、标识符以及其他不会被误认作真实客户信息的值。数据量较大时，也可以使用口碑好的假数据生成器，或者让 Lovable 专门造一份测试数据集。

For example, you could ask:

例如，你可以这样要求：

```plaintext
Create 100 fictional user records for testing. Use clearly fake names and email addresses under `example.test`. Include different account types, missing optional fields, long names, and other edge cases. Do not use real people's information.
```

Review generated data before using it, especially if you obtain it from an external source. Avoid datasets containing real personal information unless you have a legitimate reason, appropriate authorization, and proper safeguards. When possible, use synthetic data designed specifically for testing so that realistic application behavior can be tested without exposing real people's information.

使用之前先审查生成的数据，尤其是从外部来源获取的数据。除非你有正当理由、合适的授权和完善的防护措施，否则应避免使用包含真实个人信息的数据集。只要可能，就使用专为测试设计的合成数据，这样既能测试贴近真实的应用行为，又不会暴露真实用户的信息。

## 分享应用之前先测试

Before showing your project to others, follow a basic release checklist.

在把项目给别人看之前，走一遍基本的发布检查清单。

```plaintext
1. The app works on mobile and desktop screens.
2. Forms validate input correctly.
3. Authentication behaves as expected.
4. Users can't access data belonging to other users.
5. Secrets aren't included in frontend code.
6. Error messages are clear and safe.
7. Keyboard navigation works.
8. Important buttons have clear labels.
9. Empty states are understandable.
10. Loading states are visible.
11. Destructive actions require confirmation.
12. Test data doesn't contain real personal information.
13. External services are configured correctly.
14. The production environment uses secure settings.
15. The app has been tested after the final changes.
```

译：

```plaintext
1. 应用在手机和桌面屏幕上都能正常工作。
2. 表单能正确校验输入。
3. 认证行为符合预期。
4. 用户无法访问属于其他用户的数据。
5. 前端代码中没有包含密钥。
6. 错误信息清晰且安全。
7. 键盘导航可用。
8. 重要按钮有清晰的标签。
9. 空状态可被理解。
10. 加载状态可见。
11. 破坏性操作需要确认。
12. 测试数据不含真实个人信息。
13. 外部服务配置正确。
14. 生产环境使用安全配置。
15. 最后一次改动之后重新测试过应用。
```

A checklist may feel less exciting than clicking a shiny "Publish" button, but it's much more exciting than explaining to users why the app deleted everything.

过检查清单可能不如点一下闪亮的「发布」按钮来得爽，但这远比向用户解释「应用为什么把一切都删了」要爽得多。

## 让 Lovable 审查它自己的产出

AI tools can help with review tasks when given specific instructions.

只要给出具体的指令，AI 工具也能在审查任务上帮上忙。

Try prompts such as:

可以试试这类提示词：

```plaintext
Review this application for authentication and authorization problems. Identify any route, database query, or API endpoint that may expose data to the wrong user.
```

```plaintext
Review the forms for missing validation, unclear error messages, and accessibility problems.
```

```plaintext
Review the project for hardcoded secrets, unsafe logging, and sensitive information that might appear in the browser.
```

```plaintext
Review the application for mobile layout problems and explain the changes you recommend.
```

Don't accept the review blindly. Compare the suggestions with your own testing and, for serious applications, get help from an experienced developer or security professional.

不要照单全收这份审查结果。把它的建议与你自己的测试结果相互对照；对于正式的应用，还应请有经验的开发者或安全专业人士帮忙。

## 从生成的代码中学习

Using Lovable responsibly doesn't mean avoiding AI-generated code. It means using the tool as an opportunity to learn.

负责任地使用 Lovable，并不意味着要避开 AI 生成的代码，而是把它当作一个学习机会。

When you receive a result, ask:

拿到结果之后，可以问：

```plaintext
Explain this function in beginner-friendly language.
```

```plaintext
Show me a simpler version of this code.
```

```plaintext
What assumptions does this implementation make?
```

```plaintext
What are the possible failure cases?
```

```plaintext
How would this code behave with two users at the same time?
```

Try changing one small part manually. Read the error messages. Compare the before-and-after versions. Over time, the generated code will become less mysterious.

试着手动改动其中一小部分。读一读报错信息。对比改动前后的版本。久而久之，生成的代码就没那么神秘了。

The goal isn't to memorize every programming concept immediately. The goal is to become confident enough to ask better questions and recognize risky answers.

目标不是立刻记住每一个编程概念，而是变得足够有底气——能问出更好的问题，也能识别出危险的答案。

## 用 Lovable 做原型，但别假装它能直接上生产

Lovable is excellent for exploring ideas quickly.

Lovable 非常擅长快速探索想法。

You can use it to:

你可以用它来：

- Test a product concept
- Build a portfolio project
- Create a prototype for user feedback
- Learn how web applications are structured
- Experiment with interfaces
- Build an internal tool
- Turn a rough idea into something people can react to

- 验证一个产品概念
- 做一个作品集项目
- 做原型收集用户反馈
- 学习 Web 应用是如何组织的
- 试验界面设计
- 构建内部工具
- 把一个粗糙的想法变成别人能给出反应的东西

A prototype may not have the same security, reliability, monitoring, documentation, and scalability requirements as a public production application.

原型不一定具备公开生产应用那样的安全、可靠性、监控、文档和扩展性要求。

Be honest about the stage of your project. Use labels such as "Prototype", "Demo", "Work in Progress", and so on.

对项目所处阶段要如实说明，打上「原型」「演示」「施工中」之类的标签。

Don't treat a prototype like a finished product simply because it has a nice gradient and a button that says "Launch."

不要仅仅因为它有个好看的渐变背景和一个写着「Launch」的按钮，就把原型当成完成品。

## 建立一套简单的负责任开发工作流

A practical workflow might look like this:

一套实用的工作流可能是这样：

1. Define the problem
2. Identify the users
3. Decide what information the app needs
4. Write a clear prompt
5. Generate a small feature
6. Review the result
7. Test normal and unexpected behavior
8. Fix security and accessibility problems
9. Repeat for the next feature
10. Test the complete app
11. Remove test data and secrets
12. Document important decisions
13. Deploy only when the app is ready for its intended audience

14. 定义问题
15. 明确用户是谁
16. 确定应用需要哪些信息
17. 写出清晰的提示词
18. 生成一个小功能
19. 审查结果
20. 测试正常行为和意外行为
21. 修复安全与无障碍问题
22. 对下一个功能重复以上步骤
23. 测试完整的应用
24. 清除测试数据和密钥
25. 记录重要决策
26. 只有当应用已经为它的目标用户做好准备时，才部署

This process isn't slow. It's controlled. The fastest path is often the one that avoids rebuilding the entire application after discovering that the foundation was made of optimism and unvalidated form fields.

这套流程并不慢，它是可控的。最快的路径，往往是那条让你不必在发现「地基是用乐观主义和未校验的表单字段搭起来的」之后，再重建整个应用的路。

## 一份负责任的提示词模板

You can use this template when asking Lovable to create a feature:

在让 Lovable 创建一个功能时，可以使用这份模板：

```text
Build [feature] for [type of user].

The goal is to [explain the problem being solved].

Users should be able to:
- [action one]
- [action two]
- [action three]

The application should:
- Validate all user input.
- Protect authenticated routes.
- Ensure users can access only data they are authorized to access.
- Avoid hardcoded secrets.
- Use clear loading and error states.
- Support keyboard navigation.
- Work on mobile and desktop screens.
- Use accessible labels and sufficient color contrast.

Do not:
- Collect unnecessary personal information.
- Expose private data.
- Add unrelated features.
- Change existing authentication behavior without explaining the change.

After building the feature, explain:
- Which files changed.
- What data is stored.
- Which external services are used.
- What security risks remain.
- How I should test the feature.
```

译：

```text
为 [某类用户] 构建 [某个功能]。

目标是 [说明要解决的问题]。

用户应当能够：
- [操作一]
- [操作二]
- [操作三]

应用应当：
- 校验所有用户输入。
- 保护需要认证的路由。
- 确保用户只能访问其被授权访问的数据。
- 避免硬编码密钥。
- 使用清晰的加载与错误状态。
- 支持键盘导航。
- 在手机和桌面屏幕上都能正常工作。
- 使用无障碍标签和足够的颜色对比度。

不要：
- 收集不必要的个人信息。
- 暴露私密数据。
- 添加无关功能。
- 在未说明原因的情况下改动既有的认证行为。

构建完成后，请说明：
- 哪些文件被改动。
- 存储了哪些数据。
- 用到了哪些外部服务。
- 还残留哪些安全风险。
- 我应该如何测试这个功能。
```

This template encourages Lovable to think about more than appearance.

这份模板会促使 Lovable 去思考外观之外的东西。

## AI 应用构建的黄金法则

If an AI-generated feature affects another person, review it as if you will be the person affected.

如果某个 AI 生成的功能会影响另一个人，就按「你就是那个被影响的人」的标准去审查它。

Would you want your data stored there?

你愿意把自己的数据存在那里吗？

Would you understand what the app is doing?

你能看懂这个应用在做什么吗？

Would you be able to correct a mistake?

出了错你能纠正吗？

Would you know how to delete your information?

你知道怎么删除自己的信息吗？

Would you feel comfortable using the application on a phone, with a keyboard, or with a slow internet connection?

在手机上、只用键盘、或者网络很慢的情况下，你用起来还舒服吗？

Would you trust the app if you knew how it was built?

如果你知道它是怎么做出来的，你还会信任它吗？

These questions turn responsible development from an abstract idea into a practical habit.

这些问题把「负责任的开发」从一个抽象概念变成了一种日常习惯。

## 结语

Lovable can make app development more approachable, faster, and more fun. It can help beginners build their first projects and help experienced developers explore ideas without spending hours creating every screen from scratch.

Lovable 能让应用开发更易上手、更快、也更有趣。它能帮新手做出第一个项目，也能帮有经验的开发者探索想法，而无需花上几个小时从零搭建每一个页面。

But responsible use requires more than generating attractive interfaces. Write clear prompts. Protect secrets. Collect less data. Validate inputs. Test permissions. Design for accessibility. Respect ownership. Explain AI-generated features. Review the code. Keep people involved in important decisions.

但负责任地使用，绝不只是生成好看的界面。要写清晰的提示词，要保护密钥，要少收集数据，要校验输入，要测试权限，要为无障碍而设计，要尊重所有权，要说明哪些是 AI 生成的内容，要审查代码，要让「人」参与到重要决策中。

The best AI-built applications aren't the ones created with the fewest clicks. They're the ones built with curiosity, care, and enough testing to survive contact with real users.

最好的 AI 构建应用，不是点最少次数做出来的那些，而是带着好奇心与用心、经过足够测试、能够经受真实用户考验的那些。

Use Lovable to move faster, but use your judgment to decide where you're going.

用 Lovable 走得更快，但由你自己的判断决定要去哪里。

Happy coding!

编码愉快！

---

> **译者注**：
>
> 1. 代码块中的占位符在原文中带有 Markdown 转义反斜杠（如 `API\_KEY`），本文按实际可用写法还原为 `API_KEY`。
> 2. 「暗黑模式」（dark pattern）指诱导性设计，与界面主题的「深色模式」（dark mode）不是一回事。
> 3. 原文小标题「Don't Enter Sensitive Information Unnecessarily」在正文中写作「Do Not Enter…」，本文统一译为同一小节。
