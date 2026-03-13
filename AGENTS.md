# Repository Guidelines for AI Agents

This repository is **wwsun's Digital Garden**, built with **Quartz v4** and integrated with **Obsidian**. It is a content-focused repository where notes, thoughts, and research are interconnected.

## Role & Mission

As an AI agent, your mission is to help expand and maintain this digital garden. You should focus on:
- Creating high-quality, structured Markdown content.
- Ensuring strong interconnectivity between notes using Wiki-links.
- Maintaining the aesthetic and technical integrity of the garden.

## Architecture & Structure

- **`content/`**: The heart of the garden. Organized by category.
  - `blogs/`: Original long-form articles.
  - `wiki/`: Permanent notes and structured knowledge.
  - `clippings/`: Optimized web clippings and translations.
  - `books/`: Book notes and summaries.
  - `projects/`: Project-specific research.
  - `assets/`: Media files (images, etc.).
- **`quartz.config.ts`**: Site configuration (Title, Locale, Plugins).
- **`quartz.layout.ts`**: Layout definitions (Header, Footer, Sidebar).
- **`.agents/skills/`**: Custom automation skills for agents.
- **`.obsidian/`**: Local Obsidian configuration.

## Content & Authoring Standards

### 1. Language & Tone
- **Language**: Primary language is **Simplified Chinese (`zh-CN`)**.
- **Tone**: Professional, insightful, and clear. Avoid fluff.

### 2. Markdown Flavor (Obsidian)
- **Internal Links**: Always use `[[Link]]` for internal navigation. Use the shortest path resolution (e.g., `[[My Note]]`).
- **Callouts**: Use Obsidian-style callouts: `> [!note]`, `> [!warning]`, etc.
- **Frontmatter**: Every new note should have standard YAML frontmatter:
  ```yaml
  ---
  title: "Note Title"
  date: 2026-03-13
  tags:
    - category/tag
  ---
  ```

### 3. File Organization
- Use descriptive, URL-friendly filenames (e.g., `my-new-post.md`).
- Keep content paths consistent with existing notes.

## Workflow & Automation

### Optimization
- **Web Clippings**: Use available skills to clean titles, align footnotes, and sync hyperlinks.
- **Specialized Formats**: Use specific skills for `.canvas` (JSON Canvas) and `.base` (Obsidian Bases) files.

### Maintenance
- Run `npm run format` after significant changes.
- Run `npm run check` to verify links and types.

## Prohibitions
- **Do Not** modify the `quartz/` engine or core logic unless specifically instructed.
- **Do Not** create files in the `public/` or `dist/` folders.
- **Do Not** use complex HTML if Markdown is sufficient.

## Development Commands
- `npx quartz build --serve` — Preview changes locally.
- `npx quartz sync` — Sync and deploy content.
- `npm run format` — Apply Prettier formatting.
- `npm run check` — Run validations.
