// The standalone shell a guide is rendered into. Ships no JavaScript: these
// pages are prose, so the app bundle would cost load time and buy nothing.
import type { Article } from './types.ts'
import { ArrowUpRight } from '../components/ArrowUpRight'
import { REPO_URL } from '../components/repo'
import { LanguageFooter, LanguageSwitcher, type LanguageLink } from '../components/LanguageSwitcher'
import { LocaleProvider, useLocale, type LocaleBundle } from '../i18n/context.ts'
import { guidePath, homePath } from '../i18n/locales.ts'
import { SIBLINGS } from '../components/siblings.ts'

type PageProps = Readonly<{ article: Article; bundle: LocaleBundle; links: LanguageLink[] }>

const LINK = 'font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink'

function SiteHeader({ links }: Readonly<{ links: LanguageLink[] }>) {
  const { locale, messages: m } = useLocale()
  const home = homePath(locale)
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex min-h-16 max-w-300 items-center justify-between gap-3 px-5 sm:px-8">
        <a href={home} className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="size-3 shrink-0 bg-neon outline outline-1 outline-ink" />
          <span className="truncate text-lg font-bold tracking-[-0.02em]">cv.shykov.dev</span>
          <span className="hidden truncate font-mono text-xs uppercase text-ink-2 sm:inline">{m.brand}</span>
        </a>
        <div className="flex shrink-0 items-center gap-1">
          <LanguageSwitcher current={locale} links={links} label={m.languages.label} />
          <a href={home} className="btn-sm bg-ink text-paper hover:bg-neon hover:text-on-neon">{m.article.check}</a>
        </div>
      </div>
    </header>
  )
}

function MoreGuides({ current }: { current: string }) {
  const { locale, messages: m, guides } = useLocale()
  const others = guides.filter((a) => a.slug !== current)
  return (
    <nav aria-label={m.article.moreGuides} className="mt-20">
      <h2 className="lab border-b-2 border-ink pb-2">{m.article.moreGuides}</h2>
      <ul>
        {others.map((a) => (
          <li key={a.slug} className="border-b border-rule">
            <a href={guidePath(locale, a.slug)} className="group flex items-start justify-between gap-6 py-4">
              <span>
                <span className="block text-lg font-semibold group-hover:underline group-hover:decoration-neon group-hover:decoration-4 group-hover:underline-offset-4">{a.title}</span>
                <span className="mt-0.5 block text-ink-2">{a.description}</span>
              </span>
              <ArrowUpRight className="mt-2 h-4 w-4 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Mirrors the BreadcrumbList JSON-LD that scripts/prerender.mjs emits, so the
// trail a search engine is told about is also the one a reader can click.
function Breadcrumbs({ title }: { title: string }) {
  const { locale, messages: m } = useLocale()
  const home = homePath(locale)
  return (
    <nav aria-label={m.article.breadcrumbAria} className="text-sm text-ink-2">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li><a href={home} className={LINK}>{m.brand}</a></li>
        <li aria-hidden>/</li>
        <li><a href={`${home}#guides`} className={LINK}>{m.article.guidesCrumb}</a></li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-ink">{title}</li>
      </ol>
    </nav>
  )
}

// The answer first, in a couple of sentences: it is what a reader skimming from
// search wants, and the passage an answer engine is most likely to quote.
function ShortAnswer({ children }: { children: string }) {
  const { messages: m } = useLocale()
  return (
    <section aria-labelledby="short-answer" className="mt-8 border-l-4 border-neon bg-panel p-5">
      <h2 id="short-answer" className="lab">{m.article.shortAnswer}</h2>
      <p className="mt-2 text-lg leading-8">{children}</p>
    </section>
  )
}

// Rendered from the same data as the FAQPage JSON-LD, so the marked-up answers
// are always the visible ones - structured data that says something the page
// does not is what search engines penalise.
function Faq({ items }: { items: Article['faq'] }) {
  const { messages: m } = useLocale()
  return (
    <section aria-labelledby="faq" className="mt-16">
      <h2 id="faq" className="text-2xl font-bold tracking-tight">{m.article.faqHeading}</h2>
      <dl className="mt-4 border-t-2 border-ink">
        {items.map(({ q, a }) => (
          <div key={q} className="border-b border-rule py-5">
            <dt className="text-lg font-semibold">{q}</dt>
            <dd className="mt-1.5 text-[17px] leading-8 text-ink-2">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Page({ article, links }: Readonly<{ article: Article; links: LanguageLink[] }>) {
  const { locale, messages: m } = useLocale()
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader links={links} />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
        <Breadcrumbs title={article.title} />
        <article className="mt-8">
          <h1 className="text-[clamp(2.25rem,7vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.04em]">{article.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-2">{article.description}</p>
          <p className="lab mt-5 normal-case tracking-normal">
            {m.article.published} <time dateTime={article.published}>{article.published}</time> · {m.article.updated}{' '}
            <time dateTime={article.updated}>{article.updated}</time> · {m.article.by}{' '}
            <a href="https://shykov.dev/" className="underline underline-offset-4 decoration-rule-2 hover:decoration-ink">Maksym Shykov</a>
          </p>
          <ShortAnswer>{article.summary}</ShortAnswer>
          <div className="mt-8">{article.body}</div>
          <Faq items={article.faq} />
        </article>
        <MoreGuides current={article.slug} />
      </main>
      <footer className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-5 py-6 text-sm text-ink-2 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>
              <a href={homePath(locale)} className={LINK}>{m.brand}</a> — {m.article.footerRuns}
            </p>
            <p>
              {m.article.footerNo}{' '}
              <a href={REPO_URL} className={LINK}>{m.article.openSource}</a>.
            </p>
          </div>
          <nav aria-label={m.home.footer.moreFrom} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{m.home.footer.moreFrom}:</span>
            {SIBLINGS.map((s) => (
              <a key={s.name} href={s.href} className={LINK}>{s.name}</a>
            ))}
          </nav>
          <LanguageFooter current={locale} links={links} label={m.languages.footerLabel} />
        </div>
      </footer>
    </div>
  )
}

export function ArticlePage({ article, bundle, links }: PageProps) {
  return (
    <LocaleProvider value={bundle}>
      <Page article={article} links={links} />
    </LocaleProvider>
  )
}
