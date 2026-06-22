// Structured résumé parser. Clean-room implementation inspired by the publicly
// documented OpenResume 4-step approach (text items -> lines -> sections ->
// field extraction), written from scratch. Works on the line list produced by
// the PDF/DOCX extractors, so it degrades gracefully when positional data is
// absent (DOCX).
import type { Extracted } from './pdf'

export interface ExperienceEntry {
  title: string
  company: string
  date: string
  bullets: string[]
}
export interface EducationEntry {
  school: string
  degree: string
  date: string
}
export interface ProjectEntry {
  name: string
  description: string
}
export interface Resume {
  profile: {
    name: string
    email: string
    phone: string
    location: string
    links: string[]
    summary: string
  }
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  projects: ProjectEntry[]
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(?:\+?\d[\s\-().]?){9,}/
const URL_RE = /((?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com)\/\S+|[a-z0-9-]+\.(?:dev|io|me|com|net|org)(?:\/\S*)?)/i
const DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4}|\b(19|20)\d{2}\b|present|current|now/i
const BULLET_RE = /^\s*[•·▪◦‣*‐-―-]\s*/

const SECTION_TITLES: Record<string, string[]> = {
  summary: ['summary', 'profile', 'objective', 'about', 'about me'],
  experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience', 'employment'],
  education: ['education', 'academic background', 'academic'],
  skills: ['skills', 'core competencies', 'technical skills', 'expertise', 'technologies'],
  projects: ['projects', 'selected projects', 'side projects', 'personal projects'],
  certifications: ['certifications', 'certificates', 'courses', 'licenses', 'certifications & courses'],
  // Recognized only so they terminate the preceding section cleanly.
  languages: ['languages'],
  interests: ['interests', 'hobbies', 'hobbies & interests', 'interests & hobbies'],
  awards: ['awards', 'honors', 'achievements', 'key achievements'],
  other: ['publications', 'volunteer', 'volunteering', 'references', 'contact'],
}

function classifyHeader(line: string): string | null {
  const t = line.trim()
  if (!t || t.length > 45) return null
  const norm = t.toLowerCase().replace(/[^a-z& ]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const [key, names] of Object.entries(SECTION_TITLES)) {
    if (names.some((n) => norm === n || norm === n + 's' || norm.startsWith(n + ' ') || norm.endsWith(' ' + n))) {
      return key
    }
  }
  return null
}

/** Split the full line list into the profile preamble + named sections. */
function sectionize(lines: string[]): { preamble: string[]; sections: Record<string, string[]> } {
  const preamble: string[] = []
  const sections: Record<string, string[]> = {}
  let current: string | null = null
  for (const line of lines) {
    const header = classifyHeader(line)
    if (header) {
      current = header
      if (!sections[current]) sections[current] = []
      continue
    }
    if (current) sections[current].push(line)
    else preamble.push(line)
  }
  return { preamble, sections }
}

