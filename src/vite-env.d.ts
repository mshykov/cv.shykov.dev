/// <reference types="vite/client" />

// mammoth ships a browser bundle without bundled type declarations.
declare module 'mammoth/mammoth.browser' {
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer
  }): Promise<{ value: string; messages: unknown[] }>
}
