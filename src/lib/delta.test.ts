import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deltaBetween, snapshotOf } from './delta.ts'
import type { Report } from './analyze.ts'

const report = (score: number, checks: { category: string; points: number }[]) =>
  ({ score, band: { label: '', tone: 'pass' }, checks, meta: { numPages: 1, charCount: 0, words: 0 } }) as unknown as Report

test('a snapshot sums points per category', () => {
  const s = snapshotOf(report(80, [{ category: 'Contact', points: 5 }, { category: 'Contact', points: 5 }, { category: 'Format', points: 3 }]))
  assert.deepEqual(s, { score: 80, categories: { Contact: 10, Format: 3 } })
})

test('the change is next minus previous, overall and per category', () => {
  const before = snapshotOf(report(83, [{ category: 'Sections', points: 25 }, { category: 'Format', points: 15 }]))
  const after = snapshotOf(report(91, [{ category: 'Sections', points: 33 }, { category: 'Format', points: 15 }]))
  assert.deepEqual(deltaBetween(before, after), { previous: 83, change: 8, categories: { Sections: 8, Format: 0 } })
})

test('a drop is negative, and a category missing before counts from zero', () => {
  const before = snapshotOf(report(91, [{ category: 'Sections', points: 33 }]))
  const after = snapshotOf(report(86, [{ category: 'Sections', points: 28 }, { category: 'Content', points: 4 }]))
  const d = deltaBetween(before, after)
  assert.equal(d.change, -5)
  assert.deepEqual(d.categories, { Sections: -5, Content: 4 })
})

test('the same file twice is a zero change', () => {
  const s = snapshotOf(report(83, [{ category: 'Sections', points: 25 }]))
  assert.deepEqual(deltaBetween(s, s), { previous: 83, change: 0, categories: { Sections: 0 } })
})
