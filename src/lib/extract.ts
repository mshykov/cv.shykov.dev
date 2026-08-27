// File-type router for document extraction. Both paths run entirely in the
// browser; nothing is uploaded.
import { extractPdf, type Extracted } from './pdf.ts'
import { documentKind } from './filetype.ts'

export type { Extracted }

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024

async function extractDocx(file: File): Promise<Extracted> {
  const mammoth = await import('mammoth/mammoth.browser')
  const arrayBuffer = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  const lines = value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const text = lines.join('\n')
  return {
    pieces: [], // DOCX has no positional/bold data
    lines,
    text,
    numPages: 0, // unknown for DOCX
    charCount: text.replace(/\s/g, '').length,
    source: 'docx',
  }
}

export async function extractDocument(file: File): Promise<Extracted> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error('This file is too large for in-browser analysis. Please use a PDF or DOCX under 20 MB.')
  }

  const kind = documentKind(file)
  if (kind === 'pdf') return extractPdf(file)
  if (kind === 'docx') return extractDocx(file)
  throw new Error('Unsupported file type. Please upload a PDF or DOCX.')
}
