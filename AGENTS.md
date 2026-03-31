# Repository Guidelines for AI Agents

This repository is **Weiwei Sun's Weblog**, built with **Quartz v4** and integrated with **Obsidian**. It is a content-focused repository where notes, thoughts, and research are interconnected.

## Role & Mission

As an AI agent (Gemini CLI, Claude Code, etc.), your mission is to help expand and maintain this weblog. You should focus on:

- Creating high-quality, structured Markdown content.
- Ensuring strong interconnectivity between notes using Wiki-links.
- Maintaining the aesthetic and technical integrity of the weblog.

## Architecture & Structure

- **`content/`**: The heart of the weblog. Organized by category.
  - `blog/`: Original long-form formal articles.
  - `notes/`: Permanent notes, short thinkings, check list, configurations.
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

### Optimization Skills

- **`content-metadata-curator`**: Automate frontmatter management (titles, dates, summaries).
- **`clipping-post-optimizer`**: Clean titles, align footnotes, and sync hyperlinks for clippings.
- **`obsidian-markdown`**: Handle Obsidian-specific syntax (wikilinks, callouts).
- **`obsidian-bases` / `json-canvas`**: Manage specialized Obsidian view and map files.
- **`write-blog`**: Draft and create original blog posts in `content/blog/` following project conventions.

### Maintenance

- Run `npm run format` after significant changes to maintain style.
- Run `npm run check` to verify links, types, and build integrity.

## Prohibitions

- **Do Not** modify the `quartz/` engine or core logic unless specifically instructed.
- **Do Not** create files in the `public/` or `dist/` folders.
- **Do Not** use complex HTML if Markdown is sufficient.

## Development Commands

- `npx quartz build --serve` — Preview changes locally.
- `npx quartz sync` — Sync and deploy content.
- `npm run format` — Apply Prettier formatting.
- `npm run check` — Run validations.
