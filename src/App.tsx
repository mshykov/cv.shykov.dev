import { lazy, Suspense, useRef, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import type { LanguageLink } from './components/LanguageSwitcher'
import { LocaleProvider, useLocale, useMessages, type LocaleBundle } from './i18n/context.ts'
import { LOCALES, buildPath, guidePath, homePath } from './i18n/locales.ts'
import type { Job } from './lib/job.ts'

// The page is a sentence, the drop line and three crossed-out words; everything else
// loads on demand: Analyzer (with the reader, parser and scorer) after the first file,
// Builder (with @react-pdf/renderer) when the Build view opens.
const loadAnalyzer = () => import('./Analyzer')
const Analyzer = lazy(loadAnalyzer)
const Builder = lazy(() => import('./builder/Builder'))

export type Mode = 'analyze' | 'build'

// The same page in every language, for the language menu and the footer.
const pageLinks = (path: (code: (typeof LOCALES)[number]['code']) => string): LanguageLink[] => LOCALES.map((l) => ({ locale: l.code, href: path(l.code) }))
const HOME_LINKS = pageLinks(homePath)
const BUILD_LINKS = pageLinks(buildPath)

// Headline steps: the shorter the sentence, the bigger it is set. On a laptop the size is
// also capped by the height of the window, so the whole first screen stays in view.
function headlineSize(h1: string): string {
  const length = h1.replaceAll('\n', ' ').length
  if (length <= 36) return 'text-[clamp(3.4rem,14.2vw,9.5rem)] lg:text-[clamp(3rem,min(6.4vw,15vh),6.5rem)]'
  if (length <= 56) return 'text-[clamp(2.9rem,11.2vw,7.25rem)] lg:text-[clamp(2.5rem,min(5.6vw,13vh),5.25rem)]'
  return 'text-[clamp(2.4rem,8.4vw,5.5rem)] lg:text-[clamp(2.25rem,min(4.2vw,10vh),4rem)]'
}

// A report, drawn in type: the number, a bar, the three biggest fixes. Labels come from the
// scorer's own messages; the numbers are an example and the page says so.
function SampleReport() {
  const { home: { hero }, analysis: { labels } } = useMessages()
  const fixes = [[5, labels.phone], [3, labels.links], [2, labels.quant]] as const
  return (
    <div aria-hidden className="hidden border border-rule-2 p-6 lg:block">
      <p className="lab">{hero.example}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-[4.5rem] font-semibold leading-[0.8] tracking-[-0.07em] tabular-nums">90</span>
        <span className="pb-1 text-lg font-medium text-ink-2">/100</span>
      </div>
      <div className="mt-4 h-1.5 bg-rule"><div className="h-full w-[90%] bg-neon outline outline-1 outline-ink" /></div>
      <ol className="mt-4">
        {fixes.map(([points, label]) => (
          <li key={label} className="flex items-center justify-between gap-3 border-t border-rule py-2 text-sm">
            <span className="truncate">{label}</span>
            <span className="neon-block shrink-0 px-1.5 py-0.5 font-mono text-xs font-semibold">−{points}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

type HeroProps = Readonly<{
  compact: boolean
  busy: boolean
  drag: boolean
  onBrowse: () => void
  onDrop: (file: File) => void
  onDrag: (over: boolean) => void
}>

// The whole first screen: a sentence, the one thing to do, and what it does without.
function Hero({ compact, busy, drag, onBrowse, onDrop, onDrag }: HeroProps) {
  const { home: { hero }, analyzer } = useMessages()
  return (
    <section
      className={`flex flex-col justify-center gap-10 pb-12 pt-6 lg:gap-12 ${compact ? '' : 'min-h-[calc(100svh-4rem)]'}`}
      onDragOver={(e) => { e.preventDefault(); onDrag(true) }}
      onDragLeave={() => onDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDrag(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onDrop(file)
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end lg:gap-14">
        <h1 className={`whitespace-pre-line text-balance font-semibold leading-[0.92] tracking-[-0.055em] ${headlineSize(hero.h1)}`}>{hero.h1}</h1>
        <SampleReport />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
        <div>
          <p className="text-[clamp(1.5rem,3.4vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em]">{hero.runs}</p>
          <ul className="facts mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[clamp(1.125rem,2.2vw,1.375rem)] font-medium leading-tight text-ink-2 lg:flex-col lg:gap-y-2">
            {hero.facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
        </div>
        <button
          type="button"
          data-drag={drag}
          onClick={onBrowse}
          onPointerEnter={loadAnalyzer}
          onFocus={loadAnalyzer}
          className="dropzone"
        >
          <svg className="size-10 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden>
            <path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" />
          </svg>
          <span className="dz-label text-[clamp(1.375rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.03em]">{busy ? analyzer.dropBusy : analyzer.dropIdle}</span>
          <span className="inline-flex min-h-12 shrink-0 items-center bg-ink px-6 text-base font-semibold text-paper">{analyzer.chooseButton}</span>
        </button>
      </div>
    </section>
  )
}

// Questions and answers, closed: the answers are in the HTML for readers and crawlers,
// the page only shows the questions.
function Questions() {
  const { home: { faq } } = useMessages()
  return (
    <section aria-label={faq.aria}>
      <h2 className="mb-2 text-base font-semibold">{faq.heading}</h2>
      {faq.items.map(({ q, a }) => (
        <details key={q} className="group border-b border-rule">
          <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <h2 className="text-base font-medium">{q}</h2>
            <span aria-hidden className="font-mono text-xl text-ink-2 group-open:hidden">+</span>
            <span aria-hidden className="hidden font-mono text-xl text-ink-2 group-open:inline">−</span>
          </summary>
          <p className="max-w-[42em] pb-5 text-ink-2">{a}</p>
        </details>
      ))}
    </section>
  )
}

function Guides() {
  const { locale, messages: m, guides } = useLocale()
  return (
    <section id="guides" aria-label={m.home.guides.aria}>
      <h2 className="mb-2 text-base font-semibold">{m.home.guides.heading}</h2>
      <ul>
        {guides.map((a) => (
          <li key={a.slug} className="border-b border-rule">
            <a href={guidePath(locale, a.slug)} className="block py-3.5 font-medium hover:underline hover:decoration-neon hover:decoration-4 hover:underline-offset-4">{a.title}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BuildPage() {
  const { home: { loading }, builder } = useMessages()
  return (
    <>
      <h1 className={`pb-8 pt-6 font-semibold leading-[0.92] tracking-[-0.055em] sm:text-balance ${headlineSize(builder.heading)}`}>
        {builder.heading.split(' ').map((word, i) => (
          // A short hyphenated word ("ATS-clean") must not break at its hyphen; a long one may.
          <span key={word} className={word.includes('-') && word.length <= 10 ? 'whitespace-nowrap' : undefined}>{i > 0 && ' '}{word}</span>
        ))}
      </h1>
      <Suspense fallback={<p className="py-20 text-mute">{loading.builder}</p>}>
        <Builder />
      </Suspense>
    </>
  )
}

function AnalyzePage() {
  const { messages: m } = useLocale()
  const [job, setJob] = useState<Job | null>(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const jobCount = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const choose = (file: File) => {
    jobCount.current += 1
    setBusy(true)
    setJob({ file, id: jobCount.current })
  }
  const browse = () => inputRef.current?.click()

  return (
    <>
      {typeof document !== 'undefined' && <input
        ref={inputRef}
        type="file"
        aria-label={m.analyzer.srHeading}
        accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) choose(file)
          e.currentTarget.value = ''
        }}
      />}
      <Hero compact={job !== null} busy={busy} drag={drag} onBrowse={browse} onDrop={choose} onDrag={setDrag} />
      {job && (
        <Suspense fallback={<p className="py-20 text-mute">{m.home.loading.score}</p>}>
          <Analyzer key={job.id} job={job} onBusyChange={setBusy} onAnother={browse} />
        </Suspense>
      )}
    </>
  )
}

function AppBody({ mode }: Readonly<{ mode: Mode }>) {
  const { messages: m } = useLocale()
  const links = mode === 'build' ? BUILD_LINKS : HOME_LINKS
  return (
    <div className="min-h-full bg-paper">
      <SiteHeader current={mode} links={links} />
      <div className="mx-auto flex max-w-300 flex-col px-5 pb-10 sm:px-8 sm:pb-14">
        <main className="flex-1">
          <ErrorBoundary labels={m.home.errorBoundary}>
            {mode === 'build' ? <BuildPage /> : <AnalyzePage />}
          </ErrorBoundary>
        </main>

        <div className={`mt-28 grid gap-12 border-t border-rule pt-12 ${mode === 'analyze' ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24' : ''}`}>
          {mode === 'analyze' && <Questions />}
          <Guides />
        </div>
        <SiteFooter links={links} />
      </div>
    </div>
  )
}

export default function App({ bundle, mode = 'analyze' }: Readonly<{ bundle: LocaleBundle; mode?: Mode }>) {
  return (
    <LocaleProvider value={bundle}>
      <AppBody mode={mode} />
    </LocaleProvider>
  )
}
