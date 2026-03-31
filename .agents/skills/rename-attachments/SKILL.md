---
name: rename-attachments
description: 将 Markdown 文档中引用的非语义化附件（如 "Pasted image 20260113151316.png"）批量重命名为基于内容的语义化文件名，并自动更新所有 md 文件中的引用路径。当用户说"重命名附件"、"给图片起个好名字"、"附件命名太乱了"、"Pasted image 重命名"、"semantic filename for images"，或者当 markdown 文件中存在大量 `Pasted image` 样式的图片引用时触发。即使用户只是说"整理一下这篇文章的图片"，也应该使用此 skill。
---

# Rename Attachments Skill

将 Markdown 文档中非语义化的附件文件名（例如 Obsidian 自动生成的 `Pasted image 20260113151316.png`）重命名为基于内容的语义化文件名，并自动更新项目中所有 md 文件的引用。

## 项目约定

- **附件目录**：`assets/`（项目根目录，Obsidian 默认粘贴位置）
- **引用格式**：Obsidian wikilink `![[filename.png]]`（部分文件可能使用标准 Markdown `![](assets/filename.png)`）
- **命名规范**：`lowercase-hyphen-separated.ext`（英文、kebab-case、简洁描述性，3-6 个单词）

> 注意：项目同时存在 `content/assets/`（手动整理的语义化图片），不要混淆两个目录。

---

## 工作流

### 第 1 步：确定处理范围

根据用户的描述确定范围，若不明确则提供以下选项：

- **A. 单文件**：处理用户指定的某一个 md 文件（推荐用于首次尝试）
- **B. 按目录**：处理某个子目录下所有文件（如仅 `content/blog/`）
- **C. 全局**：处理 `content/` 下所有包含非语义附件引用的文件（变更范围大，建议先确认）

**非语义文件名判断标准**（满足任一条即需要重命名）：

- 包含 `Pasted image` 前缀
- 文件名为纯时间戳（如 `20260113151316.png`）
- 文件名为随机字符串（如 `img_a3f9b2.png`）

已有语义化名称的文件（如 `agent-workflow-diagram.png`）跳过，不处理。

---

### 第 2 步：安全提示

在执行任何修改前，提醒用户：

```
⚠️ 此操作将重命名文件并批量修改 md 引用，建议先执行：
git commit -m "chore: snapshot before renaming attachments"
以便出现问题时可以回滚。
```

如果用户已知晓风险或明确说不需要，跳过此步直接继续。

---

### 第 3 步：提取附件列表

扫描目标 md 文件，提取所有附件引用：

```
# Obsidian wikilink 格式
![[Pasted image 20260113151316.png]]

# 标准 Markdown 格式
![](assets/Pasted image 20260113151316.png)
```

对每个引用，确认文件是否实际存在于 `assets/` 目录中：

- **存在**：加入待处理列表
- **不存在**：可能是只存在于本地 Obsidian vault 但尚未提交到 git——记录警告，跳过处理，提醒用户先确认文件已同步

---

### 第 4 步：AI 分析图片内容，生成语义名

对每张待处理图片，使用 Read 工具读取图片（Claude 支持直接读取 PNG/JPG 等图片文件），分析视觉内容，生成符合以下规范的文件名：

**命名规范**：

- 语言：英文
- 格式：kebab-case（全小写 + 连字符）
- 长度：3-6 个单词
- 内容：描述图片的核心主题，而非泛泛而谈
- 保留原始文件扩展名

**命名示例**：

| 原始名称                          | 图片内容                   | 建议名称                            |
| --------------------------------- | -------------------------- | ----------------------------------- |
| `Pasted image 20260113151316.png` | Agent 工作流架构图         | `agent-workflow-architecture.png`   |
| `Pasted image 20260211172829.png` | Codex 初始 prompt 结构截图 | `codex-initial-prompt-snapshot.png` |
| `Pasted image 20260126161002.png` | 数据折线图                 | `monthly-data-trend-chart.png`      |

**冲突处理**：若生成的名称与现有文件名重复，追加数字后缀，如 `agent-workflow-2.png`。

---

### 第 5 步：展示重命名计划，等待用户确认

以表格形式呈现拟执行的变更：

```
以下 N 张图片将被重命名：

| 原文件名 | 新文件名 | 引用位置 |
|---------|---------|---------|
| Pasted image 20260113151316.png | agent-workflow-architecture.png | content/blog/foo.md (第 28 行) |
| Pasted image 20260211172829.png | codex-initial-prompt-snapshot.png | content/clippings/bar.md (第 174 行) |

以下文件因未找到物理文件而跳过：
- Pasted image 20260323173659.png（引用于 content/blog/baz.md，但 assets/ 中不存在）

确认执行？
```

---

### 第 6 步：执行重命名

用户确认后：

1. **重命名文件**：

   ```bash
   mv "assets/Pasted image 20260113151316.png" "assets/agent-workflow-architecture.png"
   ```

2. **全局更新引用**：在 `content/` 目录下的所有 `.md` 文件中替换旧文件名为新文件名
   - Wikilink：`![[旧名称]]` → `![[新名称]]`
   - 标准 Markdown：`![](assets/旧名称)` → `![](assets/新名称)`

3. **输出变更报告**：
   ```
   ✅ 重命名完成
   - 处理图片：N 张
   - 更新引用：M 处（涉及 K 个 md 文件）
   - 跳过（已有语义名）：P 张
   - 跳过（文件不存在）：Q 张
   ```

---

## 注意事项

- **只操作 `assets/` 目录**（根目录），不处理 `content/assets/` 或 `quartz/` 目录
- 项目使用 git，操作前建议先提交快照
- 某些 `Pasted image` 可能只在本地 Obsidian vault 中存在，尚未同步到 git —— 这类文件无法处理，会在报告中列出
