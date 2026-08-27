// Renders the app shell to static HTML at build time and injects it into
// dist/index.html, so a crawler that does not execute JavaScript still receives
// the headline, the privacy section, and the FAQ.
//
// The lazy Analyzer/Builder chunks stay unrendered — renderToString emits their
// Suspense fallback, which is correct: those are interactive tools, not content.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const OUT = new URL('../node_modules/.prerender/', import.meta.url)
const HTML = new URL('../dist/index.html', import.meta.url)
const SITEMAP = new URL('../dist/sitemap.xml', import.meta.url)

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

const { render, articleIndex, renderArticle } = await import(pathToFileURL(new URL('entry-server.js', OUT).pathname))
const body = render()

const html = readFileSync(HTML, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) {
  throw new Error(`prerender: could not find ${marker} in dist/index.html`)
}

// main.tsx uses createRoot, which discards whatever is in the container and
// renders fresh. That is intentional: hydrateRoot would demand a byte-exact
// match and turn any drift into a runtime error on a page whose whole job is
// to not break. The prerendered markup is a crawler payload and a first paint,
// not a hydration source.
writeFileSync(HTML, html.replace(marker, `<div id="root">${body}</div>`))
console.log(`prerender: injected ${body.length} bytes of static HTML`)

const SITE = 'https://cv.shykov.dev'

// Guides reuse the app's stylesheet rather than carrying their own, so the two
// stay visually identical. Vite hashes the filename, so read it back out of the
// page it just built instead of guessing.
const cssHref = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1]
  ?? html.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1]
if (!cssHref) throw new Error('prerender: could not find the built stylesheet in dist/index.html')

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function guidePage(meta, body) {
  const url = `${SITE}/${meta.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    dateModified: meta.updated,
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: 'Maksym Shykov', url: 'https://shykov.dev/' },
    publisher: { '@type': 'Person', name: 'Maksym Shykov', url: 'https://shykov.dev/' },
    isAccessibleForFree: true,
  }
  // No app script: a guide is prose, and the bundle would only slow it down.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeAttr(meta.title)} | ATS Resume Toolkit</title>
    <meta name="description" content="${escapeAttr(meta.description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <meta name="theme-color" content="#4f46e5" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(meta.title)}" />
    <meta property="og:description" content="${escapeAttr(meta.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og-image.png" />
    <meta property="og:site_name" content="ATS Resume Toolkit" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />
    <meta name="twitter:image" content="${SITE}/og-image.png" />
    <link rel="stylesheet" href="${cssHref}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>
  <body>${body}</body>
</html>
`
}

// A real 404 page with a real 404 status. The Worker used to fall back to
// "single-page-application", so every mistyped URL answered 200 with the
// homepage - a soft 404, which search engines treat as a crawl-budget leak and
// can index as duplicate content.
writeFileSync(
  new URL('../dist/404.html', import.meta.url),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page not found | ATS Resume Toolkit</title>
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>
    <div class="flex min-h-screen items-center justify-center bg-stone-50 px-5">
      <div class="max-w-md text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">404</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">This page does not exist</h1>
        <p class="mt-4 text-[15px] leading-7 text-stone-600">The link may be out of date, or the address mistyped.</p>
        <a href="/" class="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Go to the ATS Resume Toolkit</a>
      </div>
    </div>
  </body>
</html>
`,
)

const guides = articleIndex()
for (const meta of guides) {
  // "<slug>.html", not "<slug>/index.html". Cloudflare's auto-trailing-slash
  // asset handling serves the former at /<slug> with a 200, while the latter
  // 307-redirects /<slug> to /<slug>/ - which would have made every canonical
  // tag and sitemap entry here point at a URL that redirects.
  writeFileSync(new URL(`../dist/${meta.slug}.html`, import.meta.url), guidePage(meta, renderArticle(meta.slug)))
}
console.log(`prerender: wrote ${guides.length} guide pages`)

// llms.txt carries the same generated guide list, for the same reason: a guide
// added to articles.tsx and forgotten in a hand-kept list is a page no crawler
// - and no language model - ever hears about.
const LLMS = new URL('../dist/llms.txt', import.meta.url)
const llms = readFileSync(LLMS, 'utf8')
if (!llms.includes('<!--GUIDES-->')) throw new Error('prerender: llms.txt lost its <!--GUIDES--> marker')
writeFileSync(
  LLMS,
  llms.replace(
    '<!--GUIDES-->',
    guides.map((g) => `- [${g.title}](${SITE}/${g.slug}): ${g.description}`).join('\n'),
  ),
)

// The sitemap is generated, not hand-maintained: a guide added to articles.tsx
// and forgotten in an XML file is a page search engines never hear about.
// lastmod comes from the last commit, not from today - republishing an
// unchanged page with a fresh date every deploy is a signal search engines
// learn to discount.
let lastmod = null
try {
  // Absolute path, no PATH lookup: a writable directory on the caller's PATH
  // could otherwise shadow `git` and run in the build.
  const day = execFileSync('/usr/bin/git', ['log', '-1', '--format=%cs'], { encoding: 'utf8', env: {} }).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) lastmod = day
} catch {
  console.log('prerender: no git metadata, falling back to guide dates for lastmod')
}

const urls = [
  { loc: `${SITE}/`, lastmod: lastmod ?? guides[0]?.updated, changefreq: 'monthly', priority: '1.0' },
  ...guides.map((g) => ({
    loc: `${SITE}/${g.slug}`,
    lastmod: lastmod ?? g.updated,
    changefreq: 'yearly',
    priority: '0.8',
  })),
]

writeFileSync(
  SITEMAP,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`,
)
console.log(`prerender: sitemap lists ${urls.length} urls`)

rmSync(OUT, { recursive: true, force: true })
