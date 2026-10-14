---
title: 用 bare repo 管理 HOME 目录中的 dot files
tags:
  - zsh
  - git
draft: false
description: 未命名
source:
---

```bash
# 初始化
git init --bare $HOME/.dotfiles
alias dotfiles='git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
dotfiles config status.showUntrackedFiles no

# 添加到 ~/.bashrc 或 ~/.zshrc
echo "alias dotfiles='git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'" >> ~/.zshrc

# 跟踪文件
dotfiles add ~/.zshrc ~/.vimrc ~/.gitconfig
dotfiles commit -m "init dotfiles"
dotfiles remote add origin git@github.com:you/dotfiles.git
dotfiles push
```
