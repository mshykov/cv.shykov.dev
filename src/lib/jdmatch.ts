// Job-description matching: extract the keywords/skills a JD emphasizes and
// check which ones the CV actually contains. Pure client-side keyword/skill
// overlap — no uploads, no model calls. Honest heuristic, close to how a
// recruiter's keyword search or an ATS filter behaves.

export interface Keyword {
  term: string
  weight: number // higher = more emphasized in the JD
  inCv: boolean
}
export interface JDMatch {
  coverage: number // 0–100, weighted
  matched: Keyword[]
  missing: Keyword[]
  total: number
}

const STOPWORDS = new Set(
  ('a an the and or but if then else for to of in on at by with from as is are be been being will would can could should may might must have has had do does did you your we our they their this that these those it its will across into over under more most other such including etc role team work working experience years ability strong excellent good great able help build using use used within across will plays plus nice want looking join including responsibilities requirements qualifications about who what when where why how also per via etc company candidate candidates ideal preferred bonus must should week day days month months year benefits salary apply position opportunity environment culture people new like well make made making get got').split(
    /\s+/,
  ),
)

// Curated, domain-leaning lexicon. Multi-word entries are matched as phrases.
// The frequency extractor catches anything not listed here.
const SKILL_LEXICON = [
  'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'go', 'golang', 'rust', 'c++', 'c#', 'ruby', 'php', 'scala',
  'react', 'angular', 'vue', 'svelte', 'node', 'node.js', 'next.js', 'django', 'flask', 'spring', 'rails', '.net',
  'ios', 'android', 'flutter', 'react native', 'mobile',
  'aws', 'gcp', 'azure', 'cloudflare', 'kubernetes', 'docker', 'terraform', 'serverless', 'microservices',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'graphql', 'rest', 'grpc',
  'ci/cd', 'devops', 'observability', 'monitoring', 'infrastructure as code', 'iac',
  'machine learning', 'ml', 'ai', 'llm', 'data', 'analytics', 'recommendation',
  'agile', 'scrum', 'kanban', 'okrs', 'roadmap', 'stakeholder management', 'delivery',
  'leadership', 'people management', 'mentoring', 'coaching', 'hiring', 'onboarding', 'performance management',
  'cross-functional', 'engineering manager', 'team lead', 'architecture', 'testing', 'automation', 'security',
]

function normalize(s: string): string {
  return s.toLowerCase()
}

function wordRe(term: string): RegExp {
  // Custom word boundary that tolerates term chars like "ci/cd", "c#", ".net".
  // Avoid look-behind (Safari < 16.4 lacks it); a leading non-alnum class works
  // the same for the boolean .test() we use it for.
  return new RegExp('(?:^|[^a-z0-9])' + term.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) + '(?![a-z0-9])', 'i')
}

function wordTokens(value: string): string[] {
  const tokenRe = /[a-z][a-z0-9+#.]{2,}/g
  const tokens: string[] = []
  let match: RegExpExecArray | null

  while ((match = tokenRe.exec(value)) !== null) {
    tokens.push(match[0])
  }

  return tokens
}

export function matchJD(cvText: string, cvSkills: string[], jd: string): JDMatch {
  const jdLower = normalize(jd)
  const cvHaystack = normalize(cvText + ' ' + cvSkills.join(' '))
  const weights = new Map<string, number>()

  // 1) Lexicon skills present in the JD get a high base weight.
  for (const skill of SKILL_LEXICON) {
    if (wordRe(skill).test(jdLower)) weights.set(skill, (weights.get(skill) ?? 0) + 3)
  }

  // 2) Frequency of meaningful single tokens in the JD.
  const freq = new Map<string, number>()
  for (const tok of wordTokens(jdLower)) {
    if (STOPWORDS.has(tok)) continue
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }
  for (const [tok, count] of freq) {
    if (count >= 2 || weights.has(tok)) weights.set(tok, (weights.get(tok) ?? 0) + count)
  }

  // 3) Build, dedupe (drop tokens already covered by a multi-word skill), rank.
  const multi = [...weights.keys()].filter((k) => k.includes(' '))
  const keywords: Keyword[] = [...weights.entries()]
    .filter(([term]) => !(/^[a-z]/.test(term) && !term.includes(' ') && multi.some((m) => m.includes(term))))
    .map(([term, weight]) => ({ term, weight, inCv: wordRe(term).test(cvHaystack) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 30)

  const totalW = keywords.reduce((s, k) => s + k.weight, 0) || 1
  const matchedW = keywords.filter((k) => k.inCv).reduce((s, k) => s + k.weight, 0)
  return {
    coverage: Math.round((matchedW / totalW) * 100),
    matched: keywords.filter((k) => k.inCv),
    missing: keywords.filter((k) => !k.inCv),
    total: keywords.length,
  }
}
