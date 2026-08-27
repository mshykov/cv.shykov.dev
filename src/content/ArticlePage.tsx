// The standalone shell a guide is rendered into. Ships no JavaScript: these
// pages are prose, so the app bundle would cost load time and buy nothing.
import type { Article } from './articles.tsx'
import { ARTICLES } from './articles.tsx'

function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-2xl shadow-sm ring-1 ring-black/5" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">cv.shykov.dev</span>
            <span className="block truncate text-base font-semibold tracking-tight text-stone-950">ATS Resume Toolkit</span>
          </span>
        </a>
        <a
          href="/"
          className="ml-auto shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Check my CV
        </a>
      </div>
    </header>
  )
}

function MoreGuides({ current }: { current: string }) {
  const others = ARTICLES.filter((a) => a.slug !== current)
  return (
    <nav aria-label="More guides" className="mt-14 border-t border-stone-200 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">More guides</h2>
      <ul className="mt-4 space-y-3">
        {others.map((a) => (
          <li key={a.slug}>
            <a href={`/${a.slug}`} className="group block">
              <span className="text-[15px] font-medium text-indigo-700 underline underline-offset-2 group-hover:text-indigo-800">{a.title}</span>
              <span className="mt-0.5 block text-sm leading-6 text-stone-500">{a.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ArticlePage({ article }: { article: Article }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10">
        <article>
          <p className="text-sm font-medium text-indigo-700">Guide</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">{article.description}</p>
          <p className="mt-4 text-sm text-stone-500">
            Updated <time dateTime={article.updated}>{article.updated}</time> · by{' '}
            <a href="https://shykov.dev/" className="underline underline-offset-2 hover:text-stone-700">Maksym Shykov</a>
          </p>
          <div className="mt-8">{article.body}</div>
        </article>
        <MoreGuides current={article.slug} />
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-sm text-stone-500">
          <p>
            <a href="/" className="font-medium text-stone-700 underline underline-offset-2">ATS Resume Toolkit</a> — runs in your browser.
          </p>
          <p>No uploads, no accounts, no tracking.</p>
        </div>
      </footer>
    </div>
  )
}
