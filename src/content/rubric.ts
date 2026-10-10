// The published scoring rubric, check by check. Hand-written rather than
// derived from analyze() so the guide pages - and the homepage bundle that
// lists them - do not pull in the scoring engine. rubric.test.ts runs the real
// engine and fails if this table and the checker ever disagree.
import type { Check } from '../lib/analyze.ts'

export interface RubricRow {
  /** Id of the check in analyze.ts; the display label comes from the locale's messages. */
  id: Check['id']
  category: Check['category']
  /** English label, kept so the table can be read without a locale. */
  label: string
  max: number
}

export const RUBRIC: RubricRow[] = [
  { id: 'machine-text', category: 'Parseability', label: 'Machine-readable text', max: 15 },
  { id: 'encoding', category: 'Parseability', label: 'Clean text encoding', max: 10 },
  { id: 'email', category: 'Contact', label: 'Email address', max: 5 },
  { id: 'phone', category: 'Contact', label: 'Phone number', max: 5 },
  { id: 'links', category: 'Contact', label: 'LinkedIn / website link', max: 5 },
  { id: 'sec-exp', category: 'Sections', label: 'Experience', max: 8 },
  { id: 'sec-edu', category: 'Sections', label: 'Education', max: 6 },
  { id: 'sec-skills', category: 'Sections', label: 'Skills', max: 6 },
  { id: 'sec-summary', category: 'Sections', label: 'Summary', max: 5 },
  { id: 'sec-bonus', category: 'Sections', label: 'Achievements / Projects / Certifications', max: 10 },
  { id: 'pages', category: 'Format', label: 'Page count', max: 5 },
  { id: 'dates', category: 'Format', label: 'Dated history', max: 5 },
  { id: 'bullets', category: 'Format', label: 'Bulleted structure', max: 5 },
  { id: 'quant', category: 'Content', label: 'Quantified impact', max: 5 },
  { id: 'verbs', category: 'Content', label: 'Strong action verbs', max: 5 },
]
