---
title: MBP 迁移方案：Intel i9 16" → M5 14"
tags:
  - 配置/macOS
  - 清单
description: 从 2019 款 Intel MacBook Pro 16 迁移到 2025 款 M5 MacBook Pro 14 的完整方案，含环境盘点、迁移策略、操作清单与架构差异风险点
source:
---

## 背景

- **旧机**：MacBook Pro 16,1（2019，Intel i9 8 核 / 32GB / 1TB / Radeon Pro 5500M），macOS 26.6.2
- **新机**：2025 款 MacBook Pro 14"，M5（10+10 核）/ 24GB 统一内存 / 1TB，深空黑

## 一、现状盘点（2026-10-09 采集）

| 类别      | 内容                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| 系统      | macOS 26.6.2，磁盘使用约 12%（1TB 容量无压力）                                         |
| 包管理    | Homebrew 6.0（Intel 路径 `/usr/local`），33 个 formula + 7 个 cask                     |
| 应用      | 约 60 个，含 IntelliJ / VS Code / Xcode / Obsidian / Ghostty / Warp 及一批网易内部工具 |
| Node      | fnm 管理 11 个版本（v10 → v24）                                                        |
| Java      | sdkman 管理 8 / 17 / 21 Temurin + Maven 3.6.3 / 3.9.9                                  |
| Python    | pyenv 3.12.11 + poetry                                                                 |
| 容器      | colima + docker + qemu（当前未运行，无本地镜像需迁移）                                 |
| 本地服务  | mysql@8.4、redis、nginx（均未设开机启动）                                              |
| AI 工具链 | claude、codex、copilot-cli、gemini-cli、opencode、crush、goose、cc-switch 等十余个     |
| 密钥/配置 | SSH 两对密钥（`id_ed25519`、`id_netease`）、git LFS、公司内网 hosts、starship、zplug   |
| dotfiles  | bare repo 已关联 GitHub 远程 `wwsun/dotfiles`，`.zshrc` 已内置 ARM/Intel brew 路径判断 |
| 工作区    | `~/projj/` 下 6 个组织的仓库（code.netease.com、g.hz.netease.com、github.com 等）      |

## 二、核心策略：干净安装，不用整机迁移助理

原因：

1. **Homebrew 路径变更**：Intel 在 `/usr/local`，Apple Silicon 在 `/opt/homebrew`，所有包必须原生重装，直接拷贝会留下大量 x86 残骸
2. 借此机会清理多年积累的无用应用与缓存
3. 可迁移资产结构化程度高（dotfiles repo + brew + fnm/sdkman/pyenv），重建成本低

**迁移粒度**：用户数据（Documents / Desktop / Downloads / 照片等）手动拷贝；应用与开发环境全部重建。

## 三、旧机准备清单（迁移前 1-2 天）

```bash
# 1. 提交并推送 dotfiles
dotfiles add -u && dotfiles commit -m "chore: 迁移前快照" && dotfiles push

# 2. 导出 brew 清单
brew bundle dump --file=~/Brewfile --force

# 3. 导出 MySQL 数据（如有需要保留的库）
mysqldump -u root --all-databases > ~/mysql-backup.sql

# 4. 导出 VS Code 扩展清单
code --list-extensions > ~/vscode-extensions.txt

# 5. 检查所有工作仓库的未提交改动
cd ~/projj && for d in */*/*/.git; do
  repo=$(dirname $d); dirty=$(git -C $repo status -s | head -1)
  [ -n "$dirty" ] && echo "DIRTY: $repo 有未提交改动"
done

# 6. Time Machine 全量备份（兜底）
```

需要手动导出/记录的：

- OpenVPN / Tunnelblick 配置和证书
- SwitchHosts 配置（`~/.SwitchHosts`）
- mkcert 根证书（`$(mkcert -CAROOT)`）
- 公司内网根证书
- 浏览器密码/书签确认已同步

## 四、新机初始化顺序

