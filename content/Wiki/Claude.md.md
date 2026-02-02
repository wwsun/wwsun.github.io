---
created: 2025-12-11 14:38
url: https://www.anthropic.com/engineering/claude-code-best-practices
tags:
  - claude-code
---
`CLAUDE.md` 是一个特殊文件，Claude 在开始对话时会自动将其引入上下文。这使得它成为记录以下内容的理想位置：

- 常用 bash 命令
- 核心文件和实用函数
- 代码风格指南
- 测试说明
- 代码仓库规范（例如，分支命名、合并与变基等）
- 开发环境设置（例如，pyenv 的使用、支持哪些编译器）
- 项目中特有的任何异常行为或警告
- 你希望 Claude 记住的其他信息


`CLAUDE.md` 文件没有固定格式。我们建议保持简洁且易于阅读。例如：

```
# Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you’re done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

## import file

```
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

## rules

对于较大的项目，您可以使用.claude/rules/目录将指令组织到多个文件中。这允许团队保持专注、有序的规则文件，而不是一个大的CLAUDE.md。

```
your-project/
├── .claude/
│   ├── CLAUDE.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```

All `.md` files in `.claude/rules/` are automatically loaded as project memory, with the same priority as `.claude/CLAUDE.md`.

Example rule file:

```
---
paths: src/api/**/*.ts
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

