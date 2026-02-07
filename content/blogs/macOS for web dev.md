---
title: "macOS Web 开发环境配置指南"
date: 2026-02-02 00:00:00
tags:
  - macos
  - web-development
  - setup
  - tools
draft: false
description: "2026 年 macOS Web 开发环境配置综合指南，涵盖 Homebrew, Node.js, Zsh 及核心开发工具。"
url: https://www.robinwieruch.de/mac-setup-web-development/
---

## macOS for web dev

如何快速初始化 macos 开发环境

部分参考了 [Mac Setup for Web Development 2025](https://www.robinwieruch.de/mac-setup-web-development/)

## 系统设置

```python
# take screenshots as jpg (usually smaller size) and not png
defaults write com.apple.screencapture type jpg

# do not open previous previewed files (e.g. PDFs) when opening a new one
defaults write com.apple.Preview ApplePersistenceIgnoreState YES

# show Library folder
chflags nohidden ~/Library

# show hidden files
defaults write com.apple.finder AppleShowAllFiles YES

# show path bar
defaults write com.apple.finder ShowPathbar -bool true

# show status bar
defaults write com.apple.finder ShowStatusBar -bool true

```

### intel cpu，关闭深度睡眠 / 电能小憩

对于 intel cpu，某些情况下可能会存在睡眠唤醒崩溃（Sleep/Wake Kernel Panic）问题，可以尝试关闭深度睡眠。

在终端执行：

```bash
sudo pmset -a standby 0
sudo pmset -a autopoweroff 0
sudo pmset -a powernap 0
```

然后重启电脑。

这样会让 Mac 用较浅的睡眠模式，避免深度睡眠 bug。

## 必备软件

- chrome
- xcode
- homebrew
- nodejs == 使用 fnm 安装管理
- vscode
- iterm2
- [Pearcleaner](https://github.com/alienator88/Pearcleaner) 快捷卸载 App 必备
- Obsidian -- 免费的个人知识库工具
- charles
- [Bruno](https://github.com/usebruno/bruno) — 开源、轻量级的 API Client，替代 Postman
- paw 收费 [https://paw.cloud/](https://paw.cloud/)
- Figma -- 替代 Sketch
- switchhost [https://github.com/oldj/SwitchHosts](https://github.com/oldj/SwitchHosts)
- ImageOptim [https://imageoptim.com/mac](https://imageoptim.com/mac)
- MongoDB GUI: MongoDB Compass
- [Azure Data Studio](https://learn.microsoft.com/en-us/azure-data-studio/download-azure-data-studio) -- 免费的 MySQL GUI
- [Maccy](https://maccy.app/) 剪贴板工具
- [OrbStack](https://orbstack.dev/) -- 轻量级 Docker/Linux 环境（推荐）
- OpenVPN Connect
- TunnelBlick
- ClashPro -- 爬墙必备
- [Raindrop.io](http://raindrop.io/) -- 网页收藏
- [draw.io](http://draw.io/) -- 免费画图
- Folo -- 免费的RSS阅读器
- SourceTree -- 免费的仓库管理
- GIPHY CAPTURE -- 免费的 gif 截屏工具
- Telegram

## Coding Agents

- [Claude Code](https://code.claude.com/docs/zh-CN/overview)
- [Gemini-CLI](https://github.com/google-gemini/gemini-cli)
- [Open Code](https://opencode.ai/)

## 环境搭建

### 安装 xcode

xcode 会安装 git 环境

```bash
xcode-select --install

```

设置 git 全局配置

```bash
git config --global user.name "wwsun"
git config --global user.email "ww.sun@outlook.com"

```

查看 git config 的设置

```bash
git config --list
```

### ssh 配置

具体可以参考 github 的文档

- 生成ssh key [https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- 添加 ssh key [https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- 测试 ssh key [https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/testing-your-ssh-connection](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/testing-your-ssh-connection)

例如

```bash
# 推荐使用 ED25519 算法
# comment 一般是你的邮箱地址
ssh-keygen -t ed25519 -C "<comment>"

# 例如
ssh-keygen -t ed25519 -C "ww.sun@outlook.com"

ssh-keygen -t ed25519 -C "sunweiwei01@corp.netease.com"

# passphrase
# swwol

# copy ssh public key
pbcopy < ~/.ssh/id_ed25519.pub
# Copies the contents of the id_ed25519.pub file to your clipboard

```

**注意一定要添加 passphrase**

config 文件编写示例，没有的话，自己 touch 一个 `touch ~/.ssh/config`

```yaml
Host *
AddKeysToAgent yes
UseKeychain yes

Host github
HostName github.com
IdentityFile ~/.ssh/id_ed25519

Host netease
HostName g.hz.netease.com
Port 22222
User YOUR_USERNAME
PreferredAuthentications publickey
IdentityFile ~/.ssh/netease
```

将ssh私钥存储到ssh-agent中

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# 或者其他你改掉的名字
ssh-add --apple-use-keychain ~/.ssh/netease

```

将ssh公钥存储到 github 或 gitlab 配置中

[https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

```bash
$ pbcopy < ~/.ssh/id_ed25519.pub
# Copies the contents of the id_ed25519.pub file to your clipboard

```

测试 ssh：**注意一定要是 git@Host**

```bash
$ ssh -T git@github
$ ssh -T git@netease

# debug 模式
$ ssh -vT git@github

```

debug 文档：[https://docs.github.com/en/github/authenticating-to-github/troubleshooting-ssh/error-permission-denied-publickey](https://docs.github.com/en/github/authenticating-to-github/troubleshooting-ssh/error-permission-denied-publickey)

常见错误：如何在 push 代码的时候提示 `fatal: Could not read from remote repository.` 可能是因为秘钥文件没有被加入到 ssh agent

常见错误：`WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`

### 安装 homebrew

[homebrewhttps://brew.sh/](https://brew.sh/)

安装

```bash
/bin/bash -c "$(curl -fsSL <https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh>)"
```

升级到最新版

```bash
brew update
```

install terminal applications

```bash
  wget \\
  eza \\
  git \\
  fnm \\
  pnpm \\
  graphicsmagick \\
  commitzen \\
  cmatrix \\
  vips

```

### 安装 mysql

```bash
# install
brew install mysql

# start
brew services start mysql

# 首次启动，设置密码 12345678
mysql_secure_installation

# 访问mysql
mysql -u root -p

# stop mysql
brew services stop mysql

```

### 安装 java

[https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html)

### 安装 python

- 安装 python3: `brew install python`

npm 指定 python 版本

```bash
npm config set python $(which python3)

```

### 安装 oh-my-zsh (可选)

[https://ohmyz.sh/#install](https://ohmyz.sh/#install)

根据需要设置 zsh 的主题。

```bash
omz update
```

Important: If you change something in your Zsh configuration (_.zshrc_), force a reload:``

```bash
source ~/.zshrc
```

#### 安装 zsh 语法高亮插件

[oh-my-zsh syntax highlighting plugin](https://nevercodealone.medium.com/oh-my-zsh-syntax-highlighting-plugin-c166f1400c4b)

install plugin

```bash
git clone <https://github.com/zsh-users/zsh-syntax-highlighting.git> ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

```

enable plugin in `.zshrc`

```bash
plugins=( [plugins…] zsh-syntax-highlighting)

```

其他插件 [https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins](https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins)


### 安装 nerd-fonts

**Nerd Fonts** 是一个非常流行的开源项目，它通过为现有的编程字体“打补丁”（Patching）的方式，往字体里塞入了成千上万个图标（Glyphs）。

它的核心作用是让你的终端（Terminal）和代码编辑器能够显示各种图标，比如 Git 的分支图标、文件夹图标、编程语言的 Logo 等。

[https://github.com/ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts)

```bash

# 推荐安装 JetBrains Mono Nerd Font (目前最受欢迎的编程字体) 
brew install --cask font-jetbrains-mono-nerd-font
```

或者访问官网选择安装
https://www.nerdfonts.com/#home

然后设置字体为 `JetBrainsMono Nerd Font`

### 安装 ghostty 

推荐使用 ghostty 作为终端，比较简单，没有复杂的配置

[[ghostty]]

### 安装 iterm2（可选）

[https://iterm2.com/](https://iterm2.com/)

- **Profiles/General/Working Directory/Reuse previous session's directory**
- \*Preferences/Advance/Mouse/\*\*Scroll wheels sends arrow keys when in alternate screen mode -- yes

```bash
brew install --cask iterm2

```

- \*色彩风格配置：\*\*Profiles > Colors > Color Presets

[Iterm Themes - Color Schemes and Themes for Iterm2](https://iterm2colorschemes.com/)

### 安装wrap（可选）

一个体验更好的命令行工具

[https://docs.warp.dev/getting-started/getting-started-with-warp](https://docs.warp.dev/getting-started/getting-started-with-warp)

### 安装 starship

轻量、迅速、客制化的高颜值终端！
可以让你终端显示 “node 版本”、 “Git 分支” 等信息。

> [!note] 依赖 nerd-fonts

https://starship.rs/zh-CN/

安装

```zsh
brew install starship
```

在 `~/.zshrc` 的最后，添加以下内容：

```shell
eval "$(starship init zsh)"
```

配置 https://starship.rs/zh-CN/config/
预设配置 https://starship.rs/zh-CN/presets/

### 安装 fnm (Node.js 管理工具)

推荐使用 fnm 代替 nvm，性能更好，跨平台支持更佳。

```bash
# install fnm
brew install fnm

# 切换到指定版本（当前 shell）
fnm use 20
fnm use 18.17.0

# 使用 .nvmrc 或 .node-version 中指定的版本
fnm use

# 设置系统默认版本
fnm default 20

# 使用系统安装的 Node（非 fnm 管理的）
fnm use system
```

配置 Shell (如果是 Zsh)：

```bash
# 在 .zshrc 中添加
eval "$(fnm env --use-on-cd)"
```

### 安装 nvm（可选）

如果你习惯使用 nvm，也可以继续使用。

### 安装 yarn（可选）

```bash
npm install -g yarn

```

设置淘宝镜像 [https://www.npmmirror.com/](https://www.npmmirror.com/)

```bash
yarn config set registry <https://registry.npmmirror.com>

```

### 安装 pnpm

节省时间，节省磁盘空间，让你的 monorepo 焕然一新。

```bash
brew install pnpm
```

https://pnpm.io/zh/motivation

### private scope（可选）

如果是私有的 scope 可以单独设置

```bash
npm config set @your-scope:registry <http://your-register.com>

```

### 安装 cnpm

阿里巴巴 npm 国内镜像服务 [https://npmmirror.com/](https://npmmirror.com/)

```bash
npm install -g cnpm --registry=https://registry.npmmirror.com

```

如果提示权限报错的话，可以使用如下方式破除权限：

```bash
$ sudo chown -R $USER /usr/local

```

OR

```bash
sudo chown -R $(whoami) /usr/local/*

```

### 使用 npm 发布到自定义 Registry

如果想通过 `npm publish`指令发布包到自定义 registry。则需要使用 `npm adduser --registry`进行登录。

[https://docs.npmjs.com/cli/v8/commands/npm-adduser#configuration](https://docs.npmjs.com/cli/v8/commands/npm-adduser#configuration)

```bash
# log in, linking the scope to the custom registry
npm login --scope=@mycorp --registry=https://registry.mycorp.com

# netease npm
npm login --scope=@music --registry=http://rnpm.hz.netease.com

# log out, removing the link and the auth token
npm logout --scope=@mycorp

```

### 安装 projj

[https://github.com/popomore/projj](https://github.com/popomore/projj)

[Projj](https://github.com/popomore/projj) 是一个用来管理本地仓库的工具。

```bash
# 全局安装
$ cnpm i projj -g

# 初始化
$ projj init

```

目录

```
+ projj
+ .projj
  + hooks
    - git_config_user
  - config.json

```

安装插件

config.json

```json
{
  "base": "/Users/wwsun/projj",
  "hooks": {
    "postadd": "git_config_user"
  }
}
```

创建插件文件 `touch hooks/git_config_user`

将此文件添加到 `~/.projj/hooks/git_config_user`，并添加执行权限 `chmod +x ~/.projj/hooks/git_config_user`。

```tsx
#!/usr/bin/env node

"use strict"

const fs = require("fs")
const path = require("path")

const cwd = process.cwd()
const gitConfig = path.join(cwd, ".git/config")

if (!fs.existsSync(gitConfig)) {
  return
}

if (cwd.indexOf("github.com") > -1) {
  fs.appendFileSync(gitConfig, "[user]\\\\n  name = Wells\\\\n  email = ww.sww@outlook.com\\\\n")
} else if (cwd.indexOf("netease.com") > -1) {
  fs.appendFileSync(
    gitConfig,
    "[user]\\\\n  name = sunweiwei\\\\n  email = sunweiwei01@corp.netease.com\\\\n",
  )
}
```

执行 `projj add` 后可以通过 `git config -l` 测试

也可直接使用 [https://github.com/popomore/projj-hooks#git_config_user](https://github.com/popomore/projj-hooks#git_config_user)

```json
{
  "hooks": {
    "postadd": "git_config_user"
  },
  "postadd": {
    "github.com": {
      "name": "wwsun",
      "email": "ww.sun@outlook.com"
    },
    "gitlab.com": {
      "name": "sunweiwei01",
      "email": "sunweiwei01@corp.netease.com"
    }
  }
}
```

[projj-hooks](https://github.com/popomore/projj-hooks) 是一个 hooks 集，全局安装后就可以直接使用了。

### 安装 vscode 和相关插件

[https://code.visualstudio.com/](https://code.visualstudio.com/)

数据同步

- 使用 github 进行账号登陆和同步

常用插件

- eslint
- gitlens
- mdx
- prettier
- todo highlight
- color hightlight
- vscode-styled-components
- auto rename tag
- editor config
- gitlink
- code spell checker

[https://scotch.io/bar-talk/22-best-visual-studio-code-extensions-for-web-development](https://scotch.io/bar-talk/22-best-visual-studio-code-extensions-for-web-development)

## Docker

### OrbStack

[OrbStack](https://orbstack.dev/) 是 macOS 上快速、轻量且简单的 Docker Desktop 替代品。

```bash
brew install orbstack
```

### Colima

也是一个很好的开源替代方案。

```bash
brew install colima
```

使用:

```bash
# start
colima start

colima stop

colima delete # delete existing instance

# help
colima --help

# 启动服务，并将其注册为在登录时启动
brew services start colima

```

安装 docker client:

```bash
brew install docker
```

[Use Colima to Run Docker Containers on macOS - Small Sharp Software Tools](https://smallsharpsoftwaretools.com/tutorials/use-colima-to-run-docker-containers-on-macos/)

### Docker Desktop

如果是个人学习使用，直接使用 Docker Desktop 也可以，但它是重型应用。
[Docker Desktop: The #1 Containerization Tool for Developers | Docker](https://www.docker.com/products/docker-desktop/)

## 编程字体 Jetbrain Mono

[JetBrains Mono: A free and open source typeface for developers](https://www.jetbrains.com/lp/mono/)

## Hosts 配置

可以使用 SwitchHosts 配置 [https://github.com/oldj/SwitchHosts](https://github.com/oldj/SwitchHosts)

```
127.0.0.1 local.netease.com

```

## Chrome 插件

以下是经过验证的、开发人员常备的高效 Chrome 插件推荐：

### 开发调试

- **[React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)**: React 开发调试必备，官方出品。
- **[Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)**: Redux 状态管理可视化调试工具。
- **[Wappalyzer](https://chrome.google.com/webstore/detail/wappalyzer/gppongmhjkpfnbhagpmjfkannfbllamg)**: 技术栈嗅探神器，一键查看当前网站使用的框架、库、服务器等技术信息。
- **[FeHelper (前端助手)](https://chrome.google.com/webstore/detail/fehelper%E5%89%8D%E7%AB%AF%E5%8A%A9%E6%89%8B/pkgccpejnmalmdinmhkkfafefagiiiad)**: 功能强大的前端工具箱，包含 JSON 格式化、代码压缩、二维码生成、正则测试等 20+ 实用功能。
- **[Network Sniffer](https://chrome.google.com/webstore/detail/network-sniffer/coblekblkacfilmgdghecpekhadldjfj)**: 抓包工具，有时候比 DevTools 更直观。

### 效率工具

- **[uBlock Origin](https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm)**: 高效、低内存占用的广告拦截器。
- **[Proxy SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgglfemhongngoojbaMjjeolgmg)**: 轻松管理和切换代理设置，开发环境与网络调试必备。
- **[Octotree](https://chrome.google.com/webstore/detail/octotree-github-code-tree/bkhaagjahzinnekelkfhfhdtsophbgolc)**: 在 GitHub 左侧显示代码树，像 IDE 一样浏览项目代码。
- **[Awesome Screenshot](https://chrome.google.com/webstore/detail/awesome-screenshot-and-sc/nlipoenfbbikpbjkfpfillcgkoblgpmj)**: 网页截屏与录屏工具，支持滚动截屏。
- **[Session Buddy](https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko)**: 会话管理器，一键保存所有打开的标签页，防止浏览器崩溃丢失工作区。

### UI/UX 设计

- **[ColorPick Eyedropper](https://chrome.google.com/webstore/detail/colorpick-eyedropper/ohcpnigalekghcmgcdcenkpelffpdolg)**: 网页取色器，支持精确选取像素颜色。
- **[WhatFont](https://chrome.google.com/webstore/detail/whatfont/jabopobgcpjmedljpbcaablpmlmfcogm)**: 鼠标悬停即可查看网页元素对于的字体属性。
- **[VisBug](https://chrome.google.com/webstore/detail/visbug/cdjbcdkjlonfbmdjnpnddbhlciliceeo)**: 开源的网页设计调试工具，可以直接在页面上调整布局和样式，像 Sketch/Figma 一样操作网页。

### AI 辅助

- **[沉浸式翻译 (Immersive Translate)](https://chrome.google.com/webstore/detail/immersive-translate/bpoadfkcbjbfhfodiogcnhhhpibjhbnh)**: 双语对照网页翻译，阅读英文技术文档的神器。
