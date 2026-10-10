// Merges the per-language word lists. The scorer, parser and job matcher use the
// merged sets, so a Spanish CV is understood on the English page and an English
// CV on the Spanish one — the language of the page never decides how a CV is read.
//
// To add a language: write src/lib/lang/<code>.ts and add it to LANGS below.
// docs/localization.md walks through the whole procedure.
import { fold, foldHeading } from './fold.ts'
import { de } from './de.ts'
import { en } from './en.ts'
import { es } from './es.ts'
import { fr } from './fr.ts'
import { pt } from './pt.ts'
import type { LangCode, LangData, ParserSectionKey, ScorerSections } from './types.ts'

export type { LangCode, LangData, ParserSectionKey, ScorerSections } from './types.ts'
export { fold, foldHeading } from './fold.ts'

export const LANGS: Record<LangCode, LangData> = { en, es, pt, fr, de }
const ALL = Object.values(LANGS)

const unique = (items: string[]) => [...new Set(items)]

/** Headings as the matchers compare them: folded, punctuation turned to spaces. */
export const foldHeadings = (items: string[]) => unique(items.map(foldHeading).filter(Boolean))

const SCORER_KEYS = ['experience', 'education', 'skills', 'summary', 'achievements', 'projects', 'certifications'] as const
const PARSER_KEYS = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests', 'awards', 'other'] as const satisfies readonly ParserSectionKey[]

/** Scorer headings of one language, folded the way the matcher compares them. */
export function scorerSectionsFor(code: LangCode): ScorerSections {
  const source = LANGS[code].scorerSections
  return Object.fromEntries(SCORER_KEYS.map((key) => [key, foldHeadings(source[key])])) as unknown as ScorerSections
}

/** Scorer headings of every language, merged. */
export const SCORER_SECTIONS: ScorerSections = Object.fromEntries(
  SCORER_KEYS.map((key) => [key, foldHeadings(ALL.flatMap((lang) => lang.scorerSections[key]))]),
) as unknown as ScorerSections

export const PARSER_SECTIONS: Record<ParserSectionKey, string[]> = Object.fromEntries(
  PARSER_KEYS.map((key) => [key, foldHeadings(ALL.flatMap((lang) => lang.parserSections[key]))]),
) as Record<ParserSectionKey, string[]>

export const ACTION_VERBS = new Set(ALL.flatMap((lang) => lang.actionVerbs.map(fold)))
export const IMPACT_UNITS = new Set(ALL.flatMap((lang) => lang.impactUnits.map(fold)))
export const MONTHS = new Set(ALL.flatMap((lang) => lang.months.map(fold)))
export const STOPWORDS = new Set(ALL.flatMap((lang) => lang.stopwords.map(fold)))

/** Matched against the lower-cased original text, so both spellings are kept. */
export const DEGREE_WORDS = unique(ALL.flatMap((lang) => lang.degreeWords.flatMap((word) => [word.toLowerCase(), fold(word)])))

/** "Present", "actualidad", "heute"… as one case-insensitive alternation. */
export const ONGOING_PATTERN = unique(ALL.flatMap((lang) => lang.ongoing.flatMap((word) => [word, fold(word)]))).join('|')

const DETECT = ALL.map((lang) => ({ code: lang.code, words: new Set(lang.detectWords.map(fold)) }))

/**
 * Best guess at the language of a CV from its function words, or 'unknown' when
 * the text is too short or too mixed to call. Used only to decide whether the
 * English-only writing-style checks make sense — never to gate the ATS score.
 */
export function detectLanguage(text: string): LangCode | 'unknown' {
  const tokens = fold(text).match(/[a-z]+/g) ?? []
  if (tokens.length < 40) return 'unknown'
  const scored = DETECT.map(({ code, words }) => ({ code, hits: tokens.filter((t) => words.has(t)).length }))
    .sort((a, b) => b.hits - a.hits)
  const [best, second] = scored
  if (best.hits < 6 || best.hits < second.hits * 1.3) return 'unknown'
  return best.code
}
