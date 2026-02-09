# Project Context: wwsun's Digital Garden (Quartz v4)

## Overview

This is a personal digital garden and knowledge base for **wwsun**, built using **Quartz v4** and integrated with **Obsidian**. It serves as a centralized hub for notes, blog posts, book summaries, and web clippings, automatically published to [wwsun.github.io](https://wwsun.github.io).

## Architecture & Structure

### Core Technologies

- **Static Site Generator:** Quartz v4 (TypeScript, Preact, Esbuild)
- **Markdown Processing:** Unified (Remark/Rehype) with Obsidian-flavored Markdown support.
- **Local Editor:** Obsidian (configuration stored in `.obsidian/`).
- **Hosting:** GitHub Pages.
- **Intelligence:** Gemini CLI with custom skills (e.g., `clipping-post-optimizer`).

### Key Files

- **`quartz.config.ts`**: Main configuration (Title: "wwsun", Locale: "zh-CN", SPA enabled).
- **`quartz.layout.ts`**: Defines the custom layout, including Recent Posts on the homepage, Explorer, Graph, and Backlinks.
- **`.gemini/skills/`**: Contains project-specific Gemini CLI skills for automation.

### Content Organization (`content/`)

- **`blogs/`**: Original articles and blog posts.
- **`books/`**: Notes and summaries of books read.
- **`clippings/`**: Curated web content and articles (optimized via Gemini skills).
- **`wiki/`**: Structured knowledge base and permanent notes.
- **`projects/`**: open source projects analysis and notes.
- **`prompts/`**: prompts collection.
- **`assets/`**: Images and other media files used within notes.

## Development & Publishing Workflow

### Workflow

1.  **Edit Locally:** Use Obsidian to create and edit Markdown files in the `content/` directory.
2.  **Optimize (Optional):** Use Gemini CLI skills (like `clipping-post-optimizer`) to refine clippings or other content.
3.  **Preview:** Run `npx quartz build --serve` to view changes locally.
4.  **Sync/Deploy:** Run `npx quartz sync` to commit changes, pull from remote, and push to GitHub, triggering the GitHub Actions deployment.

### Useful Commands

- `npx quartz build --serve`: Local development server.
- `npx quartz sync`: Sync content with GitHub and deploy.
- `npm run format`: Format code and Markdown files.
- `npm run check`: Typecheck and lint the project.

## Project-Specific Conventions

- **Markdown Flavor:** Strictly follows Obsidian-flavored Markdown (shortest path link resolution, `[[Internal Links]]`, Callouts).
- **Language:** Primarily Chinese (`zh-CN`).
- **Automation:** Leverages Gemini CLI skills for repetitive content processing tasks.
