import { lazy, Suspense, useState } from 'react'
import Analyzer from './Analyzer'
import ErrorBoundary from './ErrorBoundary'

// Builder pulls in @react-pdf/renderer — load it only when the Build tab opens.
const Builder = lazy(() => import('./builder/Builder'))

type Mode = 'analyze' | 'build'

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze')

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col px-5 py-10 sm:py-14">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">CV Toolkit</h1>
          <nav className="flex gap-1 rounded-xl bg-stone-100 p-1 text-sm font-medium">
            {([['analyze', 'Analyze'], ['build', 'Build']] as [Mode, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)} className={`rounded-lg px-4 py-1.5 transition ${mode === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{label}</button>
            ))}
          </nav>
        </div>
        <p className="mt-2 text-sm text-stone-400">
          Parse, score, match, and build ATS-clean CVs — <span className="font-medium text-stone-500">100% in your browser</span>. Nothing is ever uploaded.
        </p>
      </header>

      <main className="flex-1">
        <ErrorBoundary>
          {mode === 'analyze'
            ? <Analyzer />
            : <Suspense fallback={<p className="py-20 text-center text-stone-400">Loading builder…</p>}><Builder /></Suspense>}
        </ErrorBoundary>
      </main>

      <footer className="mt-12 border-t border-stone-200 pt-6 text-sm text-stone-400">
        <p>Heuristic guidance, not a guarantee — real ATS platforms vary. <a href="https://shykov.dev" className="font-medium text-stone-600 underline-offset-2 hover:underline">shykov.dev</a></p>
        <p className="mt-1">No tracking, no uploads, no accounts. Built with pdf.js, mammoth &amp; react-pdf.</p>
      </footer>
    </div>
  )
}
