// Renders the 1200×630 social card of every language to public/og/<code>.png.
//
//   npm run og-images              # every language except English
//   npm run og-images -- es de     # just these
//   npm run og-images -- --en      # also redraw English into public/og-image.png
//
// The text comes from `messages.og` in src/i18n/messages/<code>.ts, so a card can
// never disagree with its page. The layout copies the original English card
// (public/og-image.png, the one already shared and cached by social networks), so
// English is left alone unless you ask: changing a card people have already
// shared does not update it for them.
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
const withEnglish = args.includes('--en')
const wanted = args.filter((a) => !a.startsWith('--'))
const targets = LOCALES.filter((l) => (wanted.length ? wanted.includes(l.code) : l.code !== 'en' || withEnglish))
if (!targets.length) throw new Error('og-images: nothing to render')

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function card(og) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: -apple-system, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #0c0a09;
         background: linear-gradient(110deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%); position: relative; }
  .brand { position: absolute; left: 70px; top: 58px; display: flex; gap: 18px; align-items: center; }
  .brand img { width: 70px; height: 70px; border-radius: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.15); }
  .brand .url { font-size: 21px; font-weight: 700; letter-spacing: .16em; color: #4338ca; text-transform: uppercase; }
  .brand .name { font-size: 28px; font-weight: 700; letter-spacing: -.01em; margin-top: 2px; }
  .badge { position: absolute; left: 80px; top: 170px; display: inline-flex; gap: 12px; align-items: center; padding: 11px 24px;
           border-radius: 999px; background: rgba(255,255,255,.85); box-shadow: 0 1px 3px rgba(0,0,0,.12); font-size: 22px; font-weight: 600; color: #44403c; }
  .badge i { width: 12px; height: 12px; border-radius: 50%; background: #10b981; display: block; }
  .headline { position: absolute; left: 80px; top: 228px; width: 600px; font-weight: 800; letter-spacing: -.035em; line-height: 1.06; }
  .headline span { display: block; white-space: nowrap; }
  .sub { position: absolute; left: 80px; top: 424px; width: 600px; font-size: 30px; line-height: 1.5; color: #57534e; }
  .sub span { display: block; white-space: nowrap; }
  .chips { position: absolute; left: 80px; top: 534px; display: flex; gap: 20px; }
  .chip { padding: 14px 24px; border-radius: 999px; font-size: 23px; font-weight: 700; background: #fff; color: #57534e; box-shadow: 0 0 0 1px #e7e5e4; white-space: nowrap; }
  .chip.ok { background: #ecfdf5; color: #047857; box-shadow: 0 0 0 1px #a7f3d0; }
  /* the two cards on the right */
  .back { position: absolute; left: 818px; top: 118px; width: 300px; height: 392px; border-radius: 22px; background: #fff; transform: rotate(3deg);
          box-shadow: 0 30px 60px rgba(30,27,75,.16), 0 0 0 1px #e7e5e4; padding: 30px; }
  .back .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .back .bar { height: 18px; border-radius: 9px; background: #1c1917; width: 150px; }
  .back .pill { padding: 8px 16px; border-radius: 999px; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 22px; box-shadow: 0 0 0 1px #a7f3d0; white-space: nowrap; }
  .back .line { height: 14px; border-radius: 7px; background: #e7e5e4; margin-bottom: 14px; }
  .back .accent { height: 18px; border-radius: 9px; background: #4f46e5; width: 150px; margin: 36px 0 18px; }
  .front { position: absolute; left: 692px; top: 154px; width: 300px; height: 370px; border-radius: 22px; background: rgba(238,242,255,.96); transform: rotate(-6deg);
           box-shadow: 0 24px 50px rgba(30,27,75,.14), 0 0 0 1px #c7d2fe; padding: 26px; }
  .front .label { display: inline-block; font-size: 22px; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: #4338ca; margin: 30px 0 24px; white-space: nowrap; }
  .front .dot { position: absolute; right: 22px; top: 40px; width: 16px; height: 16px; border-radius: 50%; background: #10b981; }
  .front .inner { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 0 0 1px #e0e7ff; }
  .front .score { display: flex; gap: 20px; align-items: center; margin-bottom: 18px; }
  .front .ring { width: 92px; height: 92px; border-radius: 50%; background: #ecfdf5; color: #047857; font-weight: 800; font-size: 40px; display: grid; place-items: center; box-shadow: 0 0 0 7px #a7f3d0; }
  .front .bars { flex: 1; } .front .b1 { height: 16px; border-radius: 8px; background: #1c1917; width: 70%; margin-bottom: 12px; } .front .b2 { height: 12px; border-radius: 6px; background: #e7e5e4; }
  .front .cell { height: 34px; border-radius: 10px; background: #fafaf9; box-shadow: 0 0 0 1px #e7e5e4; margin-bottom: 10px; padding: 11px 14px; }
  .front .cell div { height: 10px; border-radius: 5px; background: #d6d3d1; }
  .front .tags { position: absolute; left: 14px; right: 14px; bottom: 20px; display: flex; gap: 6px; justify-content: center; }
  .front .tags span { padding: 7px 11px; border-radius: 999px; background: #fff; box-shadow: 0 0 0 1px #e7e5e4; font-size: 13px; font-weight: 700; color: #57534e; text-transform: uppercase; white-space: nowrap; }
</style></head><body>
  <div class="brand"><img src="${logo}" alt=""><div><div class="url">cv.shykov.dev</div><div class="name">ATS Resume Toolkit</div></div></div>
  <div class="badge"><i></i>${esc(og.badge)}</div>
  <div class="headline" id="h">${og.headline.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
  <div class="sub" id="s">${og.sub.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
  <div class="chips" id="c">${og.chips.map((c, i) => `<div class="chip${i === 0 ? ' ok' : ''}">${esc(c)}</div>`).join('')}</div>
  <div class="back"><div class="row"><div class="bar"></div><div class="pill">83 / 100</div></div><div class="line"></div><div class="line" style="width:84%"></div><div class="line" style="width:66%"></div><div class="accent"></div><div class="line"></div><div class="line" style="width:84%"></div></div>
  <div class="front"><div class="dot"></div><div class="label">${esc(og.cardLabel)}</div>
    <div class="inner"><div class="score"><div class="ring">83</div><div class="bars"><div class="b1"></div><div class="b2"></div></div></div>
      <div class="cell"><div style="width:100%"></div></div><div class="cell"><div style="width:84%"></div></div><div class="cell"><div style="width:66%"></div></div></div>
    <div class="tags">${og.cardChips.map((c) => `<span>${esc(c)}</span>`).join('')}</div></div>
  <script>
    // Longer languages: shrink each text block until it fits the left column,
    // so a German headline never runs under the cards.
    function fit(id, start, min, maxWidth) {
      const el = document.getElementById(id); let size = start
      el.style.fontSize = size + 'px'
      while (size > min && [...el.children].some((c) => c.scrollWidth > maxWidth)) { size -= 1; el.style.fontSize = size + 'px' }
    }
    fit('h', 84, 44, 600); fit('s', 30, 20, 590)
    const label = document.querySelector('.front .label'); let ls = 22
    while (ls > 12 && label.scrollWidth > 250) { ls -= 1; label.style.fontSize = ls + 'px' }
    const chips = document.getElementById('c'); let cs = 23
    while (cs > 15 && chips.scrollWidth > 560) { cs -= 1; chips.querySelectorAll('.chip').forEach((c) => { c.style.fontSize = cs + 'px'; c.style.padding = '12px ' + Math.round(cs) + 'px' }) }
  </script>
</body></html>`
}

mkdirSync(new URL('og/', publicDir), { recursive: true })
const work = mkdtempSync(join(tmpdir(), 'og-'))
try {
  for (const loc of targets) {
    const { bundle } = await import(pathToFileURL(new URL(`../src/i18n/bundles/${loc.code}.ts`, import.meta.url).pathname).href)
    const html = join(work, `${loc.code}.html`)
    writeFileSync(html, card(bundle.messages.og))
    const out = loc.code === 'en' ? new URL('og-image.png', publicDir).pathname : new URL(`og/${loc.code}.png`, publicDir).pathname
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${out}`, pathToFileURL(html).href], { stdio: 'ignore' })
    console.log(`og-images: ${loc.code} → ${out.replace(new URL('..', import.meta.url).pathname, '')}`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
