import { useCallback, useMemo, useRef, useState } from 'react'
import { analyze } from '../lib/analyze'
import { downloadBlob } from '../lib/download'
import { TONE } from '../components/tone'
import { BUILDER_SECTION_TITLES, SAMPLE, synthExtracted, type BuilderState, type Spacing, type Template } from './model'
import type { ExperienceEntry, EducationEntry, ProjectEntry } from '../lib/parse'

const parseList = (t: string) => t.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
const ACCENT_PRESETS = ['#4f46e5', '#0f766e', '#c2410c', '#be123c', '#111827'] as const
const PREVIEW_LINE_HEIGHT: Record<Spacing, number> = { compact: 1.35, standard: 1.5, relaxed: 1.7 }
const PREVIEW_SECTION_GAP: Record<Spacing, number> = { compact: 10, standard: 15, relaxed: 21 }
const PREVIEW_ENTRY_GAP: Record<Spacing, number> = { compact: 5, standard: 8, relaxed: 12 }
const SPACING_LABELS: Record<Spacing, string> = { compact: 'Tight', standard: 'Std', relaxed: 'Airy' }

type WithUiId<T> = T & { uiId: string }
type BuilderUiState = Omit<BuilderState, 'experience' | 'education' | 'projects'> & {
  experience: WithUiId<ExperienceEntry>[]
  education: WithUiId<EducationEntry>[]
  projects: WithUiId<ProjectEntry>[]
}

let nextBuilderItemId = 0
const createUiId = (scope: string) => `${scope}-${nextBuilderItemId++}`
const withUiIds = (state: BuilderState): BuilderUiState => ({
  ...state,
  experience: state.experience.map((entry) => ({ ...entry, uiId: createUiId('experience') })),
  education: state.education.map((entry) => ({ ...entry, uiId: createUiId('education') })),
  projects: state.projects.map((entry) => ({ ...entry, uiId: createUiId('project') })),
})
const stripUiIds = (state: BuilderUiState): BuilderState => ({
  ...state,
  experience: state.experience.map((entry) => ({ title: entry.title, company: entry.company, date: entry.date, bullets: entry.bullets })),
  education: state.education.map((entry) => ({ school: entry.school, degree: entry.degree, date: entry.date })),
  projects: state.projects.map((entry) => ({ name: entry.name, description: entry.description })),
})

function Field({ label, value, onChange, area, placeholder, type = 'text', autoComplete }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string; type?: string; autoComplete?: string }) {
  const cls = 'mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition hover:border-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-600">{label}</span>
      {area
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={cls + ' resize-y'} />
        : <input type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </label>
  )
}

function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <>
      <legend className="rounded-md bg-indigo-50 px-2 py-0.5 text-lg font-semibold tracking-tight text-stone-900 ring-1 ring-indigo-100">{title}</legend>
      <div className="mb-4 mt-1 flex items-start justify-between gap-3 px-1">
        {hint ? <p className="text-sm text-stone-500">{hint}</p> : <span />}
        {action}
      </div>
    </>
  )
}

function IconButton({ label, onClick, disabled, tone = 'neutral', children }: { label: string; onClick: () => void; disabled?: boolean; tone?: 'neutral' | 'danger'; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${tone === 'danger' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700'}`}
    >
      {children}
    </button>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100">
      + {children}
    </button>
  )
}

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 text-xs font-semibold uppercase text-stone-400">{label}</div>
      {children}
    </div>
  )
}

function OptionButton<T extends string | number>({ value, selected, onSelect, children }: { value: T; selected: boolean; onSelect: (value: T) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`min-h-9 rounded-lg px-3 text-sm font-medium transition ${selected ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`}
    >
      {children}
    </button>
  )
}

