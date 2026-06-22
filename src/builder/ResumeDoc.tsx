// The exported PDF. Single column, Helvetica (a standard PDF font with no
// ligature shaping), real selectable text — i.e. ATS-clean by construction.
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { BuilderState, Spacing } from './model'

const LINE_GAP: Record<Spacing, number> = { compact: 1.25, standard: 1.4, relaxed: 1.6 }
const SECTION_GAP: Record<Spacing, number> = { compact: 8, standard: 11, relaxed: 15 }

function Section({ title, h2, rule, children }: { title: string; h2: Style; rule: Style; children: React.ReactNode }) {
  return (
    <View wrap={false}>
      <Text style={h2}>{title}</Text>
      <View style={rule} />
      {children}
    </View>
  )
}

export function ResumeDoc({ state }: { state: BuilderState }) {
  const { profile: p, settings: cfg } = state
  const fs = cfg.fontSize
  const lh = LINE_GAP[cfg.spacing]
  const gap = SECTION_GAP[cfg.spacing]

  const s = StyleSheet.create({
    page: { paddingVertical: 34, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: fs, color: '#1a1a1a', lineHeight: lh },
    name: { fontFamily: 'Helvetica-Bold', fontSize: fs + 9, marginBottom: 2 },
    contact: { fontSize: fs - 1.5, color: '#444', marginBottom: 1 },
    h2: { fontFamily: 'Helvetica-Bold', fontSize: fs + 1, color: cfg.accent, marginTop: gap, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
    rule: { borderBottomWidth: 0.7, borderBottomColor: '#bbb', marginBottom: 5 },
    entryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
    entryTitle: { fontFamily: 'Helvetica-Bold' },
    entryDate: { color: '#555', fontSize: fs - 1 },
    bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
    bulletDot: { width: 10, color: cfg.accent },
    bulletText: { flex: 1 },
    para: { marginBottom: 2 },
    skills: { marginBottom: 2 },
  })

  const contact = [p.email, p.phone, ...p.links].filter(Boolean).join('   •   ')

  return (
    <Document title={`${p.name || 'Resume'} — CV`} author={p.name}>
      <Page size={cfg.pageSize} style={s.page}>
        {p.name ? <Text style={s.name}>{p.name}</Text> : null}
        {contact ? <Text style={s.contact}>{contact}</Text> : null}
        {p.location ? <Text style={s.contact}>{p.location}</Text> : null}

        {p.summary ? (
          <Section title="Summary" h2={s.h2} rule={s.rule}><Text style={s.para}>{p.summary}</Text></Section>
        ) : null}

        {state.experience.length ? (
          <Section title="Experience" h2={s.h2} rule={s.rule}>
            {state.experience.map((e, i) => (
              <View key={i} style={{ marginBottom: 4 }} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{e.title}{e.company ? ` — ${e.company}` : ''}</Text>
                  <Text style={s.entryDate}>{e.date}</Text>
                </View>
                {e.bullets.filter((b) => b.trim()).map((b, j) => (
                  <View key={j} style={s.bulletRow}><Text style={s.bulletDot}>•</Text><Text style={s.bulletText}>{b}</Text></View>
                ))}
              </View>
            ))}
          </Section>
        ) : null}

        {state.skills.length ? (
          <Section title="Skills" h2={s.h2} rule={s.rule}><Text style={s.skills}>{state.skills.join('  •  ')}</Text></Section>
        ) : null}

        {state.projects.length ? (
          <Section title="Projects" h2={s.h2} rule={s.rule}>
            {state.projects.map((pr, i) => (
              <View key={i} style={s.bulletRow}><Text style={s.bulletDot}>•</Text><Text style={s.bulletText}><Text style={s.entryTitle}>{pr.name}</Text>{pr.description ? ` — ${pr.description}` : ''}</Text></View>
            ))}
          </Section>
        ) : null}

        {state.education.length ? (
          <Section title="Education" h2={s.h2} rule={s.rule}>
            {state.education.map((ed, i) => (
              <View key={i} style={s.entryRow}>
                <Text><Text style={s.entryTitle}>{ed.degree || ed.school}</Text>{ed.degree && ed.school ? ` — ${ed.school}` : ''}</Text>
                <Text style={s.entryDate}>{ed.date}</Text>
              </View>
            ))}
          </Section>
        ) : null}
      </Page>
    </Document>
  )
}
