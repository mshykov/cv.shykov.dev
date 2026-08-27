import { test } from 'node:test'
import assert from 'node:assert/strict'
import { documentKind, isSupportedDocument } from './filetype.ts'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

test('routes by extension', () => {
  assert.equal(documentKind({ name: 'cv.pdf', type: '' }), 'pdf')
  assert.equal(documentKind({ name: 'cv.docx', type: '' }), 'docx')
})

test('extension matching ignores case', () => {
  assert.equal(documentKind({ name: 'CV.PDF', type: '' }), 'pdf')
  assert.equal(documentKind({ name: 'CV.DocX', type: '' }), 'docx')
})

test('routes by MIME type when the name carries no extension', () => {
  assert.equal(documentKind({ name: 'resume', type: 'application/pdf' }), 'pdf')
  assert.equal(documentKind({ name: 'resume', type: DOCX_MIME }), 'docx')
})

test('rejects everything else', () => {
  for (const file of [
    { name: 'cv.txt', type: 'text/plain' },
    { name: 'cv.doc', type: 'application/msword' },
    { name: 'cv.pages', type: '' },
    { name: 'photo.png', type: 'image/png' },
    { name: '', type: '' },
  ]) {
    assert.equal(documentKind(file), null, `${file.name || '(no name)'} should not route`)
    assert.equal(isSupportedDocument(file), false)
  }
})

// A ".pdf" in the middle of the name is not the extension.
test('only a trailing extension counts', () => {
  assert.equal(documentKind({ name: 'cv.pdf.exe', type: '' }), null)
  assert.equal(documentKind({ name: 'my.docx.zip', type: '' }), null)
})

// Analyzer.tsx gates the upload on this and extract.ts routes on it. They used
// to restate the rule separately; a file the gate accepted and the router did
// not would have surfaced as "Unsupported file type" after the spinner.
test('the accept gate and the router agree on every case', () => {
  for (const file of [
    { name: 'cv.pdf', type: '' },
    { name: 'cv.docx', type: '' },
    { name: 'resume', type: 'application/pdf' },
    { name: 'resume', type: DOCX_MIME },
    { name: 'cv.txt', type: 'text/plain' },
  ]) {
    assert.equal(isSupportedDocument(file), documentKind(file) !== null)
  }
})
