// The standalone shell a guide is rendered into. Ships no JavaScript: these
// pages are prose, so the app bundle would cost load time and buy nothing.
import type { Article } from './types.ts'
import { REPO_URL } from '../components/GitHubMark'
import { LanguageFooter, LanguageSwitcher, type LanguageLink } from '../components/LanguageSwitcher'
import { LocaleProvider, useLocale, type LocaleBundle } from '../i18n/context.ts'
import { guidePath, homePath } from '../i18n/locales.ts'

type PageProps = Readonly<{ article: Article; bundle: LocaleBundle; links: LanguageLink[] }>

function SiteHeader({ links }: Readonly<{ links: LanguageLink[] }>) {
  const { locale, messages: m } = useLocale()
  const home = homePath(locale)
  return (
    <header className="border-b border-stone-200 bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <a href={home} className="flex min-w-0 items-center gap-3">
          <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-2xl shadow-sm ring-1 ring-black/5" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">cv.shykov.dev</span>
            <span className="block truncate text-base font-semibold tracking-tight text-stone-950">{m.brand}</span>
          </span>
        </a>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher current={locale} links={links} label={m.languages.label} />
          <a
            href={home}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {m.article.check}
          </a>
        </div>
      </div>
    </header>
  )
}

function MoreGuides({ current }: { current: string }) {
  const { locale, messages: m, guides } = useLocale()
  const others = guides.filter((a) => a.slug !== current)
  return (
    <nav aria-label={m.article.moreGuides} className="mt-14 border-t border-stone-200 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">{m.article.moreGuides}</h2>
      <ul className="mt-4 space-y-3">
        {others.map((a) => (
          <li key={a.slug}>
            <a href={guidePath(locale, a.slug)} className="group block">
              <span className="text-[15px] font-medium text-indigo-700 underline underline-offset-2 group-hover:text-indigo-800">{a.title}</span>
              <span className="mt-0.5 block text-sm leading-6 text-stone-500">{a.description}</span>
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
    <nav aria-label={m.article.breadcrumbAria} className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><a href={home} className="underline underline-offset-2 hover:text-stone-700">{m.brand}</a></li>
        <li aria-hidden>›</li>
        <li><a href={`${home}#guides`} className="underline underline-offset-2 hover:text-stone-700">{m.article.guidesCrumb}</a></li>
        <li aria-hidden>›</li>
        <li aria-current="page" className="text-stone-700">{title}</li>
      </ol>
    </nav>
  )
}

// The answer first, in a couple of sentences: it is what a reader skimming from
// search wants, and the passage an answer engine is most likely to quote.
function ShortAnswer({ children }: { children: string }) {
  const { messages: m } = useLocale()
  return (
    <section aria-labelledby="short-answer" className="mt-6 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
      <h2 id="short-answer" className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">{m.article.shortAnswer}</h2>
      <p className="mt-2 text-[15px] leading-7 text-stone-800">{children}</p>
    </section>
  )
}

// Rendered from the same data as the FAQPage JSON-LD, so the marked-up answers
// are always the visible ones - structured data that says something the page
// does not is what search engines penalise.
function Faq({ items }: { items: Article['faq'] }) {
  const { messages: m } = useLocale()
  return (
    <section aria-labelledby="faq" className="mt-12">
      <h2 id="faq" className="text-xl font-semibold tracking-tight text-stone-900">{m.article.faqHeading}</h2>
      <dl className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {items.map(({ q, a }) => (
          <div key={q} className="p-4">
            <dt className="text-[15px] font-semibold text-stone-900">{q}</dt>
            <dd className="mt-1.5 text-[15px] leading-7 text-stone-700">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Page({ article, links }: Readonly<{ article: Article; links: LanguageLink[] }>) {
  const { locale, messages: m } = useLocale()
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader links={links} />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
        <Breadcrumbs title={article.title} />
        <article className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">{article.description}</p>
          <p className="mt-4 text-sm text-stone-500">
            {m.article.published} <time dateTime={article.published}>{article.published}</time> · {m.article.updated}{' '}
            <time dateTime={article.updated}>{article.updated}</time> · {m.article.by}{' '}
            <a href="https://shykov.dev/" className="underline underline-offset-2 hover:text-stone-700">Maksym Shykov</a>
          </p>
          <ShortAnswer>{article.summary}</ShortAnswer>
          <div className="mt-8">{article.body}</div>
          <Faq items={article.faq} />
        </article>
        <MoreGuides current={article.slug} />
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-6 text-sm text-stone-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>
              <a href={homePath(locale)} className="font-medium text-stone-700 underline underline-offset-2">{m.brand}</a> — {m.article.footerRuns}
            </p>
            <p>
              {m.article.footerNo}{' '}
              <a href={REPO_URL} className="font-medium text-stone-700 underline underline-offset-2">{m.article.openSource}</a>.
            </p>
          </div>
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
