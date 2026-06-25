// Editable résumé model for the builder, plus a synthesizer that turns the
// in-progress résumé into the same shape the analyzer consumes — so we can show
// a *live* ATS score as the user edits.
import type { Resume } from '../lib/parse'
import type { Extracted } from '../lib/pdf'

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

export const BUILDER_SECTION_TITLES = {
  summary: 'Summary',
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  education: 'Education',
} as const

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

export const SAMPLE: BuilderState = {
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 555 0100',
    location: 'Berlin, Germany',
    links: ['linkedin.com/in/alexmorgan', 'github.com/alexmorgan'],
    summary:
      'Engineering Manager with 10+ years building and leading product teams. Shipped platforms at scale with a focus on delivery, quality, and engineering culture.',
  },
  experience: [
    {
      title: 'Engineering Manager',
      company: 'Acme Corp',
      date: 'Jan 2022 – now',
      bullets: [
        'Led a cross-functional team of 9 engineers across web and mobile',
        'Cut release cycle time by 40% by streamlining CI/CD and review flow',
        'Hired and onboarded 6 engineers; ran growth and promotion process',
      ],
    },
  ],
  education: [{ school: 'Technical University', degree: "Bachelor's in Computer Science", date: '2010 – 2014' }],
  skills: ['Engineering Leadership', 'People Management', 'Agile', 'CI/CD', 'Hiring', 'Stakeholder Management'],
  projects: [],
  settings: DEFAULT_SETTINGS,
}

function addProfileLines(lines: string[], state: BuilderState) {
  const { profile } = state
  if (profile.name) lines.push(profile.name)

  const contact = [profile.email, profile.phone, ...profile.links].filter(Boolean).join(' · ')
  if (contact) lines.push(contact)
  if (profile.location) lines.push(profile.location)
  if (profile.summary) lines.push(BUILDER_SECTION_TITLES.summary.toUpperCase(), profile.summary)
}

function addExperienceLines(lines: string[], state: BuilderState) {
  if (!state.experience.length) return

  lines.push(BUILDER_SECTION_TITLES.experience.toUpperCase())
  for (const entry of state.experience) {
    lines.push(`${entry.title}${entry.company ? ' — ' + entry.company : ''} ${entry.date}`.trim())
    for (const bullet of entry.bullets) {
      const text = bullet.trim()
      if (text) lines.push('• ' + text)
    }
  }
}

function addSkillsLines(lines: string[], state: BuilderState) {
  if (state.skills.length) lines.push(BUILDER_SECTION_TITLES.skills.toUpperCase(), state.skills.join(', '))
}

function addProjectLines(lines: string[], state: BuilderState) {
  if (!state.projects.length) return

  lines.push(BUILDER_SECTION_TITLES.projects.toUpperCase())
  for (const project of state.projects) {
    lines.push(`• ${project.name}${project.description ? ' — ' + project.description : ''}`)
  }
}

function addEducationLines(lines: string[], state: BuilderState) {
  if (!state.education.length) return

  lines.push(BUILDER_SECTION_TITLES.education.toUpperCase())
  for (const education of state.education) {
    const school = education.school && education.degree ? ' — ' + education.school : ''
    lines.push(`• ${education.degree || education.school}${school}, ${education.date}`)
  }
}

/** Render the builder state into an analyzer-ready document (UPPERCASE headers
 *  + bullets) so the live ATS score reflects the same heuristics. */
export function synthExtracted(s: BuilderState): Extracted {
  const lines: string[] = []
  addProfileLines(lines, s)
  addExperienceLines(lines, s)
  addSkillsLines(lines, s)
  addProjectLines(lines, s)
  addEducationLines(lines, s)

  const text = lines.join('\n')
  // Rough page estimate from content volume (single-column ~ 48 lines/page).
  const numPages = Math.min(3, Math.max(1, Math.ceil(lines.length / 46)))
  return { pieces: [], lines, text, numPages, charCount: text.replace(/\s/g, '').length, source: 'pdf' }
}
