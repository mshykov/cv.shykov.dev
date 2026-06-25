import { lazy, Suspense, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'

// Keep the app shell tiny; load the active workflow UI after first paint.
const Analyzer = lazy(() => import('./Analyzer'))
// Builder pulls in @react-pdf/renderer — load it only when the Build tab opens.
const Builder = lazy(() => import('./builder/Builder'))

type Mode = 'analyze' | 'build'

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 5.75 6.1v5.45c0 4.03 2.58 7.62 6.25 8.7 3.67-1.08 6.25-4.67 6.25-8.7V6.1L12 3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.4 12.2 1.75 1.75 3.7-4.05" />
    </svg>
  )
}

function SourceIcon() {
  return (
    <svg className="h-4 w-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 9-3 3 3 3M16 9l3 3-3 3M13.5 5.5l-3 13" />
    </svg>
  )
}

function LogoMark() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src="/logo.png" alt="" className="h-10 w-10 shrink-0 rounded-2xl shadow-sm ring-1 ring-black/5 sm:h-11 sm:w-11" />
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 sm:text-sm">cv.shykov.dev</div>
        <div className="truncate text-base font-semibold tracking-tight text-stone-950 sm:text-lg">ATS Resume Toolkit</div>
      </div>
    </div>
  )
}

function ModeSwitch({ mode, onSwitch }: { mode: Mode; onSwitch: (next: Mode) => void }) {
  return (
    <nav
      className="flex w-full shrink-0 gap-1 rounded-xl bg-white/85 p-1 text-sm font-medium shadow-lg shadow-stone-950/10 ring-1 ring-stone-200 backdrop-blur sm:w-auto"
      aria-label="Primary app mode"
    >
      {([['analyze', 'Analyze'], ['build', 'Build']] as [Mode, string][]).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSwitch(id)}
          aria-pressed={mode === id}
          className={`min-h-10 flex-1 rounded-lg px-3 py-2 transition sm:flex-none sm:px-4 ${mode === id ? 'bg-stone-950 text-white shadow-sm' : 'text-stone-500 hover:bg-white hover:text-stone-800'}`}
        >
          {id === 'analyze' ? 'Fast ATS Score' : label}
        </button>
      ))}
    </nav>
  )
}

function SiteHeader({ mode, onSwitch }: { mode: Mode; onSwitch: (next: Mode) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-30 max-w-7xl flex-col justify-center gap-3 px-5 py-3 sm:h-20 sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
        <LogoMark />
        <ModeSwitch mode={mode} onSwitch={onSwitch} />
      </div>
    </header>
  )
}

