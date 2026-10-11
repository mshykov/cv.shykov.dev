// Accent- and case-folding shared by every matcher that compares CV text with
// the per-language word lists. "Formação", "FORMACAO" and "formacao" must all
// meet at the same string, and so must "Fähigkeiten" and "Fahigkeiten".
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .toLowerCase()
    .replaceAll(/[̀-ͯ]/g, '')
    .replaceAll('ß', 'ss')
    .replaceAll('æ', 'ae')
    .replaceAll('œ', 'oe')
}

/** Fold, then keep only what a section heading can contain (see normalizeHeader). */
export function foldHeading(value: string): string {
  return fold(value)
    .replaceAll(/[^a-z&/ ]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}
