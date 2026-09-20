import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // If both are folders or both are files, sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

interface CategoryBadge {
  type: string
  label: string
}

function getCategoryBadge(slug?: string): CategoryBadge | null {
  if (!slug) return null
  const segment = slug.split("/")[0]
  switch (segment) {
    case "blog":
      return { type: "blog", label: "原创" }
    case "clippings":
      return { type: "clippings", label: "剪报" }
    case "notes":
      return { type: "notes", label: "笔记" }
    case "wiki":
      return { type: "wiki", label: "Wiki" }
    case "prompts":
      return { type: "prompts", label: "Prompt" }
    case "books":
      return { type: "books", label: "读书" }
    case "financial":
      return { type: "financial", label: "投资" }
    case "speech":
      return { type: "speech", label: "演讲" }
    default:
      return null
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const description = page.frontmatter?.description ?? page.description
        const tags = page.frontmatter?.tags ?? []
        const badge = getCategoryBadge(page.slug)

        return (
          <li class="section-li">
            <div class="section">
              <p class="meta">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="desc">
                <h3>
                  {badge && <span class={`category-badge badge-${badge.type}`}>{badge.label}</span>}
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                    {title}
                  </a>
                </h3>
                {description && <p class="description">{description}</p>}
              </div>
              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.section h3 .category-badge {
  font-family: var(--codeFont);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.category-badge.badge-blog {
  color: #0055ff;
  background-color: rgba(0, 85, 255, 0.1);
  border-color: rgba(0, 85, 255, 0.25);
}

.category-badge.badge-clippings {
  color: #6f42c1;
  background-color: rgba(111, 66, 193, 0.1);
  border-color: rgba(111, 66, 193, 0.25);
}

.category-badge.badge-notes {
  color: #b45309;
  background-color: rgba(180, 83, 9, 0.1);
  border-color: rgba(180, 83, 9, 0.25);
}

.category-badge.badge-wiki {
  color: #0f766e;
  background-color: rgba(15, 118, 110, 0.1);
  border-color: rgba(15, 118, 110, 0.25);
}

.category-badge.badge-prompts {
  color: #be123c;
  background-color: rgba(190, 18, 60, 0.1);
  border-color: rgba(190, 18, 60, 0.25);
}

.category-badge.badge-books {
  color: #4338ca;
  background-color: rgba(67, 56, 202, 0.1);
  border-color: rgba(67, 56, 202, 0.25);
}

.category-badge.badge-financial {
  color: #047857;
  background-color: rgba(4, 120, 87, 0.1);
  border-color: rgba(4, 120, 87, 0.25);
}

.category-badge.badge-speech {
  color: #c2410c;
  background-color: rgba(194, 65, 12, 0.1);
  border-color: rgba(194, 65, 12, 0.25);
}

:root[saved-theme="dark"] .category-badge.badge-blog {
  color: #80bfff;
  background-color: rgba(77, 166, 255, 0.15);
  border-color: rgba(77, 166, 255, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-clippings {
  color: #d2a8ff;
  background-color: rgba(163, 113, 247, 0.15);
  border-color: rgba(163, 113, 247, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-notes {
  color: #fcd34d;
  background-color: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-wiki {
  color: #5eead4;
  background-color: rgba(45, 212, 191, 0.15);
  border-color: rgba(45, 212, 191, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-prompts {
  color: #fda4af;
  background-color: rgba(251, 113, 133, 0.15);
  border-color: rgba(251, 113, 133, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-books {
  color: #a5b4fc;
  background-color: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-financial {
  color: #6ee7b7;
  background-color: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

:root[saved-theme="dark"] .category-badge.badge-speech {
  color: #fdba74;
  background-color: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.3);
}

.section .description {
  margin: 0.25rem 0 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--darkgray);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section > .tags {
  margin: 0;
}
`
