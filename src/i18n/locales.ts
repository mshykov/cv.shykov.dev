// The locale registry: the one place that says which languages the site speaks
// and where each lives. Everything else (routes, hreflang, sitemap, language
// switcher, prerender, OG images) reads from here, so adding a language starts
// with one entry below. See docs/localization.md.
import type { LangCode } from '../lib/lang/index.ts'

export const SITE = 'https://cv.shykov.dev'

export interface LocaleInfo {
  /** URL segment and our own id. English has no segment: it stays at the root. */
  code: string
  /** Value of <html lang> and of hreflang. */
  htmlLang: string
  /** Which src/lib/lang/<code>.ts word lists apply (Portuguese variants share one). */
  lang: LangCode
  /** Open Graph locale, language_TERRITORY. */
  ogLocale: string
  /** Name of the language in itself, for the switcher. */
  nativeName: string
  /** BCP 47 tag handed to Intl for number formatting. */
  intl: string
}

export const LOCALES = [
  { code: 'en', htmlLang: 'en', lang: 'en', ogLocale: 'en_US', nativeName: 'English', intl: 'en-US' },
  { code: 'es', htmlLang: 'es-ES', lang: 'es', ogLocale: 'es_ES', nativeName: 'Español', intl: 'es-ES' },
  { code: 'pt-br', htmlLang: 'pt-BR', lang: 'pt', ogLocale: 'pt_BR', nativeName: 'Português (Brasil)', intl: 'pt-BR' },
  { code: 'pt-pt', htmlLang: 'pt-PT', lang: 'pt', ogLocale: 'pt_PT', nativeName: 'Português (Portugal)', intl: 'pt-PT' },
  { code: 'fr', htmlLang: 'fr-FR', lang: 'fr', ogLocale: 'fr_FR', nativeName: 'Français', intl: 'fr-FR' },
  { code: 'de', htmlLang: 'de-DE', lang: 'de', ogLocale: 'de_DE', nativeName: 'Deutsch', intl: 'de-DE' },
] as const satisfies readonly LocaleInfo[]

export type Locale = (typeof LOCALES)[number]['code']
export const DEFAULT_LOCALE: Locale = 'en'

const BY_CODE = new Map<string, LocaleInfo>(LOCALES.map((l) => [l.code, l]))

export const isLocale = (value: string): value is Locale => BY_CODE.has(value)
export const localeInfo = (code: Locale): LocaleInfo => BY_CODE.get(code) as LocaleInfo

/** "" for English, "/es" for Spanish. Never ends with a slash. */
export const localePrefix = (code: Locale): string => (code === DEFAULT_LOCALE ? '' : `/${code}`)

/** Path of a locale's homepage: "/" for English, "/es/" for Spanish. */
export const homePath = (code: Locale): string => (code === DEFAULT_LOCALE ? '/' : `/${code}/`)

/** Path of a guide in a locale, given that locale's own slug for it. */
export const guidePath = (code: Locale, slug: string): string => `${localePrefix(code)}/${slug}`

export const absolute = (path: string): string => `${SITE}${path}`

/** The locale a path belongs to: "/es/x" → "es", "/anything-else" → "en". */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1]?.toLowerCase() ?? ''
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE
}

/** The locale an <html lang> value belongs to, or undefined. */
export function localeFromHtmlLang(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined
  const wanted = value.toLowerCase()
  return LOCALES.find((l) => l.htmlLang.toLowerCase() === wanted)?.code
}
