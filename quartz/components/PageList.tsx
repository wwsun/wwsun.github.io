import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export interface CategoryInfo {
  key: string
  label: string
  slug: FullSlug
}

const CATEGORY_MAP: Record<string, { label: string; slug: FullSlug }> = {
  blog: { label: "博客", slug: "blog/index" as FullSlug },
  clippings: { label: "剪藏", slug: "clippings/index" as FullSlug },
  learning: { label: "学习", slug: "learning/index" as FullSlug },
  notes: { label: "笔记", slug: "notes/index" as FullSlug },
}

export function getPageCategory(slug?: string): CategoryInfo | undefined {
  if (!slug) return undefined
  const segments = slug.split("/").filter(Boolean)
  if (segments.length < 2) return undefined
  const top = segments[0]
  const mapped = CATEGORY_MAP[top]
  if (mapped) {
    return { key: top, ...mapped }
  }
  return {
    key: top,
    label: top,
    slug: `${top}/index` as FullSlug,
  }
}

function cleanSummary(raw?: unknown): string {
  if (typeof raw !== "string") return ""
  return raw
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, alias) => alias || target)
    .replace(/\s+/g, " ")
    .trim()
}

export function byDateAndAlphabetical(): SortFn {
  return (f1, f2) => {
    const d1 = f1.dates ? getDate(f1) : undefined
    const d2 = f2.dates ? getDate(f2) : undefined
    if (d1 && d2) {
      const diff = d2.getTime() - d1.getTime()
      if (diff !== 0) return diff
    } else if (d1 && !d2) {
      return -1
    } else if (!d1 && d2) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    const d1 = f1.dates ? getDate(f1) : undefined
    const d2 = f2.dates ? getDate(f2) : undefined
    if (d1 && d2) {
      const diff = d2.getTime() - d1.getTime()
      if (diff !== 0) return diff
    } else if (d1 && !d2) {
      return -1
    } else if (!d1 && d2) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
  showCategory?: boolean
} & QuartzComponentProps

export const PageList: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
  limit,
  sort,
  showCategory = false,
}: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst()
  let list = [...allFiles].sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  return (
    <div class="post-feed-list">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const category = showCategory ? getPageCategory(page.slug) : undefined
        const description =
          cleanSummary(page.frontmatter?.description) || cleanSummary(page.description)
        const pageDate = page.dates ? getDate(page) : undefined

        return (
          <article class="post-feed-item">
            <h2 class="post-feed-title">
              {showCategory && category && (
                <a
                  href={resolveRelative(fileData.slug!, category.slug)}
                  class="internal post-category-badge"
                  data-category={category.key}
                >
                  {category.label}
                </a>
              )}
              <a
                href={resolveRelative(fileData.slug!, page.slug!)}
                class="internal post-title-link"
              >
                {title}
              </a>
            </h2>
            {description && description !== title && <p class="post-feed-desc">{description}</p>}
            {pageDate && (
              <p class="post-feed-date">
                <Date date={pageDate} locale={cfg.locale} />
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

PageList.css = `
.post-feed-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
}
`
