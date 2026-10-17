// Advisories: conventions worth a look that are deliberately NOT part of the
// 100-point score. The rubric is published check by check and guarded by
// rubric.test.ts; an opinion like "this is long for most roles" varies by
// country, seniority and sector, so it informs the reader without moving a
// number they might compare across tools. Same separation as style.ts.

import type { Extracted } from './pdf.ts'
import type { Resume } from './parse.ts'
import type { AnalysisMessages } from './analyze.ts'

export type AdvisoryId = 'length' | 'thin-role' | 'long-bullets'

export interface Advisory {
  id: AdvisoryId
  detail: string
  fix: string
}

/** Above this many words most recruiters are skimming, not reading. Executive, academic and some public-sector CVs run longer. */
export const LONG_CV_WORDS = 1000
/** A bullet longer than this is a paragraph. */
export const LONG_BULLET_WORDS = 40

const wordCount = (text: string) => text.match(/\p{L}[\p{L}\p{N}'’-]*|\p{N}+/gu)?.length ?? 0

export function getAdvisories(ex: Extracted, resume: Resume, m: AnalysisMessages['advisories']): Advisory[] {
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

  return out
}
