---
name: vault-manager
description: 管理和维护 Obsidian/Quartz 知识库。当用户需要更新文件的 frontmatter（title、tags、description）、同步子目录的 index.md 索引、检查断链、诊断知识库整体健康状态、或重命名非语义化附件时，使用此 skill。触发词：「更新 metadata」「同步索引」「更新 index」「知识库整理」「更新 frontmatter」「检查断链」「vault 整理」「补全元数据」「整理标签」「重命名附件」「图片命名太乱」「Pasted image 重命名」「整理图片」等。
---

# vault-manager — 知识库管理

## 五种操作

执行前先问清楚用户想做哪些操作、作用范围（整库 / 特定目录 / 特定文件）。默认逐目录处理而非一次性全库扫描，避免改动过大。

---

## 操作 1：health（只读诊断）

运行前建议先做这一步，摸清现状再决定修什么。

输出以下摘要：

```
Vault Health Report
===================
总文件数：N
Frontmatter 缺 title：N 个文件
Frontmatter 缺 tags：N 个文件
Frontmatter 缺 description：N 个文件
Frontmatter 缺 date：N 个文件
缺少 index.md 的目录：[列表]
疑似断链（wikilink 指向不存在文件）：N 处
```

执行方式：用 `find` 枚举所有 .md，用 Python/shell 脚本批量检查 frontmatter 和 wikilink。不修改任何文件。

---

## 操作 2：update-meta（更新 frontmatter）

更新 `title`、`description`、`tags` 字段，**不动其他字段**。

### 字段处理规则

**title**

- 已有有效值时保留不变
- 缺失时：优先从正文第一个 `# H1` 标题提取，其次使用文件名（去掉 `.md` 后缀）

**description**

- 已有且长度 ≥ 50 字符时保留不变（尊重用户手动填写的内容）
- 缺失或过短时：从正文首段提取前 150 个字符，去除 Markdown 语法（`#`、`*`、`[[]]`、图片引用、脚注、LaTeX）

**tags**

- 已有有效值时保留不变
- 缺失或为空：根据文件名或 H1 标题推断并填入
- 格式统一为 kebab-case，如 `ai-agent`、`frontend-design`
- 优先匹配 `content/tags.json` 中已有的标签，减少碎片化

### 执行步骤

1. 枚举目标文件（排除 `content/assets/`、`index.md`、模板文件）
2. 读取每个文件的 frontmatter，识别需要更新的字段
3. **列出变更清单**（文件路径 + 将要写入的值），用户确认后再执行
4. 写入时只替换 `---` 包围的 Frontmatter 区域，**严禁修改正文**
5. 保持原有 frontmatter 字段格式（数组用 `- value` 形式，标量用 `value:` 形式）
6. 汇总报告：列出每个文件的改动项（新增/更新了哪些字段）

### 未提交文件模式（默认）

用户未指定文件时，自动处理当前工作区未提交的 Markdown 笔记：

1. 运行 `git status --porcelain` 获取已修改（`M`）或未跟踪（`??`）的文件列表
2. 筛选 `content/` 下的 `.md` 文件（排除 `content/assets/`）
3. 逐文件执行上述规则

---

## 操作 3：sync-index（同步 index.md）

为每个子目录生成或更新 index.md，使其列出该目录所有文件并附一句简介。

### Index.md 格式

```markdown
# {目录名} — 索引

> 一句话描述本目录的内容和用途。

- [[文件名\|显示标题]] — 一句话简介（≤30 字）
```

### 简介生成原则

- 读文件前 60 行，提炼核心主题写成一句话（≤30 字）
- 显示标题优先用文件内第一个 `# 标题`，没有则用文件名
- 已有 frontmatter `description` 字段时直接引用

### 执行步骤

1. 枚举目标目录下所有 .md 文件（排除 index.md 自身、模板文件）
2. 读取每个文件生成简介
3. 检查已有 index.md 是否存在及内容
4. 展示将要写入的 index.md 内容预览，确认后写入

### 优先处理的目录

- 根目录 `index.md`（Vault 总入口）
- `content/blog/`、`content/wiki/`、`content/clippings/`

---

## 操作 4：check-links（断链检查）

扫描所有 `[[wikilink]]`，验证目标文件是否存在。

```bash
# 提取所有 wikilink 目标
grep -rh '\[\[' --include="*.md" /path/to/vault \
  | grep -oP '(?<=\[\[)[^\]|#]+' \
  | sort | uniq
```

对每个 link 尝试匹配对应的 .md 文件（注意：wikilink 不含路径时需全库搜索）。

输出格式：

```
断链报告
========
共发现 N 处断链：

- [[文件名]] — 出现在 content/blog/xxx.md（第 12 行）
- [[另一文件]] — 出现在 content/wiki/yyy.md（第 5 行）
```

不修改文件，仅报告。用户可根据报告决定是修复链接还是删除引用。

---

## 操作 5：rename-attachments（附件重命名）

将 Markdown 文档中非语义化的附件文件名（如 Obsidian 自动生成的 `Pasted image 20260113151316.png`）重命名为基于内容的语义化名称，并自动更新所有 md 文件的引用。

**附件目录**：`assets/`（根目录，Obsidian 默认粘贴位置）；不处理 `content/assets/`。  
**命名规范**：`lowercase-hyphen-separated.ext`，英文 kebab-case，3-6 个单词。

**非语义文件名判断**（满足任一即需重命名）：

- 包含 `Pasted image` 前缀
- 文件名为纯时间戳（如 `20260113151316.png`）
- 文件名为随机字符串（如 `img_a3f9b2.png`）

### 执行步骤

1. **确定范围**：询问用户处理单文件、目录还是全局；不明确时推荐先选单文件试效果
2. **安全快照提示**：提醒用户先 `git commit` 以便回滚（用户已知晓可跳过）
3. **提取附件列表**：扫描目标 md 文件中的 `![[...]]` 和 `![](assets/...)` 引用；确认文件是否存在于 `assets/`，不存在则跳过并警告
4. **AI 分析生成语义名**：用 Read 工具读取图片，根据视觉内容生成英文 kebab-case 文件名；冲突时追加数字后缀
5. **展示重命名计划**（表格形式），等待用户确认：

   ```
   | 原文件名 | 新文件名 | 引用位置 |
   |---------|---------|---------|
   | Pasted image 20260113.png | agent-workflow-diagram.png | content/blog/foo.md (第 28 行) |
   ```

6. **执行**：`mv` 重命名文件 → 全局替换 `content/` 下所有 md 引用 → 输出变更报告

---

## 通用约定

- 仅处理 `content/` 目录
- 写入操作前必须展示变更预览并获得用户确认
- 每次处理的文件数建议不超过 30 个，避免单次改动太大
- 遇到格式不确定的文件，跳过并记录，不强行修改
