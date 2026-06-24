import { lazy, Suspense, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'

// Keep the app shell tiny; load the active workflow UI after first paint.
const Analyzer = lazy(() => import('./Analyzer'))
// Builder pulls in @react-pdf/renderer — load it only when the Build tab opens.
const Builder = lazy(() => import('./builder/Builder'))

type Mode = 'analyze' | 'build'

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze')
  const [buildLoaded, setBuildLoaded] = useState(false)

  const switchMode = (next: Mode) => {
    if (next === 'build') setBuildLoaded(true)
    setMode(next)
  }

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col px-5 py-10 sm:py-14">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">ATS Resume Toolkit</h1>
          <nav className="flex gap-1 rounded-xl bg-stone-100 p-1 text-sm font-medium">
            {([['analyze', 'Analyze'], ['build', 'Build']] as [Mode, string][]).map(([id, label]) => (
              <button key={id} onClick={() => switchMode(id)} className={`rounded-lg px-4 py-1.5 transition ${mode === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{id === 'analyze' ? 'Fast ATS score' : label}</button>
            ))}
          </nav>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-stone-700">Instant ATS scoring, keyword matching, and CV building</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">100% in your browser</span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">No uploads</span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">No LLM</span>
        </div>
      </header>

      <main className="flex-1">
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
  )
}
