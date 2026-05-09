---
title: Clack - 现代、灵活、强大的 CLI 界面库
tags:
  - cli
draft: false
description: Clack 是一个现代、灵活且强大的 CLI 库，帮助你轻松构建美观的命令行界面。它提供了一组高级组件和低级原语，使创建交互式命令行应用变得简单。
source: https://bomb.sh/docs/clack/basics/getting-started/
---

Clack 是一个现代、灵活且强大的 CLI 库，帮助你轻松构建美观的命令行界面。它提供了一组高级组件和低级原语，使创建交互式命令行应用变得简单。

---

## ✨ 特性

- 🎨 **美观的现代化 UI 组件**
- 🎯 **完整的 TypeScript 类型安全支持**
- 🎭 **可定制的样式和主题**
- 🎮 **交互式提示和菜单**
- 🎪 **渐进式披露**
- 🎭 **表单验证**
- 🎯 **错误处理**
- 🎨 **一致的样式**
- 📦 **ESM-first 分发**

---

## 📦 安装

你可以使用 npm、yarn 或 pnpm 安装 Clack：

```bash
npm install @clack/prompts
```

---

## 🚀 快速开始

以下是一个简单的示例：

```typescript
import { text, select, confirm, isCancel } from "@clack/prompts"

async function main() {
  // 获取用户名
  const name = (await text({
    message: "What is your name?",
    placeholder: "John Doe",
  })) as string

  // 获取用户偏好的框架
  const framework = await select({
    message: "Choose a framework:",
    options: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
    ],
  })

  if (isCancel(framework)) {
    console.log("Operation cancelled")
    process.exit(0)
  }

  // 确认选择
  const shouldProceed = await confirm({
    message: `Create a ${framework} project for ${name}?`,
  })

  if (shouldProceed) {
    console.log("Creating project...")
  }
}
```

---

## 🧩 高级组件

Clack 提供了多个高级组件，便于构建交互式 CLI：

| 组件                 | 说明                            |
| -------------------- | ------------------------------- |
| `text()`             | 文本输入（支持验证）            |
| `password()`         | 安全密码输入（带掩码）          |
| `select()`           | 选择菜单                        |
| `confirm()`          | 是/否确认                       |
| `multiselect()`      | 多选                            |
| `groupMultiselect()` | 分组多选                        |
| `autocomplete()`     | 可搜索的选择菜单                |
| `path()`             | 文件/目录路径选择（带自动补全） |
| `note()`             | 显示信息                        |
| `box()`              | 带框文本显示                    |
| `spinner()`          | 加载状态                        |
| `progress()`         | 进度条显示                      |
| `tasks()`            | 顺序任务执行                    |
| `taskLog()`          | 日志输出（成功时自动清除）      |

---

## 🔧 低级原语

如需更多控制，可以使用低级原语：

```typescript
import { TextPrompt, isCancel } from "@clack/core"

const p = new TextPrompt({
  render() {
    return `What's your name?\n${this.value ?? ""}`
  },
})

const name = await p.prompt()

if (isCancel(name)) {
  process.exit(0)
}
```

---

## 📚 下一步

1. 查看 [Examples](https://bomb.sh/docs/clack/guides/examples) 了解更多实际用例
2. 学习 [Best Practices](https://bomb.sh/docs/clack/guides/best-practices) 掌握 CLI 构建最佳实践
3. 探索 [API Reference](https://bomb.sh/docs/clack/packages/prompts) 获取详细文档
4. 加入 [Discord 社区](https://bomb.sh/chat) 获取支持和参与讨论

---

## 🔷 TypeScript 支持

Clack 使用 TypeScript 构建，提供完整的类型安全。所有组件和原语都有正确的类型定义，便于在编译时捕获错误。

```typescript
import { text } from "@clack/prompts"

// TypeScript 会确保验证函数返回正确的类型
const age = await text({
  message: "Enter your age:",
  validate: (value) => {
    if (!value) return "Please enter a value"
    const num = parseInt(value)
    if (isNaN(num)) return "Please enter a valid number"
    if (num < 0 || num > 120) return "Age must be between 0 and 120"
    return undefined
  },
})
```

---

> 原文：https://bomb.sh/docs/clack/basics/getting-started/
