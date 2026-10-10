// ATS scoring engine — runs entirely in the browser on extracted PDF text.
//
// The checks distill what real resume parsers (and the open-source ones this
// tool was modeled on) actually key off: machine-readable text, clean
// encoding, standard section headers, parseable contact info, sane structure,
// and quantified content. Every check is transparent and explains its fix.
import type { Extracted } from './pdf'
import { cleanContactToken, contactTokens, hasEmailAddress, hasPhoneNumber, hasProfileUrl } from './contact.ts'
import { hasDate, isBulletLine, normalizeHeader, stripBullet } from './text.ts'
import { BONUS_SECTION_KEYWORDS, SECTION_KEYWORDS } from './sections.ts'
import { ACTION_VERBS, IMPACT_UNITS, fold } from './lang/index.ts'
import type { Messages } from '../i18n/messages/en.ts'

/** The scorer's wording for one language. See src/i18n/messages/en.ts. */
export type AnalysisMessages = Messages['analysis']

/** Stable keys of the five groups; the display name comes from the messages. */
export type CategoryId = keyof AnalysisMessages['categories']

export type Status = 'pass' | 'warn' | 'fail'

export interface Check {
  id: keyof AnalysisMessages['labels']
  label: string
  category: CategoryId
  status: Status
  points: number
  max: number
  detail: string
  fix?: string
}

export interface Report {
  score: number
  band: { label: string; tone: Status }
  checks: Check[]
  meta: { numPages: number; charCount: number; words: number }
}

const STATUS_RANK: Record<Status, number> = { fail: 2, warn: 1, pass: 0 }

export function getTopFixes(report: Report, limit = 3): Check[] {
  return report.checks
    .filter((check) => check.status !== 'pass')
    .sort((a, b) => {
      const lost = (b.max - b.points) - (a.max - a.points)
      if (lost !== 0) return lost
      return STATUS_RANK[b.status] - STATUS_RANK[a.status]
    })
    .slice(0, limit)
}

const LIGATURES = /[ﬀ-ﬆ]/ // ﬀ ﬁ ﬂ ﬃ ﬄ ﬅ ﬆ

const CURRENCY_SYMBOLS = new Set(['$', '€', '£'])

function hasHeader(lines: string[], keywords: string[]): boolean {
  return lines.some((l) => {
    const t = l.trim()
    if (!t || t.length > 45) return false // headers are short lines
    const norm = normalizeHeader(t)
    // Whole words only: with six languages' headings, a substring match let
    // "Informations personnelles" pass as Education ("formation") and "Sprachkenntnisse" as Skills.
    const padded = ` ${norm} `
    return keywords.some((k) => padded.includes(` ${k} `))
  })
}

function linkDetail(m: AnalysisMessages, hasUrl: boolean, hasHiddenUrl: boolean): string {
  if (hasUrl) return m.links.present
  if (hasHiddenUrl) return m.links.hidden
  return m.links.missing
}

type AddCheck = (check: Check) => void

function addParseabilityChecks(add: AddCheck, m: AnalysisMessages, text: string, charCount: number) {
  const label = m.labels['machine-text']
  const chars = m.formatNumber(charCount)
  if (charCount >= 300) {
    add({ id: 'machine-text', label, category: 'Parseability', status: 'pass', points: 15, max: 15, detail: m.machineText.pass(chars) })
  } else if (charCount >= 50) {
    add({ id: 'machine-text', label, category: 'Parseability', status: 'warn', points: 7, max: 15, detail: m.machineText.warn(String(charCount)), fix: m.machineText.warnFix })
  } else {
    add({ id: 'machine-text', label, category: 'Parseability', status: 'fail', points: 0, max: 15, detail: m.machineText.fail, fix: m.machineText.failFix })
  }

  const lig = LIGATURES.test(text)
  const cid = text.includes('(cid:')
  const encodingLabel = m.labels.encoding
  if (!lig && !cid) {
    add({ id: 'encoding', label: encodingLabel, category: 'Parseability', status: 'pass', points: 10, max: 10, detail: m.encoding.pass })
    return
  }

  const detail = lig ? m.encoding.ligatures : m.encoding.cid
  add({ id: 'encoding', label: encodingLabel, category: 'Parseability', status: 'fail', points: 0, max: 10, detail, fix: m.encoding.fix })
}

