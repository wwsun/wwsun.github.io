---
title: claude-code 深度使用总结
tags:
draft: false
description:
source: https://tw93.fun/2026-03-12/claude.html
---

## TLDR

Claude Code 不是 ChatBot，而是一个**反复循环的代理系统**。与其写长 Prompt，不如理解它的六层架构：

| 层                             | 职责                                     | 对应文件/机制        |
| ------------------------------ | ---------------------------------------- | -------------------- |
| **CLAUDE.md / rules / memory** | 长期上下文，告诉 Claude "是什么"         | 项目契约、架构边界   |
| **Tools / MCP**                | 动作能力，告诉 Claude "能做什么"         | 内置工具、MCP Server |
| **Skills**                     | 按需加载的方法论，告诉 Claude "怎么做"   | `.claude/skills/`    |
| **Hooks**                      | 强制执行某些行为，不依赖 Claude 自己判断 | `.claude/hooks/`     |
| **Subagents**                  | 隔离上下文的工作者，负责受控自治         | `.claude/agents/`    |
| **Verifiers**                  | 验证闭环，让输出可验、可回滚、可审计     | 测试、lint、检查点   |

**关键认知**：卡住的地方通常不是模型不够聪明，而是**给了错误的上下文**或**无法判断对错**。

---

## 1. 上下文工程：最重要的系统约束

### 200K 上下文的真实构成

```
200K 总上下文
├── 固定开销 (~15-20K)
│   ├── 系统指令: ~2K
│   ├── Skill 描述符: ~1-5K
│   ├── MCP Server 工具定义: ~10-20K  ← 最大隐形杀手
│   └── LSP 状态: ~2-5K
├── 半固定 (~5-10K)
│   ├── CLAUDE.md: ~2-5K
│   └── Memory: ~1-2K
└── 动态可用 (~160-180K)
    ├── 对话历史
    ├── 文件内容
    └── 工具调用结果
```

**关键数字**：接 5 个 MCP Server，固定开销达 **25K tokens（12.5%）**。

### 推荐的分层策略

```
始终常驻    → CLAUDE.md：项目契约 / 构建命令 / 禁止事项
按路径加载  → rules：语言/目录/文件类型特定规则
按需加载    → Skills：工作流/领域知识
隔离加载    → Subagents：大量探索/并行研究
不进上下文  → Hooks：确定性脚本/审计/阻断
```

### 压缩机制的陷阱

默认压缩会**删除早期的 Tool Output 和文件内容**，顺带把**架构决策和约束理由**也扔了。

**解决方案**：在 CLAUDE.md 中写 `Compact Instructions`：

```markdown
## Compact Instructions

When compressing, preserve in priority order:

1. Architecture decisions (NEVER summarize)
2. Modified files and their key changes
3. Current verification status (pass/fail)
4. Open TODOs and rollback notes
5. Tool outputs (can delete, keep pass/fail only)
```

### 更主动的切换方案：HANDOFF.md

开新会话前，让 Claude 写一份交接文档：

> "在 HANDOFF.md 里写清楚现在的进展。解释你试了什么、什么有效、什么没用，让下一个拿到新鲜上下文的 agent 只看这个文件就能继续完成任务。"

---

## 2. Skills 设计：用的时候才加载的工作流

### 好 Skill 的标准

1. **描述要让模型知道"何时该用我"**，而不是"我是干什么的"
2. 有完整步骤、输入、输出和**停止条件**
3. 正文只放导航和核心约束，大资料拆到 supporting files
4. 有副作用的 Skill 要显式设置 `disable-model-invocation: true`

### Skill 结构示例

```
.claude/skills/
└── incident-triage/
    ├── SKILL.md          # 定义任务语义、边界和执行骨架
    ├── runbook.md        # 领域细节
    ├── examples.md       # 示例
    └── scripts/
        └── collect-context.sh  # 确定性收集上下文
```

### Skill 的三种类型

| 类型           | 用途                         | 示例                |
| -------------- | ---------------------------- | ------------------- |
| **检查清单型** | 发布前跑一遍，确保不漏项     | `release-check`     |
| **工作流型**   | 标准化操作，带回滚步骤       | `config-migration`  |
| **领域专家型** | 运行时问题按固定路径收集证据 | `runtime-diagnosis` |

### Skill 反模式

- 描述过短：`description: help with backend`（任何后端工作都能触发）
- 正文过长：几百行手册全塞进 SKILL.md
- 一个 Skill 覆盖 review、deploy、debug、docs、incident 五件事
- 有副作用的 Skill 允许模型自动调用

---

## 3. 工具设计：让 Claude 少选错

### 好工具 vs 坏工具

