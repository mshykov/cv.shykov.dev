// Everything the build writes into a page's <head> for search engines and social
// cards: titles, hreflang, structured data. Pure functions over the locale
// registry and the messages, so the prerender script stays a thin writer and the
// rules are unit-tested (seo.test.ts).
import type { Article, Guide, GuideId } from '../content/types.ts'
import { DEFAULT_LOCALE, LOCALES, SITE, absolute, guidePath, homePath, localeInfo, type Locale } from './locales.ts'
import type { Messages } from './messages/en.ts'

export const AUTHOR_ID = 'https://shykov.dev/#person'

export interface Alternate {
  locale: Locale
  /** Value of hreflang. */
  hreflang: string
  /** Absolute URL. */
  url: string
}

/** hreflang cluster for a set of per-locale paths, plus x-default → English. */
export function alternates(paths: Partial<Record<Locale, string>>): (Alternate | { locale: 'x-default'; hreflang: 'x-default'; url: string })[] {
  const rows = LOCALES.filter((l) => paths[l.code]).map((l) => ({ locale: l.code, hreflang: l.htmlLang, url: absolute(paths[l.code] as string) }))
  const english = paths[DEFAULT_LOCALE]
  return english ? [...rows, { locale: 'x-default' as const, hreflang: 'x-default' as const, url: absolute(english) }] : rows
}

export const homePaths = (): Partial<Record<Locale, string>> => Object.fromEntries(LOCALES.map((l) => [l.code, homePath(l.code)]))

/** Social-card image for a locale: English keeps its original file. */
export const ogImage = (locale: Locale): string => absolute(locale === DEFAULT_LOCALE ? '/og-image.png' : `/og/${locale}.png`)

export function homeJsonLd(locale: Locale, m: Messages) {
  const info = localeInfo(locale)
  const url = absolute(homePath(locale))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: m.brand,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url,
        inLanguage: info.htmlLang,
        description: m.meta.appDescription,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: m.meta.featureList,
        isAccessibleForFree: true,
        license: 'https://opensource.org/licenses/MIT',
        sameAs: 'https://github.com/mshykov/cv.shykov.dev',
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': AUTHOR_ID },
      },
      {
        '@type': 'Person',
        '@id': AUTHOR_ID,
        name: 'Maksym Shykov',
        url: 'https://shykov.dev/',
        jobTitle: 'Engineering Manager',
        sameAs: ['https://github.com/mshykov'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: m.brand,
        inLanguage: LOCALES.map((l) => l.htmlLang),
        publisher: { '@id': AUTHOR_ID },
      },
      {
        '@type': 'FAQPage',
        mainEntity: m.meta.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  }
}

export function guideJsonLd(locale: Locale, m: Messages, article: Omit<Article, 'body'>) {
  const info = localeInfo(locale)
  const url = absolute(guidePath(locale, article.slug))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: article.title,
        description: article.description,
        abstract: article.summary,
        datePublished: article.published,
        dateModified: article.updated,
        inLanguage: info.htmlLang,
        image: ogImage(locale),
        mainEntityOfPage: url,
        isPartOf: { '@id': `${SITE}/#website` },
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': AUTHOR_ID },
        isAccessibleForFree: true,
      },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Maksym Shykov', url: 'https://shykov.dev/', sameAs: ['https://github.com/mshykov'] },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: m.brand, item: absolute(homePath(locale)) },
          { '@type': 'ListItem', position: 2, name: m.article.guidesCrumb, item: `${absolute(homePath(locale))}#guides` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: article.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  }
}

/** Per-locale path of a guide, for the hreflang cluster of that guide. */
export function guidePaths(guidesByLocale: Record<Locale, Guide[]>, id: GuideId): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const l of LOCALES) {
    const guide = guidesByLocale[l.code].find((g) => g.id === id)
    if (guide) out[l.code] = guidePath(l.code, guide.slug)
  }
  return out
}
