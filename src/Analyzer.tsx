import { useCallback, useRef, useState } from 'react'
import type { Report, Check, Status } from './lib/analyze'
import { getTopFixes } from './lib/analyze'
// Dependency-free, so this stays out of the lazily loaded extractor bundle.
import { isSupportedDocument } from './lib/filetype.ts'
import type { Resume } from './lib/parse'
import type { JDMatch } from './lib/jdmatch'
import type { StyleReport, StyleLevel, StyleSignal } from './lib/style'
import { ScoreRing } from './components/ScoreRing'
import { StatusMark } from './components/StatusMark'
import { useLocale, useMessages } from './i18n/context.ts'
import type { Messages } from './i18n/messages/en.ts'

type Tab = 'analyze' | 'style' | 'jd' | 'data'

type CheckRowProps = Readonly<{ c: Check }>
type TopFixesProps = Readonly<{ fixes: Check[] }>

// Stage names for the developer-facing error detail stay English on purpose: it is
// what gets pasted into a bug report.
const STAGE_DETAIL = { loading: 'loading modules', extracting: 'extracting text', analyzing: 'analyzing', parsing: 'parsing', style: 'checking style' } as const
type Stage = keyof typeof STAGE_DETAIL

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

const STYLE_STATUS: Record<StyleLevel, Status> = { ok: 'pass', minor: 'warn', major: 'fail' }

// Points lost are the neon mark: the one place the eye should land.
function LostPoints({ n }: Readonly<{ n: number }>) {
  return <span className="neon-block shrink-0 px-1.5 py-0.5 font-mono text-sm font-semibold tabular-nums">−{n}</span>
}

function CheckRow({ c }: CheckRowProps) {
  const { analyzer } = useMessages()
  return (
    <div className="flex gap-3 border-b border-rule py-4">
      <StatusMark status={c.status} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">{c.label}</span>
          <span className={`shrink-0 font-mono text-sm tabular-nums ${c.status === 'pass' ? '' : 'neon-block px-1.5 py-0.5 font-semibold'}`}>{c.points}/{c.max}</span>
        </div>
        <p className="mt-0.5 text-ink-2">{c.detail}</p>
        {c.fix && <p className="mt-1.5"><span className="font-semibold">{analyzer.fix}</span> {c.fix}</p>}
      </div>
    </div>
  )
}

// Category totals as a plain list: name left, points right, no bars.
function CategoryTotals({ report }: Readonly<{ report: Report }>) {
  const { analysis } = useMessages()
  const categories = [...new Set(report.checks.map((c) => c.category))]
  return (
    <dl>
      {categories.map((cat) => {
        const items = report.checks.filter((c) => c.category === cat)
        const points = items.reduce((s, c) => s + c.points, 0)
        const max = items.reduce((s, c) => s + c.max, 0)
        return (
          <div key={cat} className="flex items-baseline justify-between gap-3 border-b border-rule py-3">
            <dt className="text-ink-2">{analysis.categories[cat]}</dt>
            <dd className="font-mono text-sm font-medium tabular-nums">{points}/{max}</dd>
          </div>
        )
      })}
    </dl>
  )
}

