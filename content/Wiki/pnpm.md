---
created: 2025-12-15 09:49
url: https://pnpm.io/zh/feature-comparison
tags:
  - pnpm
  - monorepo
---
## pnpm add

```bash
# save to dependencies
pnpm add sax

# save to devDependencies
pnpm add -D sax

# save to workspace devDependencies of package.json
pnpm add -Dw dotenv @gitbeaker/rest
```

## pnpm outdated

检查过期的包。 

```bash
pnpm outdated --filter @music/agents
```

## pnpm update

`pnpm update` 基于指定的范围更新包到它们的最新版本。

- `-r` 同时在所有子目录中使用 `package.json` (不包括 `node_modules`) 运行更新。
- `-i` 显示过时的依赖项并选择要更新的依赖项。

```bash
# 更新
pnpm up

# 交互式更新
pnpm up -i
```

https://pnpm.io/cli/update

推荐使用 `npm-check-updates`

- `-i` 交互式升级
- `-u` 直接更新

```bash
pnpm dlx npm-check-updates --packageFile [package.json]
```

https://github.com/raineorshine/npm-check-updates


## workspace
monorepo support

https://pnpm.io/zh/workspaces

### `pnpm-workspace.yaml`

```
packages:
  # 指定根目录直接子目录中的包
  - 'my-app'
  # packages/ 直接子目录中的所有包
  - 'packages/*'
  # components/ 子目录中的所有包
  - 'components/**'
  # 排除测试目录中的包
  - '!**/test/**'
```

