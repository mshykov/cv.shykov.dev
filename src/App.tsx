import { lazy, Suspense, useRef, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { ArrowUpRight } from './components/ArrowUpRight'
import { GitHubMark } from './components/GitHubMark'
import { REPO_URL } from './components/repo'
import { LanguageFooter, LanguageSwitcher, type LanguageLink } from './components/LanguageSwitcher'
import { LocaleProvider, useLocale, useMessages, type LocaleBundle } from './i18n/context.ts'
import { LOCALES, guidePath, homePath } from './i18n/locales.ts'
import { SIBLINGS } from './components/siblings.ts'
import type { Job } from './lib/job.ts'

// The page is a sentence, the drop line and three crossed-out words; everything else
// loads on demand: Analyzer (with the reader, parser and scorer) after the first file,
// Builder (with @react-pdf/renderer) when the Build view opens.
const loadAnalyzer = () => import('./Analyzer')
const Analyzer = lazy(loadAnalyzer)
const Builder = lazy(() => import('./builder/Builder'))

type Mode = 'analyze' | 'build'
type ModeSwitchProps = Readonly<{ mode: Mode; onSwitch: (next: Mode) => void }>

// The homepage of every language, for the switcher and the footer.
const HOME_LINKS: LanguageLink[] = LOCALES.map((l) => ({ locale: l.code, href: homePath(l.code) }))

const TEXT_LINK = 'font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink'

// Headline steps: the shorter the sentence, the bigger it is set.
function headlineSize(h1: string): string {
  if (h1.length <= 36) return 'text-[clamp(3.4rem,14.2vw,9.5rem)]'
  if (h1.length <= 56) return 'text-[clamp(2.9rem,11.2vw,7.25rem)]'
  return 'text-[clamp(2.4rem,8.4vw,5.5rem)]'
}

function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  const { home: { header } } = useMessages()
  const next: Mode = mode === 'analyze' ? 'build' : 'analyze'
  return (
    <nav aria-label={header.primaryMode}>
      <button
        type="button"
        onClick={() => onSwitch(next)}
        className="inline-flex min-h-11 items-center px-2 text-base font-medium text-ink-2 transition-colors hover:text-ink sm:px-3"
      >
        {next === 'build' ? header.build : header.analyze}
      </button>
    </nav>
  )
}

function SiteHeader({ mode, onSwitch }: ModeSwitchProps) {
  const { locale, messages: { languages, home: { header, footer } } } = useLocale()
  return (
    <header>
      <div className="mx-auto flex min-h-16 max-w-300 items-center justify-between gap-3 px-5 sm:px-8">
        <span className="min-w-0 truncate text-base font-semibold tracking-[-0.01em]">cv.shykov.dev</span>
        <div className="flex shrink-0 items-center">
          <ModeSwitch mode={mode} onSwitch={onSwitch} />
          <a
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
            aria-label={footer.openSource}
            title={footer.openSource}
            className="inline-flex min-h-11 items-center gap-2 px-2 text-base font-medium text-ink-2 transition-colors hover:text-ink sm:px-3"
          >
            <GitHubMark className="size-5" />
            <span className="hidden md:inline">{header.openSource}</span>
          </a>
          <LanguageSwitcher current={locale} links={HOME_LINKS} label={languages.label} />
        </div>
      </div>
    </header>
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
      className={`flex flex-col justify-center pb-14 pt-8 ${compact ? '' : 'min-h-[calc(100svh-4rem)]'}`}
      onDragOver={(e) => { e.preventDefault(); onDrag(true) }}
      onDragLeave={() => onDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDrag(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onDrop(file)
      }}
    >
      <h1 className={`max-w-[10.5em] font-semibold sm:text-balance leading-[0.92] tracking-[-0.055em] ${headlineSize(hero.h1)}`}>{hero.h1}</h1>
      <p className="mt-6 text-[clamp(1.5rem,3.4vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em] sm:mt-10">{hero.runs}</p>
      <ul className="facts mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[clamp(1.125rem,2.2vw,1.5rem)] font-medium leading-tight text-ink-2">
        {hero.facts.map((fact) => <li key={fact}>{fact}</li>)}
      </ul>
      <button
        type="button"
        data-drag={drag}
        onClick={onBrowse}
        onPointerEnter={loadAnalyzer}
        onFocus={loadAnalyzer}
        className="dropzone mt-10 sm:mt-14"
      >
        <svg className="size-10 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden>
          <path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" />
        </svg>
        <span className="text-[clamp(1.375rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.03em]">{busy ? analyzer.dropBusy : analyzer.dropIdle}</span>
        <span className="mt-1 inline-flex min-h-12 items-center bg-ink px-6 text-base font-semibold text-paper">{analyzer.chooseButton}</span>
      </button>
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

function SiteFooter() {
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
      <LanguageFooter current={locale} links={HOME_LINKS} label={m.languages.footerLabel} />
    </footer>
  )
}

function AppBody() {
  const { messages: m } = useLocale()
  const [mode, setMode] = useState<Mode>('analyze')
  const [buildLoaded, setBuildLoaded] = useState(false)
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

  const switchMode = (next: Mode) => {
    if (next === 'build') setBuildLoaded(true)
    setMode(next)
    globalThis.scrollTo({ top: 0 })
  }

  const browse = () => inputRef.current?.click()

  return (
    <div className="min-h-full bg-paper">
      <SiteHeader mode={mode} onSwitch={switchMode} />
      <div className="mx-auto flex max-w-300 flex-col px-5 pb-10 sm:px-8 sm:pb-14">
        <main className="flex-1">
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
          <ErrorBoundary labels={m.home.errorBoundary}>
            <div className={mode === 'analyze' ? 'block' : 'hidden'}>
              <Hero compact={job !== null} busy={busy} drag={drag} onBrowse={browse} onDrop={choose} onDrag={setDrag} />
              {job && (
                <Suspense fallback={<p className="py-20 text-mute">{m.home.loading.score}</p>}>
                  <Analyzer key={job.id} job={job} onBusyChange={setBusy} onAnother={browse} />
                </Suspense>
              )}
            </div>
            {(mode === 'build' || buildLoaded) && (
              <Suspense fallback={<p className="py-20 text-mute">{m.home.loading.builder}</p>}>
                <div className={mode === 'build' ? 'block' : 'hidden'}>
                  <Builder />
                </div>
              </Suspense>
            )}
          </ErrorBoundary>
        </main>

        <div className="mt-28 grid gap-12 border-t border-rule pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <Questions />
          <Guides />
        </div>
        <SiteFooter />
      </div>
    </div>
  )
}

export default function App({ bundle }: Readonly<{ bundle: LocaleBundle }>) {
  return (
    <LocaleProvider value={bundle}>
      <AppBody />
    </LocaleProvider>
  )
}
