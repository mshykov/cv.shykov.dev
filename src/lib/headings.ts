// Which section a heading line belongs to, when several languages' word lists are
// merged. A heading can match more than one list — "Formación complementaria" holds
// the education word "formación" and is itself a certifications heading — so the
// most specific match wins: a match is dropped when a longer keyword of ANOTHER
// category contains it. "Education & Certifications" still counts for both, because
// neither of its keywords contains the other.

export type KeywordTable = Record<string, string[]>

const wholeWord = (norm: string, keyword: string) => ` ${norm} `.includes(` ${keyword} `)

/** Every (category, keyword) whose keyword occurs in the heading as whole words. */
function matches(norm: string, table: KeywordTable): { category: string; keyword: string }[] {
  return Object.entries(table).flatMap(([category, keywords]) =>
    keywords.filter((keyword) => wholeWord(norm, keyword)).map((keyword) => ({ category, keyword })),
  )
}

/** Categories a normalised heading counts for, most-specific match first. */
export function headingCategories(norm: string, table: KeywordTable): string[] {
  const found = matches(norm, table)
  const kept = found.filter((m) => !found.some((o) => o.category !== m.category && o.keyword.length > m.keyword.length && o.keyword.includes(m.keyword)))
  return [...new Set(kept.map((m) => m.category))]
}

/** The single best category for a heading (the parser needs exactly one), or null. */
export function bestHeadingCategory(norm: string, table: KeywordTable, accepts: (norm: string, keyword: string) => boolean): string | null {
  let best: { category: string; length: number } | null = null
  for (const [category, keywords] of Object.entries(table)) {
    for (const keyword of keywords) {
      if (accepts(norm, keyword) && (!best || keyword.length > best.length)) best = { category, length: keyword.length }
    }
  }
  return best?.category ?? null
}
