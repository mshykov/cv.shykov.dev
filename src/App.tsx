import { useCallback, useRef, useState } from 'react'
import { type Report, type Status, type Check } from './lib/analyze'

const TONE: Record<Status, { dot: string; text: string; ring: string; chip: string }> = {
  pass: { dot: 'bg-emerald-500', text: 'text-emerald-700', ring: 'text-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-700', ring: 'text-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  fail: { dot: 'bg-rose-500', text: 'text-rose-700', ring: 'text-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

function ScoreRing({ score, tone }: { score: number; tone: Status }) {
  const r = 52
  const c = 2 * Math.PI * r
  const off = c * (1 - score / 100)
  return (
    <div className="relative grid place-items-center">
      <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="currentColor" strokeWidth="11" className="text-stone-200" />
        <circle cx="66" cy="66" r={r} fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} className={TONE[tone].ring} style={{ transition: 'stroke-dashoffset 700ms ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-semibold tabular-nums text-stone-900">{score}</div>
        <div className="text-xs font-medium tracking-wide text-stone-400">/ 100</div>
      </div>
    </div>
  )
}

function CheckRow({ c }: { c: Check }) {
  return (
    <div className="flex gap-3 py-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE[c.status].dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-stone-800">{c.label}</span>
          <span className="shrink-0 text-xs tabular-nums text-stone-400">{c.points}/{c.max}</span>
        </div>
        <p className="mt-0.5 text-sm text-stone-500">{c.detail}</p>
        {c.fix && <p className="mt-1 text-sm text-stone-700"><span className="font-medium">Fix:</span> {c.fix}</p>}
      </div>
    </div>
  )
}

export default function App() {
  const [report, setReport] = useState<Report | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const run = useCallback(async (file: File) => {
    setError(''); setReport(null)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.'); return
    }
    setBusy(true); setFileName(file.name)
    try {
      // Lazy-loaded: keeps pdf.js (~600 KB) out of the initial bundle.
      const [{ extractPdf }, { analyze }] = await Promise.all([
        import('./lib/pdf'),
        import('./lib/analyze'),
      ])
      const ex = await extractPdf(file)
      setReport(analyze(ex))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that PDF.')
    } finally {
      setBusy(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) run(f)
  }, [run])

  const categories = report ? [...new Set(report.checks.map((c) => c.category))] : []

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 py-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">CV ATS Checker</h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Drop in your CV as a PDF and get an ATS-readiness score with concrete fixes.
          Everything runs <span className="font-medium text-stone-700">100% in your browser</span> — your file is never uploaded.
        </p>
      </header>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-stone-300 bg-white hover:border-stone-400'}`}
      >
        <svg className="h-9 w-9 text-stone-400 group-hover:text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4m0 0L7.5 8.5M12 4l4.5 4.5M5 20h14" /></svg>
        <span className="mt-3 font-medium text-stone-800">{busy ? 'Analyzing…' : 'Drop your CV here or click to choose'}</span>
        <span className="mt-1 text-sm text-stone-400">PDF · stays on your device</span>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) run(f) }} />
      </button>

      {fileName && !error && <p className="mt-3 text-sm text-stone-500">Analyzed: <span className="font-medium text-stone-700">{fileName}</span></p>}
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

      {report && (
        <section className="mt-8">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-stone-200 sm:flex-row sm:gap-7">
            <ScoreRing score={report.score} tone={report.band.tone} />
            <div className="text-center sm:text-left">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${TONE[report.band.tone].chip}`}>
                <span className={`h-2 w-2 rounded-full ${TONE[report.band.tone].dot}`} />{report.band.label}
              </div>
              <p className="mt-3 text-sm text-stone-500">
                {report.meta.numPages} page{report.meta.numPages > 1 ? 's' : ''} · {report.meta.words.toLocaleString()} words · {report.meta.charCount.toLocaleString()} characters of readable text.
              </p>
              <p className="mt-1 text-sm text-stone-400">Score combines parseability, contact info, sections, formatting, and content quality.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {categories.map((cat) => {
              const items = report.checks.filter((c) => c.category === cat)
              const pts = items.reduce((s, c) => s + c.points, 0)
              const max = items.reduce((s, c) => s + c.max, 0)
              return (
                <div key={cat} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                  <div className="flex items-baseline justify-between border-b border-stone-100 pb-2">
                    <h2 className="font-semibold text-stone-800">{cat}</h2>
                    <span className="text-sm tabular-nums text-stone-400">{pts}/{max}</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {items.map((c) => <CheckRow key={c.id} c={c} />)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-stone-200 pt-6 text-sm text-stone-400">
        <p>
          Heuristic guidance, not a guarantee — real ATS platforms vary.{' '}
          <a href="https://shykov.dev" className="font-medium text-stone-600 underline-offset-2 hover:underline">shykov.dev</a>
        </p>
        <p className="mt-1">No tracking, no uploads, no accounts. Built with pdf.js.</p>
      </footer>
    </div>
  )
}
