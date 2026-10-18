// Score changes between two files in the same browser session. Kept in memory
// only: nothing is stored, and a reload starts fresh.

import type { Report } from './analyze.ts'

export interface Snapshot {
  score: number
  /** Points earned per category. */
  categories: Record<string, number>
}

export interface Delta {
  /** Score before, for display next to the change. */
  previous: number
  change: number
  categories: Record<string, number>
}

export function snapshotOf(report: Report): Snapshot {
  const categories: Record<string, number> = {}
  for (const check of report.checks) categories[check.category] = (categories[check.category] ?? 0) + check.points
  return { score: report.score, categories }
}

export function deltaBetween(previous: Snapshot, next: Snapshot): Delta {
  const categories: Record<string, number> = {}
  for (const key of Object.keys(next.categories)) categories[key] = next.categories[key] - (previous.categories[key] ?? 0)
  return { previous: previous.score, change: next.score - previous.score, categories }
}
