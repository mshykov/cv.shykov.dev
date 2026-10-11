import type { LangData } from './types.ts'

// The English lists are the original ones, moved here unchanged: the published
// rubric and every existing test still describe them.
export const en: LangData = {
  code: 'en',
  scorerSections: {
    experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience'],
    education: ['education', 'academic background'],
    skills: ['skills', 'core competencies', 'technical skills', 'expertise'],
    summary: ['summary', 'profile', 'objective', 'about me', 'about'],
    achievements: ['achievements', 'key achievements', 'accomplishments', 'highlights'],
    projects: ['projects', 'selected projects', 'side projects'],
    certifications: ['certifications', 'certificates', 'courses', 'licenses', 'certifications & courses'],
  },
  parserSections: {
    summary: ['summary', 'profile', 'objective', 'about', 'about me'],
    experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience', 'employment', 'career experience', 'career history'],
    education: ['education', 'academic background', 'academic'],
    skills: ['skills', 'core competencies', 'technical skills', 'expertise', 'technologies'],
    projects: ['projects', 'selected projects', 'side projects', 'personal projects'],
    certifications: ['certifications', 'certificates', 'courses', 'licenses', 'certifications & courses'],
    languages: ['languages'],
    interests: ['interests', 'hobbies', 'hobbies & interests', 'interests & hobbies'],
    awards: ['awards', 'honors', 'achievements', 'key achievements'],
    other: ['publications', 'volunteer', 'volunteering', 'references', 'contact'],
  },
  actionVerbs: [
    'led', 'managed', 'built', 'shipped', 'delivered', 'improved', 'reduced',
    'increased', 'launched', 'created', 'developed', 'designed', 'implemented',
    'drove', 'owned', 'established', 'hired', 'mentored', 'partnered',
    'streamlined', 'optimized', 'spearheaded', 'architected', 'scaled',
    'coordinated', 'analyzed', 'automated', 'migrated', 'negotiated',
  ],
  impactUnits: ['x', '×', 'k', 'm', 'bn', 'users', 'engineers', 'people', 'hours', 'days', 'weeks'],
  months: [
    'jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april',
    'may', 'jun', 'june', 'jul', 'july', 'aug', 'august', 'sep', 'sept',
    'september', 'oct', 'october', 'nov', 'november', 'dec', 'december',
  ],
  ongoing: ['present', 'current', 'now'],
  degreeWords: ['ph.d', 'phd', "master's", 'masters', 'master', "bachelor's", 'bachelors', 'bachelor', 'b.sc', 'msc', 'm.sc', 'b.a', 'm.a', 'associate', 'diploma'],
  stopwords: (
    'a an the and or but if then else for to of in on at by with from as is are be been being will would can could should may might must have has had do does did you your we our they their this that these those it its will across into over under more most other such including etc role team work working experience years ability strong excellent good great able help build using use used within across will plays plus nice want looking join including responsibilities requirements qualifications about who what when where why how also per via etc company candidate candidates ideal preferred bonus must should week day days month months year benefits salary apply position opportunity environment culture people new like well make made making get got'
  ).split(/\s+/),
  detectWords: ['the', 'and', 'of', 'to', 'in', 'with', 'for', 'on', 'at', 'by', 'is', 'as', 'that', 'led', 'team', 'experience'],
}
