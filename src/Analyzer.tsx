import { useCallback, useRef, useState } from 'react'
import type { Report, Check, Status } from './lib/analyze'
import { getTopFixes } from './lib/analyze'
// Dependency-free, so this stays out of the lazily loaded extractor bundle.
import { isSupportedDocument } from './lib/filetype.ts'
import type { Resume } from './lib/parse'
import type { JDMatch } from './lib/jdmatch'
import type { StyleReport, StyleLevel, StyleSignal } from './lib/style'
import { TONE } from './components/tone'
import { ScoreRing } from './components/ScoreRing'
import { useLocale, useMessages } from './i18n/context.ts'
import type { Messages } from './i18n/messages/en.ts'

type Tab = 'analyze' | 'style' | 'jd' | 'data'

// Style levels are advisory, so they map onto the shared status palette rather
// than introducing a second colour language.
const STYLE_TONE: Record<StyleLevel, { dot: string; text: string }> = {
  ok: TONE.pass,
  minor: TONE.warn,
  major: TONE.fail,
}
type CheckRowProps = Readonly<{ c: Check }>
type CategoryBreakdownProps = Readonly<{ report: Report }>
type TopFixesProps = Readonly<{ fixes: Check[] }>

// Stage names for the developer-facing error detail stay English on purpose: it is
// what gets pasted into a bug report.
const STAGE_DETAIL = { loading: 'loading modules', extracting: 'extracting text', analyzing: 'analyzing', parsing: 'parsing', style: 'checking style' } as const
type Stage = keyof typeof STAGE_DETAIL

function jdCoverageClass(coverage: number): string {
  if (coverage >= 70) return 'text-emerald-600'
  if (coverage >= 40) return 'text-amber-600'
  return 'text-rose-600'
}

function experienceKey(entry: Resume['experience'][number]): string {
  return [entry.title, entry.company, entry.date, entry.bullets.join('|')].join('::')
}

function educationKey(entry: Resume['education'][number]): string {
  return [entry.degree, entry.school, entry.date].join('::')
}

function reportMetaSummary(m: Messages, report: Report): string {
  const pageCount = report.meta.numPages
  const fmt = m.analysis.formatNumber
  return m.analyzer.reportMeta(pageCount ? m.analyzer.pages(pageCount) : '', fmt(report.meta.words), fmt(report.meta.charCount))
}

function CheckRow({ c }: CheckRowProps) {
  const { analyzer } = useMessages()
  return (
    <div className="flex gap-3 py-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE[c.status].dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-stone-800">{c.label}</span>
          <span className="shrink-0 text-xs tabular-nums text-stone-400">{c.points}/{c.max}</span>
        </div>
        <p className="mt-0.5 text-sm text-stone-500">{c.detail}</p>
        {c.fix && <p className="mt-1 text-sm text-stone-700"><span className="font-medium">{analyzer.fix}</span> {c.fix}</p>}
      </div>
    </div>
  )
}

