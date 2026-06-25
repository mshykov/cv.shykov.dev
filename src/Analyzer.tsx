import { useCallback, useRef, useState } from 'react'
import type { Report, Check } from './lib/analyze'
import { getTopFixes } from './lib/analyze'
import type { Resume } from './lib/parse'
import type { JDMatch } from './lib/jdmatch'
import { TONE } from './components/tone'
import { ScoreRing } from './components/ScoreRing'

type Tab = 'analyze' | 'jd' | 'data'
type CheckRowProps = Readonly<{ c: Check }>
type CategoryBreakdownProps = Readonly<{ report: Report }>
type TopFixesProps = Readonly<{ fixes: Check[] }>

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

function reportMetaSummary(report: Report): string {
  const pageCount = report.meta.numPages
  const pages = pageCount ? `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} · ` : ''
  return `${pages}${report.meta.words.toLocaleString()} words · ${report.meta.charCount.toLocaleString()} readable characters.`
}

function CheckRow({ c }: CheckRowProps) {
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

function CategoryBreakdown({ report }: CategoryBreakdownProps) {
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
              <span className="text-xs font-medium text-stone-500">{cat}</span>
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
  if (!fixes.length) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
        No priority fixes found. The remaining report is mostly confirmation.
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

export default function Analyzer() {
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
  const inputRef = useRef<HTMLInputElement>(null)

  const run = useCallback(async (file: File) => {
    setError(''); setErrDetail(''); setReport(null); setResume(null); setJd(null)
    const ok = /\.(pdf|docx)$/i.test(file.name) || file.type === 'application/pdf' || file.type.includes('wordprocessingml')
    if (!ok) { setError('Please choose a PDF or DOCX file.'); return }
    setBusy(true); setFileName(file.name); setTab('analyze')
    let stage = 'loading modules'
    try {
      const [{ extractDocument }, { analyze }, { parseResume }] = await Promise.all([
        import('./lib/extract'), import('./lib/analyze'), import('./lib/parse'),
      ])
      stage = 'extracting text'
      const ex = await extractDocument(file)
      stage = 'analyzing'
      const rep = analyze(ex)
      stage = 'parsing'
      const res = parseResume(ex)
      setReport(rep); setResume(res); setCvText(ex.text)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      const detail = `stage: ${stage}\n${err.name}: ${err.message}\n\n${err.stack ?? '(no stack)'}\n\nfile: ${file.name} (${file.type || 'unknown'}, ${file.size} bytes)\nUA: ${navigator.userAgent}\nbuild: ${import.meta.env.MODE}`
      console.error('[ATS Resume Toolkit] analyze failed —', detail)
      setError(`Analysis failed while ${stage}. Please tap “Copy details” and send them to me.`)
      setErrDetail(detail)
    } finally { setBusy(false) }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]; if (f) run(f)
  }, [run])

  const runJd = useCallback(async () => {
    if (!resume || !jdText.trim()) return
    const { matchJD } = await import('./lib/jdmatch')
    setJd(matchJD(cvText, resume.skills, jdText))
  }, [resume, cvText, jdText])

  const download = useCallback(async () => {
    if (!report || !resume) return
    const [{ toMarkdown }, { downloadText }] = await Promise.all([import('./lib/report'), import('./lib/download')])
    downloadText(fileName.replace(/\.[^.]+$/, '') + '-ats-report.md', toMarkdown(fileName, report, resume, jd ?? undefined))
  }, [report, resume, jd, fileName])

  const categories = report ? [...new Set(report.checks.map((c) => c.category))] : []
  const topFixes = report ? getTopFixes(report, 3) : []

  return (
    <div>
      <h2 className="sr-only">Upload a resume for a fast ATS score</h2>

      {report ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition ${drag ? 'border-indigo-300 bg-indigo-50' : 'border-stone-200 bg-white'}`}
        >
          <p className="text-sm text-stone-500">Analyzed <span className="font-medium text-stone-800">{fileName}</span></p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Analyze another CV
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Upload your CV as a PDF or DOCX file"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center shadow-sm transition ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50/40'}`}
        >
          <svg className="h-9 w-9 text-stone-400 group-hover:text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4m0 0L7.5 8.5M12 4l4.5 4.5M5 20h14" /></svg>
          <span className="mt-3 font-medium text-stone-800">{busy ? 'Scoring your CV…' : 'Drop your CV here for a fast ATS score'}</span>
          <span className="mt-1 text-sm text-stone-400">PDF or DOCX · runs in your browser · no upload · no LLM</span>
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
                Copy details
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
                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">Fast ATS score</h2>
                    <p className="mt-1 text-sm text-stone-500">{reportMetaSummary(report)}</p>
                  </div>
                </div>
                <div className="mt-4"><CategoryBreakdown report={report} /></div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-stone-900">Top fixes</h3>
                  <button onClick={download} className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50">↓ Report</button>
                </div>
                <TopFixes fixes={topFixes} />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <nav className="flex shrink-0 gap-1 rounded-lg bg-stone-100 p-1 text-sm font-medium">
                {([['analyze', 'Full report'], ['jd', 'Job match'], ['data', 'Extracted data']] as [Tab, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} className={`rounded-md px-3 py-1.5 transition ${tab === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{label}</button>
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
                        <h2 className="font-semibold text-stone-800">{cat}</h2>
                        <span className="text-sm tabular-nums text-stone-400">{items.reduce((s, c) => s + c.points, 0)}/{items.reduce((s, c) => s + c.max, 0)}</span>
                      </div>
                      <div className="divide-y divide-stone-100">{items.map((c) => <CheckRow key={c.id} c={c} />)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'jd' && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <h2 className="font-semibold text-stone-800">Match against a job description</h2>
              <p className="mt-1 text-sm text-stone-500">Paste the job posting. We extract the keywords it emphasizes and check which your CV already contains.</p>
              <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={6} placeholder="Paste the full job description here…" className="mt-3 w-full resize-y rounded-lg border border-stone-300 p-3 text-sm outline-none transition hover:border-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <button onClick={runJd} disabled={!jdText.trim()} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Match keywords</button>

              {jd && (
                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-semibold tabular-nums ${jdCoverageClass(jd.coverage)}`}>{jd.coverage}%</span>
                    <span className="text-sm text-stone-500">keyword coverage · {jd.matched.length}/{jd.total} matched</span>
                  </div>
                  {jd.missing.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-stone-700">Missing from your CV <span className="font-normal text-stone-400">(add the ones that are genuinely true)</span></h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">{jd.missing.map((k) => <span key={k.term} className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700 ring-1 ring-rose-200">{k.term}</span>)}</div>
                    </div>
                  )}
                  {jd.matched.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-stone-700">Already covered</h3>
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
                <h2 className="mb-2 font-semibold text-stone-800">Profile</h2>
                <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
                  {([['Name', resume.profile.name], ['Email', resume.profile.email], ['Phone', resume.profile.phone], ['Location', resume.profile.location], ['Links', resume.profile.links.join('  ·  ')]] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-stone-400">{k}</dt><dd className={v ? 'text-stone-800' : 'text-rose-500'}>{v || 'not detected'}</dd></div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-stone-400">This is what an ATS-style parser pulls out. Blank fields in red usually mean a formatting issue.</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <h2 className="mb-3 font-semibold text-stone-800">Experience <span className="text-sm font-normal text-stone-400">({resume.experience.length} parsed)</span></h2>
                <div className="space-y-3">
                  {resume.experience.map((e) => (
                    <div key={experienceKey(e)} className="border-l-2 border-stone-200 pl-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium text-stone-800">{e.title}{e.company && <span className="font-normal text-stone-500"> — {e.company}</span>}</span><span className="text-xs text-stone-400">{e.date}</span></div>
                      <p className="text-xs text-stone-400">{e.bullets.length} bullet{e.bullets.length === 1 ? '' : 's'}</p>
                    </div>
                  ))}
                  {!resume.experience.length && <p className="text-sm text-rose-500">No experience entries parsed — check the section header and formatting.</p>}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                  <h2 className="mb-3 font-semibold text-stone-800">Education <span className="text-sm font-normal text-stone-400">({resume.education.length})</span></h2>
                  {resume.education.map((e) => <p key={educationKey(e)} className="text-sm text-stone-700">{e.degree || e.school}<span className="text-stone-400"> · {e.date}</span></p>)}
                  {!resume.education.length && <p className="text-sm text-rose-500">None parsed.</p>}
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                  <h2 className="mb-3 font-semibold text-stone-800">Skills <span className="text-sm font-normal text-stone-400">({resume.skills.length})</span></h2>
                  <div className="flex flex-wrap gap-1.5">{resume.skills.slice(0, 30).map((s) => <span key={s} className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{s}</span>)}</div>
                  {!resume.skills.length && <p className="text-sm text-rose-500">None parsed.</p>}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
