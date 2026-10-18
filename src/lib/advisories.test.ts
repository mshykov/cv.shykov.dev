import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAdvisories, LONG_BULLET_WORDS, LONG_CV_WORDS } from './advisories.ts'
import { parseResume } from './parse.ts'
import type { Extracted } from './pdf.ts'
import { en } from '../i18n/messages/en.ts'

function ex(lines: string[]): Extracted {
  const text = lines.join('\n')
  return { pieces: [], lines, text, numPages: 2, charCount: text.replace(/\s/g, '').length, source: 'pdf' }
}
const advise = (lines: string[], locale = 'en') => {
  const e = ex(lines)
  return getAdvisories(e, parseResume(e), en.analysis.advisories, { locale, now: 2026 })
}
const ids = (lines: string[], locale = 'en') => advise(lines, locale).map((a) => a.id)

const HEAD = ['JANE DOE', 'jane@example.com · +1 555 123 4567', 'SUMMARY', 'Engineering manager with ten years of experience leading teams.']
const GOOD_ROLES = [
  'EXPERIENCE',
  'Engineering Manager — Acme Jan 2020 – now',
  '• Led a team of 8 engineers and cut costs by 30%',
  '• Shipped 5 products and grew revenue 2x',
  '• Reduced API latency from 1s to 0.2s',
  'Senior Engineer — Beta Corp Jan 2016 – Dec 2019',
  '• Built the billing service used by 40 customers',
  '• Mentored 3 junior engineers',
  'SKILLS',
  'Leadership, Hiring',
]

test('a normal CV gets no advisories', () => {
  assert.deepEqual(ids([...HEAD, ...GOOD_ROLES]), [])
})

test('a CV over the word limit gets the length advisory, one under it does not', () => {
  const filler = Array.from({ length: 160 }, (_, i) => `• Delivered project number ${i} with a team of engineers across two quarters and three regions`)
  const long = [...HEAD, 'EXPERIENCE', 'Engineering Manager — Acme Jan 2020 – now', ...filler]
  assert.ok(long.join(' ').split(/\s+/).length > LONG_CV_WORDS)
  assert.ok(ids(long).includes('length'))
  assert.ok(!ids([...HEAD, ...GOOD_ROLES]).includes('length'))
})

test('a role with one bullet is flagged when the CV has other roles', () => {
  const lines = [...HEAD, 'EXPERIENCE',
    'Engineering Manager — Acme Jan 2020 – now', '• Led a team of 8 engineers and cut costs by 30%',
    'Senior Engineer — Beta Corp Jan 2016 – Dec 2019', '• Built things',
    'SKILLS', 'Leadership, Hiring']
  const a = advise(lines).find((x) => x.id === 'thin-role')
  assert.ok(a, 'expected a thin-role advisory')
  assert.match(a.detail, /2 roles have only one bullet/)
})

test('a CV with a single role is not told that its role is thin', () => {
  const lines = [...HEAD, 'EXPERIENCE', 'Engineering Manager — Acme Jan 2020 – now', '• Led a team of 8 engineers and cut costs by 30%', 'SKILLS', 'Leadership, Hiring']
  assert.ok(!ids(lines).includes('thin-role'))
})

test('a bullet that is a paragraph is flagged', () => {
  const long = `• ${Array.from({ length: LONG_BULLET_WORDS + 5 }, (_, i) => `word${i}`).join(' ')}`
  const lines = [...HEAD, 'EXPERIENCE', 'Engineering Manager — Acme Jan 2020 – now', long, '• Shipped 5 products and grew revenue 2x', '• Reduced API latency from 1s to 0.2s',
    'Senior Engineer — Beta Corp Jan 2016 – Dec 2019', '• Built the billing service used by 40 customers', '• Mentored 3 junior engineers']
  assert.ok(ids(lines).includes('long-bullets'))
})

test('advisories never change the score', async () => {
  const { analyze } = await import('./analyze.ts')
  const e = ex([...HEAD, ...GOOD_ROLES])
  assert.equal(analyze(e, en.analysis).score, analyze(ex([...HEAD, ...GOOD_ROLES]), en.analysis).score)
})

const withEducation = (...edu: string[]) => [...HEAD, ...GOOD_ROLES, 'EDUCATION', ...edu]

test('an old graduation year is flagged, in English only', () => {
  const old = withEducation('• BSc Computer Science — Example University, 1998')
  assert.ok(ids(old).includes('graduation-year'))
  for (const locale of ['es', 'pt-br', 'pt-pt', 'fr', 'de']) {
    assert.ok(!ids(old, locale).includes('graduation-year'), `no graduation advice in ${locale}`)
  }
})

test('a recent, ongoing or missing graduation year is not flagged', () => {
  assert.ok(!ids(withEducation('• BSc Computer Science — Example University, 2022')).includes('graduation-year'))
  assert.ok(!ids(withEducation('MSc Data Science — Example University 2024 – now')).includes('graduation-year'))
  assert.ok(!ids(withEducation('• BSc Computer Science — Example University')).includes('graduation-year'))
})

test('the latest year of a range decides, and a date on its own line counts', () => {
  assert.ok(ids(withEducation('Example University — BSc Computer Science 2004 - 2008')).includes('graduation-year'))
  assert.ok(ids(withEducation('Master’s in Metrology — Example University', '2008 – 2010')).includes('graduation-year'))
  assert.ok(!ids(withEducation('Example University — BSc 2004 - 2018')).includes('graduation-year'))
})

test('a graduation-year advisory never changes the score', async () => {
  const { analyze } = await import('./analyze.ts')
  const withOld = analyze(ex(withEducation('• BSc Computer Science — Example University, 1998')), en.analysis).score
  const withNew = analyze(ex(withEducation('• BSc Computer Science — Example University, 2022')), en.analysis).score
  assert.equal(withOld, withNew)
})
