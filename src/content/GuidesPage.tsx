// The guides index. Static like the guides themselves: no JavaScript.
import { ArrowUpRight } from '../components/ArrowUpRight'
import type { LanguageLink } from '../components/LanguageSwitcher'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { LocaleProvider, useLocale, type LocaleBundle } from '../i18n/context.ts'
import { headlineSize } from '../components/headline.ts'
import { guidePath } from '../i18n/locales.ts'

type Props = Readonly<{ bundle: LocaleBundle; links: LanguageLink[] }>

function Page({ links }: Readonly<{ links: LanguageLink[] }>) {
  const { locale, messages: m, guides } = useLocale()
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader current="guides" links={links} />
      <div className="mx-auto max-w-300 px-5 pb-10 sm:px-8">
        <main>
          <h1 className={`pb-8 pt-8 font-semibold leading-[0.92] tracking-[-0.055em] lg:pt-[var(--first-gap)] ${headlineSize(m.home.guides.heading)}`}>{m.home.guides.heading}</h1>
          <p className="max-w-[34em] text-xl text-ink-2">{m.home.guides.description}</p>
          <ul className="mt-12 border-t-2 border-ink">
            {guides.map((a) => (
              <li key={a.slug} className="border-b border-rule">
                <a href={guidePath(locale, a.slug)} className="group flex items-start justify-between gap-6 py-6">
                  <span>
                    <span className="block text-xl font-semibold tracking-[-0.01em] group-hover:underline group-hover:decoration-neon group-hover:decoration-4 group-hover:underline-offset-4">{a.title}</span>
                    <span className="mt-1 block max-w-[40em] text-ink-2">{a.description}</span>
                  </span>
                  <ArrowUpRight className="mt-2 h-4 w-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </main>
        <SiteFooter links={links} />
      </div>
    </div>
  )
}

export function GuidesPage({ bundle, links }: Props) {
  return (
    <LocaleProvider value={bundle}>
      <Page links={links} />
    </LocaleProvider>
  )
}
