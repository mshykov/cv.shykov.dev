import { useCallback, useMemo, useRef, useState } from 'react'
import { analyze } from '../lib/analyze'
import { downloadBlob } from '../lib/download'
import { TONE } from '../components/tone'
import { SAMPLE, synthExtracted, type BuilderState, type Spacing, type Template } from './model'
import type { ExperienceEntry, EducationEntry, ProjectEntry } from '../lib/parse'

const parseList = (t: string) => t.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)

function Field({ label, value, onChange, area, placeholder }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  const cls = 'mt-1 w-full rounded-md border border-stone-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400'
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      {area
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={cls + ' resize-y'} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </label>
  )
}

export default function Builder() {
  const [state, setState] = useState<BuilderState>(SAMPLE)
  const [skillsText, setSkillsText] = useState(SAMPLE.skills.join(', '))
  const [linksText, setLinksText] = useState(SAMPLE.profile.links.join(', '))
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  // Effective state folds the free-text skills/links fields into the model.
  const eff = useMemo<BuilderState>(() => ({
    ...state,
    skills: parseList(skillsText),
    profile: { ...state.profile, links: parseList(linksText) },
  }), [state, skillsText, linksText])

  const score = useMemo(() => analyze(synthExtracted(eff)), [eff])

  const setProfile = (k: keyof BuilderState['profile'], v: string) =>
    setState((s) => ({ ...s, profile: { ...s.profile, [k]: v } }))
  const setCfg = (k: keyof BuilderState['settings'], v: string | number) =>
    setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))

  // Generic list helpers
  const addExp = () => setState((s) => ({ ...s, experience: [...s.experience, { title: '', company: '', date: '', bullets: [] }] }))
  const setExp = (i: number, patch: Partial<ExperienceEntry>) => setState((s) => ({ ...s, experience: s.experience.map((e, j) => j === i ? { ...e, ...patch } : e) }))
  const moveExp = (i: number, d: number) => setState((s) => { const a = [...s.experience]; const t = a[i + d]; if (!t) return s; a[i + d] = a[i]; a[i] = t; return { ...s, experience: a } })
  const delExp = (i: number) => setState((s) => ({ ...s, experience: s.experience.filter((_, j) => j !== i) }))

  const addEdu = () => setState((s) => ({ ...s, education: [...s.education, { school: '', degree: '', date: '' }] }))
  const setEdu = (i: number, patch: Partial<EducationEntry>) => setState((s) => ({ ...s, education: s.education.map((e, j) => j === i ? { ...e, ...patch } : e) }))
  const delEdu = (i: number) => setState((s) => ({ ...s, education: s.education.filter((_, j) => j !== i) }))

  const addProj = () => setState((s) => ({ ...s, projects: [...s.projects, { name: '', description: '' }] }))
  const setProj = (i: number, patch: Partial<ProjectEntry>) => setState((s) => ({ ...s, projects: s.projects.map((e, j) => j === i ? { ...e, ...patch } : e) }))
  const delProj = (i: number) => setState((s) => ({ ...s, projects: s.projects.filter((_, j) => j !== i) }))

  const exportPdf = useCallback(async () => {
    setBusy(true); setNote('')
    try {
      // react-pdf (~485 KB gz) loads only on first export, not with the tab.
      const [{ pdf }, { ResumeDoc }] = await Promise.all([import('@react-pdf/renderer'), import('./ResumeDoc')])
      const blob = await pdf(<ResumeDoc state={eff} />).toBlob()
      downloadBlob(`${(eff.profile.name || 'resume').replace(/\s+/g, '_')}_CV.pdf`, blob)
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Export failed.')
    } finally { setBusy(false) }
  }, [eff])

  const importCv = useCallback(async (file: File) => {
    setBusy(true); setNote('')
    try {
      const [{ extractDocument }, { parseResume }] = await Promise.all([import('../lib/extract'), import('../lib/parse')])
      const r = parseResume(await extractDocument(file))
      setState((s) => ({ ...r, settings: s.settings }))
      setSkillsText(r.skills.join(', ')); setLinksText(r.profile.links.join(', '))
      setNote(`Imported ${r.experience.length} roles from ${file.name}. Review and tweak below.`)
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Could not import that file.')
    } finally { setBusy(false) }
  }, [])

  return (
    <div>
      <p className="mb-5 text-stone-500">Build an ATS-clean CV. Edit on the left, see it live on the right, and export a single-column PDF with real selectable text. The score updates as you type.</p>

      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-stone-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Score</span>
          <span className={`text-xl font-semibold tabular-nums ${TONE[score.band.tone].text}`}>{score.score}</span>
        </div>
        <span className="text-xs text-stone-400">{score.band.label}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-stone-500">Accent <input type="color" value={state.settings.accent} onChange={(e) => setCfg('accent', e.target.value)} className="h-6 w-7 cursor-pointer rounded border border-stone-300" /></label>
          <label className="flex items-center gap-1 text-xs text-stone-500">Size
            <select value={state.settings.fontSize} onChange={(e) => setCfg('fontSize', Number(e.target.value))} className="rounded border border-stone-300 px-1 py-0.5 text-xs">
              {[9, 10, 11, 12].map((n) => <option key={n} value={n}>{n}pt</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-500">Spacing
            <select value={state.settings.spacing} onChange={(e) => setCfg('spacing', e.target.value as Spacing)} className="rounded border border-stone-300 px-1 py-0.5 text-xs">
              {['compact', 'standard', 'relaxed'].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-500">Page
            <select value={state.settings.pageSize} onChange={(e) => setCfg('pageSize', e.target.value)} className="rounded border border-stone-300 px-1 py-0.5 text-xs">
              <option value="A4">A4</option><option value="LETTER">Letter</option>
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-500">Template
            <select value={state.settings.template} onChange={(e) => setCfg('template', e.target.value as Template)} className="rounded border border-stone-300 px-1 py-0.5 text-xs">
              <option value="classic">Classic</option><option value="modern">Modern</option>
            </select>
          </label>
          <button onClick={() => importRef.current?.click()} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-stone-400">Import CV</button>
          <button onClick={exportPdf} disabled={busy} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">{busy ? 'Working…' : '↓ Export PDF'}</button>
          <input ref={importRef} type="file" accept="application/pdf,.pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCv(f) }} />
        </div>
      </div>
      {note && <p role="status" className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 ring-1 ring-indigo-200">{note}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FORM */}
        <div className="space-y-5">
          <fieldset className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <legend className="px-1 text-sm font-semibold text-stone-800">Profile</legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" value={state.profile.name} onChange={(v) => setProfile('name', v)} />
              <Field label="Email" value={state.profile.email} onChange={(v) => setProfile('email', v)} />
              <Field label="Phone" value={state.profile.phone} onChange={(v) => setProfile('phone', v)} />
              <Field label="Location" value={state.profile.location} onChange={(v) => setProfile('location', v)} />
            </div>
            <div className="mt-3"><Field label="Links (comma-separated)" value={linksText} onChange={setLinksText} placeholder="linkedin.com/in/you, github.com/you" /></div>
            <div className="mt-3"><Field label="Summary" value={state.profile.summary} onChange={(v) => setProfile('summary', v)} area /></div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <legend className="flex w-full items-center justify-between px-1"><span className="text-sm font-semibold text-stone-800">Experience</span><button onClick={addExp} className="text-xs font-medium text-indigo-600">+ Add</button></legend>
            <div className="space-y-4">
              {state.experience.map((e, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex items-center justify-end gap-2 text-xs text-stone-400">
                    <button onClick={() => moveExp(i, -1)} disabled={i === 0} className="disabled:opacity-30">↑</button>
                    <button onClick={() => moveExp(i, 1)} disabled={i === state.experience.length - 1} className="disabled:opacity-30">↓</button>
                    <button onClick={() => delExp(i)} className="text-rose-500">Delete</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title" value={e.title} onChange={(v) => setExp(i, { title: v })} />
                    <Field label="Company" value={e.company} onChange={(v) => setExp(i, { company: v })} />
                  </div>
                  <div className="mt-3"><Field label="Dates" value={e.date} onChange={(v) => setExp(i, { date: v })} placeholder="Jan 2022 – now" /></div>
                  <div className="mt-3"><Field label="Bullets (one per line)" value={e.bullets.join('\n')} onChange={(v) => setExp(i, { bullets: v.split('\n') })} area placeholder={'Led a team of…\nReduced X by 30%…'} /></div>
                </div>
              ))}
              {!state.experience.length && <p className="text-sm text-stone-400">No roles yet — add one.</p>}
            </div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <legend className="px-1 text-sm font-semibold text-stone-800">Skills</legend>
            <Field label="Skills (comma or new-line separated)" value={skillsText} onChange={setSkillsText} area />
          </fieldset>

          <fieldset className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <legend className="flex w-full items-center justify-between px-1"><span className="text-sm font-semibold text-stone-800">Projects</span><button onClick={addProj} className="text-xs font-medium text-indigo-600">+ Add</button></legend>
            <div className="space-y-3">
              {state.projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex justify-end"><button onClick={() => delProj(i)} className="text-xs text-rose-500">Delete</button></div>
                  <Field label="Name" value={p.name} onChange={(v) => setProj(i, { name: v })} />
                  <div className="mt-2"><Field label="Description" value={p.description} onChange={(v) => setProj(i, { description: v })} /></div>
                </div>
              ))}
              {!state.projects.length && <p className="text-sm text-stone-400">Optional.</p>}
            </div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <legend className="flex w-full items-center justify-between px-1"><span className="text-sm font-semibold text-stone-800">Education</span><button onClick={addEdu} className="text-xs font-medium text-indigo-600">+ Add</button></legend>
            <div className="space-y-3">
              {state.education.map((e, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex justify-end"><button onClick={() => delEdu(i)} className="text-xs text-rose-500">Delete</button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Degree" value={e.degree} onChange={(v) => setEdu(i, { degree: v })} />
                    <Field label="School" value={e.school} onChange={(v) => setEdu(i, { school: v })} />
                  </div>
                  <div className="mt-2"><Field label="Dates" value={e.date} onChange={(v) => setEdu(i, { date: v })} /></div>
                </div>
              ))}
              {!state.education.length && <p className="text-sm text-stone-400">Add your degree(s).</p>}
            </div>
          </fieldset>
        </div>

        {/* LIVE PREVIEW */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-xl bg-white p-8 text-[13px] leading-relaxed text-stone-800 shadow-sm ring-1 ring-stone-200" style={{ minHeight: 400 }}>
            {eff.profile.name && <div className="text-xl font-bold" style={eff.settings.template === 'modern' ? { color: eff.settings.accent } : undefined}>{eff.profile.name}</div>}
            <div className="text-xs text-stone-500">{[eff.profile.email, eff.profile.phone, ...eff.profile.links].filter(Boolean).join('  •  ')}</div>
            {eff.profile.location && <div className="text-xs text-stone-500">{eff.profile.location}</div>}
            {eff.profile.summary && <PreviewSection accent={eff.settings.accent} modern={eff.settings.template === 'modern'} title="Summary"><p>{eff.profile.summary}</p></PreviewSection>}
            {eff.experience.length > 0 && <PreviewSection accent={eff.settings.accent} modern={eff.settings.template === 'modern'} title="Experience">{eff.experience.map((e, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between gap-2"><span className="font-semibold">{e.title}{e.company && ` — ${e.company}`}</span><span className="text-xs text-stone-500">{e.date}</span></div>
                <ul className="ml-4 list-disc">{e.bullets.filter((b) => b.trim()).map((b, j) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}</PreviewSection>}
            {eff.skills.length > 0 && <PreviewSection accent={eff.settings.accent} modern={eff.settings.template === 'modern'} title="Skills"><p>{eff.skills.join('  •  ')}</p></PreviewSection>}
            {eff.projects.length > 0 && <PreviewSection accent={eff.settings.accent} modern={eff.settings.template === 'modern'} title="Projects"><ul className="ml-4 list-disc">{eff.projects.map((p, i) => <li key={i}><span className="font-semibold">{p.name}</span>{p.description && ` — ${p.description}`}</li>)}</ul></PreviewSection>}
            {eff.education.length > 0 && <PreviewSection accent={eff.settings.accent} modern={eff.settings.template === 'modern'} title="Education">{eff.education.map((e, i) => <div key={i} className="flex justify-between gap-2"><span><span className="font-semibold">{e.degree || e.school}</span>{e.degree && e.school && ` — ${e.school}`}</span><span className="text-xs text-stone-500">{e.date}</span></div>)}</PreviewSection>}
          </div>
          <p className="mt-2 text-center text-xs text-stone-400">Live preview · the exported PDF is single-column Helvetica, ATS-clean</p>
        </div>
      </div>
    </div>
  )
}

function PreviewSection({ title, accent, modern, children }: { title: string; accent: string; modern?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-bold uppercase" style={{ color: modern ? '#1a1a1a' : accent, letterSpacing: modern ? '0.1em' : '0.04em' }}>{title}</div>
      <div className="mb-2 mt-1" style={modern ? undefined : { borderBottom: '1px solid #d6d3d1' }} />
      {children}
    </div>
  )
}