function addContactChecks(add: AddCheck, m: AnalysisMessages, text: string, linkTargets: string[]) {
  const hasEmail = hasEmailAddress(text)
  add({ id: 'email', label: m.labels.email, category: 'Contact', status: hasEmail ? 'pass' : 'fail', points: hasEmail ? 5 : 0, max: 5, detail: hasEmail ? m.email.found : m.email.missing, fix: hasEmail ? undefined : m.email.fix })

  const hasPhone = hasPhoneNumber(text)
  add({ id: 'phone', label: m.labels.phone, category: 'Contact', status: hasPhone ? 'pass' : 'warn', points: hasPhone ? 5 : 0, max: 5, detail: hasPhone ? m.phone.found : m.phone.missing, fix: hasPhone ? undefined : m.phone.fix })

  const hasUrl = hasProfileUrl(text)
  const hasHiddenUrl = !hasUrl && linkTargets.some(hasProfileUrl)
  add({
    id: 'links',
    label: m.labels.links,
    category: 'Contact',
    status: hasUrl ? 'pass' : 'warn',
    points: hasUrl ? 5 : 0,
    max: 5,
    detail: linkDetail(m, hasUrl, hasHiddenUrl),
    fix: hasUrl ? undefined : m.links.fix,
  })
}

function missingSectionStatus(essential: boolean): Status {
  return essential ? 'fail' : 'warn'
}

function addSectionCheck(add: AddCheck, m: AnalysisMessages, lines: string[], id: 'sec-exp' | 'sec-edu' | 'sec-skills' | 'sec-summary', max: number, keys: string[], essential: boolean) {
  const label = m.labels[id]
  const ok = hasHeader(lines, keys)
  const status: Status = ok ? 'pass' : missingSectionStatus(essential)
  add({ id, label, category: 'Sections', status, points: ok ? max : 0, max, detail: ok ? m.section.detected(label) : m.section.missing(label), fix: ok ? undefined : m.section.fix(label) })
}

function addBonusSectionCheck(add: AddCheck, m: AnalysisMessages, lines: string[]) {
  const achievements = hasHeader(lines, BONUS_SECTION_KEYWORDS.achievements)
  const projects = hasHeader(lines, BONUS_SECTION_KEYWORDS.projects)
  const certs = hasHeader(lines, BONUS_SECTION_KEYWORDS.certifications)
  const bonusPts = (achievements ? 4 : 0) + (projects ? 3 : 0) + (certs ? 3 : 0)
  const bonusFound = [achievements && m.bonus.names.achievements, projects && m.bonus.names.projects, certs && m.bonus.names.certifications].filter(Boolean)
  add({ id: 'sec-bonus', label: m.labels['sec-bonus'], category: 'Sections', status: bonusPts >= 7 ? 'pass' : 'warn', points: bonusPts, max: 10, detail: bonusFound.length ? m.bonus.found(bonusFound.join(', ')) : m.bonus.none, fix: bonusPts >= 7 ? undefined : m.bonus.fix })
}

function addSectionChecks(add: AddCheck, m: AnalysisMessages, lines: string[]) {
  addSectionCheck(add, m, lines, 'sec-exp', 8, SECTION_KEYWORDS.experience, true)
  addSectionCheck(add, m, lines, 'sec-edu', 6, SECTION_KEYWORDS.education, true)
  addSectionCheck(add, m, lines, 'sec-skills', 6, SECTION_KEYWORDS.skills, true)
  addSectionCheck(add, m, lines, 'sec-summary', 5, SECTION_KEYWORDS.summary, false)
  addBonusSectionCheck(add, m, lines)
}

function addPageCountCheck(add: AddCheck, m: AnalysisMessages, source: Extracted['source'], numPages: number) {
  const label = m.labels.pages
  if (source === 'docx' || numPages === 0) {
    add({ id: 'pages', label, category: 'Format', status: 'pass', points: 5, max: 5, detail: m.pages.docx })
  } else if (numPages <= 2) {
    add({ id: 'pages', label, category: 'Format', status: 'pass', points: 5, max: 5, detail: m.pages.ok(numPages) })
  } else if (numPages === 3) {
    add({ id: 'pages', label, category: 'Format', status: 'warn', points: 3, max: 5, detail: m.pages.three, fix: m.pages.threeFix })
  } else {
    add({ id: 'pages', label, category: 'Format', status: 'fail', points: 0, max: 5, detail: m.pages.many(numPages), fix: m.pages.manyFix })
  }
}

function addFormatChecks(add: AddCheck, m: AnalysisMessages, ex: Extracted) {
  addPageCountCheck(add, m, ex.source, ex.numPages)

  const hasDates = hasDate(ex.text)
  add({ id: 'dates', label: m.labels.dates, category: 'Format', status: hasDates ? 'pass' : 'warn', points: hasDates ? 5 : 0, max: 5, detail: hasDates ? m.dates.found : m.dates.missing, fix: hasDates ? undefined : m.dates.fix })

  const bulletLines = ex.lines.filter(isBulletLine).length
  const bulletPoints = formatBulletPoints(bulletLines)
  add({ id: 'bullets', label: m.labels.bullets, category: 'Format', status: bulletLines >= 3 ? 'pass' : 'warn', points: bulletPoints, max: 5, detail: bulletLines >= 3 ? m.bullets.found(bulletLines) : m.bullets.missing, fix: bulletLines >= 3 ? undefined : m.bullets.fix })
}