function CategoryBreakdown({ report }: CategoryBreakdownProps) {
  const { analysis } = useMessages()
  const categories = [...new Set(report.checks.map((c) => c.category))]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const items = report.checks.filter((c) => c.category === cat)
        const points = items.reduce((s, c) => s + c.points, 0)
        const max = items.reduce((s, c) => s + c.max, 0)
        const pct = Math.round((points / max) * 100)

        return (
          <div key={cat} className="min-w-34 flex-1 rounded-xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-stone-500">{analysis.categories[cat]}</span>
              <span className="text-xs tabular-nums text-stone-400">{points}/{max}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-stone-900 transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TopFixes({ fixes }: TopFixesProps) {
  const { analyzer } = useMessages()
  if (!fixes.length) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
        {analyzer.noPriorityFixes}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {fixes.map((fix) => (
        <div key={fix.id} className="rounded-xl bg-white px-4 py-3 ring-1 ring-stone-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${TONE[fix.status].dot}`} aria-hidden />
                <span className="text-sm font-semibold text-stone-900">{fix.label}</span>
              </div>
              <p className="mt-1 text-sm text-stone-600">{fix.fix ?? fix.detail}</p>
            </div>
            <span className="shrink-0 rounded-md bg-stone-100 px-2 py-1 text-xs tabular-nums text-stone-500">
              -{fix.max - fix.points}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const STYLE_STATUS: Record<StyleLevel, Status> = { ok: 'pass', minor: 'warn', major: 'fail' }

type HumanizationCardProps = Readonly<{ style: StyleReport; onOpen: () => void }>

// Surfaces the writing-style score next to the ATS score so it is not hidden
// behind a tab. Same honesty as the tab: habits to fix, not an AI-detector verdict.
function HumanizationCard({ style, onOpen }: HumanizationCardProps) {
  const { analyzer } = useMessages()
  const tone = STYLE_STATUS[style.band.tone]
  const flagged = style.signals.filter((s) => s.level !== 'ok').sort((a, b) => Number(b.level === 'major') - Number(a.level === 'major'))
  return (
    <div className="mt-5 min-w-0 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={style.score} tone={tone} />
        <div className="min-w-0 flex-1">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${TONE[tone].chip}`}>
            <span className={`h-2 w-2 rounded-full ${TONE[tone].dot}`} aria-hidden />
            <span>{style.band.label}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">{analyzer.humanization.title}</h2>
          <p className="mt-1 text-sm text-stone-500">{analyzer.humanization.blurb}</p>
          {flagged.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-stone-700">
              {flagged.slice(0, 3).map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STYLE_TONE[s.level].dot}`} aria-hidden />
                  <span><span className="font-medium">{s.label}.</span> {s.fix ?? s.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">{analyzer.humanization.none}</p>
          )}
          <button type="button" onClick={onOpen} className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50">{analyzer.humanization.all}</button>
        </div>
      </div>
    </div>
  )
}

type StyleRowProps = Readonly<{ s: StyleSignal }>

function StyleRow({ s }: StyleRowProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STYLE_TONE[s.level].dot}`} aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-stone-800">{s.label}</p>
          <p className="mt-0.5 text-sm text-stone-500">{s.detail}</p>
          {s.fix && <p className="mt-1.5 text-sm text-stone-700">{s.fix}</p>}
          {s.examples && s.examples.length > 0 && (
            <ul className="mt-2 space-y-1">
              {s.examples.map((ex) => (
                <li key={ex} className="truncate rounded bg-stone-50 px-2 py-1 font-mono text-xs text-stone-500 ring-1 ring-stone-200">{ex}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Analyzer() {
  const { locale, messages: m } = useLocale()
  const { analyzer } = m
  const [report, setReport] = useState<Report | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [cvText, setCvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [errDetail, setErrDetail] = useState('')
  const [drag, setDrag] = useState(false)
  const [tab, setTab] = useState<Tab>('analyze')
  const [jdText, setJdText] = useState('')
  const [jd, setJd] = useState<JDMatch | null>(null)
  const [style, setStyle] = useState<StyleReport | null>(null)
  // The CV was not written in English, so the English-only style checks stay out of it.
  const [styleSkipped, setStyleSkipped] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Nothing blocks a second upload while the first is still parsing - the
  // dropzone stays droppable and `busy` only swaps a caption. Two runs then
  // race, and the slower one lands last: the header said "Analyzed
  // sample-cv.pdf" above a 60-page report. Stamp each run and let only the
  // newest one write state.
  const runId = useRef(0)

  const run = useCallback(async (file: File) => {
    const id = (runId.current += 1)
    setError(''); setErrDetail(''); setReport(null); setResume(null); setJd(null); setStyle(null); setStyleSkipped(false)
    if (!isSupportedDocument(file)) { setError(analyzer.chooseFile); return }
    setBusy(true); setFileName(file.name); setTab('analyze')
    let stage: Stage = 'loading'
    try {
      const [{ extractDocument }, { analyze }, { parseResume }, { analyzeStyle }, { detectLanguage }] = await Promise.all([
        import('./lib/extract'), import('./lib/analyze'), import('./lib/parse'), import('./lib/style'), import('./lib/lang/index.ts'),
      ])
      stage = 'extracting'
      const ex = await extractDocument(file)
      stage = 'analyzing'
      const rep = analyze(ex, m.analysis)
      stage = 'parsing'
      const res = parseResume(ex)
      stage = 'style'
      // The writing-style signals look for English stock phrases and English
      // passive voice. On a Spanish or German CV they would measure nothing.
      const language = detectLanguage(ex.text)
      const skip = language !== 'en' && language !== 'unknown'
      const sty = skip ? null : analyzeStyle(ex.text, ex.lines)
      if (runId.current !== id) return
      setReport(rep); setResume(res); setCvText(ex.text); setStyle(sty); setStyleSkipped(skip)
    } catch (e) {
      if (runId.current !== id) return
      const err = e instanceof Error ? e : new Error(String(e))
      const detail = `stage: ${STAGE_DETAIL[stage]}\n${err.name}: ${err.message}\n\n${err.stack ?? '(no stack)'}\n\nfile: ${file.name} (${file.type || 'unknown'}, ${file.size} bytes)\nUA: ${navigator.userAgent}\nbuild: ${import.meta.env.MODE}`
      console.error('[ATS Resume Toolkit] analyze failed —', detail)
      setError(analyzer.failed(analyzer.stages[stage]))
      setErrDetail(detail)
    } finally {
      // A superseded run must not clear the spinner out from under the new one.
      if (runId.current === id) setBusy(false)
    }
  }, [m.analysis, analyzer])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]; if (f) run(f)
  }, [run])

  const runJd = useCallback(async () => {
    if (!resume || !jdText.trim()) return
    const id = runId.current
    const { matchJD } = await import('./lib/jdmatch')
    // A new CV may have finished analyzing during that import; its own reset
    // already cleared `jd`, and this match belongs to the previous document.
    if (runId.current !== id) return
    setJd(matchJD(cvText, resume.skills, jdText))
  }, [resume, cvText, jdText])

  const download = useCallback(async () => {
    if (!report || !resume) return
    const [{ toMarkdown }, { downloadText }] = await Promise.all([import('./lib/report'), import('./lib/download')])
    downloadText(fileName.replace(/\.[^.]+$/, '') + m.report.fileSuffix, toMarkdown(fileName, report, resume, m, jd ?? undefined))
  }, [report, resume, jd, fileName, m])

  const categories = report ? [...new Set(report.checks.map((c) => c.category))] : []
  const topFixes = report ? getTopFixes(report, 3) : []

  return (
    <div>
      <h2 className="sr-only">{analyzer.srHeading}</h2>

      {report ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition ${drag ? 'border-indigo-300 bg-indigo-50' : 'border-stone-200 bg-white'}`}
        >
          <p className="text-sm text-stone-500">{analyzer.analyzed} <span className="font-medium text-stone-800">{fileName}</span></p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            {analyzer.analyzeAnother}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center shadow-sm transition ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50/40'}`}
        >
          <svg className="h-9 w-9 text-stone-400 group-hover:text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4m0 0L7.5 8.5M12 4l4.5 4.5M5 20h14" /></svg>
          <span className="mt-3 font-medium text-stone-800">{busy ? analyzer.dropBusy : analyzer.dropIdle}</span>
          <span className="mt-1 text-sm text-stone-600">{analyzer.dropHint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) run(f)
          e.currentTarget.value = ''
        }}
      />

      {error && (
        <div role="alert" className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <p>{error}</p>
          {errDetail && (
            <>
              <button
                type="button"
                onClick={() => { void navigator.clipboard?.writeText(errDetail) }}
                className="mt-2 rounded border border-rose-300 px-2 py-1 text-xs font-medium hover:bg-rose-100"
              >
                {analyzer.copyDetails}
              </button>
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded bg-white/70 p-2 text-[11px] leading-snug text-rose-900 ring-1 ring-rose-200">{errDetail}</pre>
            </>
          )}
        </div>
      )}

      {report && resume && (
        <section className="mt-8" aria-live="polite">
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)]">
              <div className="min-w-0 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <ScoreRing score={report.score} tone={report.band.tone} />
                  <div className="min-w-0 flex-1">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${TONE[report.band.tone].chip}`}>
                      <span className={`h-2 w-2 rounded-full ${TONE[report.band.tone].dot}`} aria-hidden />
                      <span>{report.band.label}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">{analyzer.scoreHeading}</h2>
                    <p className="mt-1 text-sm text-stone-500">{reportMetaSummary(m, report)}</p>
                  </div>
                </div>
                <div className="mt-4"><CategoryBreakdown report={report} /></div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-stone-900">{analyzer.topFixes}</h3>
                  <button type="button" onClick={download} className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50">{analyzer.downloadReport}</button>
                </div>
                <TopFixes fixes={topFixes} />
              </div>
            </div>

            {style && <HumanizationCard style={style} onOpen={() => setTab('style')} />}

            <div className="mt-4 flex sm:justify-end">
              <nav className="grid w-full grid-cols-2 gap-1 rounded-lg bg-stone-100 p-1 text-sm font-medium sm:flex sm:w-auto sm:shrink-0">
                {([['analyze', analyzer.tabs.analyze], ['style', analyzer.tabs.style], ['jd', analyzer.tabs.jd], ['data', analyzer.tabs.data]] as [Tab, string][]).map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-md px-3 py-1.5 text-center transition ${tab === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{label}</button>
                ))}
              </nav>
            </div>
          </div>

          {tab === 'analyze' && (
            <div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {categories.map((cat) => {
                  const items = report.checks.filter((c) => c.category === cat)
                  return (
                    <div key={cat} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                      <div className="flex items-baseline justify-between border-b border-stone-100 pb-2">
                        <h2 className="font-semibold text-stone-800">{m.analysis.categories[cat]}</h2>
                        <span className="text-sm tabular-nums text-stone-400">{items.reduce((s, c) => s + c.points, 0)}/{items.reduce((s, c) => s + c.max, 0)}</span>
                      </div>
                      <div className="divide-y divide-stone-100">{items.map((c) => <CheckRow key={c.id} c={c} />)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'style' && !style && styleSkipped && (
            <div className="rounded-2xl bg-white p-5 text-sm text-stone-600 shadow-sm ring-1 ring-stone-200">{analyzer.style.englishOnly}</div>
          )}

          {tab === 'style' && style && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-3xl font-semibold tabular-nums ${STYLE_TONE[style.band.tone].text}`}>{style.score}</span>
                  <span className="text-sm text-stone-500">{style.band.label} · {analyzer.style.counts(style.meta.sentences, style.meta.words)}</span>
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {analyzer.style.intro} <strong>{analyzer.style.notDetector}</strong> {analyzer.style.introRest}
                </p>
                {locale !== 'en' && <p className="mt-2 text-sm text-stone-500">{analyzer.style.englishOnly}</p>}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {style.signals.map((s) => <StyleRow key={s.id} s={s} />)}
              </div>
            </div>
          )}

          {tab === 'jd' && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <h2 className="font-semibold text-stone-800">{analyzer.jd.heading}</h2>
              <p className="mt-1 text-sm text-stone-500">{analyzer.jd.blurb}</p>
              <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={6} placeholder={analyzer.jd.placeholder} className="mt-3 w-full resize-y rounded-lg border border-stone-300 p-3 text-sm outline-none transition hover:border-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <button type="button" onClick={runJd} disabled={!jdText.trim()} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">{analyzer.jd.button}</button>

              {jd && (
                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-semibold tabular-nums ${jdCoverageClass(jd.coverage)}`}>{jd.coverage}%</span>
                    <span className="text-sm text-stone-500">{analyzer.jd.coverage} · {analyzer.jd.matchedOf(jd.matched.length, jd.total)}</span>
                  </div>
                  {jd.missing.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-stone-700">{analyzer.jd.missing} <span className="font-normal text-stone-400">{analyzer.jd.missingHint}</span></h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">{jd.missing.map((k) => <span key={k.term} className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700 ring-1 ring-rose-200">{k.term}</span>)}</div>
                    </div>
                  )}
                  {jd.matched.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-stone-700">{analyzer.jd.covered}</h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">{jd.matched.map((k) => <span key={k.term} className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">{k.term}</span>)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <h2 className="mb-2 font-semibold text-stone-800">{analyzer.data.profile}</h2>
                <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
                  {([[analyzer.data.fields.name, resume.profile.name], [analyzer.data.fields.email, resume.profile.email], [analyzer.data.fields.phone, resume.profile.phone], [analyzer.data.fields.location, resume.profile.location], [analyzer.data.fields.links, resume.profile.links.join('  ·  ')]] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-stone-400">{k}</dt><dd className={v ? 'text-stone-800' : 'text-rose-500'}>{v || analyzer.data.notDetected}</dd></div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-stone-400">{analyzer.data.profileNote}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <h2 className="mb-3 font-semibold text-stone-800">{analyzer.data.experience} <span className="text-sm font-normal text-stone-400">{analyzer.data.parsed(resume.experience.length)}</span></h2>
                <div className="space-y-3">
                  {resume.experience.map((e) => (
                    <div key={experienceKey(e)} className="border-l-2 border-stone-200 pl-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium text-stone-800">{e.title}{e.company && <span className="font-normal text-stone-500"> — {e.company}</span>}</span><span className="text-xs text-stone-400">{e.date}</span></div>
                      <p className="text-xs text-stone-400">{analyzer.data.bullets(e.bullets.length)}</p>
                    </div>
                  ))}
                  {!resume.experience.length && <p className="text-sm text-rose-500">{analyzer.data.noExperience}</p>}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                  <h2 className="mb-3 font-semibold text-stone-800">{analyzer.data.education} <span className="text-sm font-normal text-stone-400">({resume.education.length})</span></h2>
                  {resume.education.map((e) => <p key={educationKey(e)} className="text-sm text-stone-700">{e.degree || e.school}<span className="text-stone-400"> · {e.date}</span></p>)}
                  {!resume.education.length && <p className="text-sm text-rose-500">{analyzer.data.noneParsed}</p>}
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                  <h2 className="mb-3 font-semibold text-stone-800">{analyzer.data.skills} <span className="text-sm font-normal text-stone-400">({resume.skills.length})</span></h2>
                  <div className="flex flex-wrap gap-1.5">{resume.skills.slice(0, 30).map((s) => <span key={s} className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{s}</span>)}</div>
                  {!resume.skills.length && <p className="text-sm text-rose-500">{analyzer.data.noneParsed}</p>}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
