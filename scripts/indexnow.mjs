// Tells IndexNow (Bing, Yandex, Seznam, Naver…) that pages changed, so they
// recrawl in minutes instead of whenever they next read the sitemap. Bing's
// index is what ChatGPT search and DuckDuckGo answer from, so this is also the
// fastest path into AI answers.
//
//   node scripts/indexnow.mjs --dry-run      # print the payload, send nothing
//   node scripts/indexnow.mjs                # every URL in the LIVE sitemap
//   node scripts/indexnow.mjs <url> [<url>]  # just these
//
// Run it AFTER a deploy is live: the engines fetch the page right away, and the
// key file must already be served for the submission to be accepted.
import { readdirSync, readFileSync } from 'node:fs'

const SITE = 'https://cv.shykov.dev'
const HOST = new URL(SITE).host
const ENDPOINT = 'https://api.indexnow.org/indexnow'

// The key is public by design: IndexNow proves ownership by fetching
// <key>.txt from the site and comparing it with the key in the request.
const PUBLIC = new URL('../public/', import.meta.url)
const keyFiles = readdirSync(PUBLIC).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (keyFiles.length !== 1) throw new Error(`indexnow: expected one <key>.txt in public/, found ${keyFiles.length}`)
const key = readFileSync(new URL(keyFiles[0], PUBLIC), 'utf8').trim()
const keyLocation = `${SITE}/${key}.txt`

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const explicit = args.filter((a) => a !== '--dry-run')

async function sitemapUrls() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const urlList = explicit.length ? explicit : await sitemapUrls()
const foreign = urlList.filter((u) => new URL(u).host !== HOST)
if (foreign.length) throw new Error(`indexnow: URLs outside ${HOST}: ${foreign.join(', ')}`)
if (!urlList.length) throw new Error('indexnow: nothing to submit')

const payload = { host: HOST, key, keyLocation, urlList }
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

// Fail here rather than get a 403 from the engine: a key that is not live yet
// usually means the deploy carrying it has not finished.
const served = await fetch(keyLocation)
if (!served.ok || (await served.text()).trim() !== key) {
  throw new Error(`indexnow: ${keyLocation} is not serving the key yet — deploy first`)
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})
// 200 = accepted, 202 = accepted, key validation pending. Anything else is a failure.
if (res.status !== 200 && res.status !== 202) {
  throw new Error(`indexnow: HTTP ${res.status} ${await res.text()}`)
}
console.log(`indexnow: submitted ${urlList.length} URL(s), HTTP ${res.status}`)
