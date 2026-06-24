export const DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{0,4}|\b(19|20)\d{2}\b|present|current|now/i

// PDF extractors do not always preserve the visible bullet glyph. Common
// fallbacks include private-use glyphs, geometric symbols, or a separated dash.
export const BULLET_START = /^\s*(?:[•·▪◦‣●○■□◆◇▸▹►➢➤✓✔\u2022\u25E6\u25AA\u25CF\uF0B7*‐‑‒–—-]|\u00B7)\s+/

export function stripBullet(line: string): string {
  return line.replace(BULLET_START, '').trim()
}

export function isBulletLine(line: string): boolean {
  return BULLET_START.test(line)
}

export function normalizeHeader(line: string): string {
  return line
    .trim()
    .toLowerCase()
    .replace(/[^a-z&/ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

