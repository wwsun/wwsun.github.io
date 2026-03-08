# Repository Guidelines for AI Agents

This repository is **wwsun's Digital Garden**, built with Quartz v4 and Obsidian. It is primarily a content repository, not a software library. As an AI agent, your focus should be on content generation, formatting, and organization, rather than modifying the underlying Quartz engine unless explicitly requested.

## Project Structure & Module Organization
- `content/` stores all Markdown notes, posts, and knowledge base files. Subdirectories include `blogs/`, `wiki/`, `clippings/`, `books/`, `projects/`, and `prompts/`.
- `content/assets/` and `assets/` store images and static media referenced by notes.
- `.agents/skills/` contains custom agent skills (e.g., `obsidian-markdown`, `json-canvas`, `obsidian-bases`, `clipping-post-optimizer`).
- `quartz.config.ts` and `quartz.layout.ts` control site behavior, layout, and styling.

## Content & Authoring Conventions
- **Language**: Always use Simplified Chinese (`zh-CN`) unless otherwise specified.
- **Markdown Flavor**: Strictly follow Obsidian-flavored Markdown.
  - Use `[[Internal Links]]` for linking between notes (shortest path resolution is supported).
  - Use Obsidian Callouts (e.g., `> [!note]`, `> [!warning]`).
- **Frontmatter**: Ensure standard YAML frontmatter properties if generating new posts (e.g., `title`, `date`, `tags`).
- **File Naming**: Use descriptive names. Keep content paths consistent with existing notes in `content/`.
- **Formatting**: Maintain clean and readable Markdown. Use `npm run format` to apply Prettier formatting.

## Workflows & Agent Skills
- **Content Optimization**: For web clippings in `content/clippings/`, apply the `clipping-post-optimizer` skill to clean up titles, footnotes, and translations.
- **Obsidian Formats**: When interacting with `.canvas` or `.base` files, utilize the `json-canvas` or `obsidian-bases` skills.
- **Do Not Modify Build Output Manually**: The website is built statically. Do not create or edit files in generated build folders manually.

## Development & Publishing Commands
- `npx quartz build --serve` — Build and run a local preview server.
- `npx quartz sync` — Sync content with GitHub and deploy to GitHub Pages.
- `npm run format` — Apply Prettier formatting across the repository.
- `npm run check` — Run TypeScript checks and Prettier verification (mainly for Quartz config/engine).
