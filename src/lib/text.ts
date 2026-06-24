const MONTHS = new Set([
  'jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april',
  'may', 'jun', 'june', 'jul', 'july', 'aug', 'august', 'sep', 'sept',
  'september', 'oct', 'october', 'nov', 'november', 'dec', 'december',
])
const MONTH_YEAR_RE = /\b([a-z]{3,9})\.?\s+\d{2,4}\b/i
const YEAR_RE = /\b(?:19|20)\d{2}\b/i
const RELATIVE_DATE_RE = /\b(?:present|current|now)\b/i

function findMonthYear(text: string): RegExpMatchArray | null {
  const match = text.match(MONTH_YEAR_RE)
  if (!match) return null
  return MONTHS.has(match[1].toLowerCase()) ? match : null
}

export function findDate(text: string): RegExpMatchArray | null {
  return [findMonthYear(text), text.match(YEAR_RE), text.match(RELATIVE_DATE_RE)]
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
  return line
    .trim()
    .toLowerCase()
    .replace(/[^a-z&/ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
