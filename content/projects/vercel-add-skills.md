---
title: add-skills 代码学习
tags:
  - vercel
  - skills
  - github
draft: false
description: '`skills` 是一个开放的 AI Agent 技能生态系统 CLI 工具，面向开发者，让他们能将 Markdown 格式的"技能"文件（SKILL.md）安装到 40+ 种 AI Agent（Claude Code、Cursor、Codex 等）的配置目录中。'
source:
---

`skills` 是一个开放的 AI Agent 技能生态系统 CLI 工具，面向开发者，让他们能将 Markdown 格式的"技能"文件（SKILL.md）安装到 40+ 种 AI Agent（Claude Code、Cursor、Codex 等）的配置目录中。

## 技术栈

- **语言**：TypeScript（ESM，`"type": "module"`）
- **运行环境**：Node.js ≥ 18
- **构建工具**：`obuild`（打包到 `dist/`）+ Bun 类型支持
- **测试框架**：Vitest
- **主要依赖**：`@clack/prompts`（交互式 CLI）、`gray-matter`（解析 SKILL.md frontmatter）、`simple-git`（git clone）、`picocolors`（终端着色）、`xdg-basedir`（跨平台 config 路径）

## 目录结构

```
add-skill/
├── bin/
│   └── cli.mjs          # 发布后的 CLI 入口（obuild 生成）
├── src/                 # 核心源码
│   ├── cli.ts           # 命令路由 + check/update 实现
│   ├── add.ts           # `skills add` 命令：最重最复杂的业务逻辑
│   ├── agents.ts        # 所有支持的 agent 定义 + 安装路径配置
│   ├── skills.ts        # 递归发现 SKILL.md、解析 frontmatter
│   ├── installer.ts     # 实际文件操作（symlink 或 copy 到 agent 目录）
│   ├── source-parser.ts # 解析输入源（owner/repo、URL、local path 等）
│   ├── skill-lock.ts    # 全局 lock 文件（~/.agents/.skill-lock.json）
│   ├── local-lock.ts    # 项目级 lock 文件（./.skill-lock.json）
│   ├── git.ts           # clone 远程仓库到临时目录
│   ├── telemetry.ts     # 使用统计上报（含安全审计）
│   ├── find.ts          # `skills find` 命令
│   ├── list.ts          # `skills list` 命令
│   ├── remove.ts        # `skills remove` 命令
│   ├── install.ts       # `experimental_install`：从 lock 文件恢复
│   ├── sync.ts          # `experimental_sync`：从 node_modules 同步
│   ├── types.ts         # 核心类型定义
│   ├── constants.ts     # 路径常量（AGENTS_DIR、SKILLS_SUBDIR）
│   ├── providers/       # 可扩展的远程技能提供商
│   │   ├── registry.ts  # 提供商注册表
│   │   ├── wellknown.ts # RFC 8615 well-known 端点支持
│   │   └── types.ts
│   └── prompts/
│       └── search-multiselect.ts  # 支持模糊搜索的多选组件
├── skills/              # CLI 工具本身携带的技能（find-skills 等）
├── scripts/             # 构建脚本（generate-licenses 等）
└── tests/               # Vitest 测试（与 src/ 平行）
```

## 入口点

- **CLI 入口**：`bin/cli.mjs`（发布版）/ `src/cli.ts`（开发版，`npm run dev`）
- **主命令调度**：`src/cli.ts:608` `main()` 函数，switch 分发到各命令处理器

## 核心数据流

`skills add vercel-labs/agent-skills` 执行路径：

```
cli.ts: main()
  → parseAddOptions(args)              # 解析 CLI flags
  → add.ts: runAdd(source, options)
      → source-parser.ts: parseSource()   # 识别输入类型
          # 返回 ParsedSource { type: 'github'|'gitlab'|'git'|'local'|'well-known', url, subpath, ref, skillFilter }
      ├─ [remote] git.ts: cloneRepo()     # clone 到系统临时目录
      ├─ [well-known] providers/wellknown.ts: fetchAllSkills()  # RFC 8615 端点获取
      └─ [local] 直接使用本地路径

      → skills.ts: discoverSkills()       # 递归扫描目录，找所有 SKILL.md，gray-matter 解析 frontmatter
      → [交互] @clack/prompts             # 选择技能、选择 agent、选安装范围(global/project)、选安装方式(symlink/copy)
      → telemetry.ts: fetchAuditData()    # 非阻塞并行：拉取安全风险评估
      → installer.ts: installSkillForAgent()  # 实际安装
          # symlink 模式：写到 .agents/skills/<name>，对其他 agent 目录建软链
          # copy 模式：独立复制到每个 agent 的 skillsDir
      → skill-lock.ts: addSkillToLock()   # 更新全局 lock（global 安装）
      → local-lock.ts: addSkillToLocalLock()  # 更新项目 lock（project 安装）
      → git.ts: cleanupTempDir()          # 清理临时目录
```

