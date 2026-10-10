// Renders every language of the site to static HTML at build time.
//
// For each locale in src/i18n/locales.ts it writes the homepage (app shell +
// prerendered copy), one page per guide, and a 404 page; then the sitemap with
// hreflang alternates and llms.txt. English stays at the root (/ and /<slug>),
// every other language lives under /<code>/.
//
// Why static HTML: the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) do
// not execute JavaScript, so a crawler that does not run JS still receives the
// headline, the privacy section, the FAQ and the guides in the page's language.
//
// The lazy Analyzer/Builder chunks stay unrendered — renderToString emits their
// Suspense fallback, which is correct: those are interactive tools, not content.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const OUT = new URL('../node_modules/.prerender/', import.meta.url)
const DIST = new URL('../dist/', import.meta.url)
const HTML = new URL('index.html', DIST)
const SITEMAP = new URL('sitemap.xml', DIST)
const SITE = 'https://cv.shykov.dev'

// A separate build, not the app's config: the Cloudflare and Tailwind plugins
// target a browser/worker bundle and have nothing to contribute to a
// throwaway Node render.
await build({
  configFile: false,
  logLevel: 'warn',
  plugins: [react()],
  build: {
    ssr: new URL('../src/entry-server.tsx', import.meta.url).pathname,
    outDir: OUT.pathname,
    emptyOutDir: true,
    ssrEmitAssets: false,
  },
})

const server = await import(pathToFileURL(new URL('entry-server.js', OUT).pathname))
const { render, renderArticle, localeIndex, homePath, guidePath, homeHead, guideHead, escapeAttr } = server
const locales = localeIndex()

const template = readFileSync(HTML, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error(`prerender: could not find ${marker} in dist/index.html`)
const seoBlock = /<!--seo:start-->[\s\S]*?<!--seo:end-->/
if (!seoBlock.test(template)) throw new Error('prerender: dist/index.html lost its <!--seo:start--> … <!--seo:end--> markers')

const write = (relative, contents) => {
  const file = new URL(relative, DIST)
  mkdirSync(dirname(file.pathname), { recursive: true })
  writeFileSync(file, contents)
}

// main.tsx uses createRoot, which discards whatever is in the container and
// renders fresh. That is intentional: hydrateRoot would demand a byte-exact
// match and turn any drift into a runtime error on a page whose whole job is
// to not break. The prerendered markup is a crawler payload and a first paint,
// not a hydration source.
for (const loc of locales) {
  const body = render(loc.locale)
  const page = template
    .replace('<html lang="en">', `<html lang="${loc.info.htmlLang}">`)
    .replace(seoBlock, homeHead(loc.locale, loc.messages, loc.homeAlternates, loc.homeJsonLd).trimStart())
    .replace(marker, `<div id="root">${body}</div>`)
  // English keeps /index.html; Spanish is /es/index.html, served at /es/.
  write(`${homePath(loc.locale).slice(1)}index.html`, page)
  console.log(`prerender: ${loc.locale} homepage, ${body.length} bytes of static HTML`)
}

// Guides reuse the app's stylesheet rather than carrying their own, so the two
// stay visually identical. Vite hashes the filename, so read it back out of the
// page it just built instead of guessing.
const cssHref = template.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1]
  ?? template.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1]
if (!cssHref) throw new Error('prerender: could not find the built stylesheet in dist/index.html')

function guidePage(loc, meta, body) {
  const head = guideHead(loc.locale, loc.messages, meta, meta.alternates, meta.jsonLd)
  // No app script: a guide is prose, and the bundle would only slow it down.
  return `<!doctype html>
<html lang="${loc.info.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${head}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>${body}</body>
</html>
`
}

// A real 404 page with a real 404 status, one per language. The Worker used to
// fall back to "single-page-application", so every mistyped URL answered 200
// with the homepage - a soft 404, which search engines treat as a crawl-budget
// leak and can index as duplicate content. Cloudflare serves the nearest
// 404.html, so /es/nope gets the Spanish one and everything else the English one.
function notFoundPage(loc) {
  const nf = loc.messages.notFound
  return `<!doctype html>
<html lang="${loc.info.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeAttr(nf.title)} | ${escapeAttr(loc.messages.brand)}</title>
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>
    <div class="flex min-h-screen items-center justify-center bg-stone-50 px-5">
      <div class="max-w-md text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">404</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">${escapeAttr(nf.heading)}</h1>
        <p class="mt-4 text-[15px] leading-7 text-stone-600">${escapeAttr(nf.body)}</p>
        <a href="${homePath(loc.locale)}" class="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">${escapeAttr(nf.cta)}</a>
      </div>
    </div>
  </body>
</html>
`
}

