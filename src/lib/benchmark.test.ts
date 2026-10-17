import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze as analyzeWith } from './analyze.ts'
import { analyzeStyle } from './style.ts'
import type { Extracted } from './pdf.ts'
import { en } from '../i18n/messages/en.ts'

// A small, public sanity benchmark. It contains no real person's data: every CV
// below is invented. It does not prove the score predicts hiring outcomes (it
// cannot, and nothing here claims to). It checks the weaker property that the
// score orders CVs the way a parser would experience them: a readable CV with
// every section beats the same CV with parts removed, which beats one with no
// extractable text. If a rule change breaks that order, this test fails.

const analyze = (extracted: Extracted) => analyzeWith(extracted, en.analysis)

function ex(lines: string[], over: Partial<Extracted> = {}): Extracted {
  const text = lines.join('\n')
  return { pieces: [], lines, text, numPages: 1, charCount: text.replace(/\s/g, '').length, source: 'pdf', ...over }
}

const CONTACT = [
  'JANE DOE',
  'jane@example.com · +1 555 123 4567 · linkedin.com/in/jane-doe',
  'Berlin, Germany',
]

const SUMMARY = [
  'SUMMARY',
  'Engineering manager with ten years of experience leading cross-functional teams, shipping products at scale and running a steady delivery process across several organizations.',
]

const EXPERIENCE = [
  'EXPERIENCE',
  'Engineering Manager — Acme Jan 2020 – now',
  '• Led a team of 8 engineers and cut infrastructure costs by 30%',
  '• Shipped 5 products and grew revenue 2x',
  '• Reduced API latency from 1s to 0.2s',
]

const SKILLS = ['SKILLS', 'Leadership, CI/CD, Hiring, Agile']
const PROJECTS = ['PROJECTS', '• Widget — an internal tool used by 40 people']
const CERTS = ['CERTIFICATIONS', '• AWS Certified, 2021']
const EDUCATION = ['EDUCATION', '• BSc Computer Science — Example University, 2014']

const FULL = [...CONTACT, ...SUMMARY, ...EXPERIENCE, ...SKILLS, ...PROJECTS, ...CERTS, ...EDUCATION]


const NO_NUMBERS = [
  ...CONTACT,
  ...SUMMARY,
  'EXPERIENCE',
  'Engineering Manager — Acme Jan 2020 – now',
  '• Led a team of engineers and reduced infrastructure costs',
  '• Shipped several products and improved revenue',
  '• Reduced API latency noticeably',
  ...SKILLS,
  ...PROJECTS,
  ...CERTS,
  ...EDUCATION,
]

const profiles: { name: string; ex: Extracted }[] = [
  { name: 'complete, quantified CV', ex: ex(FULL) },
  { name: 'complete CV without numbers in the bullets', ex: ex(NO_NUMBERS) },
  { name: 'no skills, projects, certifications or education', ex: ex([...CONTACT, ...SUMMARY, ...EXPERIENCE]) },
  { name: 'no contact details and only experience', ex: ex([...EXPERIENCE]) },
  { name: 'scanned PDF with no extractable text', ex: ex([''], { charCount: 0 }) },
]

test('the score orders synthetic CVs from most to least parser-friendly', () => {
  const scores = profiles.map((p) => ({ name: p.name, score: analyze(p.ex).score }))
  for (let i = 1; i < scores.length; i++) {
    assert.ok(
      scores[i - 1].score > scores[i].score,
      `expected "${scores[i - 1].name}" (${scores[i - 1].score}) to outscore "${scores[i].name}" (${scores[i].score})`,
    )
  }
})

test('a complete CV passes and a scanned PDF fails', () => {
  assert.equal(analyze(profiles[0].ex).band.tone, 'pass')
  assert.notEqual(analyze(profiles[4].ex).band.tone, 'pass')
})

test('the same CV scores the same on every run', () => {
  const a = analyze(ex(FULL)).score
  const b = analyze(ex(FULL)).score
  assert.equal(a, b)
})

const NATURAL = [
  'Led a team of 8 engineers across backend and mobile.',
  'Cut release time 2.5x. Weekly releases became routine.',
  'Introduced integration testing and bug count fell about 30%.',
  'Ran the interview stages behind 7 hires.',
  'Crash-free sessions rose from 96% to 99.5% over two quarters.',
]

