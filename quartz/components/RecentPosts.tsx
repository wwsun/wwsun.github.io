import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical, PageList } from "./PageList"

interface Options {
  title?: string
  limit: number
  showCategory?: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions: Options = {
  limit: 25,
  showCategory: true,
  filter: () => true,
  sort: byDateAndAlphabetical(),
}

export default ((userOpts?: Partial<Options>) => {
  const RecentPosts: QuartzComponent = (props: QuartzComponentProps) => {
    const { allFiles } = props
    const opts = { ...defaultOptions, ...userOpts }

    // Filter and sort
    const pages = allFiles.filter(opts.filter).sort(opts.sort)

    const filteredProps = {
      ...props,
      allFiles: pages,
      limit: opts.limit,
      showCategory: opts.showCategory,
    }

    return (
      <section class="recent-posts">
        {opts.title && (
          <>
            <div class="feed-page-header">
              <h1 class="feed-page-title">{opts.title}</h1>
            </div>
            <hr class="feed-page-divider" />
          </>
        )}
        <PageList {...filteredProps} />
      </section>
    )
  }

  RecentPosts.css = `
.recent-posts {
  margin: 0;
}
`

  return RecentPosts
}) satisfies QuartzComponentConstructor<Partial<Options>>
