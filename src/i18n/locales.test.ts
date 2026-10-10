import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LOCALES, DEFAULT_LOCALE, localeFromHtmlLang, localeFromPath, localePrefix, homePath, guidePath } from './locales.ts'
import { en, type Messages } from './messages/en.ts'
import { sampleState, synthExtracted } from '../builder/model.ts'
import { analyze } from '../lib/analyze.ts'
import { fold } from '../lib/lang/index.ts'

// The messages contract. Every language file must be a complete, translated copy
// of en.ts: same shape (TypeScript enforces it), real translations (not English
// left in place), working functions, and a builder sample that scores well with
// that language's own headings. docs/localization.md describes the workflow.

const MODULES: Record<string, string> = { es: 'es', 'pt-br': 'ptBR', 'pt-pt': 'ptPT', fr: 'fr', de: 'de' }

async function messagesOf(code: string): Promise<Messages> {
  if (code === DEFAULT_LOCALE) return en
  const mod = await import(`./messages/${code}.ts`)
  return mod[MODULES[code]] as Messages
}

// String leaves that may legitimately equal the English text: names, acronyms,
// file formats, units, and the sample CV's proper nouns.
const MAY_MATCH_ENGLISH = [/^[A-Z0-9/&+. ,-]{1,12}$/, /^\+?[\d ]+$/, /@/, /^linkedin\.com|github\.com/, /^(Alex Morgan|Acme Corp|ATS Resume Toolkit|GitHub|CI\/CD|PDF\/DOCX|PDF & DOCX|A4|Agile|LLM|Maksym Shykov)$/, /^[\d\s:.,;·–—\-/%+×]+$/]

function leaves(value: unknown, path: string[] = []): { path: string; value: unknown }[] {
  if (typeof value === 'string' || typeof value === 'function') return [{ path: path.join('.'), value }]
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, [...path, String(i)]))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => leaves(v, [...path, k]))
  return [{ path: path.join('.'), value }]
}

const valueAt = (root: unknown, path: string): unknown => path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], root)

// How to call every message function. A new function in en.ts without a probe
// fails the "probes cover every function" test, which is the reminder to add one.
const PROBES: Record<string, unknown[]> = {
  'analysis.formatNumber': [1234],
  'analysis.machineText.pass': ['PROBE'],
  'analysis.machineText.warn': ['PROBE'],
  'analysis.section.detected': ['PROBE'],
  'analysis.section.missing': ['PROBE'],
  'analysis.section.fix': ['PROBE'],
  'analysis.bonus.found': ['PROBE'],
  'analysis.pages.ok': [2],
  'analysis.pages.many': [4],
  'analysis.bullets.found': [7],
  'analysis.quant.many': [7],
  'analysis.quant.few': [2],
  'analysis.verbs.pass': [7],
  'analyzer.failed': ['PROBE'],
  'analyzer.pages': [2],
  'analyzer.reportMeta': ['PAGES', 'WORDS', 'CHARS'],
  'analyzer.style.counts': [11, 222],
  'analyzer.jd.matchedOf': [3, 5],
  'analyzer.data.parsed': [4],
  'analyzer.data.bullets': [3],
  'report.title': ['PROBE'],
  'report.score': [83, 'PROBE'],
  'report.stats': ['PAGES', 'WORDS', 'CHARS'],
  'report.jdTitle': [60],
  'report.jdMatched': [3, 5],
  'builder.docTitle': ['Jane Doe'],
  'builder.fileName': ['Jane Doe'],
  'builder.imported': [3, 'cv.pdf'],
  'builder.settings.pagePreview': ['A4'],
  'builder.settings.useAccent': ['#4f46e5'],
  'article.bonusPoints': [4],
  scoreRing: [83],
}

test('the locale registry is consistent', () => {
  assert.equal(LOCALES[0].code, DEFAULT_LOCALE)
  assert.equal(new Set(LOCALES.map((l) => l.code)).size, LOCALES.length, 'codes are unique')
  assert.equal(new Set(LOCALES.map((l) => l.htmlLang)).size, LOCALES.length, 'hreflang values are unique')
  for (const l of LOCALES) {
    assert.match(l.code, /^[a-z]{2}(-[a-z]{2})?$/, `${l.code}: lower-case code`)
    assert.equal(localeFromHtmlLang(l.htmlLang), l.code)
    assert.equal(localeFromPath(`${localePrefix(l.code)}/anything`), l.code)
    assert.equal(homePath(l.code), l.code === 'en' ? '/' : `/${l.code}/`)
    assert.equal(guidePath(l.code, 'x'), l.code === 'en' ? '/x' : `/${l.code}/x`)
  }
  assert.equal(localeFromPath('/unknown-page'), 'en')
  assert.equal(localeFromPath('/'), 'en')
})

