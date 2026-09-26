// Prose primitives for the guide pages. Split out from articles.tsx because a
// module may not export both components and data without tripping
// react-refresh/only-export-components.
import type { ReactNode } from 'react'

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold tracking-tight text-stone-900">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-7 text-stone-700">{children}</p>
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2 text-[15px] leading-7 text-stone-700">{children}</ul>
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
      <span>{children}</span>
    </li>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-[15px] leading-7 text-stone-700">
      {children}
    </div>
  )
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-800">{children}</a>
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 text-base font-semibold text-stone-900">{children}</h3>
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-stone-700 marker:font-semibold marker:text-indigo-600">{children}</ol>
}

/** A verbatim block — extracted text, a file listing — where line breaks carry meaning. */
export function Pre({ label, children }: { label: string; children: string }) {
  return (
    <figure className="mt-4">
      <figcaption className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</figcaption>
      <pre className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white p-4 text-[13px] leading-6 text-stone-800">{children}</pre>
    </figure>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px] text-stone-800">{children}</code>
}

/** Two or more columns of plain data. Rows are keyed by their first cell, which must be unique. */
export function Table({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-[14px] leading-6 text-stone-700">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-2.5">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((cells) => (
            <tr key={String(cells[0])}>
              {cells.map((cell, i) => <td key={head[i]} className="px-4 py-2.5 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
