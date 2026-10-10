import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LOCALES } from './locales.ts'
import { alternates, guideJsonLd, guidePaths, homeJsonLd, homePaths, ogImage } from './seo.ts'
import { escapeAttr, guideHead, homeHead, ldScript } from './head.ts'
import { en } from './messages/en.ts'
import type { Guide } from '../content/types.ts'

test('every language is an alternate of every other, plus x-default → English', () => {
  const alts = alternates(homePaths())
  assert.equal(alts.length, LOCALES.length + 1)
  assert.deepEqual(alts.map((a) => a.hreflang).sort(), [...LOCALES.map((l) => l.htmlLang), 'x-default'].sort())
  assert.equal(alts.find((a) => a.hreflang === 'x-default')?.url, 'https://cv.shykov.dev/')
  assert.equal(alts.find((a) => a.hreflang === 'es-ES')?.url, 'https://cv.shykov.dev/es/')
  assert.equal(alts.find((a) => a.hreflang === 'en')?.url, 'https://cv.shykov.dev/')
})

test('a language without a version of a guide is simply left out of its cluster', () => {
  const guides = Object.fromEntries(LOCALES.map((l) => [l.code, [] as Guide[]])) as Record<string, Guide[]>
  guides.en = [{ id: 'what-is-an-ats-score', slug: 'what-is-an-ats-score', title: 't', description: 'd' }]
  guides.es = [{ id: 'what-is-an-ats-score', slug: 'que-es-una-puntuacion-ats', title: 't', description: 'd' }]
  const paths = guidePaths(guides, 'what-is-an-ats-score')
  assert.deepEqual(paths, { en: '/what-is-an-ats-score', es: '/es/que-es-una-puntuacion-ats' })
  assert.deepEqual(alternates(paths).map((a) => a.hreflang).sort(), ['en', 'es-ES', 'x-default'])
})

test('the social card is the original for English and per-language otherwise', () => {
  assert.equal(ogImage('en'), 'https://cv.shykov.dev/og-image.png')
  assert.equal(ogImage('pt-br'), 'https://cv.shykov.dev/og/pt-br.png')
})

test('homepage head: one title, self-canonical, hreflang, og:locale, valid JSON-LD', () => {
  const head = homeHead('es', en, alternates(homePaths()), homeJsonLd('es', en))
  assert.equal(head.match(/<title>/g)?.length, 1)
  assert.match(head, /<link rel="canonical" href="https:\/\/cv\.shykov\.dev\/es\/" \/>/)
  assert.equal(head.match(/hreflang=/g)?.length, LOCALES.length + 1)
  assert.match(head, /<meta property="og:locale" content="es_ES" \/>/)
  assert.equal(head.match(/og:locale:alternate/g)?.length, LOCALES.length - 1)
  const ld = JSON.parse(head.match(/<script type="application\/ld\+json">(.*)<\/script>/)![1].replaceAll('\\u003c', '<'))
  assert.equal(ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'SoftwareApplication').inLanguage, 'es-ES')
})

test('guide head carries article times and its own canonical', () => {
  const article = { id: 'what-is-an-ats-score' as const, slug: 'que-es', title: 'Qué es', description: 'Desc', published: '2026-08-31', updated: '2026-10-10', summary: 's', faq: [{ q: 'q', a: 'a' }] }
  const head = guideHead('es', en, article, alternates({ en: '/x', es: '/es/que-es' }), guideJsonLd('es', en, article))
  assert.match(head, /<link rel="canonical" href="https:\/\/cv\.shykov\.dev\/es\/que-es" \/>/)
  assert.match(head, /article:modified_time" content="2026-10-10"/)
  assert.match(head, /<title>Qué es \| ATS Resume Toolkit<\/title>/)
})

test('text going into attributes and JSON-LD cannot break out', () => {
  assert.equal(escapeAttr('a "b" <c> & d'), 'a &quot;b&quot; &lt;c&gt; &amp; d')
  assert.ok(!ldScript({ x: '</script><script>alert(1)</script>' }).slice(0, -9).includes('</script>'))
})