export default function Builder() {
  const [state, setState] = useState<BuilderUiState>(() => withUiIds(SAMPLE))
  const [skillsText, setSkillsText] = useState(SAMPLE.skills.join(', '))
  const [linksText, setLinksText] = useState(SAMPLE.profile.links.join(', '))
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const accentRef = useRef<HTMLInputElement>(null)

  // Effective state folds the free-text skills/links fields into the model.
  const eff = useMemo<BuilderState>(() => ({
    ...stripUiIds(state),
    skills: parseList(skillsText),
    profile: { ...state.profile, links: parseList(linksText) },
  }), [state, skillsText, linksText])

  const score = useMemo(() => analyze(synthExtracted(eff)), [eff])
  const previewFontSize = state.settings.fontSize + 3
  const previewContactSize = Math.max(10, previewFontSize - 2)
  const previewNameSize = previewFontSize + 7
  const previewSectionGap = PREVIEW_SECTION_GAP[state.settings.spacing]
  const previewEntryGap = PREVIEW_ENTRY_GAP[state.settings.spacing]

  const setProfile = (k: keyof BuilderUiState['profile'], v: string) =>
    setState((s) => ({ ...s, profile: { ...s.profile, [k]: v } }))
  const setCfg = (k: keyof BuilderUiState['settings'], v: string | number) =>
    setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))

  // Generic list helpers
  const addExp = () => setState((s) => ({ ...s, experience: [...s.experience, { title: '', company: '', date: '', bullets: [], uiId: createUiId('experience') }] }))
  const setExp = (i: number, patch: Partial<ExperienceEntry>) => setState((s) => ({ ...s, experience: s.experience.map((e, j) => j === i ? { ...e, ...patch } : e) }))
  const moveExp = (i: number, d: number) => setState((s) => { const a = [...s.experience]; const t = a[i + d]; if (!t) return s; a[i + d] = a[i]; a[i] = t; return { ...s, experience: a } })
  const delExp = (i: number) => setState((s) => ({ ...s, experience: s.experience.filter((_, j) => j !== i) }))

  const addEdu = () => setState((s) => ({ ...s, education: [...s.education, { school: '', degree: '', date: '', uiId: createUiId('education') }] }))
  const setEdu = (i: number, patch: Partial<EducationEntry>) => setState((s) => ({ ...s, education: s.education.map((e, j) => j === i ? { ...e, ...patch } : e) }))
  const delEdu = (i: number) => setState((s) => ({ ...s, education: s.education.filter((_, j) => j !== i) }))

  const addProj = () => setState((s) => ({ ...s, projects: [...s.projects, { name: '', description: '', uiId: createUiId('project') }] }))
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
      setState((s) => withUiIds({ ...r, settings: s.settings }))
      setSkillsText(r.skills.join(', ')); setLinksText(r.profile.links.join(', '))
      setNote(`Imported ${r.experience.length} roles from ${file.name}. Review and tweak below.`)
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Could not import that file.')
    } finally { setBusy(false) }
  }, [])

  return (
    <div>
      <p className="mb-5 max-w-4xl text-stone-500">Build an ATS-clean resume with plain text, standard sections, and a live preview. Import an existing CV, tune the layout, then export a selectable single-column PDF.</p>

      {/* toolbar */}
      <div className="sticky top-3 z-10 mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-full bg-stone-50 text-xl font-semibold tabular-nums ring-4 ring-white ${TONE[score.band.tone].text}`}>{score.score}</div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Live score</div>
            <div className="text-sm font-medium text-stone-700">{score.band.label}</div>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => importRef.current?.click()} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50">Import CV</button>
          <button type="button" onClick={exportPdf} disabled={busy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'Working…' : '↓ Export PDF'}</button>
          <input
            ref={importRef}
            type="file"
            accept="application/pdf,.pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importCv(f)
              e.currentTarget.value = ''
            }}
          />
        </div>
      </div>
      {note && <p role="status" className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 ring-1 ring-indigo-200">{note}</p>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,0.95fr)]">
        {/* FORM */}
        <div className="space-y-5">
          <fieldset className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <SectionTitle title="Profile" hint="Keep contact details plain-text so parsers can read them." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={state.profile.name} onChange={(v) => setProfile('name', v)} />
              <Field label="Email" value={state.profile.email} onChange={(v) => setProfile('email', v)} type="email" autoComplete="email" />
              <Field label="Phone" value={state.profile.phone} onChange={(v) => setProfile('phone', v)} type="tel" autoComplete="tel" />
              <Field label="Location" value={state.profile.location} onChange={(v) => setProfile('location', v)} autoComplete="address-level2" />
            </div>
            <div className="mt-3"><Field label="Links (comma-separated)" value={linksText} onChange={setLinksText} placeholder="linkedin.com/in/you, github.com/you" /></div>
            <div className="mt-3"><Field label="Summary" value={state.profile.summary} onChange={(v) => setProfile('summary', v)} area /></div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <SectionTitle title="Experience" hint="Use action verbs, measurable impact, and one result per bullet." action={<AddButton onClick={addExp}>Add</AddButton>} />
            <div className="space-y-4">
              {state.experience.map((e, i) => (
                <div key={e.uiId} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="mb-3 flex items-center justify-end gap-2">
                    <IconButton label="Move role up" onClick={() => moveExp(i, -1)} disabled={i === 0}>↑</IconButton>
                    <IconButton label="Move role down" onClick={() => moveExp(i, 1)} disabled={i === state.experience.length - 1}>↓</IconButton>
                    <IconButton label="Delete role" onClick={() => delExp(i)} tone="danger">×</IconButton>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
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

          <fieldset className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <SectionTitle title="Skills" hint="Separate skills by comma or line break; keep terms recruiter-friendly." />
            <Field label="Skills (comma or new-line separated)" value={skillsText} onChange={setSkillsText} area />
          </fieldset>

          <fieldset className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <SectionTitle title="Projects" hint="Optional, best for proof of ownership or portfolio-worthy work." action={<AddButton onClick={addProj}>Add</AddButton>} />
            <div className="space-y-3">
              {state.projects.map((p, i) => (
                <div key={p.uiId} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="mb-2 flex justify-end"><IconButton label="Delete project" onClick={() => delProj(i)} tone="danger">×</IconButton></div>
                  <Field label="Name" value={p.name} onChange={(v) => setProj(i, { name: v })} />
                  <div className="mt-2"><Field label="Description" value={p.description} onChange={(v) => setProj(i, { description: v })} /></div>
                </div>
              ))}
              {!state.projects.length && <p className="text-sm text-stone-400">Optional.</p>}
            </div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <SectionTitle title="Education" hint="Keep dates and degree names consistent with your experience section." action={<AddButton onClick={addEdu}>Add</AddButton>} />
            <div className="space-y-3">
              {state.education.map((e, i) => (
                <div key={e.uiId} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="mb-2 flex justify-end"><IconButton label="Delete education" onClick={() => delEdu(i)} tone="danger">×</IconButton></div>
                  <div className="grid gap-3 sm:grid-cols-2">
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
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="mb-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">Document settings</h2>
                <p className="mt-0.5 text-xs text-stone-400">Affects preview and exported PDF.</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">{state.settings.pageSize === 'A4' ? 'A4' : 'Letter'} preview</span>
            </div>
            <div className="grid gap-x-5 gap-y-4 text-sm sm:grid-cols-2 2xl:grid-cols-3">
              <SettingGroup label="Accent">
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Use ${color} accent`}
                      onClick={() => setCfg('accent', color)}
                      className={`h-8 w-8 rounded-full border-2 transition ${state.settings.accent.toLowerCase() === color ? 'border-white shadow-sm ring-2 ring-stone-900' : 'border-white ring-1 ring-stone-200 hover:ring-stone-400'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => accentRef.current?.click()}
                    className="grid h-8 w-8 place-items-center rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-500 transition hover:bg-stone-50"
                    title="Choose custom accent"
                    aria-label="Choose custom accent"
                  >
                    +
                  </button>
                  <input ref={accentRef} type="color" value={state.settings.accent} onChange={(e) => setCfg('accent', e.target.value)} className="sr-only" />
                </div>
              </SettingGroup>

              <SettingGroup label="Size">
                <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
                  {[9, 10, 11, 12].map((n) => <OptionButton key={n} value={n} selected={state.settings.fontSize === n} onSelect={(value) => setCfg('fontSize', value)}>{n}pt</OptionButton>)}
                </div>
              </SettingGroup>

              <SettingGroup label="Spacing">
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
                  {(['compact', 'standard', 'relaxed'] as Spacing[]).map((n) => (
                    <OptionButton key={n} value={n} selected={state.settings.spacing === n} onSelect={(value) => setCfg('spacing', value)}>
                      {SPACING_LABELS[n]}
                    </OptionButton>
                  ))}
                </div>
              </SettingGroup>

              <SettingGroup label="Page">
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
                  <OptionButton value="A4" selected={state.settings.pageSize === 'A4'} onSelect={(value) => setCfg('pageSize', value)}>A4</OptionButton>
                  <OptionButton value="LETTER" selected={state.settings.pageSize === 'LETTER'} onSelect={(value) => setCfg('pageSize', value)}>Letter</OptionButton>
                </div>
              </SettingGroup>

              <SettingGroup label="Template">
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
                  {(['classic', 'modern'] as Template[]).map((n) => (
                    <OptionButton key={n} value={n} selected={state.settings.template === n} onSelect={(value) => setCfg('template', value)}>
                      {n === 'classic' ? 'Classic' : 'Modern'}
                    </OptionButton>
                  ))}
                </div>
              </SettingGroup>
            </div>
          </div>
          <div className="rounded-2xl bg-stone-200/70 p-4 shadow-inner">
            <div
              className="mx-auto overflow-hidden rounded-sm bg-white p-8 text-stone-800 shadow-2xl ring-1 ring-black/5"
              style={{ aspectRatio: state.settings.pageSize === 'LETTER' ? '8.5 / 11' : '210 / 297', fontSize: previewFontSize, lineHeight: PREVIEW_LINE_HEIGHT[state.settings.spacing] }}
            >
              {eff.profile.name && <div className="font-bold" style={{ fontSize: previewNameSize, color: eff.settings.template === 'modern' ? eff.settings.accent : undefined }}>{eff.profile.name}</div>}
              <div className="text-stone-500" style={{ fontSize: previewContactSize }}>{[eff.profile.email, eff.profile.phone, ...eff.profile.links].filter(Boolean).join('  •  ')}</div>
              {eff.profile.location && <div className="text-stone-500" style={{ fontSize: previewContactSize }}>{eff.profile.location}</div>}
              {eff.profile.summary && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={BUILDER_SECTION_TITLES.summary}><p>{eff.profile.summary}</p></PreviewSection>}
              {state.experience.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={BUILDER_SECTION_TITLES.experience}>{state.experience.map((e) => (
                <div key={e.uiId} style={{ marginBottom: previewEntryGap }}>
                  <div className="flex justify-between gap-2"><span className="font-semibold">{e.title}{e.company && ` — ${e.company}`}</span><span className="text-xs text-stone-500">{e.date}</span></div>
                  <ul className="ml-4 list-disc">{e.bullets.filter((b) => b.trim()).map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              ))}</PreviewSection>}
              {eff.skills.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={BUILDER_SECTION_TITLES.skills}><p>{eff.skills.join('  •  ')}</p></PreviewSection>}
              {state.projects.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={BUILDER_SECTION_TITLES.projects}><ul className="ml-4 list-disc">{state.projects.map((p) => <li key={p.uiId}><span className="font-semibold">{p.name}</span>{p.description && ` — ${p.description}`}</li>)}</ul></PreviewSection>}
              {state.education.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={BUILDER_SECTION_TITLES.education}>{state.education.map((e, i) => <div key={e.uiId} className="flex justify-between gap-2" style={{ marginBottom: i === state.education.length - 1 ? 0 : previewEntryGap }}><span><span className="font-semibold">{e.degree || e.school}</span>{e.degree && e.school && ` — ${e.school}`}</span><span className="text-xs text-stone-500">{e.date}</span></div>)}</PreviewSection>}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-stone-400">Live preview · the exported PDF is single-column Helvetica, ATS-clean</p>
        </div>
      </div>
    </div>
  )
}

function PreviewSection({ title, accent, gap, modern, children }: { title: string; accent: string; gap: number; modern?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: gap }}>
      <div className="font-bold uppercase" style={{ color: modern ? '#1a1a1a' : accent, fontSize: '1em', letterSpacing: modern ? '0.1em' : '0.04em' }}>{title}</div>
      <div className="mb-2 mt-1" style={modern ? undefined : { borderBottom: '1px solid #d6d3d1' }} />
      {children}
    </div>
  )
}
