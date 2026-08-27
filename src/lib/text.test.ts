import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findDate, hasDate, isBulletLine, normalizeHeader, stripBullet } from './text.ts'

test('finds a month-year date', () => {
  assert.equal(hasDate('Engineering Manager — Headway Feb 2025 – now'), true)
  assert.equal(hasDate('Apr 2013 – Jul 2019'), true)
  assert.equal(hasDate('September 2021'), true)
})

test('finds a bare four-digit year', () => {
  assert.equal(hasDate('MSc Computer Science, 2009'), true)
})

test('treats present/current/now as a date', () => {
  assert.equal(hasDate('Engineering Manager, present'), true)
})

test('reports no date when there is none', () => {
  assert.equal(hasDate('Led a team of eight engineers'), false)
  assert.equal(hasDate(''), false)
})

// Regression: MONTH_YEAR_RE used exec(), which returns only the first
// word+number pair. When that pair was not a month the whole line was reported
// as undated, costing the "Dated history" check and letting role headings leak
// into checks that filter dated lines out.
test('a month-year is still found after an earlier non-month word+number pair', () => {
  assert.equal(hasDate('Reduced latency 300 ms in Jan 24'), true)
  assert.equal(hasDate('Cut costs 30 percent since Mar 21'), true)
})

test('a word that merely looks like a month is not a date', () => {
  assert.equal(hasDate('Managed 12 people'), false)
  assert.equal(hasDate('Shipped 40 features'), false)
})

test('findDate returns the earliest date in the line', () => {
  const match = findDate('Present role since Mar 2021')
  assert.ok(match)
  assert.equal(match[0].toLowerCase().startsWith('present'), true)
})

test('strips a bullet glyph only when a space follows it', () => {
  assert.equal(stripBullet('• Led a team'), 'Led a team')
  assert.equal(stripBullet('- Shipped weekly'), 'Shipped weekly')
  assert.equal(stripBullet(' Cut release time'), 'Cut release time')
  // A leading minus that belongs to the number is not a bullet.
  assert.equal(stripBullet('-30% defects'), '-30% defects')
})

test('isBulletLine agrees with stripBullet', () => {
  assert.equal(isBulletLine('• Led a team'), true)
  assert.equal(isBulletLine('Led a team'), false)
  assert.equal(isBulletLine('-30% defects'), false)
})

test('normalizeHeader lowercases and drops punctuation', () => {
  assert.equal(normalizeHeader('  WORK EXPERIENCE:  '), 'work experience')
  assert.equal(normalizeHeader('Education & Training'), 'education & training')
  assert.equal(normalizeHeader('Skills / Tools'), 'skills / tools')
})
