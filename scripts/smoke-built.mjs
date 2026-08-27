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

const assetDir = join(fileURLToPath(dist), 'assets')
assert.ok(existsSync(assetDir), 'dist/assets should exist after build')