```bash
# 1. 系统初始化后，先装 Rosetta 2（旧 Node / 部分内部工具需要）
softwareupdate --install-rosetta --agree-to-license

# 2. Xcode 命令行工具
xcode-select --install

# 3. Homebrew（自动装到 /opt/homebrew）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 4. 恢复 dotfiles（.zshrc 已兼容 ARM，直接可用）
git clone --bare git@github.com:wwsun/dotfiles.git ~/.dotfiles
alias dotfiles='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
dotfiles checkout   # 如有冲突先备份
dotfiles config --local status.showUntrackedFiles no

# 5. 重开终端后批量装包
brew bundle --file=~/Brewfile

# 6. 开发环境
fnm install 22 && fnm install 20 && fnm install 18 && fnm install 16
fnm install --arch=x64 14   # v10/v14 无 ARM 官方构建，按需装 x64 版（需 Rosetta）
sdk install java 21.0.10-tem && sdk install java 17.0.19-tem && sdk install java 8.0.492-tem
sdk install maven 3.9.9
pyenv install 3.12.11 && pyenv global 3.12.11

# 7. 密钥与认证
#    - 拷贝 ~/.ssh（权限 700/600）
#    - gh auth login && gh auth setup-git
#    - glab auth login（GITLAB_HOST=g.hz.netease.com）

# 8. 数据拷贝（AirDrop / 移动硬盘 / 局域网）
#    ~/projj、~/Documents、~/Desktop、~/.SwitchHosts 等
```

应用安装优先级：brew cask 能覆盖的先装（VS Code、Ghostty、Chrome、Obsidian、draw.io、Figma、MongoDB Compass、Redis Insight、SwitchHosts、The Unarchiver、AppCleaner、iTerm 等均有 cask）；公司内部工具（popo、MailMaster、tsh、SMPrinterClient、Qzhddr、CuoCuo 等）走内部渠道确认 ARM 版本。

## 五、架构差异风险点

> [!warning] Intel → Apple Silicon 重点关注

1. **Node v10/v14**：没有 darwin-arm64 官方构建，只能通过 Rosetta 跑 x64 版本，且部分老原生模块（node-sass 等）可能编译失败。建议评估老项目是否可以升级到 v16+，只在确实需要时保留 x64 Node
2. **MySQL 数据**：`/usr/local/var/mysql` 的数据文件不能直接拷贝到新架构，必须用 `mysqldump` 逻辑备份再导入
3. **git credential helper 写死版本路径**：`.gitconfig` 中 GitHub 凭证 helper 指向 `~/Library/Caches/copilot-desktop-gh-2.96.0/gh`，新机版本号不同会断。迁移后改为系统 gh：`gh auth setup-git`，并删掉这两段 helper 配置
4. **Docker**：无本地镜像需迁移；colima 在 M5 上建议 `colima start --vm-type=vz --vz-rosetta` 获得更好性能
5. **Java**：sdkman 自动装 ARM64 版 Temurin，无需干预；Java 8 的 ARM 版已有
6. **内部工具兼容性**：tsh（Teleport）、SMPrinterClient、部分网易内部 App 可能是 Intel-only，靠 Rosetta 运行或需找内部 ARM 版本，需逐个验证
7. **Python 2.7**：`/Applications/Python 2.7` 是古早安装器残留，直接放弃

## 六、迁移后验证清单

- [ ] `git clone` GitHub + 内网 GitLab 仓库各一个，验证 SSH/凭证
- [ ] `node -v` / `java -version` / `python --version` 各版本切换正常
- [ ] `colima start && docker run hello-world`
- [ ] mysql / redis / nginx 按需启动，数据导入
- [ ] 跑通一个公司前端项目（pnpm install + dev）和一个 Java 项目（mvn build）
- [ ] hosts、SwitchHosts、mkcert 证书生效（访问 dev.music.163.com 类域名）
- [ ] AI CLI 工具逐个登录（claude / codex / copilot 等）
- [ ] 全部验证通过后，旧机保留 2-4 周作为回退，然后退出 iCloud、抹盘
