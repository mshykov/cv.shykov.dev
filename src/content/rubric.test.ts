import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze } from '../lib/analyze.ts'
import { RUBRIC } from './rubric.ts'
import { en } from '../i18n/messages/en.ts'

// The guides publish RUBRIC as "exactly how the score is built". If a check is
// added, removed, renamed or re-weighted in analyze.ts, this fails until the
// published table is updated to match.
test('the published rubric matches the checks the scorer actually runs', () => {
  const { checks } = analyze({ pieces: [], lines: [], text: '', numPages: 1, charCount: 0, source: 'pdf' }, en.analysis)
  const actual = checks.map(({ id, category, label, max }) => ({ id, category, label, max }))
  assert.deepEqual(actual, RUBRIC)
})

test('the published rubric adds up to 100', () => {
  assert.equal(RUBRIC.reduce((sum, row) => sum + row.max, 0), 100)
})
