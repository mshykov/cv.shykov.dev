// Renders the 1200×630 social card of every language to public/og/<code>.png (English:
// public/og-image.png).
//
//   npm run og-images              # every language
//   npm run og-images -- es de     # just these
//
// The text comes from `messages.og` in src/i18n/messages/<code>.ts, so a card can never
// disagree with its page. The look is the site's (docs/design.md): ink on paper, one neon
// block, the self-hosted fonts from src/fonts (Onest draws Cyrillic). Social networks cache
// a card per URL, so an already-shared link keeps its old picture until its debugger
// (LinkedIn Post Inspector, Facebook Sharing Debugger) re-scrapes it.
//
// Needs Google Chrome (headless screenshot). No npm dependency on purpose.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LOCALES } from '../src/i18n/locales.ts'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(CHROME)) throw new Error(`og-images: Chrome not found at ${CHROME}. Set CHROME_BIN.`)

const publicDir = new URL('../public/', import.meta.url)
const logo = `data:image/png;base64,${readFileSync(new URL('logo.png', publicDir)).toString('base64')}`

const args = process.argv.slice(2)
const wanted = args.filter((a) => !a.startsWith('--'))
const targets = LOCALES.filter((l) => !wanted.length || wanted.includes(l.code))
if (!targets.length) throw new Error('og-images: nothing to render')

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const font = (file) => pathToFileURL(new URL(`../src/fonts/${file}`, import.meta.url).pathname).href
const stripStop = (s) => s.replace(/[.。]$/, '')

function card(og) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Grotesk"; src: url("${font('schibsted-grotesk-latin-wght-normal.woff2')}") format("woff2"); font-weight: 400 900; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+20AC, U+2122, U+2212; }
  @font-face { font-family: "Grotesk"; src: url("${font('schibsted-grotesk-latin-ext-wght-normal.woff2')}") format("woff2"); font-weight: 400 900; unicode-range: U+0100-02BA, U+1E00-1EFF; }
  @font-face { font-family: "Grotesk"; src: url("${font('onest-cyrillic-wght-normal.woff2')}") format("woff2"); font-weight: 400 700; unicode-range: U+0301, U+0400-045F, U+0490-0491, U+2116; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: "Grotesk", Arial, sans-serif; color: #0a0a0a; background: #f4f4ef; position: relative; -webkit-font-smoothing: antialiased; }
  .brand { position: absolute; left: 80px; top: 56px; display: flex; gap: 14px; align-items: center; font-size: 28px; font-weight: 700; letter-spacing: -.01em; }
  .brand img { width: 44px; height: 44px; display: block; }
  .headline { position: absolute; left: 80px; top: 150px; width: 640px; font-weight: 600; letter-spacing: -.055em; line-height: .96; }
  .headline span { display: block; white-space: nowrap; }
  .sub { position: absolute; left: 80px; top: 372px; width: 640px; font-size: 28px; line-height: 1.35; color: #4d4d47; font-weight: 500; }
  .sub span { display: block; white-space: nowrap; }
  .facts { position: absolute; left: 80px; bottom: 56px; display: flex; gap: 34px; list-style: none; padding: 0; font-size: 26px; font-weight: 600; letter-spacing: -.01em; }
  .facts li { display: flex; align-items: center; gap: 12px; white-space: nowrap; }
  .facts i { width: 15px; height: 15px; background: #ccff00; outline: 2px solid #0a0a0a; display: block; }
  .block { position: absolute; left: 790px; top: 130px; width: 330px; height: 370px; background: #ccff00; padding: 30px 32px; display: flex; flex-direction: column; justify-content: space-between; }
  .block .label { font: 600 22px/1.2 "SF Mono", Menlo, monospace; letter-spacing: .04em; text-transform: uppercase; }
  .block .num { font-weight: 700; letter-spacing: -.08em; line-height: .78; font-size: 205px; display: flex; align-items: flex-end; gap: 6px; }
  .block .num small { font-size: 38px; font-weight: 600; letter-spacing: 0; padding-bottom: 10px; }
  .rule { position: absolute; left: 80px; right: 80px; bottom: 124px; height: 2px; background: #0a0a0a; }
</style></head><body>
  <div class="brand"><img src="${logo}" alt="">cv.shykov.dev</div>
  <div class="headline" id="h">${og.headline.map((l) => `<span>${esc(stripStop(l))}</span>`).join('')}</div>
  <div class="sub" id="s">${og.sub.map((l) => `<span>${esc(stripStop(l))}</span>`).join('')}</div>
  <div class="rule"></div>
  <ul class="facts" id="f">${og.chips.map((c) => `<li><i></i>${esc(c)}</li>`).join('')}</ul>
  <div class="block"><div class="label">${esc(og.cardLabel)}</div><div class="num">83<small>/100</small></div></div>
  <script>
    // Longer languages: shrink each text block until it fits its column, so a German
    // headline never runs under the block.
    function fit(id, start, min, maxWidth) {
      const el = document.getElementById(id); let size = start
      el.style.fontSize = size + 'px'
      while (size > min && [...el.children].some((c) => c.scrollWidth > maxWidth)) { size -= 1; el.style.fontSize = size + 'px' }
    }
    fit('h', 96, 40, 660); fit('s', 28, 18, 660)
    const facts = document.getElementById('f'); let fs = 26
    while (fs > 15 && facts.scrollWidth > 1040) { fs -= 1; facts.style.fontSize = fs + 'px'; facts.style.gap = Math.round(fs * 1.2) + 'px' }
    const label = document.querySelector('.block .label'); let ls = 22
    while (ls > 12 && label.scrollWidth > 266) { ls -= 1; label.style.fontSize = ls + 'px' }
  </script>
</body></html>`
}

mkdirSync(new URL('og/', publicDir), { recursive: true })
const work = mkdtempSync(join(tmpdir(), 'og-'))
try {
  const bundles = await Promise.all(targets.map((loc) => import(pathToFileURL(new URL(`../src/i18n/bundles/${loc.code}.ts`, import.meta.url).pathname).href)))
  for (const [index, loc] of targets.entries()) {
    const { bundle } = bundles[index]
    const html = join(work, `${loc.code}.html`)
    writeFileSync(html, card(bundle.messages.og))
    const out = loc.code === 'en' ? new URL('og-image.png', publicDir).pathname : new URL(`og/${loc.code}.png`, publicDir).pathname
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${out}`, pathToFileURL(html).href], { stdio: 'ignore' })
    console.log(`og-images: ${loc.code} → ${out.replace(new URL('..', import.meta.url).pathname, '')}`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
