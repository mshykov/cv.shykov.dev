// Build a downloadable Markdown report from the analysis. Generated and saved
// entirely in the browser (Blob + object URL); nothing is sent anywhere.
import type { Report } from './analyze'
import type { Resume } from './parse'
import type { JDMatch } from './jdmatch'

const MARK: Record<string, string> = { pass: '✅', warn: '⚠️', fail: '❌' }

export function toMarkdown(fileName: string, report: Report, resume: Resume, jd?: JDMatch): string {
  const L: string[] = []
  L.push(`# CV ATS Report — ${fileName}`, '')
  L.push(`**Score: ${report.score}/100 — ${report.band.label}**`, '')
  L.push(`${report.meta.numPages || '—'} pages · ${report.meta.words.toLocaleString()} words · ${report.meta.charCount.toLocaleString()} readable characters`, '')

  const cats = [...new Set(report.checks.map((c) => c.category))]
  for (const cat of cats) {
    const items = report.checks.filter((c) => c.category === cat)
    const pts = items.reduce((s, c) => s + c.points, 0)
    const max = items.reduce((s, c) => s + c.max, 0)
    L.push(`## ${cat} — ${pts}/${max}`, '')
    for (const c of items) {
      L.push(`- ${MARK[c.status]} **${c.label}** (${c.points}/${c.max}) — ${c.detail}${c.fix ? `  \n  _Fix:_ ${c.fix}` : ''}`)
    }
    L.push('')
  }

  if (jd) {
    L.push(`## Job-description match — ${jd.coverage}% coverage`, '')
    L.push(`Matched ${jd.matched.length}/${jd.total} emphasized keywords.`, '')
    if (jd.missing.length) {
      L.push('**Missing keywords (consider adding if true):**', '', jd.missing.map((k) => `\`${k.term}\``).join(', '), '')
    }
  }

  L.push('## Extracted profile', '')
  const p = resume.profile
  L.push(`- **Name:** ${p.name || '—'}`)
  L.push(`- **Email:** ${p.email || '—'}`)
  L.push(`- **Phone:** ${p.phone || '—'}`)
  L.push(`- **Location:** ${p.location || '—'}`)
  L.push(`- **Links:** ${p.links.join(', ') || '—'}`)
  L.push(`- **Experience entries parsed:** ${resume.experience.length}`)
  L.push(`- **Education entries parsed:** ${resume.education.length}`)
  L.push(`- **Skills parsed:** ${resume.skills.length}`, '')

  L.push('---', '_Generated locally by cv.shykov.dev — heuristic guidance, not a guarantee._')
  return L.join('\n')
}
