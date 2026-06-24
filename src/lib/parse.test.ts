import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseResume } from './parse.ts'
import type { Extracted } from './pdf.ts'

const ex = (lines: string[]): Extracted => ({ pieces: [], lines, text: lines.join('\n'), numPages: 1, charCount: 0, source: 'pdf' })

const LINES = [
  'MAKSYM SHYKOV',
  'maksym.shykov@gmail.com · +34 694 235 282 · linkedin.com/in/maksym · github.com/mshykov',
  'Madrid, Spain',
  'EXPERIENCE',
  'Engineering Manager — Headway Feb 2025 – now',
  '• Led a team of 8',
  'SKILLS',
  'Leadership, People Management, CI/CD',
  'PROJECTS',
  '• local-review (mshykov.github.io) — privacy-first AI code reviews',
  'EDUCATION',
  "• Master's in CS — KPI, 2008–2010",
  "• Bachelor's in CS — KPI, 2004–2008",
  'LANGUAGES',
  'English',
]

test('parses profile and filters the email domain out of links', () => {
  const r = parseResume(ex(LINES))
  assert.equal(r.profile.name, 'MAKSYM SHYKOV')
  assert.equal(r.profile.email, 'maksym.shykov@gmail.com')
  assert.ok(r.profile.phone.replace(/\D/g, '').length >= 9)
  assert.ok(!r.profile.links.includes('gmail.com'), 'email domain should not be a link')
  assert.ok(r.profile.links.some((l) => l.includes('linkedin')))
})

test('splits an experience header into title / company / date', () => {
  const e = parseResume(ex(LINES)).experience
  assert.equal(e.length, 1)
  assert.equal(e[0].title, 'Engineering Manager')
  assert.equal(e[0].company, 'Headway')
  assert.match(e[0].date, /Feb 2025/)
  assert.equal(e[0].bullets.length, 1)
})

test('parses split company and role/date experience headers', () => {
  const e = parseResume(ex([
    'OLENA SHYKOVA',
    'olena@example.com',
    'CAREER EXPERIENCE',
    'Data Platform Ltd',
    'Senior Data Engineer | Feb 2021 – Present',
    '● Built streaming pipelines',
    '✓ Reduced warehouse cost by 25%',
    'SKILLS',
    'Python, SQL, GCP',
  ])).experience

  assert.equal(e.length, 1)
  assert.equal(e[0].title, 'Senior Data Engineer')
  assert.equal(e[0].company, 'Data Platform Ltd')
  assert.match(e[0].date, /Feb 2021/)
  assert.equal(e[0].bullets.length, 2)
})

test('does not treat ordinary words containing date keywords as dates', () => {
  const e = parseResume(ex([
    'JANE DOE',
    'jane@example.com',
    'EXPERIENCE',
    'Knowledge Manager — Acme Jan 2020 – Present',
    '• Created onboarding materials',
    'Presentation skills and concurrent project delivery',
    '• Managed stakeholder updates',
  ])).experience

  assert.equal(e.length, 1)
  assert.equal(e[0].title, 'Knowledge Manager')
  assert.equal(e[0].company, 'Acme')
  assert.equal(e[0].bullets.length, 3)
  assert.ok(e[0].bullets.some((b) => b.includes('Presentation skills')))
})

test('itemizes a bulleted education list into separate entries', () => {
  assert.equal(parseResume(ex(LINES)).education.length, 2)
})

test('does not truncate hyphenated project names', () => {
  assert.ok(parseResume(ex(LINES)).projects.some((p) => p.name === 'local-review'))
})

test('a LANGUAGES header terminates the education section (no bleed)', () => {
  const dates = parseResume(ex(LINES)).education.map((e) => e.date).join(' ')
  assert.ok(!/LANGUAGES|English/.test(dates), 'education dates leaked into next section')
})
