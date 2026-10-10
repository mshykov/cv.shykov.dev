import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sampleState, synthExtracted } from './model.ts'
import { analyze } from '../lib/analyze.ts'
import { en } from '../i18n/messages/en.ts'

const SAMPLE = sampleState(en.builder.sample)
const TITLES = en.builder.docSections

test('synthExtracted emits UPPERCASE section headers for live scoring', () => {
  const ex = synthExtracted(SAMPLE, TITLES)
  assert.ok(ex.lines.includes(TITLES.experience.toUpperCase()))
  assert.ok(ex.lines.includes(TITLES.skills.toUpperCase()))
})

test('the builder sample produces a meaningfully scorable document', () => {
  const r = analyze(synthExtracted(SAMPLE, TITLES), en.analysis)
  assert.ok(r.score > 50, `expected >50, got ${r.score}`)
})
