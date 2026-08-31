import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('..', import.meta.url)
const dist = new URL('dist/', root)
const htmlPath = new URL('index.html', dist)
const headersPath = new URL('_headers', dist)

assert.ok(existsSync(htmlPath), 'dist/index.html should exist after build')
assert.ok(existsSync(headersPath), 'dist/_headers should exist after build')

const html = readFileSync(htmlPath, 'utf8')
const headers = readFileSync(headersPath, 'utf8')

assert.match(html, /<script[^>]+type="module"[^>]+src="\/assets\/index-[^"]+\.js"/, 'index.html should reference a hashed app chunk')
assert.match(headers, /Content-Security-Policy:/, '_headers should include the production CSP')
assert.match(headers, /Cache-Control: no-cache/, '_headers should keep HTML revalidated')
assert.match(headers, /Strict-Transport-Security: max-age=\d+/, '_headers should pin HSTS in the repo, not rely on zone-level dashboard state')
assert.match(headers, /object-src 'none'/, "CSP should keep object-src 'none' (blocks same-origin <object>/<embed> smuggling)")

// The prerendered shell is the only thing a non-JS crawler ever sees. AI
// crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) do not execute JavaScript,
// so if this regresses to a bare <div id="root"></div> the site becomes
// invisible to them without any visible breakage for human users.
assert.match(html, /<div id="root"><[^>]/, 'index.html should ship prerendered markup inside #root')
assert.match(html, /<h1[^>]*>[^<]*ATS resume score/, 'prerendered HTML should carry the h1')
assert.match(html, /What is an ATS score\?/, 'prerendered HTML should carry the FAQ copy')

// The guide pages are the site's only non-app content and its whole long-tail
// search surface. They are generated, so a broken prerender would drop all five
// silently - the app itself would still build and deploy fine.
for (const slug of ['what-is-an-ats-score', 'ats-checker-without-upload', 'pdf-or-docx-for-ats', 'how-ats-parsing-works', 'ats-resume-checklist']) {
  const page = new URL(`${slug}.html`, dist)
  assert.ok(existsSync(page), `dist/${slug}.html should exist after build`)
  const guide = readFileSync(page, 'utf8')
  assert.match(guide, new RegExp(`rel="canonical" href="https://cv\\.shykov\\.dev/${slug}"`), `${slug} should declare its canonical URL`)
  assert.ok(!guide.includes('<script type="module"'), `${slug} should ship no app bundle`)
  assert.match(guide, /<h1[^>]*>/, `${slug} should carry an h1`)
}

assert.ok(existsSync(new URL('404.html', dist)), 'dist/404.html should exist — the Worker serves it as the real 404')

const sitemap = readFileSync(new URL('sitemap.xml', dist), 'utf8')
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 6, 'sitemap should list the homepage plus all five guides')

const llms = readFileSync(new URL('llms.txt', dist), 'utf8')
assert.ok(!llms.includes('<!--GUIDES-->'), 'llms.txt should have its guide list filled in, not the marker')

const assetDir = join(fileURLToPath(dist), 'assets')
assert.ok(existsSync(assetDir), 'dist/assets should exist after build')
