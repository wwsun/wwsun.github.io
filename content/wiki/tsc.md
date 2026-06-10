---
title: TypeScript Compiler (tsc)
tags:
  - typescript
  - tooling
  - frontend
description: 关于 tsc 必须要知道的核心概念、常用配置与最佳实践
---

`tsc`（TypeScript Compiler）是 TypeScript 官方提供的命令行工具。它的主要职责是将带有类型注解的 `.ts`/`.tsx` 文件编译（降级）为普通的 JavaScript 文件，并在编译前进行严格的**类型检查**。

在现代前端/Node.js 生态中，理解 `tsc` 的定位和核心配置是每个使用 TypeScript 开发者的必修课。

## 1. 核心职责：类型检查 vs 代码转译

理解 `tsc` 最重要的一点是区分它的两个独立职责：

1. **类型检查（Type Checking）**：分析代码中的类型定义，确保没有类型错误。
2. **代码转译（Emit）**：剥离类型注解，将新的 ECMAScript 语法降级为目标环境（如 ES5/ES6）支持的语法。

> [!important] 现代工程流变
> 在早期的 TS 开发中，`tsc` 包揽了这两项工作。但在现代构建工具链（如 Vite, Webpack, esbuild, swc）中，通常只让这些**更快的工具负责转译代码**（甚至直接忽略类型，只做语法剥离），而**仅仅把 `tsc` 用作独立的类型检查器**。

典型的现代工作流：

- 运行应用：使用 `esbuild` / `swc` / `vite` 快速构建和热更新。
- 类型检查：在 CI/CD 或 pre-commit 钩子中运行 `tsc --noEmit`。

## 2. 必须掌握的核心命令

| 命令                        | 描述                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| `tsc --init`                | 在当前目录下生成一个包含详细注释的默认 `tsconfig.json` 文件。                    |
| `tsc`                       | 读取当前目录下的 `tsconfig.json`，并编译所有匹配的文件。                         |
| `tsc --noEmit`              | **仅执行类型检查**，不生成任何 JavaScript 文件。这是现代前端项目中最常用的命令。 |
| `tsc -w`                    | 监听模式（Watch Mode），当文件发生变化时自动重新进行编译或类型检查。             |
| `tsc -p <path>`             | 指定具体的 `tsconfig.json` 文件路径进行编译。                                    |
| `tsc --emitDeclarationOnly` | 仅生成 `.d.ts` 类型声明文件，不生成 `.js` 文件（多用于开发库/组件库）。          |

## 3. tsconfig.json 核心配置项

`tsconfig.json` 是 `tsc` 的灵魂。面对上百个配置项，你必须重点关注以下几个：

### 基础控制

- **`compilerOptions.strict`**: 必须设为 `true`。开启所有严格类型检查选项（包括 `noImplicitAny`, `strictNullChecks` 等）。如果你不开启它，TypeScript 的价值将大打折扣。
- **`include` / `exclude`**: 指定哪些文件需要被编译/类型检查。通常 `include` 会包含 `["src/**/*"]`，而 `exclude` 默认包含 `node_modules`。

### 模块与目标代码

- **`target`**: 指定编译输出的 JavaScript 目标版本。现代项目通常设置为 `ES2022` 或 `ESNext`。
- **`module`**: 指定生成的模块化规范。
  - 对于前端（使用 Vite/Rollup）：使用 `ESNext` 或 `Preserve`。
  - 对于 Node.js：使用 `Node16` 或 `NodeNext`。
- **`moduleResolution`**: 决定 TypeScript 如何去寻找模块。
  - 传统配置为 `node`。
  - 现代前端构建推荐使用 `bundler`（配合 Vite/esbuild 等使用）。
  - Node.js 项目使用 `node16` / `nodenext`。

### 环境与库

- **`lib`**: 告诉 TS 代码将会运行在什么环境中，从而引入对应的内置类型声明。例如 `["DOM", "ES2022"]` 会让你可以在代码中无报错地使用 `document` 和最新的 JS API。

### 常用路径配置

- **`baseUrl`** 与 **`paths`**: 用于配置路径别名（Alias）。
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
  ```
  > [!warning] 注意
  > `tsc` **不会**在编译时把 `@/` 替换成实际的相对路径，它仅仅是让 TS 类型检查器知道别名映射。如果你需要输出 JS 文件，你需要配合 `tsconfig-paths` 或构建工具的 alias 配置来完成真实的路径替换。

## 4. 类型声明与第三方库

当你在项目中使用第三方 npm 包时，`tsc` 需要知道这些包的类型信息：

- 很多现代包自带类型（包含 `.d.ts` 文件）。
- 如果包没有自带类型（如老的 `lodash`），你需要安装 DefinitelyTyped 社区提供的类型包：`npm i -D @types/lodash`。

如果你需要为一些没有类型声明的非代码文件（如图片、CSS 模块）或特殊的全局变量添加类型，你可以在项目中创建一个 `globals.d.ts`：

```typescript
// 声明 CSS Module
declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}

// 声明全局变量
declare const __APP_VERSION__: string
```

## 5. 项目引用（Project References）

在大型应用或 Monorepo（如使用 pnpm workspace）中，如果将所有代码放在一个庞大的 TypeScript 上下文中，`tsc` 检查会变得非常慢。

此时会用到**项目引用**（Project References）：

- 在子项目中设置 `"composite": true`。
- 在根目录的 `tsconfig.json` 中使用 `references` 数组引用子项目。
  这样 `tsc -b`（build mode）就能实现增量编译，大幅提升类型检查的速度。

## 延伸阅读

- [[Deno]] / [[Deno vs Bun|Bun]]: 现代的 JS 运行时，它们原生支持执行 TS，内置了类型处理能力，使得开发者往往不需要直接与 `tsc` 打交道。
- [TypeScript 官方配置参考](https://www.typescriptlang.org/tsconfig)
