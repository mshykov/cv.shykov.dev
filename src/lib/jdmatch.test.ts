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

import { stem } from './jdmatch.ts'

test('stems meet each other: managing, managed, management', () => {
  assert.equal(stem('managing'), stem('management'))
  assert.equal(stem('managed'), stem('manage'))
  assert.notEqual(stem('react'), stem('reactor'))
  assert.equal(stem('java'), 'java')
  assert.notEqual(stem('javascript'), stem('java'))
})

test('a form of the same word counts as present', () => {
  const m = matchJD('Managed three teams and mentored juniors.', [], 'We want someone who can manage teams. Manage budgets. Manage hiring.')
  assert.ok(m.matched.some((k) => k.term === 'manage'), 'manage should be met by managed')
})

test('acronyms and their expansions meet each other, in both directions', () => {
  const a = matchJD('Led search engine optimization work.', [], 'Experience with SEO. SEO tooling required.')
  assert.ok(a.matched.some((k) => k.term === 'seo'))
  const b = matchJD('Own CI/CD pipelines.', [], 'Strong continuous integration practice. Continuous integration is key.')
  assert.ok(!b.missing.some((k) => k.term === 'continuous integration'), 'CI/CD should cover continuous integration')
})

test('an equivalence is not invented: go the verb is not Go the language', () => {
  const m = matchJD('Go to market planning.', [], 'Senior Golang engineer. Golang services. Golang tooling.')
  assert.ok(m.missing.some((k) => k.term === 'golang'))
})

test('a keyword listed only in Skills is told apart from one shown in an experience bullet', () => {
  const jd = 'We use Kubernetes and Terraform daily. Kubernetes, Terraform, Kubernetes, Terraform.'
  const m = matchJD('Skills Kubernetes Terraform. Ran Kubernetes clusters for 40 services.', ['Kubernetes', 'Terraform'], jd, { experienceText: 'Ran Kubernetes clusters for 40 services.' })
  assert.equal(m.matched.find((k) => k.term === 'kubernetes')?.where, 'experience')
  assert.equal(m.matched.find((k) => k.term === 'terraform')?.where, 'skills')
})

test('without experience text no evidence claim is made', () => {
  const m = matchJD('Kubernetes', ['Kubernetes'], 'Kubernetes Kubernetes')
  assert.equal(m.matched[0].where, undefined)
})

test('a keyword only under a nice-to-have heading is marked and weighs less', () => {
  const jd = ['Requirements', 'Python and SQL required. Python daily.', 'Nice to have', 'Rust experience is a plus. Rust.'].join('\n')
  const m = matchJD('hello', [], jd)
  const rust = [...m.matched, ...m.missing].find((k) => k.term === 'rust')
  const python = [...m.matched, ...m.missing].find((k) => k.term === 'python')
  assert.equal(rust?.priority, 'nice')
  assert.equal(python?.priority, undefined)
  assert.ok(rust && python && rust.weight <= python.weight)
})

test('a keyword mentioned both as required and as preferred stays a must-have', () => {
  const jd = ['Python is required.', 'Nice to have', 'Python, Docker.'].join('\n')
  const m = matchJD('hello', [], jd)
  assert.equal([...m.matched, ...m.missing].find((k) => k.term === 'python')?.priority, undefined)
})
