import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeStyle } from './style.ts'
import type { StyleSignal } from './style.ts'

function run(lines: string[]) {
  return analyzeStyle(lines.join('\n'), lines)
}

function signal(report: ReturnType<typeof run>, id: string): StyleSignal {
  const found = report.signals.find((s) => s.id === id)
  assert.ok(found, `expected a "${id}" signal`)
  return found
}

// Varied rhythm, concrete numbers, no stock phrases, active voice.
const CLEAN = [
  'Led a team of 8 engineers across backend and mobile.',
  'Cut release time 2.5x. Weekly releases became routine.',
  'Introduced integration testing at Setapp and bug count fell about 30%.',
  'Ran the interview stages behind 7 hires.',
  'Crash-free sessions rose from 96% to 99.5% over two quarters.',
  'Built an open-source CLI that reviews a git diff locally.',
]

test('clean copy scores well and reports no major signals', () => {
  const r = run(CLEAN)
  assert.ok(r.score >= 80, `expected >= 80, got ${r.score}`)
  assert.equal(r.signals.filter((s) => s.level === 'major').length, 0)
  assert.equal(r.band.tone, 'ok')
})

test('flags filler phrases and names them', () => {
  const r = run([
    'Results-driven professional with a proven track record of success.',
    'A detail-oriented team player passionate about cutting-edge technology.',
    'Utilized best-in-class tooling to deliver world-class outcomes.',
  ])
  const s = signal(r, 'filler')
  assert.equal(s.level, 'major')
  assert.ok(s.examples && s.examples.length > 0)
  assert.ok(s.fix)
})

test('flags claims that assert scale without a number', () => {
  const r = run([
    'Significantly improved the reliability of the platform overall.',
    'Substantially reduced the cost of running the infrastructure.',
    'Delivered numerous features across several different teams.',
  ])
  const s = signal(r, 'vague')
  assert.equal(s.level, 'major')
})

test('a scale word with a real figure is not flagged as vague', () => {
  const r = run([
    'Significantly improved reliability: crash-free sessions went from 96% to 99.5%.',
    'Reduced infrastructure cost by 30% across several services in one quarter.',
    'Shipped 12 features with the team over six months of steady delivery.',
  ])
  assert.equal(signal(r, 'vague').level, 'ok')
})

test('flags monotone sentence rhythm', () => {
  const line = 'The team delivered the project on time and within the agreed budget.'
  const r = run(Array.from({ length: 6 }, () => line))
  assert.equal(signal(r, 'rhythm').level, 'major')
})

test('flags repeated line openers', () => {
  const r = run([
    'Managed the delivery of the platform migration project.',
    'Managed a team of engineers across two separate products.',
    'Managed the release process and its associated tooling.',
    'Managed stakeholder communication throughout the programme.',
  ])
  const s = signal(r, 'openers')
  assert.equal(s.level, 'major')
  assert.ok(s.examples?.some((e) => e.includes('managed')))
})

test('flags heavy passive voice', () => {
  const r = run([
    'A recommendation system was implemented by the team last year.',
    'The release process was streamlined and was documented thoroughly.',
    'Test coverage was increased and defects were reduced considerably.',
    'The migration was completed and the results were reviewed.',
  ])
  assert.equal(signal(r, 'passive').level, 'major')
})

test('flags em-dash overuse', () => {
  const r = run([
    'Led the team — eight engineers — across backend and mobile — with good results.',
    'Cut release time — from monthly to weekly — which helped — a lot.',
  ])
  assert.equal(signal(r, 'punctuation').level, 'major')
})

test('score is bounded and never negative', () => {
  const awful = [
    'Results-driven professional — a proven track record — passionate about synergy.',
    'Results-driven professional — a proven track record — passionate about synergy.',
    'Significantly improved various things — numerous outcomes were delivered — moreover.',
    'Significantly improved various things — numerous outcomes were delivered — moreover.',
  ]
  const r = run(awful)
  assert.ok(r.score >= 0 && r.score <= 100, `score out of range: ${r.score}`)
})

test('short input does not produce confident verdicts', () => {
  const r = run(['Engineering manager.'])
  for (const id of ['rhythm', 'passive', 'vocabulary']) {
    assert.equal(signal(r, id).level, 'ok', `${id} should stay neutral on tiny input`)
  }
})

test('empty input is handled without throwing', () => {
  const r = analyzeStyle('', [])
  assert.equal(r.meta.words, 0)
  assert.ok(r.score >= 0 && r.score <= 100)
})

test('every non-ok signal carries an actionable fix', () => {
  const r = run([
    'Results-driven professional with a proven track record of success.',
    'Significantly improved various things across numerous teams.',
    'The work was completed and the goals were achieved.',
  ])
  for (const s of r.signals) {
    if (s.level !== 'ok') assert.ok(s.fix, `signal "${s.id}" is ${s.level} but has no fix`)
  }
})

test('job-title rows do not drive the repeated-opener signal', () => {
  // Role headings repeat the discipline name and carry dates. They are headings,
  // not bullets, so advice about "how bullets begin" must not fire on them.
  const r = run([
    'QA Engineer — MacPaw (Setapp) Jul 2019 – Mar 2020 Kyiv, Ukraine',
    'QA Engineer — Samsung R&D Center Jan 2012 – Apr 2013 Kyiv, Ukraine',
    'QA Engineer — Alfa Bank Ukraine Oct 2010 – Dec 2011 Kyiv, Ukraine',
    'QA Engineer — InformSAN Mar 2010 – Oct 2010 Kyiv, Ukraine',
    'Introduced integration testing and bug count fell about 30% that year.',
    'Rebuilt the release process so weekly releases became routine for everyone.',
  ])
  assert.equal(signal(r, 'openers').level, 'ok')
})
