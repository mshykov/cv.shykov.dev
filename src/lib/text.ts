import { MONTHS, ONGOING_PATTERN, fold, foldHeading } from './lang/index.ts'

// Month names of every supported language (see lang/*.ts), compared accent-folded.
// A word counts as a month only when a number follows it.
//
// Global on purpose: exec() returns only the FIRST word+number pair, and if that
// pair is not a month ("latency 300 ms in Jan 24") the real date was reported as
// absent. Scan every candidate instead. matchAll is safe with /g here — it walks
// an internal clone, so this shared regex keeps lastIndex at 0.
// Unicode letters, not [a-z]: "março 2021", "févr. 2022", "Mär 2020". The leading
// group stands in for a look-behind, which Safari < 16.4 lacks.
const MONTH_YEAR_RE = /(^|[^\p{L}\d])(\p{L}{3,9})\.?\s+(\d{2,4})(?![\p{L}\d])/giu
// Portuguese and Spanish abbreviations that are also English words ("out", "set",
// "ago"): a date only when followed by a full year, so "pulled out 30 people"
// does not read as October 2030.
const NEEDS_FULL_YEAR = new Set(['out', 'set', 'ago'])
// "03/2022", "3.2022": numeric month and year, the usual form on German CVs.
const NUMERIC_MONTH_YEAR_RE = /(^|[^\d./])((?:0?[1-9]|1[0-2])[./]\d{4})(?!\d)/g
const YEAR_RE = /\b(?:19|20)\d{2}\b/i
const RELATIVE_DATE_RE = new RegExp(`(^|[^\\p{L}])(${ONGOING_PATTERN})(?![\\p{L}])`, 'giu')

/** The matched date itself, without the delimiter the regex swallowed in front of it. */
function dateMatch(match: RegExpMatchArray, lead: string, text: string, group = 0): RegExpMatchArray {
  const value = group ? match[group] : match[0].slice(lead.length)
  return Object.assign([value], { index: (match.index ?? 0) + match[0].indexOf(value, lead.length), input: text }) as RegExpMatchArray
}

function findMonthYear(text: string): RegExpMatchArray | null {
  for (const match of text.matchAll(MONTH_YEAR_RE)) {
    const word = fold(match[2])
    if (!MONTHS.has(word)) continue
    if (NEEDS_FULL_YEAR.has(word) && match[3].length !== 4) continue
    return dateMatch(match, match[1], text)
  }
  return null
}

function findNumericMonthYear(text: string): RegExpMatchArray | null {
  const match = text.matchAll(NUMERIC_MONTH_YEAR_RE).next().value
  return match ? dateMatch(match, match[1], text, 2) : null
}

function findOngoing(text: string): RegExpMatchArray | null {
  const match = text.matchAll(RELATIVE_DATE_RE).next().value
  return match ? dateMatch(match, match[1], text, 2) : null
}

export function findDate(text: string): RegExpMatchArray | null {
  return [findMonthYear(text), YEAR_RE.exec(text), findOngoing(text), findNumericMonthYear(text)]
    .filter((match): match is RegExpMatchArray => match !== null)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))[0] ?? null
}

export function hasDate(text: string): boolean {
  return findDate(text) !== null
}

// PDF extractors do not always preserve the visible bullet glyph. Common
// fallbacks include private-use glyphs, geometric symbols, or a separated dash.
const BULLET_CHARS = new Set([
  '•', '·', '▪', '◦', '‣', '●', '○', '■', '□', '◆', '◇', '▸', '▹', '►',
  '➢', '➤', '✓', '✔', '\uF0B7', '*', '‐', '‑', '‒', '–', '—', '-',
])

export function stripBullet(line: string): string {
  const trimmed = line.trimStart()
  const first = trimmed[0]
  if (!first || !BULLET_CHARS.has(first) || !/\s/.test(trimmed[1] ?? '')) return line.trim()
  return trimmed.slice(1).trim()
}

export function isBulletLine(line: string): boolean {
  return stripBullet(line) !== line.trim()
}

export function normalizeHeader(line: string): string {
  return foldHeading(line)
}
