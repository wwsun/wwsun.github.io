# Gemini CLI Project Context: wwsun's Digital Garden

> [!important]
> Please refer to **[[AGENTS.md]]** for core repository guidelines, project structure, content standards, and authoring conventions.

## Gemini CLI Specifics

### Skill Activation
This project provides several custom skills in `.agents/skills/`. Use the `activate_skill` tool to load their instructions before performing relevant tasks.

- **`clipping-post-optimizer`**: Optimizes translated web clippings in `content/clippings/`.
- **`obsidian-markdown`**: Handles Obsidian-specific Markdown syntax (wikilinks, callouts).
- **`obsidian-bases`**: Manages `.base` files (Obsidian view configurations).
- **`json-canvas`**: Manages `.canvas` files (Obsidian visual maps).

### Workflow Guidelines
- **Research Phase**: Use `grep_search` to ensure notes don't already exist and to find related content for cross-linking.
- **Implementation Phase**: 
  - For content updates, use `replace` for targeted edits (e.g., updating frontmatter).
  - For new notes, use `write_file`.
- **Validation Phase**: 
  - Always run `npm run check` or `npx quartz build` to ensure no broken links or build errors were introduced.
  - Run `npm run format` to maintain consistency.

### Tool Preferences
- **`save_memory`**: Use only for global user preferences, NOT for project-specific facts.
- **`ask_user`**: Use only for critical ambiguity or high-level decisions.
- **`run_shell_command`**: Explain commands that modify the file system (e.g., `git` operations, if requested).
