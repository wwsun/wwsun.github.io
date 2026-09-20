---
title: 使用 AGENTS.md 提升 AI 代码输出质量
tags:
  - agents-md
draft: true
description: 未命名
source:
---

如果你曾经使用 AI 代理生成代码，并觉得"它既聪明又愚蠢"，这篇文章就是为你准备的。一个小小的 `AGENTS.md` 文件可以让你的代理按照你想要的方式行事。

下面是我编写有效 `AGENTS.md` 的最佳实践。我们将从一个简单的无规则示例开始，然后逐层添加每个部分，解释它的作用和帮助。最后我们会将所有内容组合成一个完整的 `AGENTS.md`。

---

## 什么是 AGENTS.md

[AGENTS.md](http://AGENTS.md) 是位于仓库根目录的一个小型 markdown 文件，告诉 AI 工具你的项目如何工作。类似于 `.cursorrules`、`.builderrules` 等工具特定格式——这些可能会让你的项目堆满每个工具一个的文件——`AGENTS.md` 是一个不断发展的标准，用于将适用于任何代理的规则放在一个地方。

这个文件本质上是 AI 代理的 README，[许多工具都支持它](https://agents.md/)。你不用在每个提示中重复自己，只需一次性写好默认值，让代理从那里开始。

[[agents-md]]

---

## AGENTS.md 的最佳实践

### 该做和不该做

创建好的 [AGENTS.md](https://AGENTS.md) 的主要方法就是与你的代码进行一些试错。运行一些提示，看看你喜欢什么不喜欢什么，然后开始相应地编译该做和不该做的列表。

这是你随心所欲挑剔的机会。AI 在清晰的指南和反馈中茁壮成长。

保持小而清晰。你可以稍后扩展。

```markdown
### 该做

- 使用 MUI v3。确保你的代码与 v3 兼容
- 使用 emotion `css={{}}` prop 格式
- 使用 mobx 进行状态管理，配合 `useLocalStore`
- 使用 `DynamicStyles.tsx` 中的设计 token 进行所有样式设置。不要硬编码
- 使用 apex charts 绘制图表。不要提供自定义 html
- 默认使用小组件。优先选择专注的模块而不是上帝组件
- 默认使用小文件和差异。除非要求，否则避免全仓库重写

### 不该做

- 不要硬编码颜色
- 如果我们已有组件，不要使用 `div`
- 未经批准不要添加新的重量级依赖
```

**为什么有帮助**

- 版本特异性消除了诸如"在 v4 样式中工作但在 v3 中损坏"的微妙 bug
- 状态选择消除了猜测
- 小组件和小差异保持变更可读和可审查

---

### 文件级命令

让我烦恼的一件事是大多数代理太频繁地尝试运行全项目范围的构建命令。如果你在非平凡的代码库上工作，这些命令可能需要几分钟才能运行，而且通常是不必要的。

问题是代理知道它们刚刚编辑的文件路径，而且大多数关键命令（tsc、prettier、test）可以按文件运行。

如果你指定确切的操作命令格式，你会获得更快的反馈和更少的浪费周期。

```markdown
### 命令

# 按路径对单个文件进行类型检查

npm run tsc --noEmit path/to/file.tsx

# 按路径格式化单个文件

npm run prettier --write path/to/file.tsx

# 按路径对单个文件进行 lint

npm run eslint --fix path/to/file.tsx

# 单元测试 - 选择一个

npm run vitest run path/to/file.test.tsx

# 明确请求时进行完整构建

yarn build:app

注意：始终 lint、测试和类型检查更新的文件。谨慎使用项目范围的构建。
```

**为什么有帮助**

- 更快的循环。在几秒钟内对单个文件进行类型检查，而不是几分钟
- 更便宜的运行。当你只是重命名一个 prop 时，你不会在完整构建上浪费 token 或 CI 分钟
- 当事情快速且便宜时，你可以指示 AI 始终运行它们以获得更好的正确性

---

### 安全和权限

你可以明确说明代理可以在不询问的情况下运行什么，不能运行什么。一些工具有额外的允许/拒绝列表配置方式，但我个人发现自然语言指导也很有效。

```markdown
### 安全和权限

无需提示即可允许：

- 读取文件、列出文件
- 单个文件的 tsc、prettier、eslint
- 单个 vitest 测试

先询问：

- 包安装
- git push
- 删除文件、chmod
- 运行完整构建或端到端套件
```

**为什么有帮助**

- 更少的意外。没有"为什么它要 npm install"的时刻
- 更安全的默认值。你控制什么可以改变状态或触及网络

---

### 项目结构提示

代理可以搜索，但几个指针可以节省它每次新聊天都必须重新探索你的代码库的大量时间。把这看作是一个微型索引。

```markdown
### 项目结构

- 查看 `App.tsx` 了解路由
- 查看 `AppSideBar.tsx` 了解侧边栏
- 组件位于 `app/components`
- 设计 token 位于 `app/lib/theme/tokens.ts`
```

**为什么有帮助**

- 更快的结果。代理从人类开始的地方开始
- 上下文有效性。路由、设计 token 等文件在相关时始终在上下文中

---

### 使用具体示例

示例胜过抽象。指向展示你最佳模式的实际文件。同时指出要避免的遗留文件。

```markdown
### 好的和坏的示例

- 避免像 `Admin.tsx` 这样的基于类的组件
- 优先使用带 hooks 的函数式组件，如 `Projects.tsx`
- 表单：复制 `app/components/DashForm.tsx`
- 图表：复制 `app/components/Charts/Bar.tsx`
- 数据网格：复制 `app/components/Table.tsx`
- 数据层：使用 `app/api/client.ts` 进行 HTTP。不要在组件内直接 fetch
```

**为什么有帮助**

- 减少与旧代码的偏离。你可能有一些仍然编译但不应该被复制的遗留代码
- 提高保真度。代理在新代码中镜像你的最佳示例

---

### API 文档引用

如果你希望生成的屏幕在第一次就能与真实数据一起工作，向代理展示文档和类型化客户端的位置。使用简短、具体的指针。

注意：你也可以使用 MCP 服务器来暴露不在你代码中的文档，你也可以在你的 [AGENTS.md](http://AGENTS.md) 中编写关于如何使用和何时使用 MCP 服务器的指导。

```markdown
### API 文档

- 文档位于 `./api/docs/*.md`
- 列出项目 - 使用 `app/api/client.ts` 中的类型化客户端 `GET /api/projects`
- 更新项目名称 - 通过 `client.projects.update` 使用 `PATCH /api/projects/:id`
- 使用 Builder.io MCP 服务器查找 Builder API 的文档
```

**为什么有帮助**

- 默认正确。如果 AI 不必盲目飞行，就不要让它这样做

---

### 你可以嵌套 AGENTS.md 文件

大型仓库受益于分层级规则。在每个关键子目录中添加一个 `AGENTS.md`，以便指导与其确切的技术栈和版本匹配。代理读取离它工作最近的文件。

**为什么有帮助**

- 包可以独立演进。遗留包可以保持 React 17 规则，而新的可以使用 React 18
- 更清晰的指导。一个巨大文件中的条件更少

---

### PR 检查清单

明确说明"准备好"意味着什么。这故意简短且机械化。

```markdown
### PR 检查清单

- 标题：`feat(scope): short description`
- lint、类型检查、单元测试 - 提交前全部绿色
- 差异小而专注。包含变更内容和原因的简要摘要
- 发送 PR 前删除任何过多的日志或注释
```

**为什么有帮助**

- 一致性。每个变更都经过相同的关卡
- 更快的审查。审查者知道期待什么

---

### 卡住时，先计划

给代理一个逃生舱。如果它不确定，它应该询问或提出计划，而不是猜测。

```markdown
### 卡住时

- 询问澄清问题、提出简短计划，或打开带有注释的草稿 PR
- 未经确认不要推送大型推测性变更
```

**为什么有帮助**

- 避免死胡同。你用一个小问题换取一个大错误转向

---

### 可选的测试优先模式

在棘手的任务上，我有时希望代理先创建或更新测试，然后编写代码直到通过。你可以用一个小节来推动它。

```markdown
### 测试优先模式

- 添加新功能时：先编写或更新单元测试，然后编写代码直到通过
- 优先使用组件测试进行 UI 状态变更
- 对于回归：添加一个重现 bug 的失败测试，然后修复到通过
```

**为什么有帮助**

- 强制执行正确性。你在代码偏离之前将行为锁定在测试中

---

### 设计系统索引

如果你的设计系统位于单独的包中，代理会猜测如何使用它。[索引你的系统](https://www.builder.io/c/docs/component-indexing) 以便代理学习组件 API、token 和示例。然后在这里引用该输出。

```markdown
### 设计系统

- 根据 `./design-system-index/*.md` 中的索引文档使用 `@acme/ui` 的组件
- token 来自 `@acme/ui/tokens`
- 示例：查看 `./design-system-index/examples/forms.md` 和 `./design-system-index/examples/tables.md`
```

**为什么有帮助**

- 更高保真度的 UI。更少的覆盖和 hack 来"匹配设计"
- 更少的猜测。代理知道你的 Button、Select 和主题规则

---

## 使用 AGENTS.md 的结果

现在我们已经为 AI 添加了更多指导，让我们看看 [Builder.io 代理](https://www.builder.io/fusion?_host=www.builder.io) 用我们之前尝试的相同提示做得如何。

这次，事情好多了。UI 更准确，token 和暗黑模式正确，代码更干净。

我们可以尝试提示更多，比如添加一个新表格，并查看结果。

beautiful。

最棒的是，使用像 [Builder.io](http://Builder.io) 这样的工具时，`AGENTS.md` 特别有帮助，因为与 Cursor 和 Claude Code 等纯工程工具不同，Builder 通常也被设计师和产品经理使用，所以这些规则在确保那些非开发人员使用代码时，默认获得很好的默认值和指导方面变得特别有价值。

---

## 但是 CLAUDE.md 等怎么办

虽然许多工具支持 `AGENTS.md`，但并非所有工具都支持（还）。解决方案很简单——代理可以查找文件，所以一个文件可以指向另一个文件。对于尚不支持该标准的工具，你可以让它们简单地指向你的 `AGENTS.md`，比如：

```markdown
# CLAUDE.md

严格遵循 ./AGENTS.md 中的规则
```

然后，你可以在根目录旁边放置任意数量的指向它的文件，比如

```
/root
  CLAUDE.md  # 只是指向 AGENTS.md
  AGENTS.md
```

如果你想更花哨，你也可以将 `CLAUDE.md`（等）符号链接到 `AGENTS.md`。

---

## 最终的 AGENTS.md

这里是一个完整版本，将上面所有部分折叠到一个文件中。

```markdown
# AGENTS.md

### 该做

- 使用 MUI v3。确保你的代码与 v3 兼容
- 使用 emotion `css={{}}` prop 格式
- 使用 mobx 进行状态管理，配合 `useLocalStore`
- 使用 `DynamicStyles.tsx` 中的设计 token 进行所有样式设置。不要硬编码
- 使用 apex charts 绘制图表。不要提供自定义 html
- 默认使用小组件
- 默认使用小差异

### 不该做

- 不要硬编码颜色
- 如果我们已有组件，不要使用 `div`
- 未经批准不要添加新的重量级依赖

### 命令

# 优先使用文件级检查

npm run tsc --noEmit path/to/file.tsx
npm run prettier --write path/to/file.tsx
npm run eslint --fix path/to/file.tsx

# 测试

npm run vitest run path/to/file.test.tsx

# 明确请求时进行完整构建

npm run build:app

### 安全和权限

无需提示即可允许：

- 读取文件、列出文件
- 单个文件的 tsc、prettier、eslint
- 单个 vitest 测试

先询问：

- 包安装
- git push
- 删除文件、chmod
- 运行完整构建或端到端套件

### 项目结构

- 查看 `App.tsx` 了解我们的路由
- 查看 `AppSideBar.tsx` 了解我们的侧边栏
- 组件位于 app/components
- 主题 token 位于 app/lib/theme/tokens.ts

### 好的和坏的示例

- 避免像 `Admin.tsx` 这样的基于类的组件
- 使用带 hooks 的函数式组件，如 `Projects.tsx`
- 表单：复制 `app/components/Form.Field.tsx` 和 `app/components/Form.Submit.tsx`
- 图表：复制 `app/components/Charts/Bar.tsx` 和 `app/lib/chartTheme.ts`
- 数据层：使用 `app/api/client.ts`。不要在组件内 fetch

### API 文档

- 文档位于 ./api/docs/\*.md
  - 列出项目 - 使用 app/api/client.ts 的 GET /api/projects
  - 更新项目名称 - 使用 client.projects.update 的 PATCH /api/projects/:id

### PR 检查清单

- 格式化和类型检查：绿色
- 单元测试：绿色。为新代码路径添加测试
- 差异：小，带有简要摘要

### 卡住时

- 询问澄清问题、提出简短计划，或打开带有注释的草稿 PR

### 测试优先模式

- 在新功能上先编写或更新测试，然后编写代码直到通过

### 设计系统

- 根据 `./design-system-index/*.md` 中的索引文档使用 `@acme/ui`
- token 来自 `@acme/ui/tokens`
```

---

## 最佳实践回顾

老实说，如果你什么都不做，只是写一个该做和不该做的列表，那就够了。根据需要添加。试错是关键——运行提示，当事情不是你想要的方式时，将反馈放入你的 `AGENTS.md`。

保持你的 `AGENTS.md` 小而范围明确。以具体示例和文件路径开头。提供文件级命令用于类型检查、格式化、lint 和测试。迭代并在第二次看到相同错误时添加规则。

如果你想在一个能即时获得视觉反馈的代理中尝试所有这些，以便在你的现有代码上快速试验规则——试试 [Fusion](https://fusion.builder.io) 并给我你的反馈。

---

_原文链接：https://www.builder.io/blog/agents-md_
