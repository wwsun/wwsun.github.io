---
created: 2025-12-19 16:27
url: https://code.claude.com/docs/zh-CN/skills
tags:
  - agent
---
SKills 是一组指令，用来教 Claude 如何完成某项任务。你只需在一个文档中解释一次，就像培训手册一样，然后交给 Claude。下次你让 Claude 做这件事时，它会查阅这个文档，阅读指令，然后完成任务。

技能的一个强大之处在于它们可以将可执行代码作为工具包的一部分。在技能文件夹中，你可以提供脚本（Python、Node.js、Bash 等），Claude 可以运行这些脚本来执行确定性操作或进行大量计算。

## Skills vs MCP

- 技能是指导 Claude 如何完成任务的指令 (instructions)
- 而 MCP 则让 Claude 能够实际执行这些操作 (actions)

## Skills vs Sub Agents

Claude Code 中的 Sub Agents 指的是可以被创建出来，协助主 Claude 代理完成特定子任务的专业 AI 代理实例。==它们拥有自己的上下文窗口，并且独立运行。==

Sub Agents 本质上是另一个 AI 角色或模型实例，可以并行运行或按需启动，而技能并不是一个独立的 AI。它更像是主 Claude 的一个附加组件。

因此，虽然技能可以极大地扩展单个 Claude 实例的能力，但它并不具备子代理所带来的**并行处理或上下文隔离**的优势。

## Claude Code Skills

Agent Skills 将专业知识打包成可发现的功能。每个 Skill 包含一个 `SKILL.md` 文件，其中包含 Claude 在相关时读取的说明，以及可选的支持文件，如脚本和模板。

>[!info] **Skills 如何被调用**
 Skills 是**模型调用的**——Claude 根据您的请求和 Skill 的描述自主决定何时使用它们。这与斜杠命令不同，斜杠命令是**用户调用的**（您显式输入 `/command` 来触发它们）。
 >
 在启动时，Claude 会扫描每个技能的元数据以获取名称和描述。因此，在上下文中它知道有一个可以提取文本的 PDF 技能。

项目级 Skills:  项目根目录创建`mkdir -p .claude/skills/my-skill-name`
个人 Skills: `mkdir -p ~/.claude/skills/my-skill-name`

```
my-skill/
├── SKILL.md (required)
├── reference.md (optional documentation)
├── examples.md (optional examples)
├── scripts/
│   └── helper.py (optional utility)
└── templates/
    └── template.txt (optional template)
```

在 skill 中引用文件

```
For advanced usage, see [reference.md](reference.md).
```

示例的 Skills https://github.com/anthropics/skills

内置的技能：
- docx 创建 word 文档
- pptx 创建 ppt
- xlsx 创建 excel 表格
- pdf 创建 pdf 文档，提取文本，文档合并

### team-report skill

https://www.siddharthbharath.com/claude-skills/

```markdown
---
name: team-report #no capital letters allowed here.
description: Creates standardized weekly team updates. Use when the user wants a team status report or weekly update.
---

# Weekly Team Update Skill

## Instructions

When creating a weekly team update, follow this structure:

1. **Wins This Week**: 3-5 bullet points of accomplishments
2. **Challenges**: 2-3 current blockers or concerns  
3. **Next Week's Focus**: 3 key priorities
4. **Requests**: What the team needs from others

## Tone
- Professional but conversational
- Specific with metrics where possible
- Solution-oriented on challenges

## Example Output

**Wins This Week:**
- Shipped authentication refactor (reduced login time 40%)
- Onboarded 2 new engineers successfully
- Fixed 15 critical bugs from backlog

**Challenges:**
- Database migration taking longer than expected
- Need clearer specs on project X

**Next Week's Focus:**
- Complete migration
- Start project Y implementation  
- Team planning for Q4

**Requests:**
- Design review for project Y by Wednesday
- Budget approval for additional testing tools
```

### 脚本和资源

```
data-validator-skill/
├── SKILL.md
├── schemas/
│   └── customer-schema.json
└── scripts/
    └── validate.py
```

你的 SKILL.md 会引用验证脚本。当 Claude 需要验证数据时，它会用用户的数据运行 `validate.py` 。该脚本在上下文窗口之外执行。只有输出（“验证通过”或“发现 3 个错误”）会使用上下文。

## Github Copilot Skills

在执行任务时，Copilot 会根据你的提示和技能描述决定何时使用你的技能。

- 创建一个 `.github/skills` 目录来存储你的技能。
- 存储在 `.claude/skills` 目录下的技能也同样受支持。

介绍文档
https://docs.github.com/en/copilot/concepts/agents/about-agent-skills

一个示例的 skill
https://github.com/github/awesome-copilot/tree/main/skills/webapp-testing

skill 文件示例

```md
---
name: github-actions-failure-debugging
description: Guide for debugging failing GitHub Actions workflows. Use this when asked to debug failing GitHub Actions workflows.
---

To debug failing GitHub Actions workflows in a pull request, follow this process, using tools provided from the GitHub MCP Server:

1. Use the `list_workflow_runs` tool to look up recent workflow runs for the pull request and their status
2. Use the `summarize_job_log_failures` tool to get an AI summary of the logs for failed jobs, to understand what went wrong without filling your context windows with thousands of lines of logs
3. If you still need more information, use the `get_job_logs` or `get_workflow_run_logs` tool to get the full, detailed failure logs
4. Try to reproduce the failure yourself in your own environment.
5. Fix the failing build. If you were able to reproduce the failure yourself, make sure it is fixed before committing your changes.

```