// What the scorer, parser and job matcher need to know about one language.
// Data only. Each language file fills this in; index.ts merges them, so a CV
// is understood whatever language the page around it is in.
export type LangCode = 'en' | 'es' | 'pt' | 'fr' | 'de'

export interface ScorerSections {
  experience: string[]
  education: string[]
  skills: string[]
  summary: string[]
  achievements: string[]
  projects: string[]
  certifications: string[]
}

export type ParserSectionKey =
  | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications'
  | 'languages' | 'interests' | 'awards' | 'other'

export interface LangData {
  code: LangCode
  /** Headings the ATS score checks for. This list is published in the guides. */
  scorerSections: ScorerSections
  /** Headings the parser recognises, a superset of the scorer's. */
  parserSections: Record<ParserSectionKey, string[]>
  /** First words of bullets that count as a strong action verb. */
  actionVerbs: string[]
  /** Words after a number that make it a measurable result ("12 engineers"). */
  impactUnits: string[]
  /** Month names and abbreviations, accents allowed. */
  months: string[]
  /** "Present" in this language, as regex alternatives, accents allowed. */
  ongoing: string[]
  /** Degree names, for splitting "BSc Computer Science, MIT". */
  degreeWords: string[]
  /** Words that carry no keyword signal in a job description. */
  stopwords: string[]
  /** Very common function words, used to guess the language of a CV. */
  detectWords: string[]
}
