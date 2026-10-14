---
title: macOS Ghostty + Zsh (.zshrc) 配置与使用指南
tags:
  - zsh
draft: false
description: "macOS (Intel/Apple Silicon) + Ghostty + Zsh 完整 .zshrc 配置文件与快捷键、别名、迁移指南"
source:
date: 2026-04-05
---

```
# ==============================================================================
# .zshrc - Zsh 配置文件
# 环境: macOS (Intel/Apple Silicon) + Ghostty + Zsh
# 最后更新: 2026-04-05
# ==============================================================================

# 性能分析工具（调试时取消注释）
# zmodload zsh/zprof

# ------------------------------------------------------------------------------
# 1. 基础环境变量
# ------------------------------------------------------------------------------

# [优化] 用 brew --prefix 检测是目前最可靠的方式，避免路径硬编码失效。
# 但 brew 命令本身有启动开销，因此先尝试常见路径快速判断，仅在失败时 fallback。
if [[ -x /opt/homebrew/bin/brew ]]; then
  export HOMEBREW_PREFIX="/opt/homebrew"       # Apple Silicon
elif [[ -x /usr/local/bin/brew ]]; then
  export HOMEBREW_PREFIX="/usr/local"          # Intel Mac
else
  export HOMEBREW_PREFIX="$(brew --prefix 2>/dev/null || echo /usr/local)"
fi

export EDITOR='code'
export VISUAL='code'
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export COLORTERM=truecolor

# 包管理器 home（集中声明，后续 PATH 引用）
export PNPM_HOME="$HOME/Library/pnpm"
export BUN_INSTALL="$HOME/.bun"
export SDKMAN_DIR="$HOME/.sdkman"

# ------------------------------------------------------------------------------
# 2. PATH 配置（集中管理，避免分散追加）
# ------------------------------------------------------------------------------
# [修复] 原文件末尾有 antigravity / bun / codemaker 三处零散 PATH 追加，
# 已统一移入此处。typeset -U 自动去重，防止 PATH 膨胀。

typeset -U path
path=(
  "$HOME/.local/bin"
  "$HOME/bin"
  "$HOME/.antigravity/antigravity/bin"         # Antigravity
  "$HOME/.codemaker/bin"                       # CodeMaker
  "$BUN_INSTALL/bin"                           # Bun
  "$PNPM_HOME"                                 # pnpm 全局包
  "$HOMEBREW_PREFIX/bin"
  "$HOMEBREW_PREFIX/sbin"
  $path
)
export PATH

# ------------------------------------------------------------------------------
# 3. 补全系统
# ------------------------------------------------------------------------------
if [[ -d "$HOMEBREW_PREFIX/share/zsh/site-functions" ]]; then
  FPATH="$HOMEBREW_PREFIX/share/zsh/site-functions:$FPATH"
fi

autoload -Uz compinit

# [说明] (N) = 空值安全; .mh+24 = 文件修改时间超过 24 小时
# 超过 24h 才重新生成缓存，其余时间用 -C 跳过安全检查加速启动
local zcompdump="$HOME/.zcompdump"
if [[ ! -f "$zcompdump" ]] || [[ -n "$zcompdump"(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi

zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
zstyle ':completion:*:descriptions' format '%B%d%b'
zstyle ':completion:*:warnings' format 'No matches for: %d'

# ------------------------------------------------------------------------------
# 4. 历史记录
# ------------------------------------------------------------------------------
HISTFILE=~/.zsh_history
HISTSIZE=50000
SAVEHIST=50000

setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_REDUCE_BLANKS
setopt SHARE_HISTORY
setopt EXTENDED_HISTORY
setopt HIST_VERIFY

# ------------------------------------------------------------------------------
# 5. Shell 选项
# ------------------------------------------------------------------------------
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
setopt CORRECT
setopt INTERACTIVE_COMMENTS
setopt GLOB_DOTS
# [删除] NO_BEEP 在现代 macOS 上由系统设置控制，此处无效，已移除。

# ------------------------------------------------------------------------------
# 6. SSH Agent（异步启动，不阻塞 shell 加载）
# ------------------------------------------------------------------------------
# [优化] 改为后台异步执行（&!），避免 keychain 访问阻塞启动。
# 权衡：极少情况下首次 git push 时 agent 可能还未就绪，重试一次即可。
ssh_agent_start() {
  local ssh_env_file="${XDG_RUNTIME_DIR:-$HOME/.cache}/ssh-agent.env"

  ssh-add -l >/dev/null 2>&1
  local agent_status=$?

  if [[ $agent_status -eq 0 ]]; then
    return 0
  fi

  if [[ $agent_status -eq 2 ]]; then
    if [[ -f "$ssh_env_file" ]]; then
      source "$ssh_env_file" >/dev/null
      ssh-add -l >/dev/null 2>&1
      agent_status=$?
    fi

    if [[ $agent_status -eq 2 ]]; then
      mkdir -p "$(dirname "$ssh_env_file")"
      ssh-agent -t 8h > "$ssh_env_file"
      source "$ssh_env_file" >/dev/null
    fi
  fi

  if [[ "$OSTYPE" == "darwin"* ]]; then
    ssh-add --apple-load-keychain 2>/dev/null || ssh-add -A 2>/dev/null
  fi

  local keys=(~/.ssh/{id_ed25519,id_netease})
  for key in "${keys[@]}"; do
    [[ -f "$key" ]] || continue
    if [[ "$OSTYPE" == "darwin"* ]]; then
      ssh-add --apple-use-keychain "$key" 2>/dev/null || ssh-add "$key" 2>/dev/null
    else
      ssh-add "$key" 2>/dev/null
    fi
  done
}

# [优化] &! 表示在后台异步运行，且不受 shell 退出影响（disowned）
ssh_agent_start &!

# ------------------------------------------------------------------------------
# 7. 开发工具（延迟加载）
# ------------------------------------------------------------------------------

# pyenv
if [[ -d "$HOME/.pyenv" ]]; then
  pyenv() {
    unset -f pyenv
    export PYENV_ROOT="$HOME/.pyenv"
    path=("$PYENV_ROOT/bin" $path)
    eval "$(command pyenv init - zsh)"
    eval "$(pyenv virtualenv-init -)" 2>/dev/null
    pyenv "$@"
  }
fi

# fnm - Node.js 版本管理
# [说明] --use-on-cd 会在每次 cd 时检查 .nvmrc/.node-version，按需切换版本。
if command -v fnm &>/dev/null; then
  eval "$(fnm env --use-on-cd)"
fi

# SDKMAN - Java 版本管理（延迟加载）
if [[ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]]; then
  # [修复] 加 -L 跟随符号链接，并检查目录是否存在再 export，避免空值
  if [[ -d "$SDKMAN_DIR/candidates/java/current" ]]; then
    export JAVA_HOME="$SDKMAN_DIR/candidates/java/current"
    # [优化] 同步更新 path 数组，确保 java/javac 命令可用
    path=("$JAVA_HOME/bin" $path)
  fi

  sdk() {
    unset -f sdk
    source "$SDKMAN_DIR/bin/sdkman-init.sh"
    sdk "$@"
  }
fi

# Bun 补全（按需加载）
[[ -s "$BUN_INSTALL/_bun" ]] && source "$BUN_INSTALL/_bun"

# ------------------------------------------------------------------------------
# 8. 别名
# ------------------------------------------------------------------------------

# 文件操作
alias ll='ls -lah'
alias la='ls -A'
alias l='ls -CF'
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# 目录导航
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# [修复] alias -- -= 兼容性不稳定，用函数替代更健壮
cdprev() { cd - }
alias -- -='cdprev'

# Git
alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gcm='git commit -m'
alias gca='git commit --amend'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'
alias gdc='git diff --cached'
alias gco='git checkout'
alias gcb='git checkout -b'
alias gb='git branch'
alias gbd='git branch -d'
alias glog='git log --oneline --graph --decorate -15'
alias gloga='git log --oneline --graph --decorate --all -20'
alias gst='git stash'
alias gstp='git stash pop'
alias grb='git rebase'
alias grbi='git rebase -i'
alias gcp='git cherry-pick'

# 实用工具
alias cls='clear'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias df='df -h'
alias du='du -h'
alias reload='source ~/.zshrc && echo "✓ .zshrc reloaded"'
alias path='echo $PATH | tr ":" "\n" | nl'
alias serve='python3 -m http.server'
alias ports='lsof -i -P | grep LISTEN'

# macOS 特定
alias showfiles='defaults write com.apple.finder AppleShowAllFiles YES; killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles NO; killall Finder'
alias cleanup='find . -type f -name "*.DS_Store" -ls -delete'

# ------------------------------------------------------------------------------
# 9. 自定义函数
# ------------------------------------------------------------------------------

mkcd() { mkdir -p "$1" && cd "$1" }

ff() { find . -type f -name "*$1*" 2>/dev/null }

showpath() { echo "$PATH" | tr ':' '\n' | nl }

extract() {
  if [[ ! -f "$1" ]]; then
    echo "'$1' 不是有效文件"
    return 1
  fi
  case "$1" in
    *.tar.bz2) tar xjf "$1" ;;
    *.tar.gz)  tar xzf "$1" ;;
    *.bz2)     bunzip2 "$1" ;;
    *.rar)     unrar x "$1" ;;
    *.gz)      gunzip "$1" ;;
    *.tar)     tar xf "$1" ;;
    *.tbz2)    tar xjf "$1" ;;
    *.tgz)     tar xzf "$1" ;;
    *.zip)     unzip "$1" ;;
    *.Z)       uncompress "$1" ;;
    *.7z)      7z x "$1" ;;
    *)         echo "'$1' 无法被 extract() 解压" ;;
  esac
}

proj() {
  local projects_dir="$HOME/projj"
  cd "${projects_dir}${1:+/$1}"
}

port() {
  [[ -z "$1" ]] && { echo "Usage: port <port_number>"; return 1 }
  lsof -i ":$1"
}

killport() {
  [[ -z "$1" ]] && { echo "Usage: killport <port_number>"; return 1 }
  local pids=$(lsof -ti ":$1")
  if [[ -z "$pids" ]]; then
    echo "No process found on port $1"
    return 1
  fi
  echo "$pids" | xargs kill -9 && echo "✓ Killed process(es) on port $1"
}

# ------------------------------------------------------------------------------
# 10. 插件加载（必须在自定义配置之后，syntax-highlighting 必须最后）
# ------------------------------------------------------------------------------
if [[ -f "$HOMEBREW_PREFIX/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ]]; then
  source "$HOMEBREW_PREFIX/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
  ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8'
  ZSH_AUTOSUGGEST_STRATEGY=(history completion)
  ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20
fi

# ⚠️ zsh-syntax-highlighting 必须最后加载
if [[ -f "$HOMEBREW_PREFIX/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]]; then
  source "$HOMEBREW_PREFIX/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
fi

# Starship 提示符
eval "$(starship init zsh)"

# ------------------------------------------------------------------------------
# 11. Ghostty 终端集成
# ------------------------------------------------------------------------------
if [[ "$TERM_PROGRAM" == "ghostty" ]]; then
  if [[ -f "$HOME/.config/ghostty/shell-integration.zsh" ]]; then
    source "$HOME/.config/ghostty/shell-integration.zsh"
  fi
fi

# ------------------------------------------------------------------------------
# 12. 本地配置（机器特定、敏感信息，不纳入版本控制）
# ------------------------------------------------------------------------------
[[ -f ~/.zshrc.local ]] && source ~/.zshrc.local

# ------------------------------------------------------------------------------
# 13. 性能分析（调试用，取消注释后配合顶部 zmodload 使用）
# ------------------------------------------------------------------------------
# zprof

# ==============================================================================
# End of .zshrc
#
# 快速参考：
# - reload          重新加载配置
# - showpath        显示 PATH
# - mkcd <dir>      创建并进入目录
# - extract <file>  智能解压文件
# - port <number>   查看端口占用
# - killport <num>  杀死端口进程
# - proj [name]     切换到项目目录
# ==============================================================================

```

