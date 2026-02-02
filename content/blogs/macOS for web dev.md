---
title: macOS for web dev
date: 2026-02-02
tags:
  - macos
draft: true
description: macOS for web dev
url: https://www.robinwieruch.de/mac-setup-web-development/
---
# macOS for web dev

如何快速初始化 macos 开发环境

[Mac Setup for Web Development 2025](https://www.robinwieruch.de/mac-setup-web-development/)

[macOS + nginx](https://www.notion.so/macOS-nginx-1ffb6615b1a280c19652ddf024be6997?pvs=21)

[zsh config](https://www.notion.so/zsh-config-21fb6615b1a280e8a77ff421e0e87201?pvs=21)

[nvm 使用指南](https://www.notion.so/nvm-21fb6615b1a280cb99dad88b9e7cc99f?pvs=21)

[fd 快速文件搜索](https://www.notion.so/fd-222b6615b1a280be8a09f308e9417c45?pvs=21)

[mov to mp4](https://www.notion.so/mov-to-mp4-231b6615b1a28006ad12d11e1eab3540?pvs=21)

# 系统设置

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

## intel cpu，关闭深度睡眠 / 电能小憩

对于 intel cpu，某些情况下可能会存在睡眠唤醒崩溃（Sleep/Wake Kernel Panic）问题，可以尝试关闭深度睡眠。

在终端执行：

```bash
sudo pmset -a standby 0
sudo pmset -a autopoweroff 0
sudo pmset -a powernap 0
```

然后重启电脑。

这样会让 Mac 用较浅的睡眠模式，避免深度睡眠 bug。

# 必备软件

- chrome
- xcode
- homebrew
- nodejs == 使用 nvm 安装
- vscode
- iterm2
- [Pearcleaner](https://github.com/alienator88/Pearcleaner) 快捷卸载 App 必备
- Obsidian -- 免费的个人知识库工具
- charles
- ❌~~postman~~ — 不推荐了，收费了
- [https://github.com/usebruno/bruno](https://github.com/usebruno/bruno) — 作为 postman 的替代品
- paw 收费 [https://paw.cloud/](https://paw.cloud/)
- ~~sketch 收费 —~~ 使用 Figma 代替
- switchhost [https://github.com/oldj/SwitchHosts](https://github.com/oldj/SwitchHosts)
- ImageOptim [https://imageoptim.com/mac](https://imageoptim.com/mac)
- MongoDB GUI: MongoDB Compass
- [Azure Data Studio](https://learn.microsoft.com/en-us/azure-data-studio/download-azure-data-studio) -- 免费的 MySQL GUI
- [Maccy](https://maccy.app/) 剪贴板工具
- OpenVPN Connect
- TunnelBlick
- ClashPro -- 爬墙必备
- [Raindrop.io](http://raindrop.io/) -- 网页收藏
- [draw.io](http://draw.io/) -- 免费画图
- Follow -- 免费的RSS阅读器
- SourceTree -- 免费的仓库管理
- GIPHY CAPTURE -- 免费的 gif 截屏工具
- Telegram

# 环境搭建

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

升级

```bash
brew update

```

install terminal applications

```bash
brew install \\\\
  wget \\\\
  exa \\\\
  git \\\\
  nvm \\\\
  pnpm \\\\
  graphicsmagick \\\\
  commitzen \\\\
  cmatrix \\\\
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

- 安装 python3: `brew install pyhton`
- 安装 python2: [https://www.python.org/downloads/release/python-2718/](https://www.python.org/downloads/release/python-2718/)

npm 指定 python 版本

```bash
npm config set python $(which python2)

```

### 安装 oh-my-zsh

[https://ohmyz.sh/#install](https://ohmyz.sh/#install)

根据需要设置 zsh 的主题。

```bash
omz update
```

Important: If you change something in your Zsh configuration (*.zshrc*), force a reload:``

```bash
source ~/.zshrc
```

### omz theme+fonts（可选）

[Starship: Cross-Shell Prompt](https://starship.rs/)

部分zsh主题依赖nerd-fonts

推荐主题，可以显示 node 版本号：[https://github.com/romkatv/powerlevel10k](https://github.com/romkatv/powerlevel10k)

### 安装 nerd-fonts

[https://github.com/ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts)

```bash
brew install font-hack-nerd-font

```

### 安装 zsh 语法高亮插件

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

### [可选]安装 iterm2

[https://iterm2.com/](https://iterm2.com/)

- **Profiles/General/Working Directory/Reuse previous session's directory**
- *Preferences/Advance/Mouse/**Scroll wheels sends arrow keys when in alternate screen mode -- yes

```bash
brew install --cask iterm2

```

- *色彩风格配置：**Profiles > Colors > Color Presets

[Iterm Themes - Color Schemes and Themes for Iterm2](https://iterm2colorschemes.com/)

### [可选]安装wrap

一个体验更好的命令行工具

[https://docs.warp.dev/getting-started/getting-started-with-warp](https://docs.warp.dev/getting-started/getting-started-with-warp)

### [可选]安装 fnm

```bash
# install fnm
brew intall fnm

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

### [可选]安装 nvm

安装 nvm

[https://formulae.brew.sh/formula/nvm#default](https://formulae.brew.sh/formula/nvm#default)

<aside>
💡

活使用 fnm 代替 nvm，性能会好很多

</aside>

**推荐直接使用 zsh-nvm**

[https://github.com/lukechilds/zsh-nvm](https://github.com/lukechilds/zsh-nvm)

在 .zshrc 插件列表中加入 zsh-nvm 即可

```bash
# nvm setting
export NVM_DIR="$HOME/.nvm"
export NVM_LAZY_LOAD=true

# Which plugins would you like to load?
plugins=(git node docker zsh-autosuggestions zsh-syntax-highlighting zsh-nvm)
```

**或者你可以手动安装**

[https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)

```bash
# install nvm
brew install nvm

```

此时 nvm 命令可能没生效，可以使用下面的命令查看 nvm 的说明

```bash
brew info nvm
```

通常返回下面的内容，按照指令说明做即可

```
You should create NVM's working directory if it doesn't exist:
  mkdir ~/.nvm

Add the following to your shell profile e.g. ~/.profile or ~/.zshrc:
  export NVM_DIR="$HOME/.nvm"
  [ -s "/usr/local/opt/nvm/nvm.sh" ] && \\\\. "/usr/local/opt/nvm/nvm.sh"  # This loads nvm
  [ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && \\\\. "/usr/local/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion

You can set $NVM_DIR to any location, but leaving it unchanged from
/usr/local/Cellar/nvm/0.39.7 will destroy any nvm-installed Node installations
upon upgrade/reinstall.

```

然后重启 terminal 即可。

一些配置参考 [https://tecadmin.net/install-nvm-macos-with-homebrew/](https://tecadmin.net/install-nvm-macos-with-homebrew/)

```bash
# 安装 lts 版本 node
nvm install --lts

# install node18
nvm install 18

# install node16
nvm install 16

```

也直接安装 [https://nodejs.org/en/](https://nodejs.org/en/)

### 安装 yarn

```bash
npm install -g yarn

```

设置淘宝镜像 [https://www.npmmirror.com/](https://www.npmmirror.com/)

```bash
yarn config set registry <https://registry.npmmirror.com>

```

### [可选] private scope

如果是私有的 scope 可以单独设置

```bash
npm config set @your-scope:registry <http://your-register.com>

```

### [可选，外网]安装 cnpm

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

'use strict';

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const gitConfig = path.join(cwd, '.git/config');

if (!fs.existsSync(gitConfig)) {
  return;
}

if (cwd.indexOf('github.com') > -1) {
  fs.appendFileSync(gitConfig, '[user]\\\\n  name = Wells\\\\n  email = ww.sww@outlook.com\\\\n');
} else if (cwd.indexOf('netease.com') > -1) {
  fs.appendFileSync(gitConfig, '[user]\\\\n  name = sunweiwei\\\\n  email = sunweiwei01@corp.netease.com\\\\n');
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

因为版权问题 macos 上可以用 colima 代替官方的 docker desktop（商用需要授权）

也可以参考 [[Docker]] 一文

[Docker Desktop: The #1 Containerization Tool for Developers | Docker](https://www.docker.com/products/docker-desktop/)

[https://github.com/abiosoft/colima](https://github.com/abiosoft/colima)

如果是个人学习使用，直接使用 docker desktop 即可。

Colima - container runtimes on macOS (and Linux) with minimal setup

```bash
brew install colima

```

使用

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

安装 docker

```bash
brew install docker

```

[Use Colima to Run Docker Containers on macOS - Small Sharp Software Tools](https://smallsharpsoftwaretools.com/tutorials/use-colima-to-run-docker-containers-on-macos/)

# 编程字体 Jetbrain Mono

[JetBrains Mono: A free and open source typeface for developers](https://www.jetbrains.com/lp/mono/)

# Hosts 配置

可以使用 SwitchHosts 配置 [https://github.com/oldj/SwitchHosts](https://github.com/oldj/SwitchHosts)

```
127.0.0.1 local.netease.com

```

# Chrome 插件

- 去广告：uBlock origin [https://github.com/fang5566/uBlock/wiki](https://github.com/fang5566/uBlock/wiki)
- 截屏：Awesome Screenshot
- React Developer tools