| 维度     | 好工具                                       | 坏工具                        |
| -------- | -------------------------------------------- | ----------------------------- |
| 名称     | `jira_issue_get`, `sentry_errors_search`     | `query`, `fetch`, `do_action` |
| 参数     | `issue_key`, `project_id`, `response_format` | `id`, `name`, `target`        |
| 返回     | 与下一步决策直接相关的信息                   | 一堆 UUID、内部字段、原始噪声 |
| 规模     | 单一目标，边界清楚                           | 多个动作混杂，副作用不透明    |
| 错误信息 | 包含修正建议                                 | 仅返回 opaque error code      |

### 从 Claude Code 演进学到的

**AskUserQuestion 工具的演进**：

- 第一版：给 Bash 加 `question` 参数 → Claude 经常忽略
- 第二版：要求写特定 markdown 格式 → Claude 经常"忘了"按格式写
- 第三版：**做成独立的 `AskUserQuestion` 工具** → 调用即暂停，没有歧义 ✅

**关键原则**：既然你就是要 Claude 停下来问一句，**就直接给它一个专门的工具**，不要加 flag 或约定输出格式。

---

## 4. Hooks：强制执行你自己的逻辑

### 适合放 Hooks 的

- 阻断修改受保护文件
- Edit 后自动格式化/lint/轻量校验
- SessionStart 后注入动态上下文（Git 分支、环境变量）
- 任务完成后推送通知

### 不适合放 Hooks 的

- 需要读大量上下文的复杂语义判断
- 长时间运行的业务流程
- 需要多步推理和权衡的决策

### Hooks 配置示例

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "pattern": "*.rs",
        "hooks": [
          {
            "type": "command",
            "command": "cargo check 2>&1 | head -30",
            "statusMessage": "Running cargo check..."
          }
        ]
      }
    ]
  }
}
```

**注意限制输出长度**（`| head -30`），避免 Hook 输出污染上下文。

### 三层叠加

- **CLAUDE.md**：声明"提交前必须通过测试和 lint"
- **Skill**：告诉 Claude 在什么顺序下运行测试、如何看失败、如何修复
- **Hook**：对关键路径执行硬性校验，必要时阻断

---

## 5. Subagents：独立上下文的工作者

核心价值不是"并行"，而是**隔离**。

扫代码库、跑测试、做审查这类会产生大量输出的事，交给 Subagent 做，**主线程只拿摘要**，不会被中间过程污染。

### 配置时要显式约束

- `tools` / `disallowedTools`：限定能用什么工具
- `model`：探索用 Haiku/Sonnet，重要审查用 Opus
- `maxTurns`：防止跑飞
- `isolation: worktree`：需要动文件时隔离文件系统

### 反模式

- 子代理权限和主线程一样宽
- 输出格式不固定，主线程拿到没法用
- 子任务之间强依赖，频繁要共享中间状态

---

## 6. Prompt Caching：Claude Code 架构的核心

> "Cache Rules Everything Around Me" - 对 agent 同样如此。

### 缓存工作原理

Prompt 缓存按**前缀匹配**工作，从请求开头到每个 `cache_control` 断点之前的内容都会被缓存。

**Claude Code 的 Prompt 顺序**：

1. System Prompt → 静态，锁定
2. Tool Definitions → 静态，锁定
3. Chat History → 动态，在后面
4. 当前用户输入 → 最后

### 破坏缓存的常见陷阱

- 在静态系统 Prompt 中放入带时间戳的内容
- 非确定性地打乱工具定义顺序
- 会话中途增删工具

**解决方案**：动态信息（如当前时间）放到用户消息里，用 `<system-reminder>` 标签，不动系统 Prompt。

### 会话中途不要切换模型

Prompt 缓存是**模型唯一**的。和 Opus 对话 100K tokens 后，切换到 Haiku 实际上**更贵**，因为要为 Haiku 重建整个缓存。

确实需要切换的话，用 **Subagent 交接**。

### Compaction 实现

上下文快满时，Claude Code 开一个 fork 调用，把完整对话历史喂给模型生成摘要，原来几十轮对话被替换成 ~20k tokens 的摘要，腾出空间继续。

---

## 7. 验证闭环：没有 Verifier 就没有工程上的 Agent

「Claude 说完成了」其实没啥用，你得能知道：

- 它做没做对
- 出了问题能退回来
- 过程还能查

### Verifier 层级

| 层级   | 验证方式                                      |
| ------ | --------------------------------------------- |
| 最低层 | 命令退出码、lint、typecheck、unit test        |
| 中间层 | 集成测试、截图对比、contract test、smoke test |
| 更高层 | 生产日志验证、监控指标、人工审查清单          |

### 关键判断

> 假如一个任务你都说不清楚「Claude 怎么才算做对了」，那它大概率也不适合直接丢给 Claude 自动完成。

---

## 8. 高频命令速查

### 上下文管理

```
/context    # 查看 token 占用结构
/clear      # 清空会话（同一问题被纠偏两次以上就重来）
/compact    # 压缩但保留重点（配合 Compact Instructions）
/memory     # 确认哪些 CLAUDE.md 真的被加载了
```

### 能力与治理

```
/mcp          # 管理 MCP 连接，检查 token 成本
/hooks        # 管理 hooks
/permissions  # 查看或更新权限白名单
/sandbox      # 配置沙箱隔离
/model        # 切换模型
```

### 会话连续性与并行

```bash
claude --continue              # 恢复当前目录最近会话
claude --resume                # 打开选择器恢复历史会话
claude --continue --fork       # 从已有会话分叉
claude --worktree              # 创建隔离 git worktree
claude -p "prompt"             # 非交互模式，接入 CI / 脚本
claude -p --output-format json # 结构化输出
```

### 实用小技巧

| 命令         | 用途                                               |
| ------------ | -------------------------------------------------- |
| `/simplify`  | 三维检查（复用、质量、效率），改完代码后立刻跑一遍 |
| `/rewind`    | 回到某个 checkpoint 重新总结，不是撤销             |
| `/btw`       | 不打断主任务问侧问题，适合单轮旁路问答             |
| `/insight`   | 分析当前会话，提炼哪些值得沉淀到 CLAUDE.md         |
| **双击 ESC** | 回到上一条输入重新编辑                             |

---

## 9. 如何写一个好的 CLAUDE.md

`CLAUDE.md` 是**你和 Claude 之间的协作契约**，不是团队文档，也不是知识库。

### 应该放什么

- 怎么 build、怎么 test、怎么跑（最核心）
- 关键目录结构与模块边界
- 代码风格和命名约束
- 不明显的环境坑
- **绝对不能干的事（NEVER 列表）**
- **压缩时必须保留的信息（Compact Instructions）**

### 不该放什么

- 大段背景介绍
- 完整 API 文档
- 空泛原则（如"写高质量代码"）
- Claude 通过读仓库即可推断的显然信息
- 大量背景资料和低频任务知识（放 Skills）

### 高质量模板结构

```markdown
# Project Contract

