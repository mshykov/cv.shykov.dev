// Build a downloadable Markdown report from the analysis. Generated and saved
// entirely in the browser (Blob + object URL); nothing is sent anywhere.
import type { Report } from './analyze'
import type { Resume } from './parse'
import type { JDMatch } from './jdmatch'

const MARK: Record<string, string> = { pass: '✅', warn: '⚠️', fail: '❌' }

function checkLine(c: Report['checks'][number]): string {
  const fix = c.fix ? `  \n  _Fix:_ ${c.fix}` : ''
  return `- ${MARK[c.status]} **${c.label}** (${c.points}/${c.max}) — ${c.detail}${fix}`
}

function categorySection(report: Report, cat: string): string[] {
  const items = report.checks.filter((c) => c.category === cat)
  const pts = items.reduce((s, c) => s + c.points, 0)
  const max = items.reduce((s, c) => s + c.max, 0)
  return [`## ${cat} — ${pts}/${max}`, '', ...items.map(checkLine), '']
}

function categorySections(report: Report): string[] {
  const cats = [...new Set(report.checks.map((c) => c.category))]
  return cats.flatMap((cat) => categorySection(report, cat))
}

function jdSection(jd?: JDMatch): string[] {
  if (!jd) return []

  const missing = jd.missing.length
    ? ['**Missing keywords (consider adding if true):**', '', jd.missing.map((k) => `\`${k.term}\``).join(', '), '']
    : []

  return [
    `## Job-description match — ${jd.coverage}% coverage`,
    '',
    `Matched ${jd.matched.length}/${jd.total} emphasized keywords.`,
    '',
    ...missing,
  ]
}

function profileSection(resume: Resume): string[] {
  const p = resume.profile
  return [
    '## Extracted profile',
    '',
    `- **Name:** ${p.name || '—'}`,
    `- **Email:** ${p.email || '—'}`,
    `- **Phone:** ${p.phone || '—'}`,
    `- **Location:** ${p.location || '—'}`,
    `- **Links:** ${p.links.join(', ') || '—'}`,
    `- **Experience entries parsed:** ${resume.experience.length}`,
    `- **Education entries parsed:** ${resume.education.length}`,
    `- **Skills parsed:** ${resume.skills.length}`,
    '',
  ]
}

export function toMarkdown(fileName: string, report: Report, resume: Resume, jd?: JDMatch): string {
  return [
    `# CV ATS Report — ${fileName}`,
    '',
    `**Score: ${report.score}/100 — ${report.band.label}**`,
    '',
    `${report.meta.numPages || '—'} pages · ${report.meta.words.toLocaleString()} words · ${report.meta.charCount.toLocaleString()} readable characters`,
    '',
    ...categorySections(report),
    ...jdSection(jd),
    ...profileSection(resume),
    '---',
    '_Generated locally by cv.shykov.dev — heuristic guidance, not a guarantee._',
  ].join('\n')
}
