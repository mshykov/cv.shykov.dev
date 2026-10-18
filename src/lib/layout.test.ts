import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeLayout, type PageBox } from './layout.ts'
import type { TextPiece } from './lines.ts'

const A4: PageBox = { width: 595, height: 842 }
const piece = (text: string, x: number, y: number, page = 1): TextPiece => ({ text, x, y, w: text.length * 5, bold: false, page })

/** One column: headings at x=40, bullets indented to x=55, dates right-aligned. */
function singleColumn(page = 1): TextPiece[] {
  const out: TextPiece[] = []
  let y = 760
  for (let role = 0; role < 4; role++) {
    out.push(piece(`Engineering Manager at Company ${role}`, 40, y, page), piece(`Jan 20${10 + role} – Dec 20${12 + role}`, 595 - 40 - 80, y, page))
    y -= 18
    for (let b = 0; b < 3; b++) {
      out.push(piece(`• Led a team of ${b + 5} engineers and cut costs by ${b + 10}% across the company`, 55, y, page))
      y -= 16
    }
    y -= 10
  }
  return out
}

/** A sidebar: skills and languages in a narrow column on the right of the main text. */
function withSidebar(): TextPiece[] {
  const out = singleColumn()
  const items = ['Python', 'Go', 'Kotlin', 'Leadership', 'Hiring', 'Agile', 'English', 'Ukrainian']
  items.forEach((t, i) => out.push(piece(t, 440, 760 - i * 34)))
  return out
}

/** Three aligned columns, like a table: role, company, years. */
function threeColumns(): TextPiece[] {
  const out: TextPiece[] = []
  for (let i = 0; i < 8; i++) {
    const y = 760 - i * 20
    out.push(piece(`Role number ${i}`, 40, y), piece(`Company ${i}`, 230, y), piece(`Team ${i}`, 420, y))
  }
  return out
}

test('an ordinary one-column CV, with right-aligned dates and bullets, is not flagged', () => {
  const r = analyzeLayout(singleColumn(), [A4])
  assert.deepEqual(r, { columns: false, table: false, headerContact: false })
})

test('a sidebar next to the main text is flagged as columns', () => {
  const r = analyzeLayout(withSidebar(), [A4])
  assert.equal(r.columns, true)
  assert.equal(r.table, false)
})

test('three aligned columns are flagged as a table', () => {
  const r = analyzeLayout(threeColumns(), [A4])
  assert.equal(r.columns, true)
  assert.equal(r.table, true)
})

test('a few stray aligned segments are not a layout', () => {
  const stray = [...singleColumn(), piece('English', 440, 700), piece('Ukrainian', 440, 680)]
  assert.equal(analyzeLayout(stray, [A4]).columns, false)
})

const header = (page: number) => piece('jane@example.com  +1 555 123 4567', 40, 820, page)

test('contact details only in a header that repeats on every page are flagged', () => {
  const pieces = [header(1), header(2), ...singleColumn(1), ...singleColumn(2)]
  assert.equal(analyzeLayout(pieces, [A4, A4]).headerContact, true)
})

test('contact details also present in the body are not flagged', () => {
  const body = piece('Reach me: jane@example.com or +1 555 123 4567', 40, 790, 1)
  const pieces = [header(1), header(2), body, ...singleColumn(1), ...singleColumn(2)]
  assert.equal(analyzeLayout(pieces, [A4, A4]).headerContact, false)
})

test('a one-page CV cannot show a repeating header, so it is never flagged for it', () => {
  assert.equal(analyzeLayout([header(1), ...singleColumn(1)], [A4]).headerContact, false)
})

test('a contact line at the top of page one only (not repeated) is not flagged', () => {
  assert.equal(analyzeLayout([header(1), ...singleColumn(1), ...singleColumn(2)], [A4, A4]).headerContact, false)
})

test('missing geometry is handled without throwing', () => {
  assert.deepEqual(analyzeLayout([], []), { columns: false, table: false, headerContact: false })
  assert.doesNotThrow(() => analyzeLayout(singleColumn(), []))
})
