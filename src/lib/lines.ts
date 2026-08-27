// Reconstructing visual lines from positioned PDF text pieces.
//
// Kept out of pdf.ts on purpose: this is pure geometry over plain objects, but
// pdf.ts imports pdfjs-dist at module scope and only runs in a browser, so
// anything living there is unreachable from a unit test.

export interface TextPiece {
  text: string
  x: number // left edge, PDF points from bottom-left origin
  y: number // baseline
  w: number
  bold: boolean
  page: number
}

/** Baselines within this many points belong to the same visual line. */
const BASELINE_TOLERANCE = 3

/**
 * Total spread a single line's baselines may cover.
 *
 * The per-piece tolerance alone compares each piece with the previous one, so
 * a run of small steps chains without limit: baselines at 100, 97.5, 95, 92.5
 * are each within 3pt of their predecessor and collapse into one line 7.5pt
 * tall. Bounding the spread against the line's first baseline stops the drift
 * while still allowing the genuine within-line variation that superscripts and
 * mixed font sizes produce.
 */
const LINE_SPREAD_LIMIT = 6

function sameLine(piece: TextPiece, previous: TextPiece, anchor: TextPiece): boolean {
  if (piece.page !== previous.page) return false
  if (Math.abs(piece.y - previous.y) > BASELINE_TOLERANCE) return false
  return Math.abs(piece.y - anchor.y) <= LINE_SPREAD_LIMIT
}

function joinLine(pieces: TextPiece[]): string {
  return [...pieces]
    .sort((a, b) => a.x - b.x)
    .map((p) => p.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Group pieces into visual lines, in reading order: page, then top to bottom. */
export function groupIntoLines(pieces: TextPiece[]): string[] {
  const ordered = [...pieces].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const lines: string[] = []
  let current: TextPiece[] = []

  const flush = () => {
    if (!current.length) return
    const text = joinLine(current)
    if (text) lines.push(text)
    current = []
  }

  for (const piece of ordered) {
    const previous = current.at(-1)
    const anchor = current[0]
    if (previous && anchor && !sameLine(piece, previous, anchor)) flush()
    current.push(piece)
  }
  flush()

  return lines
}
