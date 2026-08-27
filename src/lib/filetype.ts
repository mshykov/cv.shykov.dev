// Which extractor a dropped file belongs to.
//
// Deliberately dependency-free. Analyzer.tsx needs this decision before it
// loads anything, and extract.ts statically imports pdf.ts -> pdfjs-dist, so
// importing the check from there would pull the whole PDF engine into the
// initial bundle and undo the lazy loading the app shell depends on. Keeping it
// here lets both callers share one rule instead of restating it, and makes the
// rule reachable from a unit test: extract.ts itself cannot be imported in Node
// at all, because pdfjs-dist touches DOMMatrix at module scope.

export type DocumentKind = 'pdf' | 'docx'

/** Structural, not `File`, so tests do not need a DOM. */
export interface FileLike {
  name: string
  type: string
}

export function documentKind(file: FileLike): DocumentKind | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) return 'docx'
  return null
}

export function isSupportedDocument(file: FileLike): boolean {
  return documentKind(file) !== null
}
