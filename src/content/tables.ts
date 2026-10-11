// The two data tables every guide publishes: the scoring rubric and the section
// headings the checker accepts. Built from the same sources the scorer reads, so a
// guide in any language states exactly what the code does.
import { RUBRIC } from './rubric.ts'
import { publishedSections, type LangCode } from '../lib/sections.ts'
import type { Messages } from '../i18n/messages/en.ts'

const quoted = (words: string[]) => words.map((w) => `“${w}”`).join(', ')

/** Check by check: [label, group, points]. */
export function rubricRows(m: Messages): string[][] {
  return RUBRIC.map((r) => [m.analysis.labels[r.id], m.analysis.categories[r.category], String(r.max)])
}

/** Section by section: [section, headings this language accepts, points]. */
export function sectionRows(code: LangCode, m: Messages): string[][] {
  const s = publishedSections(code)
  const bonus = (points: number) => m.article.bonusPoints(points)
  return [
    [m.analysis.labels['sec-exp'], quoted(s.experience), '8'],
    [m.analysis.labels['sec-edu'], quoted(s.education), '6'],
    [m.analysis.labels['sec-skills'], quoted(s.skills), '6'],
    [m.analysis.labels['sec-summary'], quoted(s.summary), '5'],
    [m.analysis.bonus.names.achievements, quoted(s.achievements), bonus(4)],
    [m.analysis.bonus.names.projects, quoted(s.projects), bonus(3)],
    [m.analysis.bonus.names.certifications, quoted(s.certifications), bonus(3)],
  ]
}
