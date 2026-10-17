import { useCallback, useMemo, useRef, useState } from 'react'
import { analyze } from '../lib/analyze'
import { downloadBlob } from '../lib/download'
import { TONE } from '../components/tone'
import { sampleState, synthExtracted, type BuilderState, type Spacing, type Template } from './model'
import { useMessages } from '../i18n/context.ts'
import type { ExperienceEntry, EducationEntry, ProjectEntry } from '../lib/parse'

const parseList = (t: string) => t.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
const ACCENT_PRESETS = ['#4f46e5', '#0f766e', '#c2410c', '#be123c', '#111827'] as const
const PREVIEW_LINE_HEIGHT: Record<Spacing, number> = { compact: 1.35, standard: 1.5, relaxed: 1.7 }
const PREVIEW_SECTION_GAP: Record<Spacing, number> = { compact: 10, standard: 15, relaxed: 21 }
const PREVIEW_ENTRY_GAP: Record<Spacing, number> = { compact: 5, standard: 8, relaxed: 12 }

type WithUiId<T> = T & { uiId: string }
type BuilderUiState = Omit<BuilderState, 'experience' | 'education' | 'projects'> & {
  experience: WithUiId<ExperienceEntry>[]
  education: WithUiId<EducationEntry>[]
  projects: WithUiId<ProjectEntry>[]
}
type FieldProps = Readonly<{ label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string; type?: string; autoComplete?: string }>
type SectionTitleProps = Readonly<{ title: string; action?: React.ReactNode }>
type IconButtonProps = Readonly<{ label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }>
type AddButtonProps = Readonly<{ onClick: () => void; children: React.ReactNode }>
type SettingGroupProps = Readonly<{ label: string; children: React.ReactNode }>
type OptionButtonProps<T extends string | number> = Readonly<{ value: T; selected: boolean; onSelect: (value: T) => void; children: React.ReactNode }>
type PreviewSectionProps = Readonly<{ title: string; accent: string; gap: number; modern?: boolean; children: React.ReactNode }>

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

function Field({ label, value, onChange, area, placeholder, type = 'text', autoComplete }: FieldProps) {
  const cls = area ? 'field mt-1.5 resize-y' : 'field-line mt-1'
  return (
    <label className="block">
      <span className="text-sm text-ink-2">{label}</span>
      {area
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={cls} />
        : <input type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </label>
  )
}

function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <legend className="float-left mb-5 w-full">
      <span className="flex items-center justify-between gap-3">
        <span className="text-xl font-semibold tracking-[-0.02em]">{title}</span>
        {action}
      </span>
    </legend>
  )
}

function IconButton({ label, onClick, disabled, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-11 place-items-center border border-rule-2 text-base font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-rule-2 disabled:hover:bg-transparent disabled:hover:text-ink"
    >
      {children}
    </button>
  )
}

function AddButton({ onClick, children }: AddButtonProps) {
  return (
    <button type="button" onClick={onClick} className="btn-sm">
      + {children}
    </button>
  )
}

function SettingGroup({ label, children }: SettingGroupProps) {
  return (
    <div className="min-w-0">
      <div className="lab mb-2">{label}</div>
      {children}
    </div>
  )
}

function OptionButton<T extends string | number>({ value, selected, onSelect, children }: OptionButtonProps<T>) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`min-h-11 px-3 text-sm font-semibold transition-colors ${selected ? 'bg-ink text-paper' : 'border border-rule-2 hover:border-ink'}`}
    >
      {children}
    </button>
  )
}

