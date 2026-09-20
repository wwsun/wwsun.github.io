import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { ConditionalRender, RecentPosts, RecentTags } from "./quartz/components"

const config = await loadQuartzConfig()
export default config

const baseLayout = await loadQuartzLayout()

const homeAfterBody = [
  ConditionalRender({
    component: RecentPosts({
      title: "最新动态",
      limit: 8,
      filter: (f) =>
        !f.slug?.endsWith("index") &&
        !f.frontmatter?.noindex &&
        !f.slug?.startsWith("templates/"),
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
