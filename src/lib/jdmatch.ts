// Job-description matching: extract the keywords/skills a JD emphasizes and
// check which ones the CV actually contains. Pure client-side keyword/skill
// overlap — no uploads, no model calls. Honest heuristic, close to how a
// recruiter's keyword search or an ATS filter behaves.

import { STOPWORDS, fold } from './lang/index.ts'

export interface Keyword {
  term: string
  weight: number // higher = more emphasized in the JD
  inCv: boolean
  /** Where a matched keyword shows up: in an experience bullet, or only in the Skills list. */
  where?: 'experience' | 'skills' | 'other'
  /** `nice` when every mention in the posting sits under a preferred / nice-to-have marker. */
  priority?: 'nice'
}
/** What the match needs besides the CV text; experience text separates evidence from a bare Skills list. */
export interface MatchContext {
  experienceText?: string
}
export interface JDMatch {
  coverage: number // 0–100, weighted
  matched: Keyword[]
  missing: Keyword[]
  total: number
}

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

// Words that mean the same thing to a recruiter's search. Deliberately short and
// conservative: a wrong equivalence invents a match, which is worse than a miss.
// Entries are folded and matched as whole words or phrases.
const EQUIVALENTS: string[][] = [
  ['seo', 'search engine optimization'],
  ['ci/cd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
  ['ml', 'machine learning'],
  ['ai', 'artificial intelligence'],
  ['iac', 'infrastructure as code'],
  ['okrs', 'okr', 'objectives and key results'],
  ['qa', 'quality assurance'],
  ['ux', 'user experience'],
  ['sre', 'site reliability engineering', 'site reliability'],
  ['k8s', 'kubernetes'],
  ['postgresql', 'postgres'],
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['node.js', 'nodejs', 'node'],
  ['react native', 'react-native'],
  ['cross-functional', 'cross functional'],
  ['mentoring', 'mentorship', 'mentor'],
  ['hiring', 'recruiting', 'recruitment'],
  ['onboarding', 'on-boarding'],
  ['people management', 'line management', 'managing people'],
  ['performance management', 'performance reviews'],
]

/** Every term the lexicon knows, including the acronyms and expansions listed as equivalents. */
const LEXICON = [...new Set([...SKILL_LEXICON, ...EQUIVALENTS.flat()])]

export function equivalentsOf(term: string): string[] {
  const key = fold(term)
  const group = EQUIVALENTS.find((g) => g.includes(key))
  return group ? group.filter((t) => t !== key) : []
}

/**
 * A light English stemmer: enough to meet "managing" with "managed" and "management".
 * Applied only to words of five letters or more, so short skills (java, go, c#) never
 * collapse into other words, and only on exact stem equality, never prefixes.
 */
export function stem(word: string): string {
  let w = fold(word)
  if (w.length < 5 || !/^[a-z]+$/.test(w)) return w
  for (const suffix of ['ments', 'ment', 'ings', 'ing', 'ied', 'ies', 'ed', 'es', 's']) {
    if (w.length - suffix.length >= 4 && w.endsWith(suffix) && !(suffix === 's' && w.endsWith('ss'))) {
      w = w.slice(0, -suffix.length)
      break
    }
  }
  return w.replace(/e$/, '')
}

function stemSet(text: string): Set<string> {
  return new Set(wordTokens(text).map(stem))
}

// Accent-folded, so "gestión" in the job ad meets "gestion" in the CV. Only used
// for matching; the keywords shown to the user keep their accents.
function normalize(s: string): string {
  return fold(s)
}

export function wordRe(term: string): RegExp {
  // Custom word boundary that tolerates term chars like "ci/cd", "c#", ".net".
  // Avoid look-behind (Safari < 16.4 lacks it); a leading non-alnum class works
  // the same for the boolean .test() we use it for.
  return new RegExp(String.raw`(?:^|[^\p{L}\p{N}])` + term.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) + String.raw`(?![\p{L}\p{N}])`, 'iu')
}