function TopFixes({ fixes }: TopFixesProps) {
  const { analyzer } = useMessages()
  if (!fixes.length) {
    return <p className="border-y border-rule py-5">{analyzer.noPriorityFixes}</p>
  }

  return (
    <ol className="border-t-2 border-ink">
      {fixes.map((fix, i) => (
        <li key={fix.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-rule py-5">
          <span className="text-2xl font-bold leading-tight tabular-nums">{i + 1}</span>
          <h4 className="flex items-center gap-2 text-lg font-semibold leading-snug">
            <StatusMark status={fix.status} />
            {fix.label}
          </h4>
          <LostPoints n={fix.max - fix.points} />
          <p className="col-start-2 col-end-4 max-w-[42em] text-ink-2">{fix.fix ?? fix.detail}</p>
        </li>
      ))}
    </ol>
  )
}

type HumanizationCardProps = Readonly<{ style: StyleReport; onOpen: () => void }>

// Surfaces the writing-style score next to the ATS score so it is not hidden
// behind a tab. Same honesty as the tab: habits to fix, not an AI-detector verdict.
function HumanizationCard({ style, onOpen }: HumanizationCardProps) {
  const { analyzer } = useMessages()
  const tone = STYLE_STATUS[style.band.tone]
  const flagged = style.signals.filter((s) => s.level !== 'ok').sort((a, b) => Number(b.level === 'major') - Number(a.level === 'major'))
  return (
    <div className="mt-10 min-w-0 border-t-2 border-ink pt-5">
      <h2 className="text-xl font-bold tracking-tight">{analyzer.humanization.title}</h2>
      <p className="mt-1 text-ink-2">{analyzer.humanization.blurb}</p>
      <div className="mt-4 flex items-center gap-3">
        <ScoreRing score={style.score} tone={tone} compact className="shrink-0" />
        <p className="flex items-center gap-2 font-semibold"><StatusMark status={tone} />{style.band.label}</p>
      </div>
      {flagged.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {flagged.slice(0, 3).map((s) => (
            <li key={s.id} className="flex gap-2.5">
              <StatusMark status={STYLE_STATUS[s.level]} className="mt-0.5" />
              <span><span className="font-semibold">{s.label}.</span> {s.fix ?? s.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">{analyzer.humanization.none}</p>
      )}
      <button type="button" onClick={onOpen} className="btn-sm mt-4">{analyzer.humanization.all}</button>
    </div>
  )
}

type StyleRowProps = Readonly<{ s: StyleSignal }>

function StyleRow({ s }: StyleRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-rule py-4">
      <StatusMark status={STYLE_STATUS[s.level]} className="mt-0.5" />
      <div className="min-w-0">
        <p className="font-semibold">{s.label}</p>
        <p className="mt-0.5 text-ink-2">{s.detail}</p>
        {s.fix && <p className="mt-1.5">{s.fix}</p>}
        {s.examples && s.examples.length > 0 && (
          <ul className="mt-2 space-y-1">
            {s.examples.map((ex) => (
              <li key={ex} className="break-words bg-panel px-2 py-1 font-mono text-xs text-ink-2">{ex}</li>
            ))}
          </ul>
        )}
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
          className={`flex flex-wrap items-center justify-between gap-3 border px-5 py-4 transition-colors ${drag ? 'border-ink bg-neon' : 'border-rule-2'}`}
        >
          <p className="text-ink-2">{analyzer.analyzed} <span className="font-semibold text-ink">{fileName}</span></p>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-sm">{analyzer.analyzeAnother}</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col gap-2.5 border px-6 py-8 text-left transition-colors sm:px-9 sm:py-10 lg:flex-row lg:items-end lg:justify-between ${drag ? 'border-ink bg-neon' : 'border-rule-2 hover:border-ink'}`}
        >
          <span className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.025em]">{busy ? analyzer.dropBusy : analyzer.dropIdle}</span>
          <span className="lab lg:max-w-[20em] lg:text-right">{analyzer.dropHint}</span>
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
        <div role="alert" className="mt-4 flex gap-3 border-2 border-ink px-5 py-4">
          <StatusMark status="fail" className="mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold">{error}</p>
            {errDetail && (
              <>
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(errDetail) }} className="btn-sm mt-3">
                  {analyzer.copyDetails}
                </button>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words bg-panel p-3 font-mono text-xs leading-snug">{errDetail}</pre>
              </>
            )}
          </div>
        </div>
      )}

      {report && resume && (
        <section className="mt-20" aria-live="polite">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <h2 className="mb-5 text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">{analyzer.scoreHeading}</h2>
              <ScoreRing score={report.score} tone={report.band.tone} className="rise" />
              <p className="mt-4 flex items-center gap-2.5 text-lg font-semibold">
                <StatusMark status={report.band.tone} />
                {report.band.label}
              </p>
              <p className="lab mt-2">{reportMetaSummary(m, report)}</p>
              <div className="mt-6"><CategoryTotals report={report} /></div>
              {style && <HumanizationCard style={style} onOpen={() => setTab('style')} />}
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-tight">{analyzer.topFixes}</h3>
                <button type="button" onClick={download} className="btn-sm shrink-0">{analyzer.downloadReport}</button>
              </div>
              <TopFixes fixes={topFixes} />

              <nav className="mt-16 flex flex-wrap gap-x-1 border-b border-rule" aria-label={analyzer.tabs.analyze}>
                {([['analyze', analyzer.tabs.analyze], ['style', analyzer.tabs.style], ['jd', analyzer.tabs.jd], ['data', analyzer.tabs.data]] as [Tab, string][]).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={tab === id}
                    onClick={() => setTab(id)}
                    className={`min-h-11 px-3 text-base font-medium transition-colors ${tab === id ? 'text-ink shadow-[inset_0_-2px_0_var(--color-ink)]' : 'text-ink-2 hover:text-ink'}`}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {tab === 'analyze' && (
                <div>
                  {categories.map((cat) => {
                    const items = report.checks.filter((c) => c.category === cat)
                    return (
                      <div key={cat} className="mt-10 first:mt-6">
                        <div className="flex items-baseline justify-between border-b border-ink pb-2">
                          <h2 className="text-lg font-bold">{m.analysis.categories[cat]}</h2>
                          <span className="font-mono text-sm font-semibold tabular-nums">{items.reduce((s, c) => s + c.points, 0)}/{items.reduce((s, c) => s + c.max, 0)}</span>
                        </div>
                        <div>{items.map((c) => <CheckRow key={c.id} c={c} />)}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {tab === 'style' && !style && styleSkipped && (
                <p className="mt-6 border-y border-rule py-5 text-ink-2">{analyzer.style.englishOnly}</p>
              )}

              {tab === 'style' && style && (
                <div className="mt-6">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-5xl font-bold tabular-nums tracking-[-0.04em]">{style.score}</span>
                    <span className="text-ink-2">{style.band.label} · {analyzer.style.counts(style.meta.sentences, style.meta.words)}</span>
                  </div>
                  <p className="mt-3 max-w-[42em] text-ink-2">
                    {analyzer.style.intro} <strong className="font-semibold text-ink">{analyzer.style.notDetector}</strong> {analyzer.style.introRest}
                  </p>
                  {locale !== 'en' && <p className="mt-2 text-ink-2">{analyzer.style.englishOnly}</p>}
                  <div className="mt-6 border-t-2 border-ink">
                    {style.signals.map((s) => <StyleRow key={s.id} s={s} />)}
                  </div>
                </div>
              )}

              {tab === 'jd' && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold">{analyzer.jd.heading}</h2>
                  <p className="mt-1 max-w-[42em] text-ink-2">{analyzer.jd.blurb}</p>
                  <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={6} placeholder={analyzer.jd.placeholder} className="field mt-4 resize-y" />
                  <button type="button" onClick={runJd} disabled={!jdText.trim()} className="btn-sm mt-3">{analyzer.jd.button}</button>

                  {jd && (
                    <div className="mt-8">
                      <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-bold tabular-nums tracking-[-0.04em]">{jd.coverage}%</span>
                        <span className="text-ink-2">{analyzer.jd.coverage} · {analyzer.jd.matchedOf(jd.matched.length, jd.total)}</span>
                      </div>
                      {jd.missing.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold">{analyzer.jd.missing} <span className="font-normal text-ink-2">{analyzer.jd.missingHint}</span></h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">{jd.missing.map((k) => <span key={k.term} className="neon-block px-2 py-1 text-sm font-medium">{k.term}</span>)}</div>
                        </div>
                      )}
                      {jd.matched.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold">{analyzer.jd.covered}</h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">{jd.matched.map((k) => <span key={k.term} className="border border-rule-2 px-2 py-1 text-sm">{k.term}</span>)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab === 'data' && (
                <div className="mt-6 space-y-10">
                  <div>
                    <h2 className="border-b border-ink pb-2 text-lg font-bold">{analyzer.data.profile}</h2>
                    <dl className="mt-2 grid grid-cols-[7rem_minmax(0,1fr)]">
                      {([[analyzer.data.fields.name, resume.profile.name], [analyzer.data.fields.email, resume.profile.email], [analyzer.data.fields.phone, resume.profile.phone], [analyzer.data.fields.location, resume.profile.location], [analyzer.data.fields.links, resume.profile.links.join('  ·  ')]] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="border-b border-rule py-2.5 text-ink-2">{k}</dt>
                          <dd className="min-w-0 break-words border-b border-rule py-2.5">{v || <span className="neon-block px-1.5 py-0.5">{analyzer.data.notDetected}</span>}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-sm text-ink-2">{analyzer.data.profileNote}</p>
                  </div>
                  <div>
                    <h2 className="border-b border-ink pb-2 text-lg font-bold">{analyzer.data.experience} <span className="font-normal text-ink-2">{analyzer.data.parsed(resume.experience.length)}</span></h2>
                    <div>
                      {resume.experience.map((e) => (
                        <div key={experienceKey(e)} className="border-b border-rule py-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-semibold">{e.title}{e.company && <span className="font-normal text-ink-2"> — {e.company}</span>}</span><span className="font-mono text-xs text-ink-2">{e.date}</span></div>
                          <p className="text-sm text-ink-2">{analyzer.data.bullets(e.bullets.length)}</p>
                        </div>
                      ))}
                      {!resume.experience.length && <p className="py-3"><span className="neon-block px-1.5 py-0.5">{analyzer.data.noExperience}</span></p>}
                    </div>
                  </div>
                  <div className="grid gap-10 sm:grid-cols-2">
                    <div>
                      <h2 className="border-b border-ink pb-2 text-lg font-bold">{analyzer.data.education} <span className="font-normal text-ink-2">({resume.education.length})</span></h2>
                      {resume.education.map((e) => <p key={educationKey(e)} className="border-b border-rule py-3">{e.degree || e.school}<span className="text-ink-2"> · {e.date}</span></p>)}
                      {!resume.education.length && <p className="py-3"><span className="neon-block px-1.5 py-0.5">{analyzer.data.noneParsed}</span></p>}
                    </div>
                    <div>
                      <h2 className="border-b border-ink pb-2 text-lg font-bold">{analyzer.data.skills} <span className="font-normal text-ink-2">({resume.skills.length})</span></h2>
                      <div className="mt-3 flex flex-wrap gap-1.5">{resume.skills.slice(0, 30).map((s) => <span key={s} className="border border-rule-2 px-2 py-0.5 text-sm">{s}</span>)}</div>
                      {!resume.skills.length && <p className="py-3"><span className="neon-block px-1.5 py-0.5">{analyzer.data.noneParsed}</span></p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