function formatBulletPoints(bulletLines: number): number {
  if (bulletLines >= 3) return 5
  if (bulletLines > 0) return 3
  return 0
}

function quantifiedStatus(quantified: number): Status {
  if (quantified >= 3) return 'pass'
  if (quantified > 0) return 'warn'
  return 'fail'
}

function quantifiedPoints(quantified: number): number {
  if (quantified >= 3) return 5
  if (quantified > 0) return 3
  return 0
}

function quantifiedDetail(m: AnalysisMessages, quantified: number): string {
  if (quantified >= 3) return m.quant.many(quantified)
  if (quantified > 0) return m.quant.few(quantified)
  return m.quant.none
}

function verbPoints(verbHits: number): number {
  if (verbHits >= 3) return 5
  if (verbHits > 0) return 3
  return 0
}

function hasDigit(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (code >= 48 && code <= 57) return true
  }
  return false
}

function isNumericToken(value: string): boolean {
  let hasNumber = false
  let dotCount = 0

  for (const char of value) {
    if (char === '.') {
      dotCount += 1
      if (dotCount > 1) return false
      continue
    }

    const code = char.codePointAt(0) ?? 0
    if (code < 48 || code > 57) return false
    hasNumber = true
  }

  return hasNumber
}

function currencyMetric(token: string, nextToken: string): boolean {
  if (CURRENCY_SYMBOLS.has(token[0]) && hasDigit(token.slice(1))) return true
  return CURRENCY_SYMBOLS.has(token) && hasDigit(nextToken)
}

function percentMetric(token: string): boolean {
  return token.endsWith('%') && hasDigit(token.slice(0, -1))
}

function unitMetric(token: string, nextToken: string): boolean {
  if (isNumericToken(token)) return IMPACT_UNITS.has(nextToken)

  let splitAt = 0
  while (splitAt < token.length) {
    const char = token[splitAt]
    const code = char.codePointAt(0) ?? 0
    if ((code < 48 || code > 57) && char !== '.') break
    splitAt += 1
  }

  if (splitAt === 0 || splitAt === token.length) return false
  return isNumericToken(token.slice(0, splitAt)) && IMPACT_UNITS.has(token.slice(splitAt))
}

function countQuantifiedImpact(text: string): number {
  const tokens = contactTokens(text).map((token) => fold(cleanContactToken(token)))
  let count = 0

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token) continue

    const next = tokens[index + 1] ?? ''
    if (percentMetric(token) || currencyMetric(token, next) || unitMetric(token, next)) count += 1
  }

  return count
}

function addContentChecks(add: AddCheck, m: AnalysisMessages, text: string, lines: string[]) {
  const quantified = countQuantifiedImpact(text)
  add({ id: 'quant', label: m.labels.quant, category: 'Content', status: quantifiedStatus(quantified), points: quantifiedPoints(quantified), max: 5, detail: quantifiedDetail(m, quantified), fix: quantified >= 3 ? undefined : m.quant.fix })

  const verbHits = lines.filter((l) => {
    const w = fold(stripBullet(l).split(/\s+/)[0] ?? '')
    return Boolean(w && ACTION_VERBS.has(w))
  }).length
  add({ id: 'verbs', label: m.labels.verbs, category: 'Content', status: verbHits >= 3 ? 'pass' : 'warn', points: verbPoints(verbHits), max: 5, detail: verbHits >= 3 ? m.verbs.pass(verbHits) : m.verbs.warn, fix: verbHits >= 3 ? undefined : m.verbs.fix })
}

function scoreBand(m: AnalysisMessages, score: number): Report['band'] {
  if (score >= 85) return { label: m.bands.excellent, tone: 'pass' }
  if (score >= 70) return { label: m.bands.good, tone: 'pass' }
  if (score >= 50) return { label: m.bands.needsWork, tone: 'warn' }
  return { label: m.bands.filtered, tone: 'fail' }
}

export function analyze(ex: Extracted, m: AnalysisMessages): Report {
  const { text, lines, linkTargets = [], numPages, charCount, source } = ex
  const words = text.split(/\s+/).filter(Boolean).length
  const checks: Check[] = []
  const add = (c: Check) => checks.push(c)

  addParseabilityChecks(add, m, text, charCount)
  addContactChecks(add, m, text, linkTargets)
  addSectionChecks(add, m, lines)
  addFormatChecks(add, m, { ...ex, source, numPages })
  addContentChecks(add, m, text, lines)

  const score = Math.round(checks.reduce((s, c) => s + c.points, 0))
  return { score, band: scoreBand(m, score), checks, meta: { numPages, charCount, words } }
}
