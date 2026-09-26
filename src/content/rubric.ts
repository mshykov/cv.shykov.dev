// The published scoring rubric, check by check. Hand-written rather than
// derived from analyze() so the guide pages - and the homepage bundle that
// lists them - do not pull in the scoring engine. rubric.test.ts runs the real
// engine and fails if this table and the checker ever disagree.
export interface RubricRow {
  category: 'Parseability' | 'Contact' | 'Sections' | 'Format' | 'Content'
  label: string
  max: number
}

export const RUBRIC: RubricRow[] = [
  { category: 'Parseability', label: 'Machine-readable text', max: 15 },
  { category: 'Parseability', label: 'Clean text encoding', max: 10 },
  { category: 'Contact', label: 'Email address', max: 5 },
  { category: 'Contact', label: 'Phone number', max: 5 },
  { category: 'Contact', label: 'LinkedIn / website link', max: 5 },
  { category: 'Sections', label: 'Experience', max: 8 },
  { category: 'Sections', label: 'Education', max: 6 },
  { category: 'Sections', label: 'Skills', max: 6 },
  { category: 'Sections', label: 'Summary', max: 5 },
  { category: 'Sections', label: 'Achievements / Projects / Certifications', max: 10 },
  { category: 'Format', label: 'Page count', max: 5 },
  { category: 'Format', label: 'Dated history', max: 5 },
  { category: 'Format', label: 'Bulleted structure', max: 5 },
  { category: 'Content', label: 'Quantified impact', max: 5 },
  { category: 'Content', label: 'Strong action verbs', max: 5 },
]
