// The section headings the scorer recognises. Data only, in its own module so
// the guide pages can publish the exact list without pulling the scoring
// engine into the homepage bundle — and so the published list cannot drift
// from what the checker actually matches.
export const SECTION_KEYWORDS = {
  experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience'],
  education: ['education', 'academic background'],
  skills: ['skills', 'core competencies', 'technical skills', 'expertise'],
  summary: ['summary', 'profile', 'objective', 'about me', 'about'],
} satisfies Record<string, string[]>

export const BONUS_SECTION_KEYWORDS = {
  achievements: ['achievements', 'key achievements', 'accomplishments', 'highlights'],
  projects: ['projects', 'selected projects', 'side projects'],
  certifications: ['certifications', 'certificates', 'courses', 'licenses', 'certifications & courses'],
} satisfies Record<string, string[]>
