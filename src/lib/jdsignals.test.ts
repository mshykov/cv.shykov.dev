import { test } from 'node:test'
import assert from 'node:assert/strict'
import { highlight, titleMatch, variantsOf, yearsAsked, yearsSpanned } from './jdsignals.ts'

test('a job title that the posting contains is found, ignoring case and accents', () => {
  const jd = 'We are hiring a Senior ENGINEERING Manager to lead the platform group.'
  assert.equal(titleMatch(jd, ['Engineering Manager', 'QA Engineer']).matched, 'Engineering Manager')
  assert.equal(titleMatch('Se busca Gestor de Ingeniería', ['Gestor de Ingenieria']).matched, 'Gestor de Ingenieria')
})

test('no title in the posting is reported as checked but unmatched; no titles means nothing to check', () => {
  assert.deepEqual(titleMatch('We need a Go developer.', ['Engineering Manager']), { checked: true, matched: null })
  assert.deepEqual(titleMatch('anything', []), { checked: false, matched: null })
  assert.deepEqual(titleMatch('anything', ['  ']), { checked: false, matched: null })
})

test('the head of a title with a team after a comma still matches', () => {
  assert.equal(titleMatch('Looking for a Staff Engineer.', ['Staff Engineer, Platform']).matched, 'Staff Engineer, Platform')
})

test('a title must be a whole phrase: "manager" inside another word does not match', () => {
  assert.equal(titleMatch('We value management skills.', ['Manager']).matched, null)
})

test('years asked are read in experience sentences, in several languages', () => {
  assert.equal(yearsAsked('Requirements: 8+ years of experience in software, 3+ years managing engineers.'), 8)
  assert.equal(yearsAsked('3-5 years of relevant experience required'), 3)
  assert.equal(yearsAsked('Від 5 років досвіду у розробці'), 5)
  assert.equal(yearsAsked('Se requieren 6 años de experiencia'), 6)
  assert.equal(yearsAsked('Mindestens 7 Jahre Erfahrung'), 7)
})

test('years listed under a requirements heading count even without the word "experience"', () => {
  const jd = ['About us', 'We were founded 12 years ago.', 'Requirements', '- 8+ years in software, 3+ years managing engineers', '- Kubernetes in production', 'Benefits', '- 2 years of free coffee'].join('\n')
  assert.equal(yearsAsked(jd), 8)
})

test('a company age or a warranty under requirements is still not a requirement', () => {
  assert.equal(yearsAsked(['Requirements', '- Join a company that is 12 years old', '- 2 years warranty on your laptop'].join('\n')), null)
})

test('years that are not an experience requirement are ignored', () => {
  assert.equal(yearsAsked('Founded 12 years ago, we ship fast. 2 years warranty on devices.'), null)
  assert.equal(yearsAsked('No numbers here.'), null)
})

test('years spanned run from the earliest dated role to now, and null without a four-digit year', () => {
  assert.equal(yearsSpanned(['Jan 2016 – Dec 2019', 'Jan 2020 – now'], 2026), 10)
  assert.equal(yearsSpanned(['січ 22 – наразі'], 2026), null)
  assert.equal(yearsSpanned([], 2026), null)
  assert.equal(yearsSpanned(['2030 – 2031'], 2026), null)
})

test('highlight marks whole words only and maps back to the original text', () => {
  const segs = highlight('Led Kubernetes migrations; ran kubernetes clusters. Reacted to React.', ['kubernetes', 'react'])
  assert.deepEqual(segs.filter((s) => s.hit).map((s) => s.text), ['Kubernetes', 'kubernetes', 'React'])
  assert.equal(segs.map((s) => s.text).join(''), 'Led Kubernetes migrations; ran kubernetes clusters. Reacted to React.')
})

test('highlight folds accents and keeps them in the rendered text', () => {
  const segs = highlight('Experiencia en gestión de equipos', ['gestion'])
  assert.deepEqual(segs.filter((s) => s.hit).map((s) => s.text), ['gestión'])
  assert.equal(segs.map((s) => s.text).join(''), 'Experiencia en gestión de equipos')
})

test('highlight copes with characters that fold to more than one letter, and with empty input', () => {
  const segs = highlight('Straße and CI/CD pipelines', ['ci/cd'])
  assert.equal(segs.map((s) => s.text).join(''), 'Straße and CI/CD pipelines')
  assert.deepEqual(segs.filter((s) => s.hit).map((s) => s.text), ['CI/CD'])
  assert.deepEqual(highlight('', ['x']), [{ text: '', hit: false }])
  assert.deepEqual(highlight('plain', []), [{ text: 'plain', hit: false }])
})

test('a keyword is highlighted through its listed equivalents', () => {
  const segs = highlight('Own the CI/CD pipeline.', variantsOf('continuous integration'))
  assert.deepEqual(segs.filter((s) => s.hit).map((s) => s.text), ['CI/CD'])
})