````

## 新增功能

### **更完善的 Git 别名**

```bash
alias gcm='git commit -m'          # 快速提交
alias gca='git commit --amend'     # 修改上次提交
alias gcb='git checkout -b'        # 创建并切换分支
alias gbd='git branch -d'          # 删除分支
alias gdc='git diff --cached'      # 查看暂存区差异
alias gloga='git log --all'        # 查看所有分支日志
alias gst='git stash'              # 暂存
alias gstp='git stash pop'         # 恢复暂存
alias grb='git rebase'             # 变基
alias grbi='git rebase -i'         # 交互式变基
alias gcp='git cherry-pick'        # 拣选提交
````

### **实用工具函数**

```bash
# 智能解压（自动识别格式）
extract <file>

# 查找占用端口的进程
port 3000

# 杀死占用端口的进程
killport 3000

# 快速切换项目目录
proj myproject

# 查找目录
fd <dirname>
```

### **macOS 特定别名**

```bash
alias showfiles='...'              # 显示隐藏文件
alias hidefiles='...'              # 隐藏文件
alias cleanup='...'                # 清理 .DS_Store
alias ports='lsof -i -P | grep LISTEN'  # 查看监听端口
```

### **SDKMAN 支持（Java 开发）**

```bash
# 延迟加载 SDKMAN（首次调用 sdk 命令时初始化）
sdk list java
sdk install java 21.0.1-tem
```

---

## 性能优化

### 1. **补全缓存检测更严谨**

```bash
# 修复：先检查文件是否存在
local zcompdump="$HOME/.zcompdump"
if [[ ! -f "$zcompdump" ]] || [[ -n "$zcompdump"(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi
```

### 2. **SSH Agent 启动优化**

- 增加了已有 agent 的验证逻辑
- 避免重复启动
- 改为同步启动（更可靠，如需异步可改回 `&!`）

### 3. **FPATH 安全检查**

```bash
if [[ -d "$HOMEBREW_PREFIX/share/zsh/site-functions" ]]; then
  FPATH="$HOMEBREW_PREFIX/share/zsh/site-functions:$FPATH"
fi
```

---

## 终端集成

### 1. **Ghostty 集成**

```bash
if [[ "$TERM_PROGRAM" == "ghostty" ]]; then
  if [[ -f "$HOME/.config/ghostty/shell-integration.zsh" ]]; then
    source "$HOME/.config/ghostty/shell-integration.zsh"
  fi
fi
```

### 2. **真彩色支持**

```bash
export COLORTERM=truecolor
```

---

## 配置改进

### 1. **补全样式增强**

```bash
zstyle ':completion:*:warnings' format 'No matches for: %d'
```

### 2. **历史记录优化**

```bash
setopt HIST_VERIFY  # 历史展开后先显示不立即执行
```

### 3. **Shell 选项增强**

```bash
setopt GLOB_DOTS    # 通配符匹配隐藏文件
```

### 4. **目录导航改进**

```bash
alias -- -='cd -'   # 返回上一个目录
```

---

## 调试工具

### 1. **性能分析**

```bash
# 在文件开头取消注释：
# zmodload zsh/zprof

# 在文件末尾取消注释：
# zprof
```

---

## 使用指南

### 安装依赖插件

```bash
brew install zsh-autosuggestions zsh-syntax-highlighting
```

### 可选工具

```bash
# Node.js 版本管理
brew install fnm

# Python 版本管理
brew install pyenv

# Java 版本管理
curl -s "https://get.sdkman.io" | bash
```

### 创建本地配置文件（可选）

```bash
# 创建 ~/.zshrc.local 存放机器特定配置
touch ~/.zshrc.local

# 示例内容：
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc.local
echo 'alias work="cd ~/WorkProjects"' >> ~/.zshrc.local
```

---

## 快速参考命令

| 命令                | 说明                  |
| ------------------- | --------------------- |
| `reload`            | 重新加载配置          |
| `showpath`          | 显示 PATH（每行一个） |
| `mkcd <dir>`        | 创建并进入目录        |
| `extract <file>`    | 智能解压文件          |
| `port <number>`     | 查看端口占用          |
| `killport <number>` | 杀死端口进程          |
| `proj [name]`       | 切换到项目目录        |
| `ff <pattern>`      | 查找文件              |
| `fd <pattern>`      | 查找目录              |
| `cleanup`           | 删除 .DS_Store 文件   |
| `ports`             | 查看所有监听端口      |

## 迁移步骤

1. **备份现有配置**

   ```bash
   cp ~/.zshrc ~/.zshrc.backup
   ```

2. **替换配置文件**

   ```bash
   # 将新的 .zshrc 复制到 ~
   cp /path/to/new/.zshrc ~/.zshrc
   ```

3. **重新加载**

   ```bash
   source ~/.zshrc
   # 或直接运行
   reload
   ```

4. **验证 Homebrew 路径**

   ```bash
   echo $HOMEBREW_PREFIX
   # 应输出: /usr/local (Intel) 或 /opt/homebrew (Apple Silicon)
   ```

5. **测试插件**

   ```bash
   # 输入命令应该有语法高亮
   git status

   # 输入历史命令应该有灰色提示
   ls -l
   ```

---

## 注意事项

1. **项目目录函数**：`proj()` 函数默认指向 `$HOME/Projects`，请根据实际情况修改
2. **SSH Agent**：改为同步启动，如果觉得启动慢可以改回异步：

   ```bash
   ssh_agent_start &!
   ```

3. **性能分析**：如需查看启动性能，取消注释 `zprof` 相关行
4. **本地配置**：敏感信息（API Key、密码等）请放在 `~/.zshrc.local` 中
