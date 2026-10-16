import { lazy, Suspense, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { ArrowUpRight } from './components/ArrowUpRight'
import { REPO_URL } from './components/repo'
import { LanguageFooter, LanguageSwitcher, type LanguageLink } from './components/LanguageSwitcher'
import { LocaleProvider, useLocale, useMessages, type LocaleBundle } from './i18n/context.ts'
import { LOCALES, guidePath, homePath } from './i18n/locales.ts'
import { splitHeadline } from './lib/headline.ts'
import { SIBLINGS } from './components/siblings.ts'

// Keep the app shell tiny; load the active workflow UI after first paint.
const Analyzer = lazy(() => import('./Analyzer'))
// Builder pulls in @react-pdf/renderer — load it only when the Build tab opens.
const Builder = lazy(() => import('./builder/Builder'))

type Mode = 'analyze' | 'build'
type ModeSwitchProps = Readonly<{ mode: Mode; onSwitch: (next: Mode) => void }>
type SiteHeaderProps = Readonly<{ mode: Mode; onSwitch: (next: Mode) => void }>

// The homepage of every language, for the switcher and the footer.
const HOME_LINKS: LanguageLink[] = LOCALES.map((l) => ({ locale: l.code, href: homePath(l.code) }))

function LogoMark() {
  const { brand } = useMessages()
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span aria-hidden className="size-3 shrink-0 bg-neon outline outline-1 outline-ink" />
      <span className="truncate text-lg font-bold tracking-[-0.02em]">cv.shykov.dev</span>
      <span className="hidden truncate font-mono text-xs uppercase text-ink-2 lg:inline">{brand}</span>
    </div>
  )
}

