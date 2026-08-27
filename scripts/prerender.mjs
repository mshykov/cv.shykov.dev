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

const { render } = await import(pathToFileURL(new URL('entry-server.js', OUT).pathname))
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

rmSync(OUT, { recursive: true, force: true })
console.log(`prerender: injected ${body.length} bytes of static HTML`)

// Stamp the sitemap with the date of the last commit rather than today's date.
// Republishing an unchanged page with a fresh lastmod every deploy is a signal
// search engines learn to ignore. If git is unavailable (some build sandboxes
// ship no .git), leave whatever the checked-in file says.
try {
  // Absolute path, no PATH lookup: a writable directory on the caller's PATH
  // could otherwise shadow `git` and get executed during the build. /usr/bin is
  // where both Xcode's git and every Linux runner's git live; if it is missing,
  // the catch below keeps the checked-in lastmod.
  const day = execFileSync('/usr/bin/git', ['log', '-1', '--format=%cs'], {
    encoding: 'utf8',
    env: {},
  }).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const xml = readFileSync(SITEMAP, 'utf8')
    writeFileSync(SITEMAP, xml.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${day}</lastmod>`))
    console.log(`prerender: sitemap lastmod set to ${day}`)
  }
} catch {
  console.log('prerender: no git metadata, keeping the checked-in sitemap lastmod')
}
