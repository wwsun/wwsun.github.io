import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabeticalFolderFirst, PageList, SortFn } from "./PageList"
import { htmlToJsx } from "../util/jsx"
import { FileTrieNode } from "../util/fileTrie"
import { Root } from "hast"

interface FolderOptions {
  showFolderCount?: boolean
  showSubfolders?: boolean
  sort?: SortFn
}

const defaultOptions: FolderOptions = {
  showFolderCount: false,
  showSubfolders: true,
}

function mostRecentDates(entries: QuartzPluginData[]): NonNullable<QuartzPluginData["dates"]> {
  let maybeDates: QuartzPluginData["dates"] | undefined
  for (const entry of entries) {
    if (entry.dates) {
      if (!maybeDates) {
        maybeDates = { ...entry.dates }
      } else {
        if (entry.dates.created > maybeDates.created) maybeDates.created = entry.dates.created
        if (entry.dates.modified > maybeDates.modified) maybeDates.modified = entry.dates.modified
        if (entry.dates.published > maybeDates.published) {
          maybeDates.published = entry.dates.published
        }
      }
    }
  }
  const now = new globalThis.Date()
  return maybeDates ?? { created: now, modified: now, published: now }
}

function collectNodeDates(
  children: Array<FileTrieNode<any>>,
): NonNullable<QuartzPluginData["dates"]> {
  const dataEntries: QuartzPluginData[] = []
  const walk = (nodes: Array<FileTrieNode<any>>) => {
    for (const n of nodes) {
      if (n.data) dataEntries.push(n.data as QuartzPluginData)
      if (n.children?.length) walk(n.children)
    }
  }
  walk(children)
  return mostRecentDates(dataEntries)
}

function pagesFromTrie(folder: FileTrieNode<any>, showSubfolders: boolean): QuartzPluginData[] {
  const results: QuartzPluginData[] = []
  for (const node of folder.children) {
    const nodeData = node.data as QuartzPluginData | null
    if (nodeData) {
      if (nodeData.unlisted === true) continue
      results.push(nodeData)
    } else if (node.isFolder && showSubfolders) {
      results.push({
        slug: node.slug,
        dates: collectNodeDates(node.children),
        defaultDateType: "modified",
        frontmatter: { title: node.displayName, tags: [] },
      } as QuartzPluginData)
    }
  }
  return results
}

function pagesFromAllFiles(
  allFiles: QuartzPluginData[],
  folderSlug: string,
  showSubfolders: boolean,
): QuartzPluginData[] {
  const folderPrefix = folderSlug.endsWith("/index")
    ? folderSlug.slice(0, -"index".length)
    : folderSlug.endsWith("/")
      ? folderSlug
      : `${folderSlug}/`

  const directChildren: QuartzPluginData[] = []
  const subfolderFiles = new Map<string, QuartzPluginData[]>()

  for (const file of allFiles) {
    if (file.unlisted === true) continue
    const fileSlug = file.slug
    if (!fileSlug || !fileSlug.startsWith(folderPrefix)) continue
    const relativePath = fileSlug.slice(folderPrefix.length)
    if (!relativePath || relativePath === "index") continue
    const segments = relativePath.split("/")
    if (segments.length === 1) {
      directChildren.push(file)
    } else if (showSubfolders) {
      const subfolderName = segments[0]
      if (!subfolderFiles.has(subfolderName)) {
        subfolderFiles.set(subfolderName, [])
      }
      subfolderFiles.get(subfolderName)!.push(file)
    }
  }

  for (const [subfolderName, files] of subfolderFiles) {
    const indexFile = files.find((f) => f.slug === `${folderPrefix}${subfolderName}/index`)
    if (indexFile) {
      directChildren.push(indexFile)
      continue
    }
    directChildren.push({
      slug: `${folderPrefix}${subfolderName}/index` as any,
      dates: mostRecentDates(files),
      defaultDateType: "modified",
      frontmatter: { title: subfolderName, tags: [] },
    } as QuartzPluginData)
  }

  return directChildren
}

export default ((userOpts?: FolderOptions) => {
  const options = { ...defaultOptions, ...userOpts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, ctx } = props
    const slug = fileData.slug
    if (!slug) return null

    const trie = ctx?.trie
    let allPagesInFolder: QuartzPluginData[]
    if (trie) {
      const folder = trie.findNode(slug.split("/"))
      allPagesInFolder = folder
        ? pagesFromTrie(folder, options.showSubfolders ?? true)
        : pagesFromAllFiles(allFiles, slug, options.showSubfolders ?? true)
    } else {
      allPagesInFolder = pagesFromAllFiles(allFiles, slug, options.showSubfolders ?? true)
    }

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = ["popover-hint", "folder-intro", ...cssClasses].join(" ")
    const hastRoot = tree as Root
    const hasMarkdownBody = (hastRoot.children?.length ?? 0) > 0
    const content =
      hasMarkdownBody && fileData.filePath ? htmlToJsx(fileData.filePath, hastRoot) : null
    const description =
      typeof fileData.frontmatter?.description === "string"
        ? fileData.frontmatter.description.trim()
        : ""

    const listProps: QuartzComponentProps & { sort?: SortFn } = {
      ...props,
      sort: options.sort ?? byDateAndAlphabeticalFolderFirst(),
      allFiles: allPagesInFolder,
    }

    return (
      <div class="folder-page-container">
        {description && <p class="folder-page-subtitle">{description}</p>}
        {hasMarkdownBody &&
          slug !== "blog/index" &&
          slug !== "clippings/index" &&
          slug !== "notes/index" && <article class={classes}>{content}</article>}
        <hr class="feed-page-divider" />
        <div class="page-listing">
          <PageList {...listProps} />
        </div>
      </div>
    )
  }

  FolderContent.css = PageList.css
  return FolderContent
}) satisfies QuartzComponentConstructor<FolderOptions>
