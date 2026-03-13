import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, getAllSegmentPrefixes, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit?: number
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: Options = {
  limit: 0, // 0 means no limit
  filter: () => true,
}

export default ((userOpts?: Partial<Options>) => {
  const RecentTags: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    const pages = allFiles.filter(opts.filter)

    const tags = [
      ...new Set(
        pages.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
      ),
    ].sort((a, b) => a.localeCompare(b))

    const displayTags = opts.limit ? tags.slice(0, opts.limit) : tags

    if (displayTags.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "recent-tags")}>
        {opts.title && <h2>{opts.title}</h2>}
        <ul class="tags">
          {displayTags.map((tag) => {
            const linkDest = resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)
            return (
              <li>
                <a href={linkDest} class="internal tag-link">
                  {tag}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  RecentTags.css = `
.recent-tags {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
.recent-tags h2 {
  margin: 0;
  margin-bottom: 1rem;
}
.recent-tags .tags {
  list-style: none;
  display: flex;
  padding-left: 0;
  gap: 0.4rem;
  margin: 0;
  flex-wrap: wrap;
}
.recent-tags .tags > li {
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  overflow-wrap: normal;
}
`
  return RecentTags
}) satisfies QuartzComponentConstructor
