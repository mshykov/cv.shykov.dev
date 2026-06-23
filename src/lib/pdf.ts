// Browser-side PDF text extraction with Mozilla's pdf.js.
// Nothing leaves the page: the file is read into memory, parsed, and discarded.
// Legacy build: Babel + core-js transpiled for older browsers. Crucially, its
// *worker* self-polyfills modern APIs (e.g. Promise.withResolvers, which Safari
// only added in 17.4) — the standard build's worker only calls them and throws
// on older iOS Safari/Chrome (both WebKit). The main-thread polyfill can't
// reach the worker's separate global, so we need the legacy worker here.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export interface TextPiece {
  text: string
  x: number // left edge, PDF points from bottom-left origin
  y: number // baseline
  w: number
  bold: boolean
  page: number
}

export interface Extracted {
  /** All pieces in reading order, page by page. */
  pieces: TextPiece[]
  /** Reconstructed visual lines (pieces grouped by page + y). */
  lines: string[]
  /** Whole document as plain text. */
  text: string
  numPages: number
  charCount: number
  /** Which extractor produced this (affects which checks are meaningful). */
  source: 'pdf' | 'docx'
}

function isBold(fontFamily: string | undefined): boolean {
  if (!fontFamily) return false
  return /bold|black|heavy|semibold|800|700/i.test(fontFamily)
}

export async function extractPdf(file: File): Promise<Extracted> {
  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  const doc = await task.promise
  const pieces: TextPiece[] = []

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p)
      const content = await page.getTextContent()
      const styles = content.styles as Record<string, { fontFamily?: string }>
      for (const item of content.items) {
        // TextItem has str/transform/width; TextMarkedContent does not.
        if (!('str' in item)) continue
        const str = item.str
        if (!str) continue
        const tr = item.transform // [a,b,c,d,e,f]; e=x, f=y
        pieces.push({
          text: str,
          x: tr[4],
          y: tr[5],
          w: item.width ?? 0,
          bold: isBold(styles?.[item.fontName]?.fontFamily),
          page: p,
        })
      }
    }
  } finally {
    await task.destroy()
  }

  // Group pieces into visual lines: same page, baseline within ~3pt.
  const lines: string[] = []
  let cur: TextPiece[] = []
  const flush = () => {
    if (!cur.length) return
    cur.sort((a, b) => a.x - b.x)
    const s = cur
      .map((p) => p.text)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
    if (s) lines.push(s)
    cur = []
  }
  for (const piece of pieces) {
    if (!cur.length) {
      cur.push(piece)
      continue
    }
    const last = cur[cur.length - 1]
    const sameLine = piece.page === last.page && Math.abs(piece.y - last.y) <= 3
    if (sameLine) cur.push(piece)
    else {
      flush()
      cur.push(piece)
    }
  }
  flush()

  const text = lines.join('\n')
  return {
    pieces,
    lines,
    text,
    numPages: doc.numPages,
    charCount: text.replace(/\s/g, '').length,
    source: 'pdf',
  }
}
