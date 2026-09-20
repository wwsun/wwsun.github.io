import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical, PageList } from "./PageList"

interface Options {
  title?: string
  limit: number
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions: Options = {
  limit: 10,
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
    }

    return (
      <div class="recent-posts">
        {opts.title && <h2>{opts.title}</h2>}
        <PageList {...filteredProps} />
      </div>
    )
  }

  RecentPosts.css = `
.recent-posts {
  margin-top: 2rem;
}
.recent-posts h2 {
  margin: 0;
  margin-bottom: 1rem;
}
`

  return RecentPosts
}) satisfies QuartzComponentConstructor<Partial<Options>>