let guideCount = 0
for (const loc of locales) {
  const prefix = homePath(loc.locale).slice(1) // "" for English, "es/" for Spanish
  write(`${prefix}404.html`, notFoundPage(loc))
  for (const meta of loc.articles) {
    // "<slug>.html", not "<slug>/index.html". Cloudflare's auto-trailing-slash
    // asset handling serves the former at /<slug> with a 200, while the latter
    // 307-redirects /<slug> to /<slug>/ - which would have made every canonical
    // tag and sitemap entry here point at a URL that redirects.
    write(`${prefix}${meta.slug}.html`, guidePage(loc, meta, renderArticle(loc.locale, meta.id)))
    guideCount += 1
  }
}
console.log(`prerender: wrote ${guideCount} guide pages in ${locales.length} languages`)

// llms.txt carries the same generated guide lists, for the same reason: a guide
// added to articles.tsx and forgotten in a hand-kept list is a page no crawler
// - and no language model - ever hears about.
const LLMS = new URL('llms.txt', DIST)
const llms = readFileSync(LLMS, 'utf8')
for (const token of ['<!--GUIDES-->', '<!--LOCALES-->']) {
  if (!llms.includes(token)) throw new Error(`prerender: llms.txt lost its ${token} marker`)
}
const guideList = (loc) => loc.articles.map((g) => `- [${g.title}](${SITE}${guidePath(loc.locale, g.slug)}): ${g.description}`).join('\n')
const english = locales.find((l) => l.locale === 'en')
const others = locales.filter((l) => l.locale !== 'en')
writeFileSync(
  LLMS,
  llms
    .replace('<!--GUIDES-->', guideList(english))
    .replace('<!--LOCALES-->', others.map((loc) => `### ${loc.info.nativeName} (${loc.info.htmlLang})\n\n- [${loc.messages.meta.title}](${SITE}${homePath(loc.locale)}): ${loc.messages.meta.description}\n${guideList(loc)}`).join('\n\n')),
)

// The sitemap is generated, not hand-maintained: a guide added to articles.tsx
// and forgotten in an XML file is a page search engines never hear about.
// lastmod must move only when that page's content does. Republishing unchanged
// pages with a fresh date (e.g. on every dependency bump) is a signal search
// engines learn to discount — for the whole sitemap, not just the stale entry.
// Guides use their editorial `updated` date, the same one in their Article
// JSON-LD `dateModified`.
// Homepages use the last commit that touched the code they render.
const HOME_PATHS = ['src', 'index.html', ':(exclude,glob)src/**/*.test.ts']

function homeLastmod() {
  // Absolute path, no PATH lookup: a writable directory on the caller's PATH
  // could otherwise shadow `git` and run in the build.
  const git = (...args) => execFileSync('/usr/bin/git', args, { encoding: 'utf8', env: {} }).trim()
  try {
    // In a shallow clone the boundary commit looks like it added every file, so
    // a path-limited log would just return HEAD's date. No lastmod beats a wrong one.
    if (git('rev-parse', '--is-shallow-repository') === 'true') {
      console.log('prerender: shallow clone, omitting homepage lastmod')
      return null
    }
    const day = git('log', '-1', '--format=%cs', '--', ...HOME_PATHS)
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
  } catch {
    console.log('prerender: no git metadata, omitting homepage lastmod')
    return null
  }
}

const homeDate = homeLastmod()
const urls = []
for (const loc of locales) {
  urls.push({ loc: `${SITE}${homePath(loc.locale)}`, lastmod: homeDate, changefreq: 'monthly', priority: loc.locale === 'en' ? '1.0' : '0.9', alternates: loc.homeAlternates })
  for (const g of loc.articles) {
    urls.push({ loc: `${SITE}${guidePath(loc.locale, g.slug)}`, lastmod: g.updated, changefreq: 'yearly', priority: '0.8', alternates: g.alternates })
  }
}

// Each URL lists every language version of itself, itself included, as the
// sitemap flavour of hreflang (Google reads either; the page tags are the
// primary signal and this is the cross-check).
const alternateLinks = (alts) => alts.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.url}" />`).join('')

writeFileSync(
  SITEMAP,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${alternateLinks(u.alternates)}
  </url>`).join('\n')}
</urlset>
`,
)
console.log(`prerender: sitemap lists ${urls.length} urls`)

rmSync(OUT, { recursive: true, force: true })
