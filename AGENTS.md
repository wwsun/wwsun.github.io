# Repository Guidelines

## Project Structure & Module Organization
- `content/` stores source notes/posts (for example, `content/blogs/`, `content/wiki/`, `content/clippings/`).
- `assets/` stores images and static media referenced by notes.
- `quartz/` contains the Quartz v4 engine code (CLI, components, plugins, processors, utilities).
- `docs/` is the build output target used for local docs preview and GitHub Pages-style deployment.
- Root config files (`quartz.config.ts`, `quartz.layout.ts`, `tsconfig.json`, `.prettierrc`) control site behavior, layout, and TypeScript/format rules.

## Build, Test, and Development Commands
- `npm ci` — install dependencies with a clean lockfile-based install.
- `npx quartz build --serve` — build and run a local preview server.
- `npm run docs` — build and serve with `docs/` as destination.
- `npm run check` — run TypeScript checks and Prettier verification.
- `npm test` — run the TypeScript test suite (`tsx --test`).
- `npm run format` — apply Prettier formatting across the repository.

## Coding Style & Naming Conventions
- Follow `.prettierrc`: 2-space indentation, no semicolons, trailing commas, 100-char line width.
- Use TypeScript strict mode conventions; keep imports and types explicit.
- Prefer descriptive file names and existing patterns (for example, `*.test.ts` for tests and kebab-case content paths).
- Keep content frontmatter and paths consistent with existing notes in `content/`.

## Testing Guidelines
- Test runner: Node + `tsx --test`.
- Place tests near related source files in `quartz/` (examples: `quartz/util/path.test.ts`, `quartz/components/scripts/search.test.ts`).
- Before opening a PR, run at least `npm run check` and `npm test`; for publish-impacting changes, also run `npx quartz build --bundleInfo -d docs`.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, etc.).
- Keep commits focused; avoid mixing content-only backups with code/config changes.
- PRs should include: clear summary, rationale, impacted paths, and screenshots for UI/visual changes.
- Link related issues/tasks and confirm local checks passed.

## Environment & Tooling Notes
- Use Node.js `>=22` and npm `>=10.9.2` (see `package.json` engines).
- Do not edit generated artifacts in `docs/` manually; regenerate via Quartz commands.
