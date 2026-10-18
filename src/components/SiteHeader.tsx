// The header of every page: wordmark, the three pages, GitHub, language. Plain links, no
// script: the guide pages ship no JavaScript, and every page change is a real navigation
// (so the browser's Back button works).
import { useLocale } from '../i18n/context.ts'
import { buildPath, guidesPath, homePath } from '../i18n/locales.ts'
import { GitHubMark } from './GitHubMark'
import { LogoMark } from './LogoMark'
import { LanguageSwitcher, type LanguageLink } from './LanguageSwitcher'
import { REPO_URL } from './repo'

export type PageId = 'analyze' | 'build' | 'guides'

type Props = Readonly<{ current: PageId; links: LanguageLink[] }>

export function SiteHeader({ current, links }: Props) {
  const { locale, messages: m } = useLocale()
  const { header, footer, guides } = m.home
  const pages: [PageId, string, string][] = [
    ['analyze', homePath(locale), header.analyze],
    ['build', buildPath(locale), header.build],
    ['guides', guidesPath(locale), guides.heading],
  ]
  return (
    <header>
      <div className="mx-auto flex max-w-300 flex-wrap items-center gap-x-2 px-5 sm:px-8">
        <a href={homePath(locale)} className="mr-auto flex min-h-14 items-center gap-2.5 text-base font-semibold tracking-[-0.01em]"><LogoMark />cv.shykov.dev</a>
        <nav aria-label={header.primaryMode} className="order-3 -ml-2 flex w-full sm:order-none sm:ml-0 sm:w-auto">
          {pages.map(([id, href, label]) => (
            <a
              key={id}
              href={href}
              aria-current={current === id ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center px-2 text-base font-medium transition-colors sm:px-3 ${current === id ? 'text-ink shadow-[inset_0_-2px_0_var(--color-ink)]' : 'text-ink-2 hover:text-ink'}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href={REPO_URL}
          rel="noreferrer"
          target="_blank"
          aria-label={footer.openSource}
          title={footer.openSource}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-base font-medium text-ink-2 transition-colors hover:text-ink sm:px-3"
        >
          <GitHubMark className="size-5" />
          <span className="hidden lg:inline">{header.openSource}</span>
        </a>
        <LanguageSwitcher current={locale} links={links} label={m.languages.label} />
      </div>
    </header>
  )
}
