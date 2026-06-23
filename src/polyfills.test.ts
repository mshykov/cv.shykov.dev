import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withResolvers } from './polyfills.ts'

test('withResolvers resolves like a real Promise', async () => {
  const { promise, resolve } = withResolvers<number>()
  resolve(42)
  assert.equal(await promise, 42)
})

test('withResolvers rejects like a real Promise', async () => {
  const { promise, reject } = withResolvers<number>()
  reject(new Error('boom'))
  await assert.rejects(promise, /boom/)
})
