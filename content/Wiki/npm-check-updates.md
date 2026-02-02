---
created: 2026-01-06 10:21
url: https://github.com/raineorshine/npm-check-updates
tags:
---
ncu 用于升级 package.json 依赖，兼容 npm、yarn、pnpm、deno 和 bun

## 安装

```bash
npm install -g npm-check-updates
```

## 使用

```bash
$ ncu
Checking package.json
[====================] 5/5 100%

 eslint             7.32.0  →    8.0.0
 prettier           ^2.7.1  →   ^3.0.0
 svelte            ^3.48.0  →  ^3.51.0
 typescript         >3.0.0  →   >4.0.0
 untildify          <4.0.0  →   ^4.0.0
 webpack               4.x  →      5.x

运行 ncu -u 来升级 package.json
```

### 检查全局包

```bash
ncu -g
```

### 交互模式

```bash
ncu -i

ncu -i --format group # 分组模式，体验更好
```

## workspace

```bash
# Run on one or more specified workspaces
ncu --workspace <s>

# 交互式升级某个 workspace package
ncu -i --workspace <s>

# Run on all workspaces
ncu -w, --workspaces
```