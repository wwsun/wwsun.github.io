import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"

export interface NavItem {
  label: string
  slug: FullSlug
  matchPrefix: string
}

interface Options {
  links?: NavItem[]
}

const defaultNavItems: NavItem[] = [
  { label: "博客", slug: "blog/index" as FullSlug, matchPrefix: "blog" },
  { label: "剪藏", slug: "clippings/index" as FullSlug, matchPrefix: "clippings" },
  { label: "学习", slug: "learning/index" as FullSlug, matchPrefix: "learning" },
  { label: "笔记", slug: "notes/index" as FullSlug, matchPrefix: "notes" },
  { label: "关于", slug: "about" as FullSlug, matchPrefix: "about" },
]

export default ((userOpts?: Options) => {
  const navItems = userOpts?.links ?? defaultNavItems

  const TopNav: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const title = cfg?.pageTitle ?? "wwsun"
    const currentSlug = (fileData.slug ?? "index") as FullSlug
    const baseDir = pathToRoot(currentSlug)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    return (
      <div class={classNames(displayClass, "top-nav-left")}>
        <a href={baseDir} class="internal site-brand">
          <img src={iconPath} alt="" class="site-logo" width={28} height={28} />
          <span class="site-brand-text">{title}</span>
        </a>
        <nav class="site-nav" aria-label="主导航">
          {navItems.map((item) => {
            const isActive =
              currentSlug === item.slug ||
              currentSlug === item.matchPrefix ||
              currentSlug.startsWith(`${item.matchPrefix}/`)
            return (
              <a
                href={resolveRelative(currentSlug, item.slug)}
                class={classNames("internal", "site-nav-link", isActive ? "active" : undefined)}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      </div>
    )
  }

  return TopNav
}) satisfies QuartzComponentConstructor<Options>