function HeroMedia() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-5 hidden w-[48%] min-w-[32rem] overflow-hidden lg:block" aria-hidden>
      <div className="absolute inset-y-0 right-0 w-full">
        <div className="absolute right-6 top-[5.75rem] h-[20.5rem] w-[16.75rem] rotate-3 rounded-xl bg-white p-5 shadow-2xl shadow-indigo-950/15 ring-1 ring-stone-200">
          <div className="mb-5 flex items-center justify-between">
            <div className="h-3 w-28 rounded-full bg-stone-900" />
            <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">83 / 100</div>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 rounded-full bg-stone-200" />
            <div className="h-2.5 w-10/12 rounded-full bg-stone-200" />
            <div className="h-2.5 w-8/12 rounded-full bg-stone-200" />
          </div>
          <div className="mt-7 space-y-3">
            <div className="h-3 w-32 rounded-full bg-indigo-600" />
            <div className="h-px bg-stone-200" />
            <div className="h-2.5 rounded-full bg-stone-200" />
            <div className="h-2.5 w-11/12 rounded-full bg-stone-200" />
            <div className="h-2.5 w-9/12 rounded-full bg-stone-200" />
          </div>
          <div className="mt-7 space-y-3">
            <div className="h-3 w-36 rounded-full bg-indigo-600" />
            <div className="h-px bg-stone-200" />
            <div className="flex gap-2">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="h-2.5 flex-1 rounded-full bg-stone-200" />
            </div>
            <div className="flex gap-2">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
              <div className="h-2.5 w-9/12 rounded-full bg-stone-200" />
            </div>
          </div>
        </div>

        <div className="hero-scan absolute right-[11.5rem] top-[9.5rem] h-[16.75rem] w-[14rem] -rotate-6 overflow-hidden rounded-xl border border-indigo-200/80 bg-indigo-50/90 p-4 shadow-xl shadow-indigo-950/10 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">local parse</div>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-indigo-100">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-lg font-bold tabular-nums text-emerald-700 ring-4 ring-emerald-200">83</div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-24 rounded-full bg-stone-900" />
                <div className="h-2 w-full rounded-full bg-stone-200" />
              </div>
            </div>
            <div className="space-y-2">
              {['w-full', 'w-10/12', 'w-8/12'].map((width) => (
                <div key={width} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className={`h-2 rounded-full bg-stone-300 ${width}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-stone-200">No upload</span>
            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-stone-200">No LLM</span>
            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-stone-200">PDF/DOCX</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroMiniMedia() {
  return (
    <div className="hero-scan relative mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white/85 p-4 shadow-lg shadow-indigo-950/5 ring-1 ring-white/70 backdrop-blur lg:hidden" aria-label="Preview of local ATS scoring">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Local parse</div>
          <div className="mt-1 text-sm font-medium text-stone-700">Score, top fixes, keyword signals</div>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-50 text-2xl font-bold tabular-nums text-emerald-700 ring-4 ring-emerald-200">
          83
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {['Parseability', 'Sections', 'Content'].map((label) => (
          <div key={label} className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200">
            <div className="text-xs font-medium text-stone-500">{label}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full w-4/5 rounded-full bg-stone-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    ['Choose PDF/DOCX', 'Pick a resume file from your device.'],
    ['Parse locally', 'Text extraction and scoring run in this browser.'],
    ['Fix the top issues', 'See score, breakdown, keywords, and exportable notes.'],
  ]

  return (
    <section className="-mt-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:-mt-10" aria-label="How the local ATS resume checker works">
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map(([title, body], index) => (
          <div key={title} className="flex gap-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{index + 1}</div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
              <p className="mt-1 text-sm text-stone-500">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200"><ShieldIcon />No server upload</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 ring-1 ring-stone-200">Deterministic checks, no LLM calls</span>
        <a className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 ring-1 ring-stone-200 transition hover:bg-stone-200" href="https://github.com/mshykov/cv.shykov.dev" rel="noreferrer" target="_blank"><SourceIcon />Source available</a>
      </div>
    </section>
  )
}

function TrustNotes() {
  return (
    <section className="mt-16 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-label="Privacy and trust notes">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">Privacy claims you can inspect.</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            The source is public, and the product promise stays narrow: local document parsing, deterministic scoring, no account wall, and no AI model call hidden behind the interface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-sm font-semibold text-stone-900">Local parser</div>
            <p className="mt-1 text-sm text-stone-500">PDF and DOCX text is extracted in the browser with client-side libraries.</p>
          </div>
          <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-sm font-semibold text-stone-900">No LLM scoring</div>
            <p className="mt-1 text-sm text-stone-500">Scores come from repeatable checks for parseability, sections, format, and content signals.</p>
          </div>
          <a className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200 transition hover:bg-stone-100" href="https://github.com/mshykov/cv.shykov.dev" rel="noreferrer" target="_blank">
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900"><SourceIcon />Public source</div>
            <p className="mt-1 text-sm text-stone-500">Review the app code, scoring checks, parser, and export flow in the GitHub repository.</p>
          </a>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze')
  const [buildLoaded, setBuildLoaded] = useState(false)

  const switchMode = (next: Mode) => {
    if (next === 'build') setBuildLoaded(true)
    setMode(next)
  }

  const scrollToTool = () => {
    window.requestAnimationFrame(() => document.getElementById('fast-ats-score')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const switchModeAndFocusTool = (next: Mode) => {
    switchMode(next)
    scrollToTool()
  }

  const focusAnalyze = () => {
    switchModeAndFocusTool('analyze')
  }

  return (
    <div className="min-h-full bg-stone-50">
      <SiteHeader mode={mode} onSwitch={switchModeAndFocusTool} />
      <section className="relative isolate overflow-hidden border-b border-stone-200 bg-[linear-gradient(110deg,#f8fafc_0%,#ffffff_45%,#eef2ff_100%)] pt-30 sm:pt-20">
        <div className="relative mx-auto max-w-7xl px-5 lg:min-h-[30rem]">
          <HeroMedia />
          <div className="max-w-2xl py-10 sm:py-14 lg:py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm ring-1 ring-stone-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              100% local resume analysis
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Fast ATS resume score. Private by default.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
              Score your PDF or DOCX in seconds, see the highest-impact fixes first, match keywords, and build an ATS-clean resume without uploads, accounts, or LLM calls.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={focusAnalyze}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Check my resume
              </button>
              <button
                type="button"
                onClick={() => switchModeAndFocusTool('build')}
                className="rounded-xl border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Build ATS-clean CV
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 ring-1 ring-emerald-200"><ShieldIcon />Runs in your browser</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5 font-medium text-stone-600 ring-1 ring-stone-200">No uploads</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5 font-medium text-stone-600 ring-1 ring-stone-200">No LLM</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5 font-medium text-stone-600 ring-1 ring-stone-200">PDF & DOCX</span>
            </div>
            <HeroMiniMedia />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col px-5 py-10 sm:py-14">
        <HowItWorks />
        <main id="fast-ats-score" className="mt-8 flex-1 scroll-mt-32 sm:scroll-mt-24">
          <ErrorBoundary>
            <Suspense fallback={<p className="py-20 text-center text-stone-400">Loading fast ATS score…</p>}>
              <div className={mode === 'analyze' ? 'block' : 'hidden'}>
                <Analyzer />
              </div>
            </Suspense>
            {(mode === 'build' || buildLoaded) && (
              <Suspense fallback={<p className="py-20 text-center text-stone-400">Loading builder…</p>}>
                <div className={mode === 'build' ? 'block' : 'hidden'}>
                  <Builder />
                </div>
              </Suspense>
            )}
          </ErrorBoundary>
        </main>

      <TrustNotes />

      <section className="mt-16 grid gap-6 border-t border-stone-200 pt-8 text-sm text-stone-500 sm:grid-cols-2 lg:grid-cols-4" aria-label="ATS resume checker FAQ">
        <div>
          <h2 className="font-semibold text-stone-800">What is an ATS score?</h2>
          <p className="mt-2">A fast heuristic check for parser-friendly text, contact details, sections, dates, bullets, and measurable impact.</p>
        </div>
        <div>
          <h2 className="font-semibold text-stone-800">Is my CV uploaded?</h2>
          <p className="mt-2">No. PDF and DOCX files are processed locally in your browser and are not sent to a server.</p>
        </div>
        <div>
          <h2 className="font-semibold text-stone-800">Does this use AI?</h2>
          <p className="mt-2">No. The score is deterministic and does not use LLMs, model calls, accounts, or API keys.</p>
        </div>
        <div>
          <h2 className="font-semibold text-stone-800">PDF or DOCX?</h2>
          <p className="mt-2">Both work. Text-based PDFs give the clearest page-count and parseability signal.</p>
        </div>
      </section>

      <footer className="mt-8 border-t border-stone-200 pt-5 text-xs text-stone-400 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p>Heuristic guidance, not a guarantee. <a href="https://shykov.dev" className="font-medium text-stone-600 underline-offset-2 hover:underline">shykov.dev</a></p>
        <p className="mt-1 sm:mt-0">No tracking, no uploads, no accounts.</p>
      </footer>
      </div>
    </div>
  )
}