function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  const { home: { header } } = useMessages()
  return (
    <nav className="flex" aria-label={header.primaryMode}>
      {([['analyze', header.analyze], ['build', header.build]] as [Mode, string][]).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSwitch(id)}
          aria-pressed={mode === id}
          className={`min-h-11 px-3 text-base font-medium transition-colors ${mode === id ? 'text-ink shadow-[inset_0_-2px_0_var(--color-ink)]' : 'text-ink-2 hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

function SiteHeader({ mode, onSwitch }: SiteHeaderProps) {
  const { locale, messages: { home: { header }, languages } } = useLocale()
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-x-3 px-5 sm:px-8">
        <div className="flex min-h-14 min-w-0 items-center sm:mr-auto"><LogoMark /></div>
        <div className="order-3 -ml-3 flex w-full items-center sm:order-none sm:ml-0 sm:w-auto">
          <ModeSwitch mode={mode} onSwitch={onSwitch} />
        </div>
        <div className="flex shrink-0 items-center">
          <a
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
            aria-label={header.githubAria}
            className="hidden min-h-11 items-center gap-1 px-3 text-base font-medium text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            {header.github}
            <ArrowUpRight />
          </a>
          <LanguageSwitcher current={locale} links={HOME_LINKS} label={languages.label} />
        </div>
      </div>
    </header>
  )
}

// What leaves the browser. The privacy claim is the product, so it is the one
// designed object on the page: a number, and the rows that explain it.
function PrivacyReadout() {
  const { home: { hero: { privacy } } } = useMessages()
  return (
    <aside className="self-start" aria-label={privacy.aria}>
      <div className="neon-block flex items-end justify-between gap-4 px-5 pb-5 pt-6">
        <b className="text-[clamp(6.5rem,22vw,10rem)] font-bold leading-[0.78] tracking-[-0.06em]">0</b>
        <span className="max-w-[9.5em] pb-0.5 text-right text-[0.9375rem] font-medium leading-snug">{privacy.zero}</span>
      </div>
      <ul>
        {privacy.rows.map(({ label, value }) => (
          <li key={label} className="flex justify-between gap-4 border-b border-rule py-4">
            <span>{label}</span>
            <span className="font-semibold">{value}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 border-b border-rule py-4">
          <span>{privacy.source}</span>
          <a href={REPO_URL} rel="noreferrer" target="_blank" className="inline-flex items-center gap-1 font-semibold underline decoration-rule-2 underline-offset-4 hover:decoration-ink">
            {privacy.sourceValue}
            <ArrowUpRight />
          </a>
        </li>
      </ul>
    </aside>
  )
}

function Hero({ onCheck, onBuild }: Readonly<{ onCheck: () => void; onBuild: () => void }>) {
  const { home: { hero } } = useMessages()
  const { lead, mark } = splitHeadline(hero.h1)
  // Long headlines (fr, es, de) get a smaller step so they stay at four or five lines.
  const long = hero.h1.length > 52
  return (
    <section className="mx-auto grid max-w-300 gap-12 px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,7.4fr)_minmax(0,4fr)] lg:gap-20 lg:pb-20 lg:pt-24">
      <div>
        <h1 className={`font-bold leading-[1.04] tracking-[-0.045em] ${long ? 'text-[clamp(2.25rem,7.6vw,4rem)]' : 'text-[clamp(2.6rem,9vw,5.25rem)]'}`}>
          {lead}{' '}
          {mark && <span className="hl">{mark}</span>}
        </h1>
        <p className="mt-7 max-w-[32em] text-lg leading-relaxed text-ink-2 sm:text-xl">{hero.lead}</p>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
          <button type="button" onClick={onCheck} className="btn">{hero.check}</button>
          <button type="button" onClick={onBuild} className="alt">{hero.build}</button>
        </div>
      </div>
      <PrivacyReadout />
    </section>
  )
}

function HowItWorks() {
  const { home: { how } } = useMessages()
  return (
    <section className="mt-16 sm:mt-20" aria-label={how.aria}>
      <ol className="border-t-2 border-ink">
        {how.steps.map(({ title, body }, index) => (
          <li key={title} className="grid gap-x-8 gap-y-1 border-b border-rule py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:items-baseline">
            <span className="lab hidden sm:block">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-ink-2">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function TrustNotes() {
  const { home: { trust } } = useMessages()
  return (
    <section className="mt-24 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20" aria-label={trust.aria}>
      <div>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">{trust.heading}</h2>
        <p className="mt-4 max-w-[34em] text-ink-2">{trust.body}</p>
      </div>
      <dl className="border-t-2 border-ink">
        {trust.cards.map((card) => (
          <div key={card.title} className="border-b border-rule py-5">
            <dt className="text-lg font-semibold">{card.title}</dt>
            <dd className="mt-1 max-w-[40em] text-ink-2">{card.body}</dd>
          </div>
        ))}
        <div className="border-b border-rule py-5">
          <dt>
            <a className="inline-flex items-center gap-1.5 text-lg font-semibold underline decoration-rule-2 decoration-2 underline-offset-4 hover:decoration-ink" href={REPO_URL} rel="noreferrer" target="_blank">
              {trust.repoTitle}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </dt>
          <dd className="mt-1 max-w-[40em] text-ink-2">{trust.repoBody}</dd>
        </div>
      </dl>
    </section>
  )
}

function AppBody() {
  const { locale, messages: m, guides } = useLocale()
  const [mode, setMode] = useState<Mode>('analyze')
  const [buildLoaded, setBuildLoaded] = useState(false)

  const switchMode = (next: Mode) => {
    if (next === 'build') setBuildLoaded(true)
    setMode(next)
  }

  const scrollToTool = () => {
    globalThis.requestAnimationFrame(() => document.getElementById('fast-ats-score')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const switchModeAndFocusTool = (next: Mode) => {
    switchMode(next)
    scrollToTool()
  }

  return (
    <div className="min-h-full bg-paper">
      <SiteHeader mode={mode} onSwitch={switchModeAndFocusTool} />
      <Hero onCheck={() => switchModeAndFocusTool('analyze')} onBuild={() => switchModeAndFocusTool('build')} />

      <div className="mx-auto flex max-w-300 flex-col px-5 pb-10 sm:px-8 sm:pb-14">
        <main id="fast-ats-score" className="flex-1 scroll-mt-6">
          <ErrorBoundary labels={m.home.errorBoundary}>
            <Suspense fallback={<p className="py-20 text-center text-mute">{m.home.loading.score}</p>}>
              <div className={mode === 'analyze' ? 'block' : 'hidden'}>
                <Analyzer />
              </div>
            </Suspense>
            {(mode === 'build' || buildLoaded) && (
              <Suspense fallback={<p className="py-20 text-center text-mute">{m.home.loading.builder}</p>}>
                <div className={mode === 'build' ? 'block' : 'hidden'}>
                  <Builder />
                </div>
              </Suspense>
            )}
          </ErrorBoundary>
        </main>

        <HowItWorks />
        <TrustNotes />

        <section className="mt-24 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20" aria-label={m.home.faq.aria}>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">{m.home.faq.heading}</h2>
          <div className="border-t-2 border-ink">
            {m.home.faq.items.map(({ q, a }) => (
              <div key={q} className="border-b border-rule py-5">
                <h2 className="text-lg font-semibold">{q}</h2>
                <p className="mt-1.5 max-w-[42em] text-ink-2">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="guides" className="mt-24 grid scroll-mt-6 gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20" aria-label={m.home.guides.aria}>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">{m.home.guides.heading}</h2>
          <ul className="border-t-2 border-ink">
            {guides.map((a) => (
              <li key={a.slug} className="border-b border-rule">
                <a href={guidePath(locale, a.slug)} className="group flex items-start justify-between gap-6 py-5">
                  <span>
                    <span className="block text-lg font-semibold group-hover:underline group-hover:decoration-neon group-hover:decoration-4 group-hover:underline-offset-4">{a.title}</span>
                    <span className="mt-1 block max-w-[40em] text-ink-2">{a.description}</span>
                  </span>
                  <ArrowUpRight className="mt-2 h-4 w-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-24 border-t border-rule pt-6 text-sm text-ink-2">
          <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
            <p>{m.home.footer.disclaimer} <a href="https://shykov.dev/" className="font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink">{m.home.footer.author}</a></p>
            <p className="mt-1 sm:mt-0">{m.home.footer.noTracking} <a href={REPO_URL} rel="noreferrer" target="_blank" className="font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink">{m.home.footer.openSource}</a>.</p>
          </div>
          <nav aria-label={m.home.footer.moreFrom} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{m.home.footer.moreFrom}:</span>
            {SIBLINGS.map((s) => (
              <a key={s.name} href={s.href} className="font-medium underline underline-offset-4 decoration-rule-2 hover:decoration-ink">{s.name}</a>
            ))}
          </nav>
          <LanguageFooter current={locale} links={HOME_LINKS} label={m.languages.footerLabel} />
        </footer>
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
