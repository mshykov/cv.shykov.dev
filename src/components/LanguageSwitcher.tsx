// Language switcher. Plain links inside <details>, so it works in the prerendered
// HTML with no JavaScript and every language stays one crawlable click away.
import { useEffect, useRef } from 'react'
import { LOCALES, type Locale } from '../i18n/locales.ts'

export interface LanguageLink {
  locale: Locale
  href: string
}

type Props = Readonly<{ current: Locale; links: LanguageLink[]; label: string }>

const nameOf = (code: Locale) => LOCALES.find((l) => l.code === code)

export function LanguageSwitcher({ current, links, label }: Props) {
  const here = nameOf(current)
  const menu = useRef<HTMLDetailsElement>(null)

  // A click outside the menu, or Escape, closes it. Where no script runs (the guide pages)
  // it is still a plain <details> that opens and closes on its own summary.
  useEffect(() => {
    const close = (e: Event) => {
      const el = menu.current
      if (el?.open && !(e instanceof PointerEvent && el.contains(e.target as Node))) el.open = false
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(e)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <details ref={menu} className="group relative">
      <summary
        aria-label={label}
        title={here?.nativeName}
        className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 px-2 font-mono sm:px-3 text-sm font-medium uppercase text-ink-2 transition-colors hover:text-ink group-open:text-ink [&::-webkit-details-marker]:hidden"
      >
        {current}
        <svg className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 4.5l4 4 4-4" />
        </svg>
      </summary>
      <ul className="absolute right-0 z-50 mt-1 w-52 border border-ink bg-paper py-1 text-base">
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
                className={`flex min-h-11 items-center justify-between px-4 transition-colors hover:bg-neon hover:text-on-neon ${active ? 'font-semibold text-ink' : 'text-ink-2'}`}
              >
                {info?.nativeName}
                {active && <span aria-hidden className="size-2 bg-ink" />}
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
    <nav aria-label={label} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>{label}:</span>
      {others.map(({ locale, href }) => {
        const info = nameOf(locale)
        return (
          <a key={locale} href={href} hrefLang={info?.htmlLang} lang={info?.htmlLang} className="font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink">
            {info?.nativeName}
          </a>
        )
      })}
    </nav>
  )
}
