---
title: AGENTS.md
date: 2026-02-06 14:03:42
tags:
  - agent
draft: false
description: AGENTS
source: https://agents.md/
---
README.md 面向人类开发者
AGENTS.md 面向智能体


添加有助于智能体高效处理项目的章节。常用选项：

- Project overview  项目概览
- Build and test commands  构建和测试命令
- Code style guidelines  代码风格指南
- Testing instructions  测试说明
- Security considerations  安全注意事项

https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/

## 优化渐进披露 prompt

```
I want you to refactor my AGENTS.md file to follow progressive disclosure principles.

Follow these steps:

1. **Find contradictions**: Identify any instructions that conflict with each other. For each contradiction, ask me which version I want to keep.

2. **Identify the essentials**: Extract only what belongs in the root AGENTS.md:
   - One-sentence project description
   - Package manager (if not npm)
   - Non-standard build/typecheck commands
   - Anything truly relevant to every single task

3. **Group the rest**: Organize remaining instructions into logical categories (e.g., TypeScript conventions, testing patterns, API design, Git workflow). For each group, create a separate markdown file.

4. **Create the file structure**: Output:
   - A minimal root AGENTS.md with markdown links to the separate files
   - Each separate file with its relevant instructions
   - A suggested docs/ folder structure

5. **Flag for deletion**: Identify any instructions that are:
   - Redundant (the agent already knows this)
   - Too vague to be actionable
   - Overly obvious (like "write clean code")
```


## 参考

- https://github.com/openai/codex/blob/main/AGENTS.md
- https://github.com/apache/airflow/blob/main/AGENTS.md
