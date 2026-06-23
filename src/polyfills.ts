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