const BOILERPLATE = [
  'Results-driven professional with a proven track record of success.',
  'Passionate about leveraging synergies to deliver best-in-class solutions.',
  'Responsible for significantly improving various processes.',
  'Responsible for managing numerous stakeholders and projects.',
  'Responsible for utilizing cutting-edge tools in a fast-paced environment.',
]

test('the writing-style score separates natural wording from boilerplate', () => {
  const natural = analyzeStyle(NATURAL.join('\n'), NATURAL)
  const boilerplate = analyzeStyle(BOILERPLATE.join('\n'), BOILERPLATE)
  assert.ok(natural.score > boilerplate.score, `natural ${natural.score} vs boilerplate ${boilerplate.score}`)
})

// Expected behaviour that other checkers have and this one does not yet. Each is
// a `todo` test: it runs and reports, but a failure does not fail the suite.
// When the rule ships, delete `todo` so the test guards it from then on.
// Found in the 2026-10-16 cross-check, see docs/comparison-2026-10-16.md.

const flagged = (report: ReturnType<typeof analyze>, pattern: RegExp) =>
  report.checks.some((c) => pattern.test(`${c.id} ${c.label}`) && c.status !== 'pass')

test('flags a graduation year more than 15 years old (#106)', { todo: 'issue #106' }, () => {
  const old = ex([...CONTACT, ...SUMMARY, ...EXPERIENCE, ...SKILLS, 'EDUCATION', '• BSc Computer Science — Example University, 1998'])
  const recent = ex([...CONTACT, ...SUMMARY, ...EXPERIENCE, ...SKILLS, 'EDUCATION', '• BSc Computer Science — Example University, 2022'])
  assert.ok(flagged(analyze(old), /graduat|education year/i), 'an old graduation year should be flagged')
  assert.ok(!flagged(analyze(recent), /graduat|education year/i), 'a recent graduation year should not be')
})

test('flags a resume over ~1,000 words (#107)', { todo: 'issue #107' }, () => {
  const filler = Array.from({ length: 140 }, (_, i) => `• Delivered project ${i + 1} with a team of ${(i % 7) + 3} engineers, cutting cycle time by ${(i % 40) + 5}% across two quarters and three regions`)
  const long = ex([...CONTACT, ...SUMMARY, 'EXPERIENCE', 'Engineering Manager — Acme Jan 2020 – now', ...filler, ...SKILLS, ...EDUCATION])
  assert.ok(flagged(analyze(long), /word|length/i), 'a very long CV should get a length warning')
})

test('flags a role that has a single bullet (#108)', { todo: 'issue #108' }, () => {
  const thin = ex([
    ...CONTACT, ...SUMMARY, 'EXPERIENCE',
    'Engineering Manager — Acme Jan 2020 – now', '• Led a team of 8 engineers and cut costs by 30%',
    'Senior Engineer — Beta Corp Jan 2016 – Dec 2019', '• Built things',
    ...SKILLS, ...EDUCATION,
  ])
  assert.ok(flagged(analyze(thin), /single bullet|bullet balance|thin/i), 'a one-bullet role should be flagged')
})

// Reported by a reader on 2026-10-17 and fixed since. Kept here so it stays fixed.
test('empty text is not scored as a perfect writing style', () => {
  assert.equal(analyzeStyle('', []).insufficient, true)
})

test('adding bare headings does not raise the ATS score', () => {
  const without = analyze(ex([...CONTACT, ...SUMMARY, ...EXPERIENCE, ...SKILLS, ...EDUCATION])).score
  const withEmpty = analyze(ex([...CONTACT, ...SUMMARY, ...EXPERIENCE, ...SKILLS, ...EDUCATION, 'ACHIEVEMENTS', 'PROJECTS', 'CERTIFICATIONS'])).score
  assert.equal(withEmpty, without)
})

test('adding a year to weak sentences does not raise the writing-style score', () => {
  const weak = Array.from({ length: 5 }, () => 'Responsible for managing various projects.')
  const dated = weak.map((l) => l.replace('.', ' in 2025.'))
  assert.ok(analyzeStyle(dated.join('\n'), dated).score <= analyzeStyle(weak.join('\n'), weak).score)
})
