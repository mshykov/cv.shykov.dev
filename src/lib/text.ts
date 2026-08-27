const MONTHS = new Set([
  'jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april',
  'may', 'jun', 'june', 'jul', 'july', 'aug', 'august', 'sep', 'sept',
  'september', 'oct', 'october', 'nov', 'november', 'dec', 'december',
])
// Global on purpose: exec() returns only the FIRST word+number pair, and if that
// pair is not a month ("latency 300 ms in Jan 24") the real date was reported as
// absent. Scan every candidate instead. matchAll is safe with /g here — it walks
// an internal clone, so this shared regex keeps lastIndex at 0.
const MONTH_YEAR_RE = /\b([a-z]{3,9})\.?\s+\d{2,4}\b/gi
const YEAR_RE = /\b(?:19|20)\d{2}\b/i
const RELATIVE_DATE_RE = /\b(?:present|current|now)\b/i

function findMonthYear(text: string): RegExpMatchArray | null {
  for (const match of text.matchAll(MONTH_YEAR_RE)) {
    if (MONTHS.has(match[1].toLowerCase())) return match
  }
  return null
}

export function findDate(text: string): RegExpMatchArray | null {
  return [findMonthYear(text), YEAR_RE.exec(text), RELATIVE_DATE_RE.exec(text)]
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
