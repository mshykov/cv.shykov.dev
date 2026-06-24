// ATS scoring engine — runs entirely in the browser on extracted PDF text.
//
// The checks distill what real resume parsers (and the open-source ones this
// tool was modeled on) actually key off: machine-readable text, clean
// encoding, standard section headers, parseable contact info, sane structure,
// and quantified content. Every check is transparent and explains its fix.
import type { Extracted } from './pdf'
import { hasDate, isBulletLine, normalizeHeader, stripBullet } from './text.ts'

export type Status = 'pass' | 'warn' | 'fail'

export interface Check {
  id: string
  label: string
  category: string
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

const LIGATURES = /[ﬀ-ﬆ]/ // ﬀ ﬁ ﬂ ﬃ ﬄ ﬅ ﬆ

const SECTION_KEYWORDS: Record<string, string[]> = {
  experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience'],
  education: ['education', 'academic background'],
  skills: ['skills', 'core competencies', 'technical skills', 'expertise'],
  summary: ['summary', 'profile', 'objective', 'about me', 'about'],
}

const ACTION_VERBS = [
  'led', 'managed', 'built', 'shipped', 'delivered', 'improved', 'reduced',
  'increased', 'launched', 'created', 'developed', 'designed', 'implemented',
  'drove', 'owned', 'established', 'hired', 'mentored', 'partnered',
  'streamlined', 'optimized', 'spearheaded', 'architected', 'scaled',
  'coordinated', 'analyzed', 'automated', 'migrated', 'negotiated',
]

function hasHeader(lines: string[], keywords: string[]): boolean {
  return lines.some((l) => {
    const t = l.trim()
    if (!t || t.length > 45) return false // headers are short lines
    const norm = normalizeHeader(t)
    return keywords.some((k) => norm === k || norm.startsWith(k + ' ') || norm.endsWith(' ' + k) || norm.includes(k))
  })
}

function detectPhone(text: string): boolean {
  const m = text.match(/(?:\+?\d[\s\-().]?){9,}/g)
  if (!m) return false
  return m.some((cand) => {
    const digits = cand.replace(/\D/g, '')
    return digits.length >= 9 && digits.length <= 15
  })
}

export function analyze(ex: Extracted): Report {
  const { text, lines, numPages, charCount, source } = ex
  const words = text.split(/\s+/).filter(Boolean).length
  const checks: Check[] = []
  const add = (c: Check) => checks.push(c)

  // ── Parseability ─────────────────────────────────────────────
  if (charCount >= 300) {
    add({ id: 'machine-text', label: 'Machine-readable text', category: 'Parseability', status: 'pass', points: 15, max: 15, detail: `Extracted ${charCount.toLocaleString()} characters of selectable text.` })
  } else if (charCount >= 50) {
    add({ id: 'machine-text', label: 'Machine-readable text', category: 'Parseability', status: 'warn', points: 7, max: 15, detail: `Only ${charCount} characters extracted — parts may be images.`, fix: 'Export from your editor as text-based PDF (not “print to image” or a scan).' })
  } else {
    add({ id: 'machine-text', label: 'Machine-readable text', category: 'Parseability', status: 'fail', points: 0, max: 15, detail: 'Almost no selectable text — this looks like a scanned image.', fix: 'An ATS reads text, not pictures. Re-export a real text-based PDF from Word/Docs/Pages.' })
  }

  const lig = LIGATURES.test(text)
  const cid = text.includes('(cid:')
  if (!lig && !cid) {
    add({ id: 'encoding', label: 'Clean text encoding', category: 'Parseability', status: 'pass', points: 10, max: 10, detail: 'No ligature glyphs or broken character codes detected.' })
  } else {
    add({ id: 'encoding', label: 'Clean text encoding', category: 'Parseability', status: 'fail', points: 0, max: 10, detail: lig ? 'Ligature glyphs found (e.g. “ﬁ”, “ﬂ”) — keyword search for words like “fintech”/“significant” will miss them.' : 'Broken character codes “(cid:…)” found in the text stream.', fix: 'Disable OpenType ligatures, or re-export with a standard font (Helvetica/Arial/Calibri).' })
  }

  // ── Contact ──────────────────────────────────────────────────
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)
  add({ id: 'email', label: 'Email address', category: 'Contact', status: hasEmail ? 'pass' : 'fail', points: hasEmail ? 5 : 0, max: 5, detail: hasEmail ? 'Email found.' : 'No email address detected.', fix: hasEmail ? undefined : 'Add your email as plain text near the top.' })

