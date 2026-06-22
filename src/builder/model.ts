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

/** Render the builder state into an analyzer-ready document (UPPERCASE headers
 *  + bullets) so the live ATS score reflects the same heuristics. */
export function synthExtracted(s: BuilderState): Extracted {
  const lines: string[] = []
  const { profile: p } = s
  if (p.name) lines.push(p.name)
  const contact = [p.email, p.phone, ...p.links].filter(Boolean).join(' · ')
  if (contact) lines.push(contact)
  if (p.location) lines.push(p.location)
  if (p.summary) { lines.push('SUMMARY', p.summary) }
  if (s.experience.length) {
    lines.push('EXPERIENCE')
    for (const e of s.experience) {
      lines.push(`${e.title}${e.company ? ' — ' + e.company : ''} ${e.date}`.trim())
      for (const b of e.bullets) if (b.trim()) lines.push('• ' + b.trim())
    }
  }
  if (s.skills.length) { lines.push('SKILLS', s.skills.join(', ')) }
  if (s.projects.length) {
    lines.push('PROJECTS')
    for (const pr of s.projects) lines.push(`• ${pr.name}${pr.description ? ' — ' + pr.description : ''}`)
  }
  if (s.education.length) {
    lines.push('EDUCATION')
    for (const ed of s.education) lines.push(`• ${ed.degree || ed.school}${ed.school && ed.degree ? ' — ' + ed.school : ''}, ${ed.date}`)
  }
  const text = lines.join('\n')
  // Rough page estimate from content volume (single-column ~ 48 lines/page).
  const numPages = Math.min(3, Math.max(1, Math.ceil(lines.length / 46)))
  return { pieces: [], lines, text, numPages, charCount: text.replace(/\s/g, '').length, source: 'pdf' }
}
