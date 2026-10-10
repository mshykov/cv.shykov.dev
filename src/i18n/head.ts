// The <head> tags that differ per page and per language, as strings. Used by the
// prerender script; kept in TypeScript so seo.test.ts can check them.
import type { Article } from '../content/types.ts'
import { LOCALES, absolute, guidePath, homePath, localeInfo, type Locale } from './locales.ts'
import { ogImage, type Alternate } from './seo.ts'
import type { Messages } from './messages/en.ts'

export const escapeAttr = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** JSON for a <script type="application/ld+json">: "<" escaped so nothing can close the tag. */
export const ldScript = (data: unknown): string =>
  `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`

type AnyAlternate = Alternate | { locale: 'x-default'; hreflang: 'x-default'; url: string }

const hreflangLinks = (alts: AnyAlternate[]): string[] =>
  alts.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.url}" />`)

const ogLocales = (locale: Locale): string[] => [
  `<meta property="og:locale" content="${localeInfo(locale).ogLocale}" />`,
  ...LOCALES.filter((l) => l.code !== locale).map((l) => `<meta property="og:locale:alternate" content="${l.ogLocale}" />`),
]

interface HeadInput {
  locale: Locale
  m: Messages
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  twitterDescription: string
  path: string
  type: 'website' | 'article'
  alternates: AnyAlternate[]
  jsonLd: unknown
  extra?: string[]
}

function head(i: HeadInput): string {
  const url = absolute(i.path)
  const image = ogImage(i.locale)
  const lines = [
    `<title>${escapeAttr(i.title)}</title>`,
    `<meta name="description" content="${escapeAttr(i.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...hreflangLinks(i.alternates),
    `<meta property="og:type" content="${i.type}" />`,
    ...(i.extra ?? []),
    `<meta property="og:title" content="${escapeAttr(i.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(i.ogDescription)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeAttr(i.m.meta.ogImageAlt)}" />`,
    `<meta property="og:site_name" content="${escapeAttr(i.m.brand)}" />`,
    ...ogLocales(i.locale),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeAttr(i.ogTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(i.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(i.m.meta.ogImageAlt)}" />`,
    ldScript(i.jsonLd),
  ]
  return lines.map((l) => `    ${l}`).join('\n')
}

export function homeHead(locale: Locale, m: Messages, alternates: AnyAlternate[], jsonLd: unknown): string {
  return head({
    locale, m, alternates, jsonLd,
    title: m.meta.title,
    description: m.meta.description,
    ogTitle: m.meta.ogTitle,
    ogDescription: m.meta.ogDescription,
    twitterDescription: m.meta.twitterDescription,
    path: homePath(locale),
    type: 'website',
  })
}

export function guideHead(locale: Locale, m: Messages, article: Omit<Article, 'body'>, alternates: AnyAlternate[], jsonLd: unknown): string {
  const title = `${article.title} | ${m.brand}`
  return head({
    locale, m, alternates, jsonLd,
    title,
    description: article.description,
    ogTitle: article.title,
    ogDescription: article.description,
    twitterDescription: article.description,
    path: guidePath(locale, article.slug),
    type: 'article',
    extra: [
      `<meta property="article:published_time" content="${article.published}" />`,
      `<meta property="article:modified_time" content="${article.updated}" />`,
    ],
  })
}