## Build And Test

- Install: `pnpm install`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Architecture Boundaries

- HTTP handlers live in `src/http/handlers/`
- Domain logic lives in `src/domain/`
- Do not put persistence logic in handlers

## Safety Rails

### NEVER

- Modify `.env`, lockfiles, or CI secrets without explicit approval
- Remove feature flags without searching all call sites
- Commit without running tests

### ALWAYS

- Show diff before committing
- Update CHANGELOG for user-facing changes

## Verification

- Backend changes: `make test` + `make lint`
- API changes: update contract tests
- UI changes: capture before/after screenshots

## Compact Instructions

Preserve:

1. Architecture decisions (NEVER summarize)
2. Modified files and key changes
3. Current verification status
4. Open risks, TODOs, rollback notes
```

### 让 Claude 维护自己的 CLAUDE.md

每次纠正 Claude 的错误后，让它自己更新：

> "Update your CLAUDE.md so you don't make that mistake again."

---

## 10. 常见反模式

| 反模式                 | 症状                         | 修复                                   |
| ---------------------- | ---------------------------- | -------------------------------------- |
| CLAUDE.md 当 wiki      | 每次加载污染上下文           | 只保留契约，资料拆到 Skills            |
| Skill 大杂烩           | 描述无法稳定触发             | 一个 Skill 只做一类事                  |
| 工具太多描述模糊       | 选错工具，schema 挤爆上下文  | 合并重叠工具，明确 namespacing         |
| 没有验证闭环           | Claude 只能"觉得自己完成了"  | 给每类任务绑定 verifier                |
| 过度自治               | 多 agent 并行无边界          | 角色/权限/worktree 最小化              |
| 上下文不做切分         | 研究、实现、审查全堆主线程   | 任务切换 `/clear`，阶段切换 `/compact` |
| 自治范围过宽但治理不足 | MCP、工具全开但无边界        | permissions + sandbox + hooks 组合     |
| 已批准命令堆积不清理   | `settings.json` 残留危险操作 | 定期审查 `allowedTools`                |

---

## 11. 配置健康检查

使用开源 Skill 一键检查配置状态：

```bash
npx skills add tw93/claude-health
```

装好后在任意会话里跑 `/health`，它会检查 `CLAUDE.md`、`rules`、`skills`、`hooks`、`allowedTools` 和实际行为模式，输出优先级报告。

---

## 结语：使用 Claude Code 的三个阶段

| 阶段           | 关注点                                       | 效率感知     |
| -------------- | -------------------------------------------- | ------------ |
| **工具使用者** | "这个功能怎么用"                             | 有帮助但有限 |
| **流程优化者** | "如何让协作更顺"，开始写 CLAUDE.md 和 Skills | 明显提升     |
| **系统设计者** | "如何让 Agent 在约束下自主运作"              | **质变**     |

**关键问题**：假如一个任务你说不清楚「什么叫做完」，那大概率也不适合直接扔给 Claude 自主完成。
