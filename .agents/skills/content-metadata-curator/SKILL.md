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

### 场景 A：处理单篇新笔记
1. 读取文件内容。
2. 提取 H1 标题或文件名作为 `title`。
3. 提取正文首段作为 `description`。
4. 格式化并清理 `tags`。
5. 使用 `replace` 写入或更新 Frontmatter。

### 场景 B：批量审计与更新
1. 使用 `grep_search` 查找缺失 `description` 或 `tags` 的笔记。
2. 循环处理文件，保持原有的 Frontmatter 字段顺序，仅更新缺失或过时的项。

## 约束
- **严禁破坏正文**：仅修改 `---` 包围的 Frontmatter 区域。
- **Quartz 兼容性**：字段命名必须符合 `quartz.config.ts` 中的配置。
- **保守策略**：如果用户手动设置了 `description` 且长度合理，不要覆盖。
