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

const assetDir = join(fileURLToPath(dist), 'assets')
assert.ok(existsSync(assetDir), 'dist/assets should exist after build')
