// Promise.withResolvers polyfill. pdf.js v6 calls it; Safari only shipped it in
// 17.4, so on older iOS Safari it's undefined and PDF parsing throws
// "undefined is not a function". Imported first in main.tsx, before anything
// that could pull in pdf.js.
export function withResolvers<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const P = Promise as unknown as { withResolvers?: typeof withResolvers }
if (typeof P.withResolvers !== 'function') {
  P.withResolvers = withResolvers
}

// Async iteration of ReadableStream (`for await (const x of stream)`). Safari
// (incl. v26) doesn't implement it — a long-standing WebKit gap. pdf.js v6's
// getTextContent does `for await (const chunk of this.streamTextContent(...))`,
// so on Safari `stream[Symbol.asyncIterator]` is undefined → "undefined is not
// a function". pd f.js runs on the main thread here, so patching the main-thread
// prototype covers it. Verified: this is THE cause of the iOS analyze failure.
type AsyncIterableProto = { [Symbol.asyncIterator]?: () => AsyncIterator<unknown> }
if (typeof ReadableStream !== 'undefined') {
  const proto = ReadableStream.prototype as unknown as AsyncIterableProto
  if (typeof proto[Symbol.asyncIterator] !== 'function') {
    proto[Symbol.asyncIterator] = function (this: ReadableStream): AsyncIterator<unknown> {
      const reader = this.getReader()
      return {
        next: () => reader.read() as Promise<IteratorResult<unknown>>,
        return: () => {
          reader.releaseLock()
          return Promise.resolve({ done: true, value: undefined })
        },
      }
    }
  }
}
