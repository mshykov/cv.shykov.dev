// Runtime loader: the browser fetches only the language of the page it is on.
// English ships in the main bundle (it is the default and the fallback); every
// other language is its own chunk, so the English page never downloads Spanish.
//
// One `case` per locale, with a literal path, because that is what lets the
// bundler split them. Adding a language: add a case and a bundle file.
import type { Locale } from './locales.ts'
import type { LocaleBundle } from './context.ts'
import { bundle as en } from './bundles/en.ts'

export async function loadLocale(locale: Locale): Promise<LocaleBundle> {
  switch (locale) {
    case 'es': return (await import('./bundles/es.ts')).bundle
    case 'pt-br': return (await import('./bundles/pt-br.ts')).bundle
    case 'pt-pt': return (await import('./bundles/pt-pt.ts')).bundle
    case 'fr': return (await import('./bundles/fr.ts')).bundle
    case 'de': return (await import('./bundles/de.ts')).bundle
    default: return en
  }
}
