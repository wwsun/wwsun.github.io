---
created: 2025-12-15 21:14
url: https://docs.npmjs.com/cli/v11/commands
tags:
  - npm
---
## 查看全局包是否需要升级

```bash
npm outdated -g

npm outdated -g --depth=0
```

或者使用 `npm-check`

```bash
npm-check -g

npm-check -gu
```

[https://github.com/dylang/npm-check](https://github.com/dylang/npm-check)
## 升级项目依赖

使用 `npm-check-updates`

```
# workspace 级别
npx npm-check-updates -w -i
```


## 添加/更新 tag 到指定版本

```bash
npm dist-tag add <package>@<version> <tag>

npm dist-tag add my-lib@2.0.0-beta.1 beta

npm dist-tag add my-lib@2.0.0-beta.1 latest
```

移除 tag

```bash
npm dist-tag rm <package> <tag>
```

## npm 包加权限

```bash
npm owner add zhousunjing @music/kernel-service-login --registry=http://rnpm.hz.netease.com
```

## 查看包的信息

```bash
npm list              # 查看已安装的包（树形结构）
npm list --depth=0    # 只显示顶层包
npm view <包名>       # 查看包的详细信息
npm info <包名> versions  # 查看包的所有版本
```

## 缓存管理

```bash
npm cache clean --force  # 清理 npm 缓存（问题排查时很有用）
npm cache verify         # 验证缓存完整性
```

## 私有 registry

```bash
# 登陆
npm login --registry <http://localhost:4873/>

# 查看当前用户
npm whoami --registry <http://localhost:4873/>

# log in, linking the scope to the custom registry 
npm login --scope=@mycorp --registry=https://registry.mycorp.com 

# netease npm 
npm login --scope=@music --registry=http://rnpm.hz.netease.com 


# log out, removing the link and the auth token 
npm logout --scope=@mycorp
```

### 发布私有包

需要在 `package.json` 中加入 `publishConfig`

```
{
  "name": "@music/psionic-api-register",
  "version": "1.0.0-beta.0",
  // ... 其他配置 ...
  "publishConfig": {
    "registry": "http://rnpm.hz.netease.com/"
  }
}
```

## workspace

```bash
# 添加新的子项目 
npm init -w ./packages/a 

# 根目录安装依赖 
npm i --save-dev eslint 

# 向工作区添加依赖 
npm install abbrev -w a 

# 在工作区上下文中运行命令 
npm run test --workspace=a 

# 为每个工作区运行相同的命令 
npm run test --workspace=packages 

# 忽略缺失的脚本 
npm run test --workspaces --if-present 

# -w, --workspace : 指定操作的 workspace 
# -W, --workspace-root: 指向根目录（根 package.json） 
# 升级依赖 
npm outdated -W
```

