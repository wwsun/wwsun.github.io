import { ValidLocale } from "../i18n"
import { QuartzPluginData } from "../plugins/vfile"

interface Props {
  date: Date
  locale?: ValidLocale
}

export type ValidDateType = keyof Required<QuartzPluginData>["dates"]

const isoDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/

function parseFrontmatterDate(raw: unknown): Date | undefined {
  if (!raw) return undefined
  if (raw instanceof globalThis.Date) {
    return isNaN(raw.getTime()) ? undefined : raw
  }
  if (typeof raw === "string" || typeof raw === "number") {
    const str =
      typeof raw === "string" && isoDateOnlyRegex.test(raw.trim()) ? `${raw.trim()}T00:00:00` : raw
    const dt = new globalThis.Date(str)
    if (!isNaN(dt.getTime()) && dt.getTime() > 0) {
      return dt
    }
  }
  return undefined
}

export function getDate(data: QuartzPluginData): Date | undefined {
  const fm = data.frontmatter as Record<string, unknown> | undefined
  const explicitDate =
    parseFrontmatterDate(fm?.date) ??
    parseFrontmatterDate(fm?.published) ??
    parseFrontmatterDate(fm?.created)
  if (explicitDate) {
    return explicitDate
  }
  if (!data.defaultDateType) {
    throw new Error(
      `Field 'defaultDateType' was not set. Ensure the CreatedModifiedDate plugin is configured with a 'defaultDateType' option. See https://quartz.jzhao.xyz/plugins/CreatedModifiedDate for more details.`,
    )
  }
  return data.dates?.[data.defaultDateType]
}

export function formatDate(d: Date, _locale: ValidLocale = "en-US"): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function Date({ date, locale }: Props) {
  return <time datetime={date.toISOString()}>{formatDate(date, locale)}</time>
}
