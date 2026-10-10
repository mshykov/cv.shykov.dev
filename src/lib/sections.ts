// The section headings the scorer recognises. Data only, in its own module so
// the guide pages can publish the exact list without pulling the scoring
// engine into the homepage bundle — and so the published list cannot drift
// from what the checker actually matches.
//
// The words themselves live in src/lib/lang/<code>.ts. SECTION_KEYWORDS is what
// the scorer matches against: every supported language merged, accent-folded.
// sectionsFor() is one language's slice, which is what that language's guide
// publishes.
import { SCORER_SECTIONS, scorerSectionsFor, LANGS, type LangCode } from './lang/index.ts'

export const SECTION_KEYWORDS = {
  experience: SCORER_SECTIONS.experience,
  education: SCORER_SECTIONS.education,
  skills: SCORER_SECTIONS.skills,
  summary: SCORER_SECTIONS.summary,
} satisfies Record<string, string[]>

export const BONUS_SECTION_KEYWORDS = {
  achievements: SCORER_SECTIONS.achievements,
  projects: SCORER_SECTIONS.projects,
  certifications: SCORER_SECTIONS.certifications,
} satisfies Record<string, string[]>

/** The headings one language contributes, as written (accents kept) for display. */
export function publishedSections(code: LangCode) {
  const s = LANGS[code].scorerSections
  return {
    experience: s.experience, education: s.education, skills: s.skills, summary: s.summary,
    achievements: s.achievements, projects: s.projects, certifications: s.certifications,
  }
}

export { scorerSectionsFor }
export type { LangCode }
