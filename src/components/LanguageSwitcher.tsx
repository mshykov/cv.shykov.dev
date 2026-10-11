// Language switcher. Plain links inside <details>, so it works in the prerendered
// HTML with no JavaScript and every language stays one crawlable click away.
import { LOCALES, type Locale } from '../i18n/locales.ts'

export interface LanguageLink {
  locale: Locale
  href: string
}

type Props = Readonly<{ current: Locale; links: LanguageLink[]; label: string }>

const nameOf = (code: Locale) => LOCALES.find((l) => l.code === code)

function GlobeIcon() {
  return (
    <svg className="h-4 w-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" />
    </svg>
  )
}

export function LanguageSwitcher({ current, links, label }: Props) {
  const here = nameOf(current)
  return (
    <details className="group relative">
      <summary
        aria-label={label}
        className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl bg-white/85 px-3.5 text-sm font-medium text-stone-700 shadow-lg shadow-stone-950/10 ring-1 ring-stone-200 backdrop-blur transition hover:bg-white hover:text-stone-950 [&::-webkit-details-marker]:hidden"
      >
        <GlobeIcon />
        <span className="hidden md:inline">{here?.nativeName}</span>
        <span className="md:hidden">{current.toUpperCase()}</span>
      </summary>
      <ul className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 text-sm shadow-xl shadow-stone-950/10">
        {links.map(({ locale, href }) => {
          const info = nameOf(locale)
          const active = locale === current
          return (
            <li key={locale}>
              <a
                href={href}
                hrefLang={info?.htmlLang}
                lang={info?.htmlLang}
                aria-current={active ? 'true' : undefined}
                className={`block px-4 py-2 transition hover:bg-stone-50 ${active ? 'font-semibold text-indigo-700' : 'text-stone-700'}`}
              >
                {info?.nativeName}
              </a>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

type FooterProps = Readonly<{ current: Locale; links: LanguageLink[]; label: string }>

/** The same links as a visible footer line, for readers and crawlers who skip menus. */
export function LanguageFooter({ current, links, label }: FooterProps) {
  const others = links.filter((l) => l.locale !== current)
  return (
    <nav aria-label={label} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>{label}:</span>
      {others.map(({ locale, href }) => {
        const info = nameOf(locale)
        return (
          <a key={locale} href={href} hrefLang={info?.htmlLang} lang={info?.htmlLang} className="font-medium text-stone-600 underline-offset-2 hover:underline">
            {info?.nativeName}
          </a>
        )
      })}
    </nav>
  )
}
