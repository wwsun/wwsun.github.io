import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { PageList } from "./PageList"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"

interface Options {
  title?: string
  limit: number
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 10,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const RecentPosts: QuartzComponent = (props: QuartzComponentProps) => {
    const { allFiles, cfg } = props
    const opts = { ...defaultOptions(cfg), ...userOpts }
    
    // Filter and sort
    const pages = allFiles.filter(opts.filter).sort(opts.sort)
    
    // Create a new props object with the filtered files to pass to PageList
    // PageList expects 'allFiles' to be the list it renders (or we can handle slicing here)
    const filteredProps = {
      ...props,
      allFiles: pages,
      limit: opts.limit
    }

    return (
      <div class="recent-posts">
        {opts.title && <h2>{opts.title}</h2>}
        <PageList {...filteredProps} />
      </div>
    )
  }

  return RecentPosts
}) satisfies QuartzComponentConstructor
