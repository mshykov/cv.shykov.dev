import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze } from './analyze.ts'
import type { Extracted } from './pdf.ts'

function ex(lines: string[], over: Partial<Extracted> = {}): Extracted {
  const text = lines.join('\n')
  return { pieces: [], lines, text, numPages: 2, charCount: text.replace(/\s/g, '').length, source: 'pdf', ...over }
}

const STRONG = [
  'JANE DOE',
  'jane@example.com · +1 555 123 4567 · linkedin.com/in/jane',
  'Berlin, Germany',
  'SUMMARY',
  'Engineering manager with over ten years of experience building and leading high-performing cross-functional teams, shipping products at scale, and driving engineering excellence, delivery, and a healthy culture across multiple organizations.',
  'EXPERIENCE',
  'Engineering Manager — Acme Jan 2020 – now',
  '• Led a team of 8 engineers and cut infrastructure costs by 30%',
  '• Shipped 5 products improving revenue by 2x',
  '• Reduced API latency from 1s to 0.2s',
  'SKILLS',
  'Leadership, CI/CD, Hiring, Agile',
  'PROJECTS',
  '• Widget — an internal tool',
  'CERTIFICATIONS',
  '• AWS Certified, 2021',
  'EDUCATION',
  '• BSc Computer Science — MIT, 2014',
]

test('a strong CV scores high and passes', () => {
  const r = analyze(ex(STRONG))
  assert.ok(r.score >= 85, `expected >=85, got ${r.score}`)
  assert.equal(r.band.tone, 'pass')
})

test('detects ligature glyphs as an encoding failure', () => {
  const r = analyze(ex(['JOHN DOE', 'worked in ﬁntech and oﬃce roles'])) // ﬁ, ﬃ
  assert.equal(r.checks.find((c) => c.id === 'encoding')?.status, 'fail')
})

test('missing email fails the email check', () => {
  const r = analyze(ex(['JOHN DOE', 'no contact here', 'EXPERIENCE', '• did stuff']))
  assert.equal(r.checks.find((c) => c.id === 'email')?.status, 'fail')
})

test('DOCX source does not penalize page count', () => {
  const r = analyze(ex(STRONG, { source: 'docx', numPages: 0 }))
  assert.equal(r.checks.find((c) => c.id === 'pages')?.status, 'pass')
})

test('detects common PDF bullet glyph fallbacks', () => {
  const r = analyze(ex([
    'JANE DOE',
    'jane@example.com · +1 555 123 4567',
    'EXPERIENCE',
    'Senior Engineer — Acme Jan 2020 – now',
    '● Led a team of 8 engineers',
    '✓ Reduced latency by 30%',
    '– Built CI/CD automation',
  ]))

  assert.equal(r.checks.find((c) => c.id === 'bullets')?.status, 'pass')
  assert.ok((r.checks.find((c) => c.id === 'verbs')?.points ?? 0) > 0)
})

test('a thin scanned-style doc scores low', () => {
  const r = analyze(ex(['Resume'], { charCount: 12 }))
  assert.ok(r.score < 50, `expected <50, got ${r.score}`)
  assert.equal(r.checks.find((c) => c.id === 'machine-text')?.status, 'fail')
})
