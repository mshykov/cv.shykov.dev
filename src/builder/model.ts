// Editable résumé model for the builder, plus a synthesizer that turns the
// in-progress résumé into the same shape the analyzer consumes — so we can show
// a *live* ATS score as the user edits.
import type { Resume } from '../lib/parse'
import type { Extracted } from '../lib/pdf'
import type { Messages } from '../i18n/messages/en.ts'

export type Spacing = 'compact' | 'standard' | 'relaxed'
export type Template = 'classic' | 'modern'
export interface Settings {
  accent: string
  fontSize: number // base pt
  spacing: Spacing
  pageSize: 'A4' | 'LETTER'
  template: Template
}
export interface BuilderState extends Resume {
  settings: Settings
}

/** Headings of the exported CV, in the CV's language (messages.builder.docSections). */
export type SectionTitles = Messages['builder']['docSections']

export const DEFAULT_SETTINGS: Settings = {
  accent: '#4f46e5',
  fontSize: 10,
  spacing: 'standard',
  pageSize: 'A4',
  template: 'classic',
}

export const EMPTY: BuilderState = {
  profile: { name: '', email: '', phone: '', location: '', links: [], summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  settings: DEFAULT_SETTINGS,
}

/** The example CV the builder opens with, in the page's language. */
export function sampleState(sample: Messages['builder']['sample']): BuilderState {
  return {
    profile: {
      name: sample.name,
      email: sample.email,
      phone: sample.phone,
      location: sample.location,
      links: [...sample.links],
      summary: sample.summary,
    },
    experience: sample.experience.map((e) => ({ ...e, bullets: [...e.bullets] })),
    education: sample.education.map((e) => ({ ...e })),
    skills: [...sample.skills],
    projects: [],
    settings: DEFAULT_SETTINGS,
  }
}

function addProfileLines(lines: string[], state: BuilderState, titles: SectionTitles) {
  const { profile } = state
  if (profile.name) lines.push(profile.name)

  const contact = [profile.email, profile.phone, ...profile.links].filter(Boolean).join(' · ')
  if (contact) lines.push(contact)
  if (profile.location) lines.push(profile.location)
  if (profile.summary) lines.push(titles.summary.toUpperCase(), profile.summary)
}

function addExperienceLines(lines: string[], state: BuilderState, titles: SectionTitles) {
  if (!state.experience.length) return

  lines.push(titles.experience.toUpperCase())
  for (const entry of state.experience) {
    lines.push(`${entry.title}${entry.company ? ' — ' + entry.company : ''} ${entry.date}`.trim())
    for (const bullet of entry.bullets) {
      const text = bullet.trim()
      if (text) lines.push('• ' + text)
    }
  }
}

function addSkillsLines(lines: string[], state: BuilderState, titles: SectionTitles) {
  if (state.skills.length) lines.push(titles.skills.toUpperCase(), state.skills.join(', '))
}

function addProjectLines(lines: string[], state: BuilderState, titles: SectionTitles) {
  if (!state.projects.length) return

  lines.push(titles.projects.toUpperCase())
  for (const project of state.projects) {
    lines.push(`• ${project.name}${project.description ? ' — ' + project.description : ''}`)
  }
}

function addEducationLines(lines: string[], state: BuilderState, titles: SectionTitles) {
  if (!state.education.length) return

  lines.push(titles.education.toUpperCase())
  for (const education of state.education) {
    const school = education.school && education.degree ? ' — ' + education.school : ''
    lines.push(`• ${education.degree || education.school}${school}, ${education.date}`)
  }
}

/** Render the builder state into an analyzer-ready document (UPPERCASE headers
 *  + bullets) so the live ATS score reflects the same heuristics. */
export function synthExtracted(s: BuilderState, titles: SectionTitles): Extracted {
  const lines: string[] = []
  addProfileLines(lines, s, titles)
  addExperienceLines(lines, s, titles)
  addSkillsLines(lines, s, titles)
  addProjectLines(lines, s, titles)
  addEducationLines(lines, s, titles)

  const text = lines.join('\n')
  // Rough page estimate from content volume (single-column ~ 48 lines/page).
  const numPages = Math.min(3, Math.max(1, Math.ceil(lines.length / 46)))
  return { pieces: [], lines, text, numPages, charCount: text.replace(/\s/g, '').length, source: 'pdf' }
}
