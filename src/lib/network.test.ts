import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeNetwork } from './network.ts'

const ORIGIN = 'https://cv.shykov.dev'
const e = (name: string, startTime: number, initiatorType = 'script') => ({ name, startTime, initiatorType })

test('counts only requests made after the mark', () => {
  const r = summarizeNetwork([e(`${ORIGIN}/a.js`, 5), e(`${ORIGIN}/b.js`, 50)], 10, ORIGIN)
  assert.deepEqual(r, { total: 1, otherOrigin: 0, data: 0 })
})

test('data: and blob: URLs are not network', () => {
  const r = summarizeNetwork([e('data:application/wasm;base64,AAAA', 20, 'fetch'), e('blob:https://cv.shykov.dev/xyz', 21, 'fetch')], 0, ORIGIN)
  assert.deepEqual(r, { total: 0, otherOrigin: 0, data: 0 })
})

test('a request to another origin is counted and reported', () => {
  const r = summarizeNetwork([e('https://www.googletagmanager.com/gtag.js', 20)], 0, ORIGIN)
  assert.equal(r.otherOrigin, 1)
  assert.equal(r.total, 1)
})

test('a same-origin fetch is a data request, a same-origin script is not', () => {
  const r = summarizeNetwork([e(`${ORIGIN}/chunk.js`, 20, 'script'), e(`${ORIGIN}/api`, 21, 'fetch'), e(`${ORIGIN}/t`, 22, 'beacon')], 0, ORIGIN)
  assert.deepEqual(r, { total: 3, otherOrigin: 0, data: 2 })
})

test('a malformed entry name is skipped, not thrown on', () => {
  assert.doesNotThrow(() => summarizeNetwork([e('http://', 20)], 0, ORIGIN))
})
