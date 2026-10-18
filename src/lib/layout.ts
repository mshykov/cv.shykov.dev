// Layout checks from text positions (PDF only): columns, table-like grids, and
// contact details that live only in a repeated page header or footer. Pure
// geometry over TextPiece objects, so it is unit-testable without a browser.
//
// These are *risk* signals for parsers that read a page line by line, reported
// as advisories (never scored). They are conservative on purpose: a right-aligned
// date column and an indented bullet list are ordinary and must not be flagged.

import { groupIntoRows, type TextPiece } from './lines.ts'
import { hasDate } from './text.ts'
import { hasEmailAddress, hasPhoneNumber } from './contact.ts'

export interface PageBox {
  width: number
  height: number
}

export interface LayoutReport {
  /** Two text columns (a sidebar, or main text next to a side column). */
  columns: boolean
  /** Three or more aligned columns: a grid, or text laid out as a table. */
  table: boolean
  /** Email or phone appears only in a header/footer that repeats on every page. */
  headerContact: boolean
}

/** Gap, as a share of page width, that separates two text segments on one row. */
const SEGMENT_GAP = 0.04
/** Segment start positions within this many points are the same alignment. */
const ALIGN_TOLERANCE = 6
/** A column needs at least this many aligned segments on the page. */
const MIN_SEGMENTS = 6
/** Two columns must start at least this share of the page width apart. */
const MIN_COLUMN_DISTANCE = 0.2
/** Two columns count as side by side when their vertical extents overlap by at least this many points. */
const MIN_OVERLAP = 80
/** Share of the page height treated as a header (top) or footer (bottom) band. */
const BAND = 0.07

interface Segment {
  x: number
  end: number
  text: string
  y: number
}

function segmentsOf(row: TextPiece[], width: number): Segment[] {
  const gap = width * SEGMENT_GAP
  const out: Segment[] = []
  for (const piece of row) {
    const last = out.at(-1)
    if (last && piece.x - last.end < gap) {
      last.end = Math.max(last.end, piece.x + piece.w)
      last.text += piece.text
    } else {
      out.push({ x: piece.x, end: piece.x + piece.w, text: piece.text, y: piece.y })
    }
  }
  return out.map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ').trim() })).filter((s) => s.text.length > 0)
}

/** Right-aligned dates ("Jan 2020 – now") vary in start position and are not a column. */
const isDateSegment = (s: Segment) => s.text.length <= 24 && hasDate(s.text)

interface Cluster {
  x: number
  rows: Set<number>
  top: number
  bottom: number
}

function clusterStarts(rows: Segment[][]): Cluster[] {
  const clusters: Cluster[] = []
  rows.forEach((segments, rowIndex) => {
    for (const s of segments) {
      if (isDateSegment(s)) continue
      const hit = clusters.find((c) => Math.abs(c.x - s.x) <= ALIGN_TOLERANCE)
      if (hit) {
        hit.rows.add(rowIndex)
        hit.top = Math.max(hit.top, s.y)
        hit.bottom = Math.min(hit.bottom, s.y)
      } else {
        clusters.push({ x: s.x, rows: new Set([rowIndex]), top: s.y, bottom: s.y })
      }
    }
  })
  return clusters.filter((c) => c.rows.size >= MIN_SEGMENTS).sort((a, b) => a.x - b.x)
}

/** How far two columns overlap vertically, in points. Real columns are independent: their lines do not share baselines. */
function overlap(a: Cluster, b: Cluster): number {
  return Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom)
}

/** Columns that sit side by side on the same rows, far enough apart to be separate. */
function sideBySide(clusters: Cluster[], width: number): Cluster[] {
  const kept = new Set<Cluster>()
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const far = clusters[j].x - clusters[i].x >= width * MIN_COLUMN_DISTANCE
      if (far && overlap(clusters[i], clusters[j]) >= MIN_OVERLAP) {
        kept.add(clusters[i])
        kept.add(clusters[j])
      }
    }
  }
  return [...kept]
}

function pageShape(pieces: TextPiece[], page: number, width: number): { columns: boolean; table: boolean } {
  const rows = groupIntoRows(pieces.filter((p) => p.page === page)).map((row) => segmentsOf(row, width))
  const columns = sideBySide(clusterStarts(rows), width)
  return { columns: columns.length >= 2, table: columns.length >= 3 }
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase()

/** Rows in the top/bottom band whose text repeats at the same height on every page. */
function runningBandText(pieces: TextPiece[], pages: PageBox[]): string[] {
  if (pages.length < 2) return []
  const perPage = pages.map((box, i) => {
    const rows = groupIntoRows(pieces.filter((p) => p.page === i + 1))
    return rows
      .map((row) => ({ text: normalize(row.map((p) => p.text).join('')), y: row[0].y }))
      .filter((r) => r.text && (r.y > box.height * (1 - BAND) || r.y < box.height * BAND))
  })
  return perPage[0]
    .filter((r) => perPage.every((rows) => rows.some((o) => o.text === r.text && Math.abs(o.y - r.y) <= 3)))
    .map((r) => r.text)
}

function contactOnlyInRunningBand(pieces: TextPiece[], pages: PageBox[]): boolean {
  const running = runningBandText(pieces, pages)
  const bandWithContact = running.filter((t) => hasEmailAddress(t) || hasPhoneNumber(t))
  if (bandWithContact.length === 0) return false
  const body = groupIntoRows(pieces)
    .map((row) => normalize(row.map((p) => p.text).join('')))
    .filter((t) => t && !running.includes(t))
    .join('\n')
  const emailInBand = bandWithContact.some(hasEmailAddress)
  const phoneInBand = bandWithContact.some(hasPhoneNumber)
  const emailOk = !emailInBand || !hasEmailAddress(body)
  const phoneOk = !phoneInBand || !hasPhoneNumber(body)
  return emailOk && phoneOk
}

export function analyzeLayout(pieces: TextPiece[], pages: PageBox[]): LayoutReport {
  const report: LayoutReport = { columns: false, table: false, headerContact: false }
  if (pieces.length === 0 || pages.length === 0) return report
  pages.forEach((box, i) => {
    const shape = pageShape(pieces, i + 1, box.width)
    report.columns ||= shape.columns
    report.table ||= shape.table
  })
  report.headerContact = contactOnlyInRunningBand(pieces, pages)
  return report
}