  const hasPhone = detectPhone(text)
  add({ id: 'phone', label: 'Phone number', category: 'Contact', status: hasPhone ? 'pass' : 'warn', points: hasPhone ? 5 : 0, max: 5, detail: hasPhone ? 'Phone number found.' : 'No phone number detected.', fix: hasPhone ? undefined : 'Add a phone number as plain text (include country code, e.g. +44…).' })

  const hasUrl = /(linkedin\.com\/\S+|github\.com\/\S+|https?:\/\/\S+|[a-z0-9-]+\.(dev|io|me|com|net|org)\/\S*)/i.test(text)
  add({ id: 'links', label: 'LinkedIn / website link', category: 'Contact', status: hasUrl ? 'pass' : 'warn', points: hasUrl ? 5 : 0, max: 5, detail: hasUrl ? 'A profile or website link is present.' : 'No LinkedIn/website link found.', fix: hasUrl ? undefined : 'Add the full URL as text (e.g. linkedin.com/in/you) — parsers read text, not the link target.' })

  // ── Sections ─────────────────────────────────────────────────
  const sec = (id: string, label: string, max: number, keys: string[], essential: boolean) => {
    const ok = hasHeader(lines, keys)
    add({ id, label, category: 'Sections', status: ok ? 'pass' : essential ? 'fail' : 'warn', points: ok ? max : 0, max, detail: ok ? `“${label}” section detected.` : `No “${label}” section header found.`, fix: ok ? undefined : `Add a clearly labeled ${label} section. Use a standard, ideally UPPERCASE, header.` })
  }
  sec('sec-exp', 'Experience', 8, SECTION_KEYWORDS.experience, true)
  sec('sec-edu', 'Education', 6, SECTION_KEYWORDS.education, true)
  sec('sec-skills', 'Skills', 6, SECTION_KEYWORDS.skills, true)
  sec('sec-summary', 'Summary', 5, SECTION_KEYWORDS.summary, false)

  const achievements = hasHeader(lines, ['achievements', 'key achievements', 'accomplishments', 'highlights'])
  const projects = hasHeader(lines, ['projects', 'selected projects', 'side projects'])
  const certs = hasHeader(lines, ['certifications', 'certificates', 'courses', 'licenses', 'certifications & courses'])
  const bonusPts = (achievements ? 4 : 0) + (projects ? 3 : 0) + (certs ? 3 : 0)
  const bonusFound = [achievements && 'Achievements', projects && 'Projects', certs && 'Certifications'].filter(Boolean)
  add({ id: 'sec-bonus', label: 'Achievements / Projects / Certifications', category: 'Sections', status: bonusPts >= 7 ? 'pass' : bonusPts > 0 ? 'warn' : 'warn', points: bonusPts, max: 10, detail: bonusFound.length ? `Found: ${bonusFound.join(', ')}.` : 'None of these supporting sections were found.', fix: bonusPts >= 7 ? undefined : 'Add the missing sections (Key Achievements is highest-value — recruiters scan it first).' })