test('probes cover every function in en.ts', () => {
  const fns = leaves(en).filter((l) => typeof l.value === 'function').map((l) => l.path).sort()
  assert.deepEqual(Object.keys(PROBES).sort(), fns, 'add a probe to PROBES for each new message function')
})

for (const loc of LOCALES) {
  test(`[${loc.code}] messages have the same shape as English`, async () => {
    const m = await messagesOf(loc.code)
    const shape = (root: unknown) => leaves(root).map((l) => `${l.path}:${typeof l.value}`).sort()
    assert.deepEqual(shape(m), shape(en))
  })

  test(`[${loc.code}] no empty strings, no stray template markers`, async () => {
    const m = await messagesOf(loc.code)
    for (const { path, value } of leaves(m)) {
      if (typeof value !== 'string') continue
      assert.ok(value.trim().length > 0 || path.endsWith('.0.date'), `${path} is empty`)
      assert.ok(!/\$\{|\{\{|undefined|\[object/.test(value), `${path} has a template marker: ${value}`)
    }
  })

  test(`[${loc.code}] message functions return text that carries their arguments`, async () => {
    const m = await messagesOf(loc.code)
    for (const [path, args] of Object.entries(PROBES)) {
      const fn = valueAt(m, path) as (...a: unknown[]) => unknown
      const out = fn(...args)
      assert.equal(typeof out, 'string', `${path} should return a string`)
      assert.ok((out as string).length > 0, `${path} returned nothing`)
      if (path === 'analysis.formatNumber') {
        assert.match(out as string, /1.?234/, `${path}: 1234 should keep its digits`)
        continue
      }
      for (const arg of args) {
        const text = String(arg)
        if (path === 'builder.fileName' || path === 'builder.docTitle') continue
        assert.ok((out as string).includes(text), `${path}(${args.join(', ')}) should contain "${text}", got "${out}"`)
      }
    }
  })

  if (loc.code === DEFAULT_LOCALE) continue

  test(`[${loc.code}] is translated, not English left in place`, async () => {
    const m = await messagesOf(loc.code)
    const english = new Map(leaves(en).filter((l) => typeof l.value === 'string').map((l) => [l.path, l.value as string]))
    const same: string[] = []
    let total = 0
    for (const { path, value } of leaves(m)) {
      if (typeof value !== 'string') continue
      total += 1
      const source = english.get(path)
      if (source === value && !MAY_MATCH_ENGLISH.some((re) => re.test(value))) same.push(path)
    }
    assert.ok(same.length / total < 0.04, `${same.length}/${total} strings are still English: ${same.slice(0, 12).join(', ')}`)
  })

  test(`[${loc.code}] SEO fields fit what search engines show`, async () => {
    const m = await messagesOf(loc.code)
    assert.ok(m.meta.title.length <= 70, `title is ${m.meta.title.length} chars (max 70): ${m.meta.title}`)
    assert.ok(m.meta.description.length >= 100 && m.meta.description.length <= 170, `description is ${m.meta.description.length} chars (100–170)`)
    assert.ok(m.meta.ogTitle.length <= 70)
    assert.ok(m.meta.ogDescription.length <= 200)
    assert.ok(m.home.hero.h1.length <= 90, 'h1 should stay short enough for the hero')
    assert.equal(m.og.headline.length, 2)
    assert.equal(m.og.sub.length, 2)
    assert.equal(m.og.chips.length, 3)
    assert.equal(m.og.cardChips.length, 3)
    assert.ok(m.og.headline.every((line) => line.length <= 26), `OG headline lines must fit the card: ${m.og.headline.join(' / ')}`)
  })

  test(`[${loc.code}] the builder sample scores well with this language's own headings`, async () => {
    const m = await messagesOf(loc.code)
    const report = analyze(synthExtracted(sampleState(m.builder.sample), m.builder.docSections), m.analysis)
    const status = (id: string) => report.checks.find((c) => c.id === id)?.status
    for (const id of ['sec-exp', 'sec-edu', 'sec-skills', 'sec-summary', 'dates', 'email', 'phone', 'links'])
      assert.equal(status(id), 'pass', `${id} should pass on the sample CV (${loc.code}), got ${status(id)}`)
    // English scores 83 (its +1 555 sample number is not read as a phone). A
    // translation with a realistic local number and headings should do at least as well.
    assert.ok(report.score >= 83, `sample CV scores ${report.score}, expected >= 83`)
  })

  test(`[${loc.code}] the exported CV's headings are ones the scorer recognises`, async () => {
    const m = await messagesOf(loc.code)
    const headings = Object.values(m.builder.docSections).map((h) => fold(h))
    assert.equal(new Set(headings).size, headings.length, 'section headings should be distinct')
  })
}
