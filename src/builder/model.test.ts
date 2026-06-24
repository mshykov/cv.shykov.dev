import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BUILDER_SECTION_TITLES, synthExtracted, SAMPLE } from './model.ts'
import { analyze } from '../lib/analyze.ts'

test('synthExtracted emits UPPERCASE section headers for live scoring', () => {
  const ex = synthExtracted(SAMPLE)
  assert.ok(ex.lines.includes(BUILDER_SECTION_TITLES.experience.toUpperCase()))
  assert.ok(ex.lines.includes(BUILDER_SECTION_TITLES.skills.toUpperCase()))
})

test('the builder sample produces a meaningfully scorable document', () => {
  const r = analyze(synthExtracted(SAMPLE))
  assert.ok(r.score > 50, `expected >50, got ${r.score}`)
})
