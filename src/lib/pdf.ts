// Browser-side PDF text extraction with Mozilla's pdf.js.
// Nothing leaves the page: the file is read into memory, parsed, and discarded.
// Standard build (NOT legacy — legacy's core-js transpilation throws on modern
// Safari) run on the MAIN THREAD, no Web Worker. iOS Safari was terminating the
// module worker; running in-process avoids that entirely. Importing the worker
// module registers `globalThis.pdfjsWorker`, so pd f.js uses its in-process
// "fake worker" instead of spawning one. We use a *dynamic* import (a
// side-effect import could be tree-shaken) and leave workerSrc unset.
// (src/polyfills.ts patches Promise.withResolvers on the main thread, covering
// the worker code now that it runs there — for the rare pre-17.4 Safari.)
import * as pdfjs from 'pdfjs-dist'

let workerReady: Promise<unknown> | null = null
function ensureMainThreadWorker(): Promise<unknown> {
  return (workerReady ??= import('pdfjs-dist/build/pdf.worker.min.mjs'))
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

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
  /** PDF hyperlink targets. These may not be visible to ATS-style text parsers. */
  linkTargets?: string[]
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
  await ensureMainThreadWorker()
  const task = pdfjs.getDocument({ data })
  const doc = await task.promise
  const pieces: TextPiece[] = []
  const linkTargets = new Set<string>()

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
      const annotations = await page.getAnnotations()
      for (const annotation of annotations) {
        const a = annotation as { url?: string; unsafeUrl?: string }
        const url = a.url || a.unsafeUrl
        if (url) linkTargets.add(url)
      }
      await yieldToBrowser()
    }
  } finally {
    await task.destroy()
  }

  // Group pieces into visual lines: same page, baseline within ~3pt.
  pieces.sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
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
    linkTargets: [...linkTargets],
    numPages: doc.numPages,
    charCount: text.replace(/\s/g, '').length,
    source: 'pdf',
  }
}
