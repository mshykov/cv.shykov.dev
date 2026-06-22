import { test } from 'node:test'
import assert from 'node:assert/strict'
import { synthExtracted, SAMPLE } from './model.ts'
import { analyze } from '../lib/analyze.ts'

test('synthExtracted emits UPPERCASE section headers for live scoring', () => {
  const ex = synthExtracted(SAMPLE)
  assert.ok(ex.lines.includes('EXPERIENCE'))
  assert.ok(ex.lines.includes('SKILLS'))
})

test('the builder sample produces a meaningfully scorable document', () => {
  const r = analyze(synthExtracted(SAMPLE))
  assert.ok(r.score > 50, `expected >50, got ${r.score}`)
})
