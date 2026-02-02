# Project Context: Quartz v4

## Overview
Quartz is a static site generator (SSG) designed to publish digital gardens and notes as a website. It transforms Markdown content into a fully functional, fast, and customizable website. It is built with Node.js and TypeScript, utilizing the Unified ecosystem (Remark/Rehype) for content processing and Preact for rendering.

## Architecture & Structure

### Key Configuration Files
*   **`quartz.config.ts`**: The main configuration file. It controls site metadata (title, baseUrl), theme (colors, fonts), plugins (transformers, filters, emitters), and other core settings.
*   **`quartz.layout.ts`**: Defines the structure of pages. It exports `sharedPageComponents` (header/footer), `defaultContentPageLayout` (single note), and `defaultListPageLayout` (tags/folders). It allows composing pages using components from `quartz/components`.

### Directory Structure
*   **`content/`**: The directory where user content (Markdown files) resides. This is the "input" for the site.
*   **`quartz/`**: The source code for Quartz itself.
    *   **`components/`**: Preact components used to render the site (e.g., `ArticleTitle.tsx`, `Darkmode.tsx`, `TableOfContents.tsx`).
    *   **`plugins/`**: Logic for transforming content (transformers), filtering content (filters), and generating output files (emitters).
    *   **`styles/`**: Global styles and SCSS files.
    *   **`cli/`**: Implementation of the CLI commands (`build`, `sync`, `update`, etc.).
*   **`docs/`**: Documentation for Quartz itself (likely served as the official docs site).
*   **`public/`**: Output directory for static assets (managed by build process).

## Development Workflow

### Key Commands
*   **Start Local Server:** `npx quartz build --serve`
    *   Builds the site and starts a local server (default port 8080).
    *   Watches for changes in content and code.
*   **Build for Production:** `npx quartz build`
    *   Generates the static site in the output directory (default `public`).
*   **Sync with GitHub:** `npx quartz sync`
    *   Automates the git workflow: commits changes, pulls updates from the remote, and pushes changes.
    *   Useful for backing up the digital garden and deploying.
*   **Update Quartz:** `npx quartz update`
    *   Pulls the latest changes from the upstream Quartz repository and updates dependencies.
*   **Typecheck & Lint:** `npm run check`
    *   Runs TypeScript type checking and Prettier check.
*   **Format Code:** `npm run format`
    *   Formats code using Prettier.

### Technology Stack
*   **Runtime:** Node.js
*   **Language:** TypeScript
*   **Frontend Library:** Preact (rendered to static HTML/components)
*   **Bundler:** Esbuild
*   **Styling:** Sass/SCSS
*   **Markdown Processing:** Unified, Remark, Rehype

## Customization
*   **Content:** Edit files in `content/`.
*   **Styling:** Modify `quartz/styles/custom.scss` or theme colors in `quartz.config.ts`.
*   **Layout:** Edit `quartz.layout.ts` to add/remove/rearrange components.
*   **Components:** Create new components in `quartz/components/` and register them in `quartz.layout.ts`.
