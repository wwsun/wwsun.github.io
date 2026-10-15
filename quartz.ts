import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import {
  ArticleSource,
  ConditionalRender,
  FolderContent,
  RecentPosts,
  TopNav,
} from "./quartz/components"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes"

const config = await loadQuartzConfig()
const baseLayout = await loadQuartzLayout()

const topNav = TopNav()
const articleSource = ArticleSource()
const sharedHeader = [topNav, ...(baseLayout.defaults.header ?? [])]

const homeAfterBody = [
  ConditionalRender({
    component: RecentPosts({
      title: "首页",
      limit: 30,
      showCategory: true,
      filter: (f) =>
        f.slug !== "index" &&
        f.slug !== "about" &&
        !f.slug?.endsWith("/index") &&
        !f.frontmatter?.noindex &&
        !f.slug?.startsWith("templates/"),
    }),
    condition: (page) => page.fileData.slug === "index",
  }),
]

export const layout = await loadQuartzLayout({
  defaults: {
    header: sharedHeader,
    beforeBody: [...(baseLayout.defaults.beforeBody ?? []), articleSource],
    afterBody: [...(baseLayout.defaults.afterBody ?? []), ...homeAfterBody],
  },
  byPageType: {
    content: {
      header: sharedHeader,
      beforeBody: [...(baseLayout.byPageType.content?.beforeBody ?? []), articleSource],
      afterBody: [...(baseLayout.byPageType.content?.afterBody ?? []), ...homeAfterBody],
    },
    folder: {
      header: sharedHeader,
    },
    tag: {
      header: sharedHeader,
    },
    "404": {
      header: sharedHeader,
    },
    bases: {
      header: sharedHeader,
    },
  },
})

// Replace FolderPage body with custom FolderContent so directory pages share the feed style
const folderPageType = config.plugins.pageTypes?.find(
  (pt) => typeof pt === "object" && pt !== null && "name" in pt && pt.name === "FolderPage",
)
if (folderPageType && "body" in folderPageType) {
  folderPageType.body = FolderContent
}

// Replace PageTypeDispatcher in config.plugins.emitters with customized layout
const dispatcherIdx = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
if (dispatcherIdx !== -1) {
  config.plugins.emitters[dispatcherIdx] = PageTypeDispatcher({
    defaults: layout.defaults,
    byPageType: layout.byPageType,
  })
}

export default config
