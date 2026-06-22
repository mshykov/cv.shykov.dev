import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchJD } from './jdmatch.ts'

test('coverage is bounded and surfaces matched vs missing skills', () => {
  const cv = 'Engineering Manager. Led teams. JavaScript, CI/CD, hiring, agile delivery.'
  const skills = ['JavaScript', 'CI/CD', 'Hiring', 'Agile']
  const jd =
    'We need an Engineering Manager strong in agile and CI/CD, plus Kubernetes and AWS. Hiring and leadership a must.'
  const m = matchJD(cv, skills, jd)

  assert.ok(m.coverage >= 0 && m.coverage <= 100)
  assert.equal(m.matched.length + m.missing.length, m.total)
  assert.ok(m.matched.some((k) => /ci\/cd|agile|hiring/i.test(k.term)), 'should match present skills')
  assert.ok(m.missing.some((k) => /kubernetes|aws/i.test(k.term)), 'should flag absent skills')
})

test('an empty/irrelevant CV against a rich JD has low coverage', () => {
  const m = matchJD('hello world', [], 'Senior Go engineer: Kubernetes, AWS, Terraform, microservices, gRPC.')
  assert.ok(m.coverage < 50, `expected low coverage, got ${m.coverage}`)
})
