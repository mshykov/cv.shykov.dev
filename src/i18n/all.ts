// Every locale at once, statically imported. For the build-time prerender only:
// the browser never loads this (see load.ts, which splits locales into chunks).
import type { Article } from '../content/types.ts'
import type { LocaleBundle } from './context.ts'
import type { Locale } from './locales.ts'
import { bundle as en } from './bundles/en.ts'
import { bundle as es } from './bundles/es.ts'
import { bundle as ptBR } from './bundles/pt-br.ts'
import { bundle as ptPT } from './bundles/pt-pt.ts'
import { bundle as fr } from './bundles/fr.ts'
import { bundle as de } from './bundles/de.ts'
import { ARTICLES as enArticles } from '../content/en/articles.tsx'
import { ARTICLES as esArticles } from '../content/es/articles.tsx'
import { ARTICLES as ptBRArticles } from '../content/pt-br/articles.tsx'
import { ARTICLES as ptPTArticles } from '../content/pt-pt/articles.tsx'
import { ARTICLES as frArticles } from '../content/fr/articles.tsx'
import { ARTICLES as deArticles } from '../content/de/articles.tsx'

export const BUNDLES: Record<Locale, LocaleBundle> = { en, es, 'pt-br': ptBR, 'pt-pt': ptPT, fr, de }
export const ARTICLES: Record<Locale, Article[]> = {
  en: enArticles, es: esArticles, 'pt-br': ptBRArticles, 'pt-pt': ptPTArticles, fr: frArticles, de: deArticles,
}
