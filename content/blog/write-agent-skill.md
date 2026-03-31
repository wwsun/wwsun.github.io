---
title: How to write good agent skills
tags:
  - agent-skill
draft: false
description: 只写 "When" 而完全不写 "What"，当有多个相似 skill 时，agent 无法区分该选哪个。
source: null
date: 2026-03-31T06:02:38.969Z
---

## Skill Description 如何写

| 维度                          | 权重 | 作用                                  |
| ----------------------------- | ---- | ------------------------------------- |
| **什么情况触发**（When）      | 主要 | 让 agent 知道何时调用                 |
| **这个 skill 做什么**（What） | 辅助 | 帮助 agent 区分相似 skill，避免误触发 |

只写 "When" 而完全不写 "What"，当有多个相似 skill 时，agent 无法区分该选哪个。

---

### 真实对比例子

#### ❌ 只写 When（不够好）

```
当用户上传了文件但内容不在 context 中时使用这个 skill。
```

问题：有好几个文件处理 skill，agent 不知道选哪个。

---

#### ❌ 只写 What（不够好）

```
这个 skill 使用 python-docx 库操作 Word 文档，支持添加标题、表格、图片等元素。
```

问题：agent 不知道什么时候该触发它，容易漏触发。

---

#### ✅ When + What 结合（好）

**docx skill：**

```
Use this skill whenever the user wants to create, read, edit, or manipulate
Word documents (.docx files).

Triggers include: any mention of 'Word doc', 'word document', '.docx', or
requests to produce professional documents with formatting like tables of
contents, headings, page numbers, or letterheads.

Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks
unrelated to document generation.
```

**pdf-reading skill（区别于 pdf skill）：**

```
Use this skill when you need to read, inspect, or extract content from PDF
files.

Covers content inventory, text extraction, page rasterization for visual
inspection.

Do NOT use this skill for PDF creation, form filling, merging, splitting,
watermarking — use the pdf skill instead.
```

---

### Description 的核心结构模板

```
[触发条件] Use this skill when/whenever [具体场景].

[覆盖范围] Covers/Triggers include: [列举典型触发词或场景].

[边界] Do NOT use when [容易混淆的场景] — use [其他skill] instead.
```

**三段式的价值：**

- 第一段：正向触发（让 agent 知道何时用）
- 第二段：扩展触发词（提高召回率）
- 第三段：负向边界（降低误触发率，尤其是有相似 skill 时）

## SKILL.md 结构

1. 要具体：提供具体路径、命令、工具名
2. 减少 agent 决策空间：写模板，给步骤，让 agent 填空而不是自由发挥
3. 写反例：gotchas 和 do not use 往往比正向描述更有价值
4. 从失败中迭代：每当 agent 犯错，就把错误写到 gotchas
5. description 负责触发，SKILL.md 负责执行

````markdown
# Excel Skill

## When to use

Use when the user wants to create, edit, or export `.xlsx`/`.csv` files.
Triggers: "spreadsheet", "Excel", "export table", "add formulas"
Do NOT use for: PDF tables, HTML tables, Google Sheets

## Steps

1. If user uploaded a file, copy it from `/mnt/user-data/uploads/` to `/home/claude/`
2. Run: `pip install openpyxl --break-system-packages`
3. Write script to `/home/claude/build.py` using the template below
4. Execute: `python /home/claude/build.py`
5. Verify output exists at `/mnt/user-data/outputs/`
6. Call `present_files` with the output path

## Code template

```python
from openpyxl import Workbook
from openpyxl.styles import Font

wb = Workbook()
ws = wb.active

# TODO: fill in data here

wb.save("/mnt/user-data/outputs/result.xlsx")
```

## Gotchas

- `/mnt/user-data/uploads/` is read-only — always copy before editing
- Always call `present_files` at the end
- For merged cells use `ws.merge_cells("A1:C1")`

## Output

Call `present_files(["/mnt/user-data/outputs/result.xlsx"])` then write
one sentence describing what was created. Do not summarize every cell.

```

```
````