## 整体架构

```
CLI 层         cli.ts → 命令路由（add/remove/list/find/check/update/init）
Business 层    add.ts / remove.ts / list.ts / find.ts → 业务编排 + 用户交互
Core 层        skills.ts / installer.ts → 技能发现与文件安装
Adapter 层     git.ts / source-parser.ts / providers/ → 外部系统适配
State 层       skill-lock.ts / local-lock.ts → 全局 & 项目级状态持久化
```

## 核心抽象

- **`Skill`**（`src/types.ts:46`）— 一个可安装的技能单元，来自 SKILL.md 解析
  - 关键字段：`name`、`description`、`path`（绝对路径）、`pluginName`（所属插件组）、`rawContent`

- **`AgentConfig`**（`src/types.ts:57`）— 表示一种 AI Agent 工具，定义了技能安装目录和检测逻辑
  - 关键字段：`name`、`displayName`、`skillsDir`（项目级）、`globalSkillsDir`、`detectInstalled()`

- **`ParsedSource`**（`src/types.ts:68`）— 解析后的安装来源，统一各种输入格式
  - 关键字段：`type`（`github`/`gitlab`/`git`/`local`/`well-known`）、`url`、`subpath`、`skillFilter`

- **`SkillLockEntry`**（`src/skill-lock.ts:14`）— lock 文件中追踪已安装技能的一条记录，用于后续更新检测
  - 关键字段：`source`、`sourceType`、`sourceUrl`、`skillPath`、`skillFolderHash`（GitHub tree SHA）

- **Universal Agent**（`src/agents.ts`）— 使用 `.agents/skills/` 共享目录的 agent（如 Amp、Antigravity）；其他 agent 则各自维护独立的 skillsDir，安装时通过 symlink 指向 universal 目录的规范副本

## 关键文件速查

| 想了解什么                               | 去哪里找                     |
| ---------------------------------------- | ---------------------------- |
| 支持哪些 Agent 及其安装路径              | `src/agents.ts`              |
| 输入源格式解析逻辑（owner/repo、URL 等） | `src/source-parser.ts`       |
| symlink vs copy 安装逻辑                 | `src/installer.ts`           |
| lock 文件结构 / update 检测机制          | `src/skill-lock.ts`          |
| SKILL.md 发现与 frontmatter 解析         | `src/skills.ts`              |
| well-known 端点（RFC 8615）支持          | `src/providers/wellknown.ts` |
| 安全审计集成（Socket/Snyk/ATH）          | `src/telemetry.ts`           |

## 核心依赖

| 库               | 用途                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| `@clack/prompts` | 美观的交互式 CLI（spinner、multiselect、confirm），避免手写 readline |
| `gray-matter`    | 解析 SKILL.md 的 YAML frontmatter（name/description 等元数据）       |
| `simple-git`     | Git clone 操作，比直接调用 `child_process` 更安全可靠                |
| `picocolors`     | 极轻量的终端颜色库，替代 chalk，减少依赖体积                         |
| `xdg-basedir`    | 跨平台获取 XDG_CONFIG_HOME，与 OpenCode/Amp 等 agent 路径约定一致    |

## 值得关注的设计决策

1. **Universal Agent 概念**：使用 `.agents/skills/` 作为共享规范存储，其他 agent 通过 symlink 指向它。好处是多 agent 共享同一份文件、更新一次即全部生效；缺点是 Windows 上 symlink 需要开发者模式（代码有回退到 copy 的逻辑）。

2. **安全审计并行化**：在用户进行 agent 选择和安装方式交互时，同步在后台拉取 ATH/Socket/Snyk 安全评估数据（`fetchAuditData`），交互完成后恰好可以展示结果，不额外增加等待时间。

3. **双 lock 文件机制**：全局 lock（`~/.agents/.skill-lock.json`）用于 `check`/`update` 命令追踪已安装技能版本；项目 lock（`./.skill-lock.json`）用于 `experimental_install` 从 lock 文件恢复，两者职责分离。

4. **Private repo 遥测保护**：安装前检查 GitHub API 判断仓库是否私有，私有仓库跳过遥测，避免泄露内部仓库信息。
