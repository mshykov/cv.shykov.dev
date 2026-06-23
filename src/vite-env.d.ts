/// <reference types="vite/client" />

// Imported only for its side effect (registers globalThis.pdfjsWorker so pd f.js
// runs on the main thread). No types needed.
declare module 'pdfjs-dist/build/pdf.worker.min.mjs'

// mammoth ships a browser bundle without bundled type declarations.
declare module 'mammoth/mammoth.browser' {
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer
  }): Promise<{ value: string; messages: unknown[] }>
}
