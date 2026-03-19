---
name: content-metadata-curator
description: 自动化管理 Markdown 文件的 Frontmatter 元数据，包括标题提取、日期同步、摘要生成和标签优化。
---

# content-metadata-curator

该技能用于优化和标准化 Quartz 数字花园中的 Frontmatter 元数据。它确保每篇笔记都具有一致的结构，便于 Quartz 构建索引、生成列表和 SEO 优化。

## 核心任务

### 1. 结构化校准 (Structural Calibration)

- **缺失补全**：检查并补足必要的 Frontmatter 字段（`title`, `tags`, `description`）。
- **标题提取**：若 Frontmatter 缺失 `title`，从正文的第一个 `# H1` 标题中提取；若无 H1，则使用文件名。

### 2. 智能摘要生成 (Smart Summary)

- **Description 提取**：若 `description` 缺失或过短，自动抓取正文前 150 个字符（排除 Markdown 语法和 HTML 标签）作为 SEO 摘要。
- **清理干扰**：确保摘要中不包含图片引用、脚注链接或复杂的 LaTeX 公式。

### 3. 标签与分类优化 (Tag & Category Optimization)

- **标签格式化**：确保标签为小写横杠格式（kebab-case），例如 `AI Agent` 转换为 `ai-agent`。
- **现有标签匹配**：优先匹配 `wiki/` 或 `tags/` 中已有的现有标签，减少标签碎片化。

### 4. 状态管理 (Status Tracking)

- **草稿标记**：根据内容完整度自动设置 `draft: true` 或 `false`。
- **永久链接 (Permalink)**：根据标题生成美观的英文 URL Slug（可选）。

## 工作流指令

### 场景A: 处理未提交笔记 (默认模式)

当用户未指定文件路径时，自动检测并处理当前工作区中所有未提交的 Markdown 笔记。

1. **检测未提交文件**：运行 `git status --porcelain` 获取所有已修改（`M`）或未跟踪（`??`）的文件列表。
2. **过滤目标文件**：从列表中筛选出路径以 `content/` 开头、扩展名为 `.md` 的文件，排除 `content/assets/` 下的文件。
3. **逐文件处理**：对每个目标文件依次执行以下操作：
   a. 读取文件内容，解析现有 Frontmatter。
   b. 检查并补全 `title`：优先从 Frontmatter 读取，其次提取正文第一个 `# H1`，最后使用文件名。
   c. 检查并生成 `description`：若缺失或少于 50 个字符，从正文首段提取前 150 个字符（去除 Markdown 语法）。
   d. 检查并格式化 `tags`：将标签转换为 kebab-case，优先匹配 `wiki/` 或 `tags/` 中已有的标签。
   e. 检查 `date` 字段：若缺失，填入文件的 git 首次提交时间，若无 git 记录则使用当前日期（格式 `YYYY-MM-DD HH:mm:ss`）。
   f. 检查 `draft` 字段：若缺失，根据内容完整度推断（字数少于 200 字或无 H1 标题则设为 `true`）。
4. **仅更新 Frontmatter**：使用 `edit` 工具替换 `---` 区域，严禁修改正文内容。
5. **汇总报告**：处理完成后，输出一个简洁的处理摘要，列出每个文件的改动项（新增/更新了哪些字段）。若无文件需要处理，提示"未发现未提交的 Markdown 文件"。

### 场景 B：处理单篇新笔记

1. 读取文件内容。
2. 提取 H1 标题或文件名作为 `title`。
3. 提取正文首段作为 `description`。
4. 格式化并清理 `tags`。
5. 使用 `replace` 写入或更新 Frontmatter。

### 场景 C：批量审计与更新

1. 使用 `grep_search` 查找缺失 `description` 或 `tags` 的笔记。
2. 循环处理文件，保持原有的 Frontmatter 字段顺序，仅更新缺失或过时的项。

## 约束

- **严禁破坏正文**：仅修改 `---` 包围的 Frontmatter 区域。
- **Quartz 兼容性**：字段命名必须符合 `quartz.config.ts` 中的配置。
- **保守策略**：如果用户手动设置了 `description` 且长度合理，不要覆盖。
