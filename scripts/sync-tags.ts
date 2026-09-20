import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

const CONTENT_DIR = join(import.meta.dirname, "../content")
const OUTPUT_FILE = join(CONTENT_DIR, "tags.json")

function* walkMarkdown(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      yield* walkMarkdown(full)
    } else if (entry.endsWith(".md")) {
      yield full
    }
  }
}

function extractTags(content: string): string[] {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return []

  const yaml = match[1]

  // 匹配 "tags:\n  - foo\n  - bar" 格式
  const blockMatch = yaml.match(/^tags:\n((?:[ \t]+-[^\n]*\n?)+)/m)
  if (blockMatch) {
    return [...blockMatch[1].matchAll(/^\s+-\s*(.+)$/gm)].map((m) =>
      m[1].trim().replace(/^["']|["']$/g, ""),
    )
  }

  // 匹配 "tags: [foo, bar]" 内联格式
  const inlineMatch = yaml.match(/^tags:\s*\[([^\]]*)\]/m)
  if (inlineMatch) {
    return inlineMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }

  return []
}

const tagSet = new Set<string>()

for (const file of walkMarkdown(CONTENT_DIR)) {
  const content = readFileSync(file, "utf-8")
  for (const tag of extractTags(content)) {
    tagSet.add(tag)
  }
}

const tags = [...tagSet].sort((a, b) => a.localeCompare(b, "zh"))
writeFileSync(OUTPUT_FILE, JSON.stringify(tags, null, 2) + "\n")
console.log(`sync-tags: ${tags.length} tags → content/tags.json`)
