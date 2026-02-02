---
created: 2025-12-18 09:56
url:
tags:
---
## Config 初始化

```bash
git config - - global user.name “[name]”
git config - - global user.email “[email address]”

```

## 设置/更新 Remote

```bash
# 首次添加
git remote add origin <REPO_URL>
# 替换 origin 的地址
git remote set-url origin <新URL>

# 查看现有远程地址:
git remote -v

# 查看详细信息
git remote show origin
```

## 撤消最近一次 git 提交

### 只想修改最近一次提交的内容/说明

- 提交里少加了一个文件
- 提交信息（commit message）写错了
- 还没推送到远程，或即使推了也允许改历史

```bash
# 修改文件、git add ...
git add <文件或目录>

# 用新的内容覆盖最近一次提交（提交信息不变）
git commit --amend
# 或者同时更改提交说明
git commit --amend -m "新的提交说明"
```

### 完全撤销最近一次提交，但保留工作区修改

- 提交早了，想撤销提交，但保留改动继续编辑
- 本地操作，历史可重写

```bash
git reset --soft HEAD~1
```

## Remote Prune 清空本地过期的远程分支

```bash
git remote prune origin
```

## cherry pick 从分支转移代码

```bash
# 将指定的提交转移到当前分支
git cherry-pick <commitHash>

# 转移多个提交
git cherry-pick <HashA> <HashB>

# 转移连续提交
git cherry-pick A..B

```

## 停止跟踪某个文件夹

```bash
git rm -r --cached some-folder
```

## merge分支时合并commit

```bash
git merge --squash <target-branch>
```

这也是一种非破坏性的方式，分支保留了其历史，但现在不会出现合并提交，主分支中的所有更改都被合并成一个名为Squash的提交，以单个提交的形式出现在特性分支中。

## pull 后执行 rebase

拉取远程变更的同时执行rebase操作

```bash
git pull --rebase
```

## Worktree

git worktree 是 Git 提供的一种功能，允许你在同一个仓库（同一 .git 数据库）下同时检出多个工作副本（working trees），每个工作树可以检出不同的分支，用于并行开发、代码审查、快速切换上下文等。

新建并检出新分支到新的工作树（在父目录创建一个名为 ../feature 的文件夹）： 
`git worktree add -b feature/foo ../feature origin/main`

检出已存在的分支到新的工作树： 
`git worktree add ../feature feature/foo`

列出所有工作树： 
`git worktree list`

移除工作树（清理工作树目录的元信息并删除工作树记录）： 
`git worktree remove ../feature`

清理已丢失的（stale）工作树记录： 
`git worktree prune` （可结合 --expire 参数） 


>[!tip] 备注
不要直接用 rm -rf 删除工作树目录，否则会留下 git 的记录；若已删除请运行 git worktree prune 清理。

