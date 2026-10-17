import { useEffect, useRef, useState } from 'react'
import type { Report, Check, Status } from './lib/analyze'
import { getTopFixes } from './lib/analyze'
// Dependency-free, so this stays out of the lazily loaded extractor bundle.
import { isSupportedDocument } from './lib/filetype.ts'
import type { Job } from './lib/job.ts'
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

type AnalyzerProps = Readonly<{
  /** The CV to score. The parent remounts this component for every new file. */
  job: Job
  onBusyChange: (busy: boolean) => void
  /** Open the file picker again. */
  onAnother: () => void
}>

export default function Analyzer({ job, onBusyChange, onAnother }: AnalyzerProps) {
  const { locale, messages: m } = useLocale()
  const { analyzer } = m
  const fileName = job.file.name
  const [report, setReport] = useState<Report | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [cvText, setCvText] = useState('')
  const [error, setError] = useState('')
  const [errDetail, setErrDetail] = useState('')
  const [tab, setTab] = useState<Tab>('analyze')
  const [jdText, setJdText] = useState('')
  const [jd, setJd] = useState<JDMatch | null>(null)
  const [style, setStyle] = useState<StyleReport | null>(null)
  // The CV was not written in English, so the English-only style checks stay out of it.
  const [styleSkipped, setStyleSkipped] = useState(false)
  const resultRef = useRef<HTMLElement>(null)
  // The run reads the messages of the moment it starts; a new messages object must not restart it.
  const messages = useRef(m)
  useEffect(() => { messages.current = m })

  // One run per mounted job. Choosing another file remounts this component, so a slow
  // earlier run (a 60-page PDF) can never write over the newer result: its `current`
  // flag is false by then (e2e: "a superseded upload never overwrites the newer result").
  useEffect(() => {
    let current = true
    const settle = () => {
      if (current) onBusyChange(false)
    }
    const run = async (file: File) => {
      const { analysis, analyzer } = messages.current
      if (!isSupportedDocument(file)) {
        setError(analyzer.chooseFile)
        settle()
        return
      }
      let stage: Stage = 'loading'
      try {
        const [{ extractDocument }, { analyze }, { parseResume }, { analyzeStyle }, { detectLanguage }] = await Promise.all([
          import('./lib/extract'), import('./lib/analyze'), import('./lib/parse'), import('./lib/style'), import('./lib/lang/index.ts'),
        ])
        stage = 'extracting'
        const ex = await extractDocument(file)
        stage = 'analyzing'
        const rep = analyze(ex, analysis)
        stage = 'parsing'
        const res = parseResume(ex)
        stage = 'style'
        // The writing-style signals look for English stock phrases and English
        // passive voice. On a Spanish or German CV they would measure nothing.
        const language = detectLanguage(ex.text)
        const skip = language !== 'en' && language !== 'unknown'
        const sty = skip ? null : analyzeStyle(ex.text, ex.lines)
        if (!current) return
        setReport(rep); setResume(res); setCvText(ex.text); setStyle(sty); setStyleSkipped(skip)
      } catch (e) {
        if (!current) return
        const err = e instanceof Error ? e : new Error(String(e))
        const detail = `stage: ${STAGE_DETAIL[stage]}\n${err.name}: ${err.message}\n\n${err.stack ?? '(no stack)'}\n\nfile: ${file.name} (${file.type || 'unknown'}, ${file.size} bytes)\nUA: ${navigator.userAgent}\nbuild: ${import.meta.env.MODE}`
        console.error('[ATS Resume Toolkit] analyze failed —', detail)
        setError(analyzer.failed(analyzer.stages[stage]))
        setErrDetail(detail)
      } finally {
        settle()
      }
    }
    void run(job.file)
    return () => { current = false }
  }, [job.file, onBusyChange])

  // The first screen is full height, so bring the report into view once it exists.
  useEffect(() => {
    if (!report) return
    const calm = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    resultRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
  }, [report])

  const runJd = async () => {
    if (!resume || !jdText.trim()) return
    const { matchJD } = await import('./lib/jdmatch')
    setJd(matchJD(cvText, resume.skills, jdText))
  }

  const download = async () => {
    if (!report || !resume) return
    const [{ toMarkdown }, { downloadText }] = await Promise.all([import('./lib/report'), import('./lib/download')])
    downloadText(fileName.replace(/\.[^.]+$/, '') + m.report.fileSuffix, toMarkdown(fileName, report, resume, m, jd ?? undefined))
  }

  const categories = report ? [...new Set(report.checks.map((c) => c.category))] : []
  const topFixes = report ? getTopFixes(report, 3) : []

  return (
    <div>
      {error && (
        <div role="alert" className="flex gap-3 border-2 border-ink px-5 py-4">
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
        <section ref={resultRef} className="grid scroll-mt-6 gap-12 pt-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24" aria-live="polite">
          <div>
            <h2 className="lab">{analyzer.scoreHeading}</h2>
            <ScoreRing score={report.score} tone={report.band.tone} className="mt-3" />
            <p className="mt-5 flex items-center gap-2.5 text-2xl font-semibold tracking-[-0.02em]">
              <StatusMark status={report.band.tone} />
              {report.band.label}
            </p>
            <p className="lab mt-3 normal-case">{fileName} · {reportMetaSummary(m, report)}</p>
          </div>

          <div className="min-w-0">
            <h3 className="sr-only">{analyzer.topFixes}</h3>
            <TopFixes fixes={topFixes} />
            <div className="mt-5 flex flex-wrap gap-x-7">
              <button type="button" onClick={download} className="alt">{analyzer.downloadReport}</button>
              <button type="button" onClick={onAnother} className="alt">{analyzer.analyzeAnother}</button>
            </div>

            <details className="group mt-8 border-b border-rule">
              <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {analyzer.details}
                <span aria-hidden className="font-mono text-xl text-ink-2 group-open:hidden">+</span>
                <span aria-hidden className="hidden font-mono text-xl text-ink-2 group-open:inline">−</span>
              </summary>
              <nav className="flex flex-wrap gap-x-1 border-b border-rule" aria-label={analyzer.details}>
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
              <div className="pb-10">
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
            </details>
          </div>
        </section>
      )}
    </div>
  )
}
