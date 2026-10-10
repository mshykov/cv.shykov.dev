import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOCALES, SITE, guidePath, homePath } from '../src/i18n/locales.ts'
import { GUIDE_IDS } from '../src/content/types.ts'

const root = new URL('..', import.meta.url)
const dist = new URL('dist/', root)
const headersPath = new URL('_headers', dist)
const read = (path) => readFileSync(new URL(path.replace(/^\//, ''), dist), 'utf8')

assert.ok(existsSync(new URL('index.html', dist)), 'dist/index.html should exist after build')
assert.ok(existsSync(headersPath), 'dist/_headers should exist after build')

const headers = readFileSync(headersPath, 'utf8')
assert.match(headers, /Content-Security-Policy:/, '_headers should include the production CSP')
assert.match(headers, /Cache-Control: no-cache/, '_headers should keep HTML revalidated')
assert.match(headers, /Strict-Transport-Security: max-age=\d+/, '_headers should pin HSTS in the repo, not rely on zone-level dashboard state')
assert.match(headers, /object-src 'none'/, "CSP should keep object-src 'none' (blocks same-origin <object>/<embed> smuggling)")

// --- every language: homepage, guides, 404 ---------------------------------
// The prerendered shell is the only thing a non-JS crawler ever sees. AI
// crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) do not execute JavaScript,
// so if this regresses to a bare <div id="root"></div> the site becomes
// invisible to them without any visible breakage for human users. The same goes
// for each language: a locale that ships an empty shell is a locale search
// engines cannot read.
const jsonLd = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const pageFile = (path) => (path.endsWith('/') ? `${path}index.html` : `${path}.html`)
const internalLinks = (html) => [...html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)].map((m) => m[1])
const hreflangs = (html) => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]])

const guideSlugs = {} // locale → [{ id, slug }] read from the built pages' own JSON-LD
let urlCount = 0
for (const loc of LOCALES) {
  const homeUrl = homePath(loc.code)
  const home = read(pageFile(homeUrl))
  const label = `[${loc.code}]`
  urlCount += 1

  assert.match(home, new RegExp(`<html lang="${loc.htmlLang}">`), `${label} homepage should declare lang="${loc.htmlLang}"`)
  assert.match(home, /<script[^>]+type="module"[^>]+src="\/assets\/index-[^"]+\.js"/, `${label} homepage should reference a hashed app chunk`)
  assert.match(home, /<div id="root"><[^>]/, `${label} homepage should ship prerendered markup inside #root`)
  assert.match(home, /<h1[^>]*>[^<]{10,}/, `${label} homepage should carry an h1`)
  assert.match(home, new RegExp(`<link rel="canonical" href="${SITE}${homeUrl}" />`), `${label} homepage canonical should be its own URL`)
  assert.equal(home.match(/<title>/g)?.length, 1, `${label} homepage should have exactly one <title>`)
  assert.ok(!home.includes('<!--seo:start-->'), `${label} homepage should have had its seo block replaced`)
  assert.match(home, new RegExp(`<meta property="og:locale" content="${loc.ogLocale}" />`), `${label} homepage should set og:locale`)

  // hreflang: every language, itself included, plus x-default → English.
  const alts = Object.fromEntries(hreflangs(home))
  for (const other of LOCALES) assert.equal(alts[other.htmlLang], `${SITE}${homePath(other.code)}`, `${label} homepage should link ${other.htmlLang}`)
  assert.equal(alts['x-default'], `${SITE}/`, `${label} homepage x-default should be the English homepage`)

  const ld = jsonLd(home)
  const types = (ld?.['@graph'] ?? []).map((node) => node['@type'])
  for (const type of ['SoftwareApplication', 'Person', 'WebSite', 'FAQPage']) assert.ok(types.includes(type), `${label} homepage JSON-LD should include ${type}`)
  assert.equal(ld['@graph'].find((n) => n['@type'] === 'SoftwareApplication').inLanguage, loc.htmlLang, `${label} JSON-LD inLanguage`)

  assert.ok(existsSync(new URL(`${homeUrl.slice(1)}404.html`, dist)), `${label} should have its own 404.html`)
  assert.match(headers, new RegExp(`^${homeUrl.replace(/[/]/g, '\\/')}\\s*\\n\\s+Cache-Control: no-cache`, 'm'), `${label} homepage should revalidate (add it to public/_headers)`)

  // The social card exists and is a real image, not the English one under another name.
  const ogImage = loc.code === 'en' ? 'og-image.png' : `og/${loc.code}.png`
  assert.ok(existsSync(new URL(ogImage, dist)), `${label} social card dist/${ogImage} should exist (npm run og-images)`)
  assert.match(home, new RegExp(`<meta property="og:image" content="${SITE}/${ogImage}" />`), `${label} homepage should point og:image at its own card`)

  // --- guides ---
  const slugs = []
  const guideLinks = [...new Set(internalLinks(home).filter((href) => href.startsWith(homeUrl === '/' ? '/' : homeUrl)))]
  const guideHrefs = guideLinks.filter((href) => href !== homeUrl && href !== '/' && !href.startsWith('/assets') && !/\.\w+$/.test(href) && !LOCALES.some((l) => homePath(l.code) === href))
  assert.equal(guideHrefs.length, GUIDE_IDS.length, `${label} homepage should list ${GUIDE_IDS.length} guides, found ${guideHrefs.join(', ')}`)

  for (const href of guideHrefs) {
    urlCount += 1
    const file = pageFile(href)
    assert.ok(existsSync(new URL(file.slice(1), dist)), `${label} dist${file} should exist after build`)
    const guide = read(file)
    assert.match(guide, new RegExp(`<html lang="${loc.htmlLang}">`), `${label} ${href} should declare lang="${loc.htmlLang}"`)
    assert.match(guide, new RegExp(`rel="canonical" href="${SITE}${href}"`), `${label} ${href} should declare its canonical URL`)
    assert.ok(!guide.includes('<script type="module"'), `${label} ${href} should ship no app bundle`)
    assert.match(guide, /<h1[^>]*>/, `${label} ${href} should carry an h1`)
    assert.equal(guide.match(/<title>/g)?.length, 1, `${label} ${href} should have exactly one <title>`)

    // The structured data has to parse and has to say what the page shows:
    // FAQ answers that are marked up but not visible are a spam signal.
    const gld = jsonLd(guide)
    const gtypes = (gld?.['@graph'] ?? []).map((node) => node['@type'])
    for (const type of ['Article', 'BreadcrumbList', 'FAQPage']) assert.ok(gtypes.includes(type), `${label} ${href} JSON-LD should include ${type}`)
    const article = gld['@graph'].find((node) => node['@type'] === 'Article')
    assert.equal(article.inLanguage, loc.htmlLang, `${label} ${href} Article inLanguage`)
    const faq = gld['@graph'].find((node) => node['@type'] === 'FAQPage')
    assert.ok(faq.mainEntity.length >= 3, `${label} ${href} should carry at least three FAQ entries`)
    for (const { name } of faq.mainEntity) {
      const visible = name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')
      assert.ok(guide.includes(`>${visible}</dt>`) || guide.includes(`>${decode(visible)}</dt>`) || decode(guide).includes(`>${name}</dt>`), `${label} ${href}: FAQ question "${name}" is marked up but not visible`)
    }
    assert.ok(guide.includes('id="short-answer"'), `${label} ${href} should open with a short answer`)

    // Every guide names the same page in every other language (and x-default).
    const galts = Object.fromEntries(hreflangs(guide))
    for (const other of LOCALES) assert.ok(galts[other.htmlLang], `${label} ${href} should link its ${other.htmlLang} version`)
    assert.equal(galts[loc.htmlLang], `${SITE}${href}`, `${label} ${href} hreflang for itself`)

    // No dead internal links: every local href must be a built page or file.
    for (const link of new Set(internalLinks(guide))) {
      const target = /\.\w+$/.test(link) ? link : pageFile(link.endsWith('/') ? link : link)
      assert.ok(existsSync(new URL(target.slice(1), dist)), `${label} ${href} links to ${link}, which was not built`)
    }
    slugs.push(href.slice(href.lastIndexOf('/') + 1))
  }
  assert.equal(new Set(slugs).size, GUIDE_IDS.length, `${label} guide slugs should be unique`)
  guideSlugs[loc.code] = slugs

  for (const link of new Set(internalLinks(home))) {
    const target = /\.\w+$/.test(link) ? link : pageFile(link)
    assert.ok(existsSync(new URL(target.slice(1), dist)), `${label} homepage links to ${link}, which was not built`)
  }
}

