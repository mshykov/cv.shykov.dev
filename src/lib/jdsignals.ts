// What a posting says that a keyword list cannot: whether it names one of your job
// titles, how many years of experience it asks for against what your dated roles
// span, and where the matched keywords sit in your CV. Pure functions, no model,
// nothing sent anywhere. All of it is a comparison of text, not a verdict.

import { fold } from './lang/index.ts'
import { equivalentsOf, wordRe } from './jdmatch.ts'

export interface TitleMatch {
  /** Whether the CV has any job title to compare. */
  checked: boolean
  /** The CV title (as written) that the posting contains, if any. */
  matched: string | null
}

/** A title may carry a team or a seniority after a separator ("Engineer, Platform"). */
function titleCandidates(title: string): string[] {
  const head = title.split(/[,(|/–—]|\s-\s/)[0]
  return [...new Set([title, head].map((t) => t.trim()).filter((t) => t.length >= 4 && /\p{L}/u.test(t)))]
}

/** The first of your titles that appears in the posting, longest first so "Senior Engineer" beats "Engineer". */
export function titleMatch(jd: string, titles: string[]): TitleMatch {
  const usable = titles.flatMap((title) => titleCandidates(title).map((candidate) => ({ title, candidate })))
  if (usable.length === 0) return { checked: false, matched: null }
  const folded = fold(jd)
  const hit = [...usable]
    .sort((a, b) => b.candidate.length - a.candidate.length)
    .find(({ candidate }) => wordRe(fold(candidate)).test(folded))
  return { checked: true, matched: hit ? hit.title : null }
}

// "5+ years", "3-5 yrs", "8 років", "5 años", "5 anos", "5 ans", "8 Jahre". The number counts
// only in a sentence that talks about experience, so "founded 10 years ago" and "2 years
// warranty" are not read as requirements.
const YEARS_RE = /(\d{1,2})\s*\+?(?:\s*(?:-|–|to|до)\s*\d{1,2}\s*\+?)?\s*(?:years?|yrs?|рок(?:и|ів|у)|рік|років|años|anos|ans|jahre[n]?)(?![\p{L}])/giu
const EXPERIENCE_WORD_RE = /experience|досвід|experiencia|experiência|expérience|erfahrung/i
// A heading that opens the list of requirements: bullets under it are requirements even when
// the word "experience" is not in the line ("- 8+ years in software").
const REQUIREMENTS_HEADING_RE = /\b(?:requirements?|qualifications|must[- ]have|minimum|you will need|what you.ll need|you have|вимоги|кваліфікація|requisitos|requisiti|anforderungen|exigences|profil recherché)\b/i
// Where a number of years is a fact about the company or a product, not a requirement.
const NOT_A_REQUIREMENT_RE = /\b(?:ago|warranty|guarantee|old|since|гарантія|garantía|garantie)\b/i

/** The largest number of years a posting asks for, or null. Counts a line that talks about experience, or sits under a requirements heading. */
export function yearsAsked(jd: string): number | null {
  let best: number | null = null
  let inRequirements = false
  for (const raw of jd.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const heading = line.length <= 40 && !/[.;:]$/.test(line) && !/\d/.test(line)
    if (heading) inRequirements = REQUIREMENTS_HEADING_RE.test(line)
    for (const sentence of line.split(/[.!?;]+/)) {
      if (NOT_A_REQUIREMENT_RE.test(sentence)) continue
      if (!inRequirements && !EXPERIENCE_WORD_RE.test(sentence)) continue
      for (const match of sentence.matchAll(YEARS_RE)) {
        const n = Number(match[1])
        if (n > 0 && n <= 40 && (best === null || n > best)) best = n
      }
    }
  }
  return best
}

const YEAR_RE = /\b(?:19|20)\d{2}\b/g

/** Years from the earliest dated role to `now`, or null when no role carries a four-digit year. */
export function yearsSpanned(dates: string[], now: number): number | null {
  const years = dates.flatMap((d) => d.match(YEAR_RE) ?? []).map(Number).filter((y) => y <= now)
  if (years.length === 0) return null
  return Math.max(0, now - Math.min(...years))
}

export interface Segment {
  text: string
  hit: boolean
}

/** Terms to look for in the CV for one keyword: the keyword and its listed equivalents. */
export const variantsOf = (term: string): string[] => [term, ...equivalentsOf(term)]

const escapeRe = (s: string) => s.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)

/**
 * Splits `text` into plain and highlighted segments. Matching is accent- and case-folded
 * (so "gestión" meets "gestion"); offsets are mapped back to the original text, which is
 * what gets rendered.
 */
export function highlight(text: string, terms: string[]): Segment[] {
  const chars = [...text]
  const owner: number[] = []
  let folded = ''
  chars.forEach((ch, i) => {
    const f = fold(ch)
    for (let k = 0; k < f.length; k++) owner.push(i)
    folded += f
  })

  const alternatives = [...new Set(terms.map((t) => fold(t).trim()).filter(Boolean))].sort((a, b) => b.length - a.length)
  if (alternatives.length === 0 || folded.length === 0) return [{ text, hit: false }]
  const re = new RegExp(String.raw`(^|[^\p{L}\p{N}])(${alternatives.map(escapeRe).join('|')})(?![\p{L}\p{N}])`, 'giu')

  const ranges: [number, number][] = []
  for (const m of folded.matchAll(re)) {
    const start = (m.index ?? 0) + m[1].length
    const end = start + m[2].length
    ranges.push([owner[start], owner[end - 1] + 1])
  }

  const segments: Segment[] = []
  let cursor = 0
  for (const [from, to] of ranges) {
    if (from < cursor) continue
    if (from > cursor) segments.push({ text: chars.slice(cursor, from).join(''), hit: false })
    segments.push({ text: chars.slice(from, to).join(''), hit: true })
    cursor = to
  }
  if (cursor < chars.length) segments.push({ text: chars.slice(cursor).join(''), hit: false })
  return segments
}
