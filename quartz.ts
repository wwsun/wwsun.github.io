import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { ConditionalRender, RecentPosts, RecentTags } from "./quartz/components"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes"

const config = await loadQuartzConfig()
const baseLayout = await loadQuartzLayout()

const homeAfterBody = [
  ConditionalRender({
    component: RecentPosts({
      title: "最新动态",
      limit: 8,
      filter: (f) =>
        !f.slug?.endsWith("index") && !f.frontmatter?.noindex && !f.slug?.startsWith("templates/"),
    }),
    condition: (page) => page.fileData.slug === "index",
  }),
  ConditionalRender({
    component: RecentTags({ title: "探索标签", limit: 25 }),
    condition: (page) => page.fileData.slug === "index",
  }),
]

export const layout = await loadQuartzLayout({
  defaults: {
    afterBody: [...(baseLayout.defaults.afterBody ?? []), ...homeAfterBody],
  },
  byPageType: {
    content: {
      afterBody: [...(baseLayout.byPageType.content?.afterBody ?? []), ...homeAfterBody],
    },
  },
})

// Replace PageTypeDispatcher in config.plugins.emitters with customized layout
const dispatcherIdx = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
if (dispatcherIdx !== -1) {
  config.plugins.emitters[dispatcherIdx] = PageTypeDispatcher({
    defaults: layout.defaults,
    byPageType: layout.byPageType,
  })
}

export default config
