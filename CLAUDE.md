# Claude Code Project Context: wwsun's Digital Garden

> [!important]
> Please refer to **[[AGENTS.md]]** for core repository guidelines, project structure, content standards, and authoring conventions.

## Claude Code Specifics

### Skill Usage
This project provides several custom skills in `.agents/skills/`. Use the `Skill` tool to load their instructions before performing relevant tasks.

- **`clipping-post-optimizer`**: Optimizes translated web clippings in `content/clippings/`.
- **`obsidian-markdown`**: Handles Obsidian-specific Markdown syntax (wikilinks, callouts).
- **`obsidian-bases`**: Manages `.base` files (Obsidian view configurations).
- **`json-canvas`**: Manages `.canvas` files (Obsidian visual maps).

### Specific Rules
- When processing `.canvas` files, you **MUST** use the `json-canvas` skill.
- When processing `.base` files, you **MUST** use the `obsidian-bases` skill.
- When processing Obsidian Markdown files, you **MUST** use the `obsidian-markdown` skill.
- When optimizing translations in `content/clippings/`, you **MUST** use the `clipping-post-optimizer` skill.

### Maintenance Commands
- Run `npm run format` (calls Prettier) to ensure clean Markdown formatting.
- Run `npm run check` (calls `tsc` and Prettier verification) to ensure technical integrity.
