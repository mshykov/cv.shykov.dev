// Build-time prerender entry. NOT shipped to the browser and never imported by
// main.tsx — `scripts/prerender.mjs` compiles this on its own and throws the
// bundle away.
//
// Why this exists: the app used to ship `<div id="root"></div>` and nothing
// else. Google renders JavaScript eventually, but the AI crawlers (GPTBot,
// ClaudeBot, PerplexityBot, CCBot) do not run JS at all — they read the HTML
// they are served. They were seeing an empty page.
//
// This file is a build entry, never hot-reloaded, so the fast-refresh rule about
// mixing component and data exports does not apply to it.
/* eslint-disable react-refresh/only-export-components */
//
// Deliberately imports App and nothing else: `main.tsx` pulls in `index.css`
// and the pdf.js polyfills, which touch browser globals that do not exist here.
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import { ArticlePage } from './content/ArticlePage.tsx'
import type { Article } from './content/types.ts'
import { ARTICLES, BUNDLES } from './i18n/all.ts'
import { GUIDE_IDS } from './content/types.ts'
import { LOCALES, guidePath, homePath, type Locale } from './i18n/locales.ts'
import { alternates, guideJsonLd, guidePaths, homeJsonLd, homePaths, ogImage } from './i18n/seo.ts'
import type { LanguageLink } from './components/LanguageSwitcher.tsx'
import { escapeAttr, guideHead, homeHead } from './i18n/head.ts'

export { LOCALES, homePath, guidePath, alternates, ogImage, escapeAttr, guideHead, homeHead }

/** Everything the prerender script needs, per locale, without any JSX. */
export function localeIndex() {
  const guidesByLocale = Object.fromEntries(LOCALES.map((l) => [l.code, BUNDLES[l.code].guides])) as Record<Locale, (typeof BUNDLES)[Locale]['guides']>
  return LOCALES.map((l) => {
    const bundle = BUNDLES[l.code]
    const articles = ARTICLES[l.code]
    // The homepage lists this locale's guides; the build writes pages for its
    // articles. A guide listed without an article would be a homepage link to a 404.
    const missing = bundle.guides.filter((g) => !articles.some((a) => a.id === g.id))
    if (missing.length) throw new Error(`localeIndex(${l.code}): no article body for ${missing.map((g) => g.id).join(', ')}`)
    const unknown = articles.filter((a) => !GUIDE_IDS.includes(a.id))
    if (unknown.length) throw new Error(`localeIndex(${l.code}): unknown guide ids ${unknown.map((a) => a.id).join(', ')}`)
    return {
      locale: l.code,
      info: l,
      messages: bundle.messages,
      homeAlternates: alternates(homePaths()),
      homeJsonLd: homeJsonLd(l.code, bundle.messages),
      articles: articles.map(({ id, slug, title, description, published, updated, summary, faq }: Article) => {
        const meta = { id, slug, title, description, published, updated, summary, faq }
        return {
          ...meta,
          alternates: alternates(guidePaths(guidesByLocale, id)),
          jsonLd: guideJsonLd(l.code, bundle.messages, meta),
        }
      }),
    }
  })
}

const homeLinks = (): LanguageLink[] => LOCALES.map((l) => ({ locale: l.code, href: homePath(l.code) }))

export function render(locale: Locale): string {
  return renderToString(<App bundle={BUNDLES[locale]} />)
}

export function renderArticle(locale: Locale, id: Article['id']): string {
  const article = ARTICLES[locale].find((a) => a.id === id)
  if (!article) throw new Error(`renderArticle: no article "${id}" in ${locale}`)
  const guidesByLocale = Object.fromEntries(LOCALES.map((l) => [l.code, BUNDLES[l.code].guides])) as Record<Locale, Article[]>
  // Switcher links go to the same guide in each language, falling back to that
  // language's homepage if it has no version of this guide.
  const links: LanguageLink[] = LOCALES.map((l) => {
    const target = guidesByLocale[l.code].find((g) => g.id === id)
    return { locale: l.code, href: target ? guidePath(l.code, target.slug) : homePath(l.code) }
  })
  return renderToString(<ArticlePage article={article} bundle={BUNDLES[locale]} links={links} />)
}

export { homeLinks }
