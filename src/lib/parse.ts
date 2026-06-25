// Structured résumé parser. Clean-room implementation inspired by the publicly
// documented OpenResume 4-step approach (text items -> lines -> sections ->
// field extraction), written from scratch. Works on the line list produced by
// the PDF/DOCX extractors, so it degrades gracefully when positional data is
// absent (DOCX).
import type { Extracted } from './pdf'
import { cleanContactToken, contactTokens, digitCount, findEmailAddress, findPhoneNumber, findProfileUrls, hasEmailAddress, hasPhoneNumber, hasProfileUrl } from './contact.ts'
import { findDate, hasDate, isBulletLine, normalizeHeader, stripBullet } from './text.ts'

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

const SECTION_TITLES: Record<string, string[]> = {
  summary: ['summary', 'profile', 'objective', 'about', 'about me'],
  experience: ['experience', 'employment history', 'work experience', 'work history', 'professional experience', 'employment', 'career experience', 'career history'],
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

const TRIM_SEPARATORS = new Set(['—', '–', '·', '|', ',', ' ', '\t', '\n', '\r', '(', ':', '-'])
const HEADER_SPLIT_SEPARATORS = [' — ', ' – ', ' at ', ' | ', ', ', ',']
const DEGREE_WORDS = ['ph.d', 'phd', "master's", 'masters', 'master', "bachelor's", 'bachelors', 'bachelor', 'b.sc', 'msc', 'm.sc', 'b.a', 'm.a', 'associate', 'diploma']
const EDUCATION_END_SEPARATORS = new Set(['—', '–', ',', '|'])
const SKILL_SPLIT_SEPARATORS = new Set([',', ';', '•', '·', '|'])
const PROJECT_SPLIT_SEPARATORS = new Set(['—', '–', '(', ':'])

function classifyHeader(line: string): string | null {
  const t = line.trim()
  if (!t || t.length > 45) return null
  const norm = normalizeHeader(t)
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

function hasLetter(value: string): boolean {
  for (const char of value) {
    const code = char.toLowerCase().codePointAt(0) ?? 0
    if (code >= 97 && code <= 122) return true
  }
  return false
}

function isNameChar(char: string): boolean {
  const code = char.toLowerCase().codePointAt(0) ?? 0
  return (code >= 97 && code <= 122) || char === ' ' || char === '.' || char === '\'' || char === '-'
}

function isLikelyName(value: string): boolean {
  if (!value || !hasLetter(value) || digitCount(value) > 0) return false
  return contactTokens(value).length <= 5 && [...value].every(isNameChar)
}

function trimStartSeparators(value: string): string {
  let start = 0
  while (start < value.length && TRIM_SEPARATORS.has(value[start])) start += 1
  return value.slice(start).trim()
}

function trimEndSeparators(value: string): string {
  let end = value.length
  while (end > 0 && TRIM_SEPARATORS.has(value[end - 1])) end -= 1
  return value.slice(0, end).trim()
}

function trimSeparators(value: string): string {
  return trimStartSeparators(trimEndSeparators(value))
}

function stripAfterMiddleDot(value: string): string {
  const dot = value.indexOf('·')
  return (dot === -1 ? value : value.slice(0, dot)).trim()
}

function findName(preamble: string[]): string {
  for (const line of preamble) {
    const text = line.trim()
    if (!text) continue
    if (hasEmailAddress(text) || hasPhoneNumber(text) || hasProfileUrl(text)) continue
    if (isLikelyName(text)) return text
  }
  return ''
}

function findLocation(preamble: string[], name: string): string {
  for (const line of preamble) {
    const text = line.trim()
    if (text === name) continue
    if (hasEmailAddress(text) || hasProfileUrl(text)) continue
    if (text.includes(',') && text.length <= 60 && hasLetter(text)) return stripAfterMiddleDot(text)
  }
  return ''
}

function parseProfile(preamble: string[], summarySection: string[] | undefined, fullText: string) {
  const email = findEmailAddress(fullText)
  const phone = findPhoneNumber(fullText)
  const links = findProfileUrls(fullText, 4)
  const name = findName(preamble)
  const location = findLocation(preamble, name)
  const summary = (summarySection || []).join(' ').trim()
  return { name, email, phone, location, links, summary }
}

/** Group a section's lines into entries: an entry starts at a non-bullet
 *  "header" line (often containing a date) and accrues following bullets. */
function groupEntries(lines: string[]): { header: string; bullets: string[] }[] {
  const entries: { header: string; bullets: string[] }[] = []
  let cur: { header: string; bullets: string[] } | null = null
  for (const line of lines) {
    const isBullet = isBulletLine(line)

    if (!cur) {
      if (!isBullet) {
        cur = { header: line.trim(), bullets: [] }
        entries.push(cur)
      }
      continue
    }

    if (isBullet) {
      cur.bullets.push(stripBullet(line))
      continue
    }

    if (cur.bullets.length === 0) {
      cur.header += '\n' + line.trim()
      continue
    }

    if (hasDate(line)) {
      cur = { header: line.trim(), bullets: [] }
      entries.push(cur)
      continue
    }

    cur.bullets.push(stripBullet(line))
  }
  return entries
}

function splitHeader(header: string): { left: string; date: string } {
  const dm = findDate(header)
  if (!dm) return { left: header.trim(), date: '' }
  // Take the date span from its first match to the end of the date-ish tail.
  const idx = dm.index ?? 0
  const left = trimEndSeparators(header.slice(0, idx))
  const date = trimStartSeparators(header.slice(idx))
  return { left: left || header.trim(), date }
}

function splitRoleCompany(left: string): string[] {
  for (const separator of HEADER_SPLIT_SEPARATORS) {
    const index = left.indexOf(separator)
    if (index > 0) return [left.slice(0, index), left.slice(index + separator.length)]
  }
  return [left]
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  return groupEntries(lines).map(({ header, bullets }) => {
    const parts = header.split('\n').map((p) => p.trim()).filter(Boolean)
    const headerLine = parts.at(-1) ?? header
    const leadingCompany = parts.length > 1 ? parts.slice(0, -1).join(', ') : ''
    const { left, date } = splitHeader(headerLine)
    // "Title — Company" or "Title at Company" or "Title, Company"
    const m = splitRoleCompany(left)
    const title = (m[0] || left).trim()
    const company = (leadingCompany || m.slice(1).join(', ') || '').trim()
    return { title, company, date, bullets }
  }).filter((e) => e.title)
}

/** Split a section into items. If it's a bullet list (education/projects often
 *  are), each bullet is an item; otherwise each line is an item. */
function itemize(lines: string[]): string[] {
  if (!lines.some(isBulletLine)) return lines.map((l) => l.trim()).filter(Boolean)
  const items: string[] = []
  for (const line of lines) {
    if (isBulletLine(line)) items.push(stripBullet(line))
    else if (items.length) items.splice(items.length - 1, 1, `${items.at(-1) ?? ''} ${line.trim()}`)
    else if (line.trim()) items.push(line.trim())
  }
  return items.filter(Boolean)
}

function parseEducation(lines: string[]): EducationEntry[] {
  return itemize(lines).map((item) => {
    const { left, date } = splitHeader(item)
    const degree = findDegree(left)
    const school = trimSeparators(degree ? left.replace(degree, '') : left) || left.trim()
    return { school, degree, date }
  }).filter((e) => e.school)
}

function findDegree(left: string): string {
  const lower = left.toLowerCase()
  let start = -1

  for (const word of DEGREE_WORDS) {
    const index = lower.indexOf(word)
    if (index !== -1 && (start === -1 || index < start)) start = index
  }

  if (start === -1) return ''

  let end = left.length
  for (let index = start; index < left.length; index += 1) {
    if (EDUCATION_END_SEPARATORS.has(left[index])) {
      end = index
      break
    }
  }

  return left.slice(start, end).trim()
}

function isSkillPrefix(value: string): boolean {
  if (!value) return false
  for (const char of value) {
    const code = char.toLowerCase().codePointAt(0) ?? 0
    const isLetter = code >= 97 && code <= 122
    if (!isLetter && char !== ' ' && char !== '&' && char !== '/') return false
  }
  return true
}

function stripSkillPrefix(value: string): string {
  const body = stripBullet(value)
  const colon = body.indexOf(':')
  if (colon === -1) return body
  return isSkillPrefix(body.slice(0, colon)) ? body.slice(colon + 1) : body
}

function splitSkills(value: string): string[] {
  const tokens: string[] = []
  let token = ''

  for (const char of value) {
    if (SKILL_SPLIT_SEPARATORS.has(char)) {
      if (token.trim()) tokens.push(token.trim())
      token = ''
    } else {
      token += char
    }
  }

  if (token.trim()) tokens.push(token.trim())
  return tokens
}

function parseSkills(lines: string[]): string[] {
  const out: string[] = []
  for (const line of lines) {
    const body = stripSkillPrefix(line)
    for (const tok of splitSkills(body)) {
      const s = cleanContactToken(tok)
      if (s && s.length <= 40) out.push(s)
    }
  }
  return Array.from(new Set(out))
}

function firstProjectSeparator(value: string): number {
  for (let index = 0; index < value.length; index += 1) {
    if (PROJECT_SPLIT_SEPARATORS.has(value[index])) return index
  }
  return -1
}

function projectName(item: string): string {
  const separator = firstProjectSeparator(item)
  if (separator > 0) return item.slice(0, separator).trim()
  return contactTokens(item).slice(0, 3).join(' ').trim()
}

function parseProjects(lines: string[]): ProjectEntry[] {
  return itemize(lines).map((item) => {
    const name = projectName(item)
    return { name, description: trimStartSeparators(item.slice(name.length)) }
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
