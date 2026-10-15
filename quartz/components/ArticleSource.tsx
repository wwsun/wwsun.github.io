import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

function normalizeSources(raw: unknown): string[] {
  if (!raw) return []
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    return trimmed ? [trimmed] : []
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
  }
  return []
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function formatSourceLabel(src: string): string {
  try {
    const url = new URL(src)
    const host = url.hostname.replace(/^www\./i, "")
    const path = url.pathname.replace(/\/$/, "")
    // 路径简短时展示 host + path，否则只展示 host 以保持紧凑
    if (path && path.length <= 24) {
      return `${host}${path}`
    }
    return host
  } catch {
    return src
  }
}

export default (() => {
  const ArticleSource: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (slug === "index" || slug.endsWith("/index")) {
      return null
    }

    const fm = fileData.frontmatter as Record<string, unknown> | undefined
    const sources = normalizeSources(fm?.source)
    if (sources.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "article-source")}>
        <span class="article-source-label">来源：</span>
        <span class="article-source-items">
          {sources.map((src, idx) => (
            <span key={idx} class="article-source-item">
              {isHttpUrl(src) ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="external article-source-link"
                  title={src}
                >
                  <span class="article-source-name">{formatSourceLabel(src)}</span>
                  <span class="article-source-icon" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ) : (
                <span class="article-source-text">{src}</span>
              )}
              {idx < sources.length - 1 && <span class="article-source-sep">, </span>}
            </span>
          ))}
        </span>
      </div>
    )
  }

  return ArticleSource
}) satisfies QuartzComponentConstructor
