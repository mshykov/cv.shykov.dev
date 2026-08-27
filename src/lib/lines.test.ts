import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groupIntoLines, type TextPiece } from './lines.ts'

function piece(text: string, x: number, y: number, page = 1): TextPiece {
  return { text, x, y, w: text.length * 4, bold: false, page }
}

test('joins pieces that share a baseline, left to right', () => {
  assert.deepEqual(
    groupIntoLines([piece('team ', 90, 700), piece('Led a ', 60, 700), piece('of 8', 130, 700)]),
    ['Led a team of 8'],
  )
})

test('separates lines by baseline and reads top to bottom', () => {
  assert.deepEqual(
    groupIntoLines([piece('second', 60, 688), piece('first', 60, 700)]),
    ['first', 'second'],
  )
})

test('keeps pages in order and never merges across a page break', () => {
  // Same baseline on both pages: only the page number separates them.
  assert.deepEqual(
    groupIntoLines([piece('page two', 60, 700, 2), piece('page one', 60, 700, 1)]),
    ['page one', 'page two'],
  )
})

test('tolerates the small baseline shift a superscript introduces', () => {
  assert.deepEqual(
    groupIntoLines([piece('Revenue up 30%', 60, 700), piece('1', 150, 702.5)]),
    ['Revenue up 30%1'],
  )
})

// Regression: the tolerance used to be checked only against the PREVIOUS piece,
// so a run of small steps chained without limit. Six baselines 2.5pt apart are
// each within tolerance of their predecessor and collapsed into a single line
// 12.5pt tall, silently fusing six lines of a CV into one.
test('a run of small baseline steps does not chain into one line', () => {
  const drifting = [700, 697.5, 695, 692.5, 690, 687.5].map((y, i) => piece(`row ${i}`, 60, y))
  const lines = groupIntoLines(drifting)
  assert.ok(lines.length > 1, `expected the drift to be split, got ${JSON.stringify(lines)}`)
  assert.ok(
    lines.every((l) => !/row 0.*row 5/.test(l)),
    `first and last row must not share a line: ${JSON.stringify(lines)}`,
  )
})

test('drops pieces that carry no visible text', () => {
  assert.deepEqual(groupIntoLines([piece('   ', 60, 700), piece('real', 60, 688)]), ['real'])
})

test('collapses runs of whitespace inside a joined line', () => {
  assert.deepEqual(groupIntoLines([piece('Led   a', 60, 700), piece('  team', 100, 700)]), ['Led a team'])
})

test('handles an empty document', () => {
  assert.deepEqual(groupIntoLines([]), [])
})

test('does not mutate the caller array', () => {
  const input = [piece('b', 60, 688), piece('a', 60, 700)]
  const snapshot = input.map((p) => p.text)
  groupIntoLines(input)
  assert.deepEqual(input.map((p) => p.text), snapshot)
})