function wordTokens(value: string): string[] {
  const tokenRe = /\p{L}[\p{L}\p{N}+#.]{2,}/gu
  const tokens: string[] = []
  let match: RegExpExecArray | null

  while ((match = tokenRe.exec(value)) !== null) {
    // A trailing dot is sentence punctuation ("SEO."), not part of the word; "node.js" keeps its inner dot.
    const token = match[0].replace(/\.+$/, '')
    if (token.length >= 3) tokens.push(token)
  }

  return tokens
}

const NICE_RE = /\b(?:nice[- ]to[- ]have|preferred|bonus|a plus|desirable|good to have|ideally)\b/i

/** Terms whose every mention sits on a line (or under a heading) marked as preferred. */
function niceTerms(jd: string, terms: string[]): Set<string> {
  const mentions = new Map<string, { nice: number; other: number }>()
  let mode: 'nice' | 'other' = 'other'
  for (const raw of jd.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const heading = line.length <= 40 && !/[.;]$/.test(line)
    if (heading && NICE_RE.test(line)) mode = 'nice'
    else if (heading && /\b(?:requirements?|must[- ]have|required|qualifications|minimum|you will need|what you.ll need|responsibilities)\b/i.test(line)) mode = 'other'
    const nice = mode === 'nice' || NICE_RE.test(line)
    const folded = normalize(line)
    for (const term of terms) {
      if (!wordRe(normalize(term)).test(folded)) continue
      const m = mentions.get(term) ?? { nice: 0, other: 0 }
      if (nice) m.nice += 1
      else m.other += 1
      mentions.set(term, m)
    }
  }
  return new Set([...mentions].filter(([, m]) => m.nice > 0 && m.other === 0).map(([term]) => term))
}

function presentIn(term: string, haystack: string, stems: Set<string>): boolean {
  const candidates = [term, ...equivalentsOf(term)].map(fold)
  return candidates.some((c) => wordRe(c).test(haystack) || (!c.includes(' ') && c.length >= 5 && stems.has(stem(c))))
}

export function matchJD(cvText: string, cvSkills: string[], jd: string, context: MatchContext = {}): JDMatch {
  const jdLower = jd.toLowerCase() // shown to the user, accents intact
  const jdFolded = normalize(jd)
  const skillsText = normalize(cvSkills.join(' '))
  const cvHaystack = normalize(cvText + ' ' + cvSkills.join(' '))
  const cvStems = stemSet(cvHaystack)
  const experienceText = context.experienceText === undefined ? undefined : normalize(context.experienceText)
  const experienceStems = experienceText === undefined ? undefined : stemSet(experienceText)
  const weights = new Map<string, number>()

  // 1) Lexicon skills present in the JD get a high base weight.
  for (const skill of LEXICON) {
    if (wordRe(skill).test(jdFolded)) weights.set(skill, (weights.get(skill) ?? 0) + 3)
  }

  // 2) Frequency of meaningful single tokens in the JD.
  const freq = new Map<string, number>()
  for (const tok of wordTokens(jdLower)) {
    if (STOPWORDS.has(fold(tok))) continue
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }
  for (const [tok, count] of freq) {
    if (count >= 2 || weights.has(tok)) weights.set(tok, (weights.get(tok) ?? 0) + count)
  }

  // 3) Build, dedupe (drop tokens already covered by a multi-word skill), rank.
  const multi = [...weights.keys()].filter((k) => k.includes(' '))
  const kept = [...weights.entries()].filter(([term]) => !(/^\p{L}/u.test(term) && !term.includes(' ') && multi.some((m) => m.includes(term))))
  const nice = niceTerms(jd, kept.map(([term]) => term))
  const keywords: Keyword[] = kept
    .map(([term, weight]) => {
      const inCv = presentIn(term, cvHaystack, cvStems)
      const keyword: Keyword = { term, weight: nice.has(term) ? Math.max(1, Math.round(weight / 2)) : weight, inCv }
      if (nice.has(term)) keyword.priority = 'nice'
      if (inCv && experienceText !== undefined && experienceStems) {
        if (presentIn(term, experienceText, experienceStems)) keyword.where = 'experience'
        else keyword.where = presentIn(term, skillsText, stemSet(skillsText)) ? 'skills' : 'other'
      }
      return keyword
    })
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
