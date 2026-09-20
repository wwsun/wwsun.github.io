---
title: agent skills for nextjs
tags:
  - nextjs
  - skills
description: agent skills for nextjs
source: https://github.com/vercel/next.js/tree/canary/.agents/skills
---

## **贡献流程类**

- **create-pr** — 指导创建 Git 分支、提交代码、推送并通过 `gh` 命令开 PR，包括处理 PR 模板格式和 Codex 分支命名规范。
- **backport-pr** — 将已合并到 `canary` 的 PR cherry-pick 回旧版本 release 分支（如 `next-16-2`），完成 backport PR 的完整流程。
- **gh-stack** — 使用 `gh-stack` CLI 插件管理"堆叠式 PR"（stacked diffs），适合需要多个相互依赖 PR 的增量代码评审工作流。
- **pr-status-triage** — 通过 `scripts/pr-status.js` 分诊 CI 失败和 PR 评审意见，按优先级排查（构建 > lint > 类型 > 测试），并支持本地复现 CI 环境变量配置。

---

## **底层架构与调试类**

- **flags** — 端到端添加或修改 Next.js 实验性 feature flag，涉及 `config-shared.ts`、`config-schema.ts`、`define-env-plugin.ts` 等文件的完整链路。
- **dce-edge** — Edge Runtime 下的 DCE（死代码消除）安全写法，指导如何用 `if/else` 分支保护 `node:stream` 等 Node 专属 import，以及 `define-env.ts` 中强制 flag 为 false 的时机。
- **react-vendoring** — React vendor 包的边界管理，涵盖 `entry-base.ts` 的 react-server 层边界规范、vendored React 通道、Turbopack remap 和类型声明等。
- **runtime-debug** — 诊断 runtime bundle 和模块解析回归问题，包括通过 `__NEXT_SHOW_IGNORE_LISTED` 获取完整堆栈、nft.json trace 检查、webpack stats diff 等调试手段。
- **v8-jit** — 为 Next.js server 内部热路径代码（如 `app-render`、routing）提供 V8 JIT 优化建议，涵盖 hidden class、内联缓存、megamorphic deopt 等性能模式（不对外暴露为斜杠命令）。
- **next-rspack** — 维护 `@next/rspack-core` 和 `@next/rspack-binding` 包，涵盖升级 `@rspack/core`、Rust toolchain 版本管理和本地联调方式。

---

## **文档写作类**

- **update-docs** — 根据代码变更识别需要同步更新的文档文件，输出受影响的 `.mdx` 文件列表，适合 PR review 时检查文档完整性。
- **write-api-reference** — 生成符合 Next.js 规范的 API 参考文档页（含 frontmatter、用法示例、参数说明），以独立 fork 子 Agent 模式运行。
- **write-guide** — 生成渐进式教学风格的技术指南，适合将 feature skill 或 API 文档转换为 step-by-step 教程，同样以 fork 子 Agent 模式运行。
- **insight-error-page** — 编写或审核开发 overlay 中的错误说明页（`errors/<slug>.mdx`），包含 FixOption 卡片、"Copy AI prompt"按钮和术语规范校验。
- **router-act** — 指导如何用 `createRouterAct` 和 `LinkAccordion` 编写端到端测试，精确控制 prefetch 等内部请求的时序，避免测试 flaky（不对外暴露为斜杠命令）。

---

## Meta skills

**authoring-skills** 则是一个"元 skill"，专门讲解如何编写上面这些 skill 本身，不对外暴露。