// English URLs are the ones already indexed: they must not move.
for (const id of GUIDE_IDS) assert.ok(guideSlugs.en.includes(id), `English guide /${id} must keep its URL`)
assert.ok(guidePath('en', 'x') === '/x', 'English stays at the root')

const sitemap = readFileSync(new URL('sitemap.xml', dist), 'utf8')
assert.equal((sitemap.match(/<loc>/g) ?? []).length, urlCount, `sitemap should list every page: ${LOCALES.length} homepages plus ${GUIDE_IDS.length} guides each`)
assert.equal((sitemap.match(/<loc>/g) ?? []).length, LOCALES.length * (1 + GUIDE_IDS.length))
assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'sitemap should declare the xhtml namespace for hreflang alternates')
assert.equal((sitemap.match(/hreflang="x-default"/g) ?? []).length, urlCount, 'every sitemap url should carry an x-default alternate')

assert.match(read('index.html'), /<h1[^>]*>[^<]*CV ATS score/, 'English h1 should carry the CV ATS score wording')
assert.match(read('index.html'), /<title>[^<]*ATS Resume Checker/, 'English <title> must keep "ATS Resume Checker" — the daily site monitor in shykov.dev greps for it')
assert.match(read('index.html'), /What is an ATS score\?/, 'prerendered HTML should carry the FAQ copy')
assert.ok(existsSync(new URL('404.html', dist)), 'dist/404.html should exist — the Worker serves it as the real 404')

// IndexNow proves ownership by fetching <key>.txt; a build that drops it makes
// every submission fail with 403.
const keyFiles = readdirSync(dist).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
assert.equal(keyFiles.length, 1, 'dist should carry exactly one IndexNow <key>.txt')
assert.equal(readFileSync(new URL(keyFiles[0], dist), 'utf8').trim(), keyFiles[0].slice(0, 32), 'IndexNow key file must contain its own key')

const llms = readFileSync(new URL('llms.txt', dist), 'utf8')
assert.ok(!llms.includes('<!--GUIDES-->') && !llms.includes('<!--LOCALES-->'), 'llms.txt should have its guide lists filled in, not the markers')
for (const loc of LOCALES) assert.ok(llms.includes(`${SITE}${homePath(loc.code)}`), `llms.txt should list the ${loc.code} homepage`)

const assetDir = join(fileURLToPath(dist), 'assets')
assert.ok(existsSync(assetDir), 'dist/assets should exist after build')
