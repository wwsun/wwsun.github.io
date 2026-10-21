---
title: VS Code Workspace 指定 TypeScript 版本
date: 2026-10-21
description: 如何让 VS Code 使用项目本地安装的 TypeScript 而非内置版本，保证团队协作一致性
tags:
  - vscode
  - typescript
  - dev-tools
---

## 概述

VS Code 自带 TypeScript，但团队项目通常锁定了特定版本。让 VS Code 使用项目里的 TypeScript 可以保证 IDE 检查结果与 CI/命令行一致。

## 1. 使用项目里的 TypeScript

在项目中安装 TypeScript：

```bash
npm install -D typescript
```

然后 VS Code：

- `Cmd + Shift + P` → **TypeScript: Select TypeScript Version** → **Use Workspace Version**

这样 VS Code 会优先使用 `node_modules/typescript/` 而非内置版本。

## 2. 检查当前使用的版本

打开一个 `.ts` 文件，然后：

- `Cmd + Shift + P` → **TypeScript: Select TypeScript Version**

你会看到类似：

```
VS Code's Version    (5.2.2)
Workspace's Version  (5.8.3)
```

也可以在项目目录执行：

```bash
npx tsc --version
```

## 3. 推荐做法

对于团队项目，建议把 TypeScript 固定在 `package.json`：

```json
{
  "devDependencies": {
    "typescript": "5.8.3"
  }
}
```

然后 VS Code 使用 **Workspace Version**。这样 CI、开发环境和 VS Code 使用的 TS compiler 版本保持一致。