export default function Builder() {
  const m = useMessages()
  const b = m.builder
  const sample = useMemo(() => sampleState(b.sample), [b.sample])
  const [state, setState] = useState<BuilderUiState>(() => withUiIds(sample))
  const [skillsText, setSkillsText] = useState(sample.skills.join(', '))
  const [linksText, setLinksText] = useState(sample.profile.links.join(', '))
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

  const score = useMemo(() => analyze(synthExtracted(eff, b.docSections), m.analysis), [eff, b.docSections, m.analysis])
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
  const moveExp = (i: number, d: number) => setState((s) => {
    const a = [...s.experience]
    const t = a[i + d]
    if (!t) return s

    a[i + d] = a[i]
    a[i] = t
    return { ...s, experience: a }
  })
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
      const blob = await pdf(<ResumeDoc state={eff} titles={b.docSections} docTitle={b.docTitle(eff.profile.name)} />).toBlob()
      downloadBlob(b.fileName(eff.profile.name), blob)
    } catch (e) {
      setNote(e instanceof Error ? e.message : b.exportFailed)
    } finally { setBusy(false) }
  }, [eff, b])

  const importCv = useCallback(async (file: File) => {
    setBusy(true); setNote('')
    try {
      const [{ extractDocument }, { parseResume }] = await Promise.all([import('../lib/extract'), import('../lib/parse')])
      const r = parseResume(await extractDocument(file))
      setState((s) => withUiIds({ ...r, settings: s.settings }))
      setSkillsText(r.skills.join(', ')); setLinksText(r.profile.links.join(', '))
      setNote(b.imported(r.experience.length, file.name))
    } catch (e) {
      setNote(e instanceof Error ? e.message : b.importFailed)
    } finally { setBusy(false) }
  }, [b])

  return (
    <div>
      <h1 className="max-w-[12em] text-balance text-[clamp(2.25rem,8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">{b.heading}</h1>

      {/* toolbar */}
      <div className="sticky top-0 z-10 mb-10 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule bg-paper py-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 min-w-12 place-items-center px-2 text-2xl font-semibold tabular-nums ${TONE[score.band.tone].block}`}>{score.score}</div>
          <div>
            <div className="lab">{b.liveScore}</div>
            <div className="text-sm font-semibold">{score.band.label}</div>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" onClick={() => importRef.current?.click()} className="alt">{b.importCv}</button>
          <button type="button" onClick={exportPdf} disabled={busy} className="btn !min-h-12 disabled:cursor-not-allowed disabled:opacity-40">{busy ? b.working : b.exportPdf}</button>
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
      {note && <output className="mb-4 block border-l-4 border-neon bg-panel px-3 py-2 text-sm">{note}</output>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,0.95fr)]">
        {/* FORM */}
        <div className="space-y-5">
          <fieldset className="border-t border-rule pt-5">
            <SectionTitle title={b.profile.title} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={b.profile.fullName} value={state.profile.name} onChange={(v) => setProfile('name', v)} />
              <Field label={b.profile.email} value={state.profile.email} onChange={(v) => setProfile('email', v)} type="email" autoComplete="email" />
              <Field label={b.profile.phone} value={state.profile.phone} onChange={(v) => setProfile('phone', v)} type="tel" autoComplete="tel" />
              <Field label={b.profile.location} value={state.profile.location} onChange={(v) => setProfile('location', v)} autoComplete="address-level2" />
            </div>
            <div className="mt-3"><Field label={b.profile.links} value={linksText} onChange={setLinksText} placeholder={b.profile.linksPlaceholder} /></div>
            <div className="mt-3"><Field label={b.profile.summary} value={state.profile.summary} onChange={(v) => setProfile('summary', v)} area /></div>
          </fieldset>

          <fieldset className="border-t border-rule pt-5">
            <SectionTitle title={b.experience.title} action={<AddButton onClick={addExp}>{b.experience.add}</AddButton>} />
            <div className="space-y-4">
              {state.experience.map((e, i) => (
                <div key={e.uiId} className="clear-both border-t border-rule pt-4">
                  <div className="mb-3 flex items-center justify-end gap-2">
                    <IconButton label={b.experience.moveUp} onClick={() => moveExp(i, -1)} disabled={i === 0}>↑</IconButton>
                    <IconButton label={b.experience.moveDown} onClick={() => moveExp(i, 1)} disabled={i === state.experience.length - 1}>↓</IconButton>
                    <IconButton label={b.experience.delete} onClick={() => delExp(i)}>×</IconButton>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={b.experience.jobTitle} value={e.title} onChange={(v) => setExp(i, { title: v })} />
                    <Field label={b.experience.company} value={e.company} onChange={(v) => setExp(i, { company: v })} />
                  </div>
                  <div className="mt-3"><Field label={b.experience.dates} value={e.date} onChange={(v) => setExp(i, { date: v })} placeholder={b.experience.datesPlaceholder} /></div>
                  <div className="mt-3"><Field label={b.experience.bullets} value={e.bullets.join('\n')} onChange={(v) => setExp(i, { bullets: v.split('\n') })} area placeholder={b.experience.bulletsPlaceholder} /></div>
                </div>
              ))}
              {!state.experience.length && <p className="text-sm text-mute">{b.experience.empty}</p>}
            </div>
          </fieldset>

          <fieldset className="border-t border-rule pt-5">
            <SectionTitle title={b.skills.title} />
            <Field label={b.skills.field} value={skillsText} onChange={setSkillsText} area />
          </fieldset>

          <fieldset className="border-t border-rule pt-5">
            <SectionTitle title={b.projects.title} action={<AddButton onClick={addProj}>{b.projects.add}</AddButton>} />
            <div className="space-y-3">
              {state.projects.map((p, i) => (
                <div key={p.uiId} className="clear-both border-t border-rule pt-4">
                  <div className="mb-2 flex justify-end"><IconButton label={b.projects.delete} onClick={() => delProj(i)}>×</IconButton></div>
                  <Field label={b.projects.name} value={p.name} onChange={(v) => setProj(i, { name: v })} />
                  <div className="mt-2"><Field label={b.projects.description} value={p.description} onChange={(v) => setProj(i, { description: v })} /></div>
                </div>
              ))}
              {!state.projects.length && <p className="text-sm text-mute">{b.projects.empty}</p>}
            </div>
          </fieldset>

          <fieldset className="border-t border-rule pt-5">
            <SectionTitle title={b.education.title} action={<AddButton onClick={addEdu}>{b.education.add}</AddButton>} />
            <div className="space-y-3">
              {state.education.map((e, i) => (
                <div key={e.uiId} className="clear-both border-t border-rule pt-4">
                  <div className="mb-2 flex justify-end"><IconButton label={b.education.delete} onClick={() => delEdu(i)}>×</IconButton></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={b.education.degree} value={e.degree} onChange={(v) => setEdu(i, { degree: v })} />
                    <Field label={b.education.school} value={e.school} onChange={(v) => setEdu(i, { school: v })} />
                  </div>
                  <div className="mt-2"><Field label={b.education.dates} value={e.date} onChange={(v) => setEdu(i, { date: v })} /></div>
                </div>
              ))}
              {!state.education.length && <p className="text-sm text-mute">{b.education.empty}</p>}
            </div>
          </fieldset>
        </div>

        {/* LIVE PREVIEW */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="bg-panel p-4">
            <div
              className="relative mx-auto overflow-hidden border border-rule-2 bg-page text-page-ink"
              style={{ aspectRatio: state.settings.pageSize === 'LETTER' ? '8.5 / 11' : '210 / 297', fontSize: previewFontSize, lineHeight: PREVIEW_LINE_HEIGHT[state.settings.spacing] }}
            >
              {/* Inset box clips content at the page margin, so the bottom gap matches top and sides. */}
              <div className="absolute inset-8 overflow-hidden">
              {eff.profile.name && <div className="font-bold" style={{ fontSize: previewNameSize, color: eff.settings.template === 'modern' ? eff.settings.accent : undefined }}>{eff.profile.name}</div>}
              <div className="text-page-mute" style={{ fontSize: previewContactSize }}>{[eff.profile.email, eff.profile.phone, ...eff.profile.links].filter(Boolean).join('  •  ')}</div>
              {eff.profile.location && <div className="text-page-mute" style={{ fontSize: previewContactSize }}>{eff.profile.location}</div>}
              {eff.profile.summary && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={b.docSections.summary}><p>{eff.profile.summary}</p></PreviewSection>}
              {state.experience.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={b.docSections.experience}>{state.experience.map((e) => (
                <div key={e.uiId} style={{ marginBottom: previewEntryGap }}>
                  <div className="flex justify-between gap-2"><span className="font-semibold">{e.title}{e.company && ` — ${e.company}`}</span><span className="text-xs text-page-mute">{e.date}</span></div>
                  <ul className="ml-4 list-disc">{e.bullets.filter((b) => b.trim()).map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              ))}</PreviewSection>}
              {eff.skills.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={b.docSections.skills}><p>{eff.skills.join('  •  ')}</p></PreviewSection>}
              {state.projects.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={b.docSections.projects}><ul className="ml-4 list-disc">{state.projects.map((p) => <li key={p.uiId}><span className="font-semibold">{p.name}</span>{p.description && ` — ${p.description}`}</li>)}</ul></PreviewSection>}
              {state.education.length > 0 && <PreviewSection accent={eff.settings.accent} gap={previewSectionGap} modern={eff.settings.template === 'modern'} title={b.docSections.education}>{state.education.map((e, i) => <div key={e.uiId} className="flex justify-between gap-2" style={{ marginBottom: i === state.education.length - 1 ? 0 : previewEntryGap }}><span><span className="font-semibold">{e.degree || e.school}</span>{e.degree && e.school && ` — ${e.school}`}</span><span className="text-xs text-page-mute">{e.date}</span></div>)}</PreviewSection>}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-2">{b.previewNote}</p>
          <details className="group mt-6 border-b border-rule">
            <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {b.settings.title}
              <span className="flex items-center gap-4">
                <span className="lab">{b.settings.pagePreview(state.settings.pageSize === 'A4' ? 'A4' : b.settings.letter)}</span>
                <span aria-hidden className="font-mono text-xl text-ink-2 group-open:hidden">+</span>
                <span aria-hidden className="hidden font-mono text-xl text-ink-2 group-open:inline">−</span>
              </span>
            </summary>
            <div className="grid gap-x-5 gap-y-4 text-sm sm:grid-cols-2 2xl:grid-cols-3">
              <SettingGroup label={b.settings.accent}>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={b.settings.useAccent(color)}
                      onClick={() => setCfg('accent', color)}
                      className={`size-8 outline outline-offset-2 transition-[outline-color] ${state.settings.accent.toLowerCase() === color ? 'outline-2 outline-ink' : 'outline-1 outline-rule-2 hover:outline-ink'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => accentRef.current?.click()}
                    className="grid size-8 place-items-center border border-rule-2 text-sm font-semibold transition-colors hover:border-ink"
                    title={b.settings.customAccent}
                    aria-label={b.settings.customAccent}
                  >
                    +
                  </button>
                  <input ref={accentRef} type="color" value={state.settings.accent} onChange={(e) => setCfg('accent', e.target.value)} className="sr-only" />
                </div>
              </SettingGroup>

              <SettingGroup label={b.settings.size}>
                <div className="grid grid-cols-4 gap-1.5">
                  {[9, 10, 11, 12].map((n) => <OptionButton key={n} value={n} selected={state.settings.fontSize === n} onSelect={(value) => setCfg('fontSize', value)}>{n}pt</OptionButton>)}
                </div>
              </SettingGroup>

              <SettingGroup label={b.settings.spacing}>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['compact', 'standard', 'relaxed'] as Spacing[]).map((n) => (
                    <OptionButton key={n} value={n} selected={state.settings.spacing === n} onSelect={(value) => setCfg('spacing', value)}>
                      {b.settings.spacingOptions[n]}
                    </OptionButton>
                  ))}
                </div>
              </SettingGroup>

              <SettingGroup label={b.settings.page}>
                <div className="grid grid-cols-2 gap-1.5">
                  <OptionButton value="A4" selected={state.settings.pageSize === 'A4'} onSelect={(value) => setCfg('pageSize', value)}>A4</OptionButton>
                  <OptionButton value="LETTER" selected={state.settings.pageSize === 'LETTER'} onSelect={(value) => setCfg('pageSize', value)}>{b.settings.letter}</OptionButton>
                </div>
              </SettingGroup>

              <SettingGroup label={b.settings.template}>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['classic', 'modern'] as Template[]).map((n) => (
                    <OptionButton key={n} value={n} selected={state.settings.template === n} onSelect={(value) => setCfg('template', value)}>
                      {b.settings.templates[n]}
                    </OptionButton>
                  ))}
                </div>
              </SettingGroup>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

function PreviewSection({ title, accent, gap, modern, children }: PreviewSectionProps) {
  return (
    <div style={{ marginTop: gap }}>
      <div className="font-bold uppercase" style={{ color: modern ? '#1a1a1a' : accent, fontSize: '1em', letterSpacing: modern ? '0.1em' : '0.04em' }}>{title}</div>
      <div className="mb-2 mt-1" style={modern ? undefined : { borderBottom: '1px solid #d6d3d1' }} />
      {children}
    </div>
  )
}