function parseProfile(preamble: string[], summarySection: string[] | undefined, fullText: string) {
  const email = (fullText.match(EMAIL_RE) || [''])[0]
  const emailDomain = email.split('@')[1]?.toLowerCase() ?? ''
  const phoneM = fullText.match(PHONE_RE)
  const phone = phoneM && phoneM[0].replace(/\D/g, '').length >= 9 ? phoneM[0].trim() : ''
  const links = Array.from(new Set((fullText.match(new RegExp(URL_RE, 'gi')) || []).map((s) => s.trim())))
    .filter((l) => l.toLowerCase() !== emailDomain) // drop the email's own domain
    .slice(0, 4)

  // Name: first preamble line that's mostly letters and not a contact line.
  let name = ''
  for (const l of preamble) {
    const t = l.trim()
    if (!t) continue
    if (EMAIL_RE.test(t) || /\d{4,}/.test(t)) continue
    if (/^[A-Za-z][A-Za-z .'-]+$/.test(t) && t.split(/\s+/).length <= 5) { name = t; break }
  }
  // Location: a preamble line with a comma that isn't the name/contact.
  let location = ''
  for (const l of preamble) {
    const t = l.trim()
    if (t === name) continue
    if (EMAIL_RE.test(t) || URL_RE.test(t)) continue
    if (/,/.test(t) && t.length <= 60 && /[A-Za-z]/.test(t)) { location = t.replace(/\s*·.*$/, '').trim(); break }
  }
  const summary = (summarySection || []).join(' ').trim()
  return { name, email, phone, location, links, summary }
}

/** Group a section's lines into entries: an entry starts at a non-bullet
 *  "header" line (often containing a date) and accrues following bullets. */
function groupEntries(lines: string[]): { header: string; bullets: string[] }[] {
  const entries: { header: string; bullets: string[] }[] = []
  let cur: { header: string; bullets: string[] } | null = null
  for (const line of lines) {
    const isBullet = BULLET_RE.test(line)
    if (!isBullet && (DATE_RE.test(line) || !cur)) {
      cur = { header: line.trim(), bullets: [] }
      entries.push(cur)
    } else if (cur) {
      cur.bullets.push(line.replace(BULLET_RE, '').trim())
    }
  }
  return entries
}

function splitHeader(header: string): { left: string; date: string } {
  const dm = header.match(DATE_RE)
  if (!dm) return { left: header.trim(), date: '' }
  // Take the date span from its first match to the end of the date-ish tail.
  const idx = header.search(DATE_RE)
  const left = header.slice(0, idx).replace(/[—–·|,\s]+$/, '').trim()
  const date = header.slice(idx).replace(/^[—–·|,\s]+/, '').trim()
  return { left: left || header.trim(), date }
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  return groupEntries(lines).map(({ header, bullets }) => {
    const { left, date } = splitHeader(header)
    // "Title — Company" or "Title at Company" or "Title, Company"
    const m = left.split(/\s+[—–]\s+| at | \| |,\s+/)
    const title = (m[0] || left).trim()
    const company = (m.slice(1).join(', ') || '').trim()
    return { title, company, date, bullets }
  }).filter((e) => e.title)
}

/** Split a section into items. If it's a bullet list (education/projects often
 *  are), each bullet is an item; otherwise each line is an item. */
function itemize(lines: string[]): string[] {
  if (!lines.some((l) => BULLET_RE.test(l))) return lines.map((l) => l.trim()).filter(Boolean)
  const items: string[] = []
  for (const line of lines) {
    if (BULLET_RE.test(line)) items.push(line.replace(BULLET_RE, '').trim())
    else if (items.length) items[items.length - 1] += ' ' + line.trim()
    else if (line.trim()) items.push(line.trim())
  }
  return items.filter(Boolean)
}

function parseEducation(lines: string[]): EducationEntry[] {
  return itemize(lines).map((item) => {
    const { left, date } = splitHeader(item)
    const degreeM = left.match(/(ph\.?d|master'?s?|bachelor'?s?|b\.?sc|m\.?sc|b\.?a|m\.?a|associate|diploma)[^—–,|]*/i)
    const degree = degreeM ? degreeM[0].trim() : ''
    const school = (degree ? left.replace(degree, '') : left).replace(/^[—–·|,\s]+|[—–·|,\s]+$/g, '').trim() || left.trim()
    return { school, degree, date }
  }).filter((e) => e.school)
}

function parseSkills(lines: string[]): string[] {
  const out: string[] = []
  for (const line of lines) {
    const body = line.replace(BULLET_RE, '').replace(/^[A-Za-z &/]+:\s*/, '') // drop "Leadership:" prefix
    for (const tok of body.split(/[,;•·|]/)) {
      const s = tok.trim()
      if (s && s.length <= 40) out.push(s)
    }
  }
  return Array.from(new Set(out))
}

function parseProjects(lines: string[]): ProjectEntry[] {
  return itemize(lines).map((item) => {
    const m = item.match(/^(.+?)\s*[—–(:]/) // split on dash/paren/colon, not hyphen
    const name = (m ? m[1] : item.split(/\s+/).slice(0, 3).join(' ')).trim()
    return { name, description: item.replace(name, '').replace(/^[\s—–(:-]+/, '').trim() }
  }).filter((p) => p.name)
}

export function parseResume(ex: Extracted): Resume {
  const { preamble, sections } = sectionize(ex.lines)
  return {
    profile: parseProfile(preamble, sections.summary, ex.text),
    experience: parseExperience(sections.experience || []),
    education: parseEducation(sections.education || []),
    skills: parseSkills(sections.skills || []),
    projects: parseProjects(sections.projects || []),
  }
}
