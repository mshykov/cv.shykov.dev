// Build a downloadable Markdown report from the analysis. Generated and saved
// entirely in the browser (Blob + object URL); nothing is sent anywhere.
import type { Report } from './analyze'
import type { Resume } from './parse'
import type { JDMatch } from './jdmatch'
import type { Messages } from '../i18n/messages/en.ts'

const MARK: Record<string, string> = { pass: '✅', warn: '⚠️', fail: '❌' }

function checkLine(m: Messages['report'], c: Report['checks'][number]): string {
  const fix = c.fix ? `  \n  _${m.fix}_ ${c.fix}` : ''
  return `- ${MARK[c.status]} **${c.label}** (${c.points}/${c.max}) — ${c.detail}${fix}`
}

function categorySection(m: Messages, report: Report, cat: Report['checks'][number]['category']): string[] {
  const items = report.checks.filter((c) => c.category === cat)
  const pts = items.reduce((s, c) => s + c.points, 0)
  const max = items.reduce((s, c) => s + c.max, 0)
  return [`## ${m.analysis.categories[cat]} — ${pts}/${max}`, '', ...items.map((c) => checkLine(m.report, c)), '']
}

function categorySections(m: Messages, report: Report): string[] {
  const cats = [...new Set(report.checks.map((c) => c.category))]
  return cats.flatMap((cat) => categorySection(m, report, cat))
}

function jdSection(m: Messages['report'], jd?: JDMatch): string[] {
  if (!jd) return []

  const missing = jd.missing.length
    ? [`**${m.jdMissing}**`, '', jd.missing.map((k) => `\`${k.term}\``).join(', '), '']
    : []

  return [
    `## ${m.jdTitle(jd.coverage)}`,
    '',
    m.jdMatched(jd.matched.length, jd.total),
    '',
    ...missing,
  ]
}

function profileSection(m: Messages['report'], resume: Resume): string[] {
  const p = resume.profile
  return [
    `## ${m.profileTitle}`,
    '',
    `- **${m.fields.name}:** ${p.name || '—'}`,
    `- **${m.fields.email}:** ${p.email || '—'}`,
    `- **${m.fields.phone}:** ${p.phone || '—'}`,
    `- **${m.fields.location}:** ${p.location || '—'}`,
    `- **${m.fields.links}:** ${p.links.join(', ') || '—'}`,
    `- **${m.experienceEntries}:** ${resume.experience.length}`,
    `- **${m.educationEntries}:** ${resume.education.length}`,
    `- **${m.skillsParsed}:** ${resume.skills.length}`,
    '',
  ]
}

export function toMarkdown(fileName: string, report: Report, resume: Resume, m: Messages, jd?: JDMatch): string {
  const fmt = m.analysis.formatNumber
  return [
    `# ${m.report.title(fileName)}`,
    '',
    `**${m.report.score(report.score, report.band.label)}**`,
    '',
    m.report.stats(String(report.meta.numPages || '—'), fmt(report.meta.words), fmt(report.meta.charCount)),
    '',
    ...categorySections(m, report),
    ...jdSection(m.report, jd),
    ...profileSection(m.report, resume),
    '---',
    `_${m.report.footer}_`,
  ].join('\n')
}
