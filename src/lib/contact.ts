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

/** A URL written out as one: a protocol, a www. prefix, or a path. */
function isProfileUrlToken(raw: string): boolean {
  if (isEmailToken(raw)) return false

  const cleaned = cleanContactToken(raw).toLowerCase()
  const token = stripUrlProtocol(cleaned)
  const normalized = token.startsWith('www.') ? token.slice(4) : token
  if (normalized.startsWith('linkedin.com/') || normalized.startsWith('github.com/')) return true

  const slash = normalized.indexOf('/')
  const host = slash === -1 ? normalized : normalized.slice(0, slash)
  if (!isProfileHost(host)) return false

  return cleaned !== token || token.startsWith('www.') || slash !== -1
}

/** A host and nothing else: "jane.dev" - but also "socket.io". */
function isBareProfileHost(raw: string): boolean {
  if (isEmailToken(raw)) return false

  const cleaned = cleanContactToken(raw).toLowerCase()
  if (cleaned !== stripUrlProtocol(cleaned)) return false
  if (cleaned.startsWith('www.') || cleaned.includes('/')) return false
  return isProfileHost(cleaned)
}

function lineCarriesContactDetails(line: string): boolean {
  return contactTokens(line).some(isEmailToken) || hasPhoneNumber(line)
}

/**
 * A bare host is structurally identical to a package name - "jane.dev" and
 * "socket.io" are the same shape - so counting bare hosts anywhere credited any
 * CV that merely mentioned a .io/.dev library with having a profile link, and
 * then told it no link was needed.
 *
 * Position is not the discriminator (extraction order is unreliable); company
 * is. A bare host counts only on a line that already carries an email or phone,
 * which is what a contact line looks like. Anywhere else the URL has to be
 * written out - the same "full URL as visible text" this check's own fix asks
 * for, and the format the built-in Builder writes ("linkedin.com/in/you").
 */
function profileUrlsIn(value: string): string[] {
  const found: string[] = []

  for (const line of value.split('\n')) {
    const bareAllowed = lineCarriesContactDetails(line)
    for (const raw of contactTokens(line)) {
      if (isProfileUrlToken(raw) || (bareAllowed && isBareProfileHost(raw))) {
        found.push(cleanContactToken(raw))
      }
    }
  }

  return found
}

export function hasProfileUrl(value: string): boolean {
  return profileUrlsIn(value).length > 0
}

export function findProfileUrls(value: string, limit = Number.POSITIVE_INFINITY): string[] {
  const links: string[] = []
  const seen = new Set<string>()

  for (const token of profileUrlsIn(value)) {
    const key = token.toLowerCase()
    if (seen.has(key)) continue
    links.push(token)
    seen.add(key)
    if (links.length >= limit) break
  }

  return links
}

function isPhoneChar(char: string): boolean {
  return isDigit(char) || PHONE_CHARS.has(char)
}

/**
 * A 9-15 digit run is not enough on its own: '.' and ' ' are both phone
 * separators and decimal points, so a line of metrics like "96.5 99.5 99.9"
 * used to be reported as the candidate's phone number - on a tool whose own
 * advice is to add exactly those metrics.
 */
function looksLikePhone(candidate: string): boolean {
  const groups = candidate.split(/[^0-9]+/).filter(Boolean)
  if (groups.length === 0) return false

  // A one-digit group is a decimal fraction ("96.5"), not a phone segment. The
  // sole exception is a leading country code: "+1 555 123 4567".
  const leadingCountryCode = candidate.trimStart().startsWith('+')
  if (groups.some((g, i) => g.length === 1 && !(i === 0 && leadingCountryCode))) return false

  // "2019 2020 2021" is a run of years, not a number anyone can call.
  const isYear = (g: string) => g.length === 4 && Number(g) >= 1900 && Number(g) <= 2099
  return !groups.every(isYear)
}

export function findPhoneNumber(text: string): string {
  let candidate = ''

  function flush(): string {
    const phone = candidate.trim()
    candidate = ''
    const digits = digitCount(phone)
    if (digits < 9 || digits > 15) return ''
    return looksLikePhone(phone) ? phone : ''
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
