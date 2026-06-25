const CONTACT_SEPARATORS = new Set([' ', '\n', '\t', '\r', '|', ',', ';', '·'])
const PHONE_CHARS = new Set(['+', '-', '(', ')', '.', ' '])
const PROFILE_TLDS = new Set(['dev', 'io', 'me', 'com', 'net', 'org'])
const TRIM_CHARS = '()[]{}<>"\'.,;:'

export function contactTokens(value: string): string[] {
  const tokens: string[] = []
  let token = ''

  for (const char of value) {
    if (CONTACT_SEPARATORS.has(char)) {
      if (token) tokens.push(token)
      token = ''
    } else {
      token += char
    }
  }

  if (token) tokens.push(token)
  return tokens
}

export function cleanContactToken(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && TRIM_CHARS.includes(value[start])) start += 1
  while (end > start && TRIM_CHARS.includes(value[end - 1])) end -= 1
  return value.slice(start, end)
}

function isDigit(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return code >= 48 && code <= 57
}

function isLowercaseLetter(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return code >= 97 && code <= 122
}

export function digitCount(value: string): number {
  let count = 0
  for (const char of value) {
    if (isDigit(char)) count += 1
  }
  return count
}

function isDomainLabel(value: string): boolean {
  if (!value || value.startsWith('-') || value.endsWith('-')) return false
  for (const char of value) {
    if (!isDigit(char) && !isLowercaseLetter(char) && char !== '-') return false
  }
  return true
}

export function isEmailToken(raw: string): boolean {
  const token = cleanContactToken(raw).toLowerCase()
  const at = token.indexOf('@')
  if (at <= 0 || at !== token.lastIndexOf('@') || at === token.length - 1) return false

  const domain = token.slice(at + 1)
  const dot = domain.lastIndexOf('.')
  const tld = domain.slice(dot + 1)
  if (dot <= 0 || tld.length < 2) return false

  return domain.split('.').every(isDomainLabel)
}

export function findEmailAddress(text: string): string {
  return contactTokens(text).find(isEmailToken) ?? ''
}

export function hasEmailAddress(text: string): boolean {
  return Boolean(findEmailAddress(text))
}

function stripUrlProtocol(value: string): string {
  if (value.startsWith('https://')) return value.slice(8)
  if (value.startsWith('http://')) return value.slice(7)
  return value
}

function isProfileHost(host: string): boolean {
  const hostname = host.startsWith('www.') ? host.slice(4) : host
  if (hostname.includes('@')) return false

  const labels = hostname.split('.')
  if (labels.length < 2 || !labels.every(isDomainLabel)) return false

  const tld = labels.at(-1)
  return Boolean(tld && PROFILE_TLDS.has(tld))
}

function isProfileUrlToken(raw: string): boolean {
  if (isEmailToken(raw)) return false

  const token = stripUrlProtocol(cleanContactToken(raw).toLowerCase())
  const normalized = token.startsWith('www.') ? token.slice(4) : token
  if (normalized.startsWith('linkedin.com/') || normalized.startsWith('github.com/')) return true

  const slash = normalized.indexOf('/')
  const host = slash === -1 ? normalized : normalized.slice(0, slash)
  return isProfileHost(host)
}

export function hasProfileUrl(value: string): boolean {
  return contactTokens(value).some(isProfileUrlToken)
}

export function findProfileUrls(value: string, limit = Number.POSITIVE_INFINITY): string[] {
  const links: string[] = []
  const seen = new Set<string>()

  for (const raw of contactTokens(value)) {
    const token = cleanContactToken(raw)
    const key = token.toLowerCase()
    if (!isProfileUrlToken(token) || seen.has(key)) continue
    links.push(token)
    seen.add(key)
    if (links.length >= limit) break
  }

  return links
}

function isPhoneChar(char: string): boolean {
  return isDigit(char) || PHONE_CHARS.has(char)
}

export function findPhoneNumber(text: string): string {
  let candidate = ''

  function flush(): string {
    const phone = candidate.trim()
    candidate = ''
    const digits = digitCount(phone)
    return digits >= 9 && digits <= 15 ? phone : ''
  }

  for (const char of text) {
    if (isPhoneChar(char)) {
      candidate += char
      continue
    }

    const found = flush()
    if (found) return found
  }

  return flush()
}

export function hasPhoneNumber(text: string): boolean {
  return Boolean(findPhoneNumber(text))
}
