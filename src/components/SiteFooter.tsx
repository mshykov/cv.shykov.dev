import { useLocale } from '../i18n/context.ts'
import { ArrowUpRight } from './ArrowUpRight'
import { LanguageFooter, type LanguageLink } from './LanguageSwitcher'
import { REPO_URL } from './repo'
import { SIBLINGS } from './siblings.ts'

const TEXT_LINK = 'font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink'

/** The one quiet footer block of every page. */
export function SiteFooter({ links }: Readonly<{ links: LanguageLink[] }>) {
  const { locale, messages: m } = useLocale()
  return (
    <footer className="mt-16 border-t border-rule pt-6 text-sm text-ink-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span>{m.home.footer.disclaimer} <a href="https://shykov.dev/" className={TEXT_LINK}>{m.home.footer.author}</a></span>
        <a href={REPO_URL} rel="noreferrer" target="_blank" className={`inline-flex items-center gap-1 ${TEXT_LINK}`}>{m.home.footer.openSource}<ArrowUpRight /></a>
      </div>
      <p className="mt-2">{m.home.footer.noTracking}</p>
      <nav aria-label={m.home.footer.moreFrom} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>{m.home.footer.moreFrom}:</span>
        {SIBLINGS.map((s) => (
          <a key={s.name} href={s.href} className={TEXT_LINK}>{s.name}</a>
        ))}
      </nav>
      <LanguageFooter current={locale} links={links} label={m.languages.footerLabel} />
    </footer>
  )
}