  // ── Format ───────────────────────────────────────────────────
  if (source === 'docx' || numPages === 0) {
    add({ id: 'pages', label: 'Page count', category: 'Format', status: 'pass', points: 5, max: 5, detail: 'Page count is not determinable from a DOCX — export to PDF to verify length (aim for 1–2).' })
  } else if (numPages <= 2) {
    add({ id: 'pages', label: 'Page count', category: 'Format', status: 'pass', points: 5, max: 5, detail: `${numPages} page${numPages > 1 ? 's' : ''} — within the expected 1–2.` })
  } else if (numPages === 3) {
    add({ id: 'pages', label: 'Page count', category: 'Format', status: 'warn', points: 3, max: 5, detail: '3 pages — on the long side for most roles.', fix: 'Tighten older roles; aim for 2 pages unless you have 15+ years and deep history.' })
  } else {
    add({ id: 'pages', label: 'Page count', category: 'Format', status: 'fail', points: 0, max: 5, detail: `${numPages} pages — too long; later pages often go unread.`, fix: 'Cut to 1–2 pages of the most relevant, recent experience.' })
  }

  const hasDates = hasDate(text)
  add({ id: 'dates', label: 'Dated history', category: 'Format', status: hasDates ? 'pass' : 'warn', points: hasDates ? 5 : 0, max: 5, detail: hasDates ? 'Dates detected — timeline is parseable.' : 'No clear dates found.', fix: hasDates ? undefined : 'Add start/end dates (e.g. “Feb 2023 – now”) to each role.' })

  const bulletLines = lines.filter(isBulletLine).length
  add({ id: 'bullets', label: 'Bulleted structure', category: 'Format', status: bulletLines >= 3 ? 'pass' : 'warn', points: bulletLines >= 3 ? 5 : bulletLines > 0 ? 3 : 0, max: 5, detail: bulletLines >= 3 ? `${bulletLines} bullet lines detected.` : 'Few or no bullet points found.', fix: bulletLines >= 3 ? undefined : 'Use bullet points for responsibilities/achievements — easier to parse and to scan.' })

  // ── Content quality ──────────────────────────────────────────
  const quantified = (text.match(/\d+\s?%|[$€£]\s?\d|\b\d+(?:\.\d+)?\s?(?:x|×|k|m|bn|users|engineers|people|hours|days|weeks)\b/gi) || []).length
  add({ id: 'quant', label: 'Quantified impact', category: 'Content', status: quantified >= 3 ? 'pass' : quantified > 0 ? 'warn' : 'fail', points: quantified >= 3 ? 5 : quantified > 0 ? 3 : 0, max: 5, detail: quantified >= 3 ? `${quantified} quantified results found (%, ×, counts).` : quantified > 0 ? `Only ${quantified} quantified result(s).` : 'No numbers/metrics detected.', fix: quantified >= 3 ? undefined : 'Quantify impact: “cut release time 2.5×”, “grew the team to 14”, “−30% bugs”.' })

  const verbHits = lines.filter((l) => {
    const w = stripBullet(l).split(/\s+/)[0]?.toLowerCase()
    return w && ACTION_VERBS.includes(w)
  }).length
  add({ id: 'verbs', label: 'Strong action verbs', category: 'Content', status: verbHits >= 3 ? 'pass' : verbHits > 0 ? 'warn' : 'warn', points: verbHits >= 3 ? 5 : verbHits > 0 ? 3 : 0, max: 5, detail: verbHits >= 3 ? `${verbHits} bullets start with an action verb.` : 'Few bullets start with an action verb.', fix: verbHits >= 3 ? undefined : 'Start bullets with verbs: Led, Shipped, Reduced, Built, Owned…' })

  const score = Math.round(checks.reduce((s, c) => s + c.points, 0))
  const band =
    score >= 85 ? { label: 'Excellent — ATS-ready', tone: 'pass' as const } :
    score >= 70 ? { label: 'Good — a few fixes left', tone: 'pass' as const } :
    score >= 50 ? { label: 'Needs work', tone: 'warn' as const } :
    { label: 'Likely to be filtered out', tone: 'fail' as const }

  return { score, band, checks, meta: { numPages, charCount, words } }
}
