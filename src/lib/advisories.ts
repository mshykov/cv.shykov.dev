// Advisories: conventions worth a look that are deliberately NOT part of the
// 100-point score. The rubric is published check by check and guarded by
// rubric.test.ts; an opinion like "this is long for most roles" varies by
// country, seniority and sector, so it informs the reader without moving a
// number they might compare across tools. Same separation as style.ts.

import type { Extracted } from './pdf.ts'
import type { Resume } from './parse.ts'
import type { AnalysisMessages } from './analyze.ts'

export type AdvisoryId = 'length' | 'thin-role' | 'long-bullets' | 'graduation-year'

export interface Advisory {
  id: AdvisoryId
  detail: string
  fix: string
}

/** Above this many words most recruiters are skimming, not reading. Executive, academic and some public-sector CVs run longer. */
export const LONG_CV_WORDS = 1000
/** A graduation year older than this many years may reveal age. */
export const OLD_GRADUATION_YEARS = 15
/** A bullet longer than this is a paragraph. */
export const LONG_BULLET_WORDS = 40

const wordCount = (text: string) => text.match(/\p{L}[\p{L}\p{N}'’-]*|\p{N}+/gu)?.length ?? 0

const YEAR_RE = /\b(?:19|20)\d{2}\b/g

/** Education entries whose latest year is more than OLD_GRADUATION_YEARS before `now`. */
export function countOldGraduationYears(resume: Resume, now: number): number {
  return resume.education.filter((e) => {
    const years = `${e.school} ${e.degree} ${e.date}`.match(YEAR_RE)?.map(Number) ?? []
    return years.length > 0 && Math.max(...years) < now - OLD_GRADUATION_YEARS
  }).length
}

export interface AdvisoryOptions {
  /** Interface language. The graduation-year advice is only given in English. */
  locale?: string
  /** Current year; injectable so the check does not drift with the calendar in tests. */
  now?: number
}

export function getAdvisories(ex: Extracted, resume: Resume, m: AnalysisMessages['advisories'], opts: AdvisoryOptions = {}): Advisory[] {
  const out: Advisory[] = []

  // Same count the report shows next to the score, so the two numbers agree.
  const words = ex.text.split(/\s+/).filter(Boolean).length
  if (words > LONG_CV_WORDS) out.push({ id: 'length', detail: m.length.detail(words), fix: m.length.fix })

  // A single role cannot be "thin" relative to the others, and a one-role CV is
  // usually a student or career changer; stay quiet there.
  const roles = resume.experience
  if (roles.length >= 2) {
    const thin = roles.filter((r) => r.bullets.length === 1).length
    if (thin > 0) out.push({ id: 'thin-role', detail: m.thinRole.detail(thin), fix: m.thinRole.fix })
  }

  const longBullets = roles.flatMap((r) => r.bullets).filter((b) => wordCount(b) > LONG_BULLET_WORDS).length
  if (longBullets > 0) out.push({ id: 'long-bullets', detail: m.longBullets.detail(longBullets), fix: m.longBullets.fix })

  // English only, on purpose: whether to show a graduation year is a convention that
  // differs by country (customary in much of Europe and in academic CVs), and a
  // translated version would read as local advice we cannot stand behind. Other
  // languages get the explanation in the checklist guide instead. Like every
  // advisory, it never touches the score.
  if (opts.locale === 'en') {
    const old = countOldGraduationYears(resume, opts.now ?? new Date().getFullYear())
    if (old > 0) {
      out.push({
        id: 'graduation-year',
        detail: `${old} graduation ${old === 1 ? 'year is' : 'years are'} more than ${OLD_GRADUATION_YEARS} years back.`,
        fix: 'Some candidates, mostly in the US and UK, leave an old graduation year out to reduce the risk of age bias. In other countries, and in academic CVs, the year is customary. Your call.',
      })
    }
  }

  return out
}
