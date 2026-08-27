import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toMarkdown } from './report.ts'
import type { Report } from './analyze.ts'
import type { Resume } from './parse.ts'
import type { JDMatch } from './jdmatch.ts'

const report: Report = {
  score: 83,
  band: { label: 'Good — a few fixes left', tone: 'pass' },
  meta: { numPages: 2, charCount: 5286, words: 1234 },
  checks: [
    { id: 'email', label: 'Email address', category: 'Contact', status: 'pass', points: 5, max: 5, detail: 'Email found.' },
    { id: 'phone', label: 'Phone number', category: 'Contact', status: 'warn', points: 0, max: 5, detail: 'No phone number detected.', fix: 'Add a phone number as plain text.' },
    { id: 'dates', label: 'Dated history', category: 'Format', status: 'pass', points: 5, max: 5, detail: 'Dates detected.' },
  ],
}

const resume: Resume = {
  profile: { name: 'Jane Doe', email: 'jane@example.com', phone: '', location: 'Madrid, Spain', links: ['linkedin.com/in/jane'], summary: 'Engineering manager.' },
  experience: [], education: [], skills: ['kotlin'], projects: [],
}

test('leads with the file name, score and band', () => {
  const md = toMarkdown('cv.pdf', report, resume)
  assert.match(md, /^# CV ATS Report — cv\.pdf$/m)
  assert.match(md, /\*\*Score: 83\/100 — Good — a few fixes left\*\*/)
})

test('totals each category from its own checks', () => {
  const md = toMarkdown('cv.pdf', report, resume)
  assert.match(md, /^## Contact — 5\/10$/m)
  assert.match(md, /^## Format — 5\/5$/m)
})

test('renders a fix only for the checks that carry one', () => {
  const md = toMarkdown('cv.pdf', report, resume)
  assert.match(md, /_Fix:_ Add a phone number as plain text\./)
  assert.equal(md.match(/_Fix:_/g)?.length, 1)
})

test('marks each check with its status glyph', () => {
  const md = toMarkdown('cv.pdf', report, resume)
  assert.match(md, /- ✅ \*\*Email address\*\* \(5\/5\)/)
  assert.match(md, /- ⚠️ \*\*Phone number\*\* \(0\/5\)/)
})

test('omits the job-description section when there was no match run', () => {
  assert.equal(toMarkdown('cv.pdf', report, resume).includes('Job-description match'), false)
})

test('includes coverage and missing keywords when a match ran', () => {
  const jd: JDMatch = {
    coverage: 60,
    total: 5,
    matched: [{ term: 'kotlin', weight: 1 }, { term: 'ci/cd', weight: 1 }, { term: 'testing', weight: 1 }] as JDMatch['matched'],
    missing: [{ term: 'kafka', weight: 1 }, { term: 'scala', weight: 1 }] as JDMatch['missing'],
  }
  const md = toMarkdown('cv.pdf', report, resume, jd)
  assert.match(md, /## Job-description match — 60% coverage/)
  assert.match(md, /Matched 3\/5 emphasized keywords\./)
  assert.match(md, /`kafka`, `scala`/)
})

test('a full match reports no missing-keyword list', () => {
  const jd: JDMatch = { coverage: 100, total: 2, matched: [{ term: 'kotlin', weight: 1 }, { term: 'ci/cd', weight: 1 }] as JDMatch['matched'], missing: [] }
  const md = toMarkdown('cv.pdf', report, resume, jd)
  assert.match(md, /100% coverage/)
  assert.equal(md.includes('Missing keywords'), false)
})

test('renders an em dash for every profile field the parser could not fill', () => {
  const md = toMarkdown('cv.pdf', report, resume)
  assert.match(md, /- \*\*Phone:\*\* —/)
  assert.match(md, /- \*\*Name:\*\* Jane Doe/)
  assert.match(md, /- \*\*Links:\*\* linkedin\.com\/in\/jane/)
})

// DOCX carries no page count, and 0 must not print as "0 pages".
test('an unknown page count prints as an em dash', () => {
  const docx: Report = { ...report, meta: { ...report.meta, numPages: 0 } }
  assert.match(toMarkdown('cv.docx', docx, resume), /^— pages · /m)
})

test('closes with the local-generation notice', () => {
  assert.match(toMarkdown('cv.pdf', report, resume), /Generated locally by cv\.shykov\.dev/)
})
