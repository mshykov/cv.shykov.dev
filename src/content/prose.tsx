// Prose primitives for the guide pages. Split out from articles.tsx because a
// module may not export both components and data without tripping
// react-refresh/only-export-components.
import type { ReactNode } from 'react'

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-12 border-t-2 border-ink pt-4 text-2xl font-bold tracking-tight">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[17px] leading-8 text-ink-2">{children}</p>
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2 text-[17px] leading-8 text-ink-2">{children}</ul>
}

export function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-3 size-2 shrink-0 bg-neon outline outline-1 outline-ink" />
      <span>{children}</span>
    </li>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 border-l-4 border-neon bg-panel p-4 text-[17px] leading-8 text-ink">
      {children}
    </div>
  )
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="font-semibold text-ink underline decoration-neon decoration-[3px] underline-offset-4 hover:bg-neon">{children}</a>
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-bold">{children}</h3>
}

export function Ol({ children }: { children: ReactNode }) {
  return <ol className="mt-4 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-ink-2 marker:font-mono marker:font-semibold marker:text-ink">{children}</ol>
}

/** A verbatim block — extracted text, a file listing — where line breaks carry meaning. */
export function Pre({ label, children }: { label: string; children: string }) {
  return (
    <figure className="mt-4">
      <figcaption className="lab">{label}</figcaption>
      <pre className="mt-2 overflow-x-auto border border-rule-2 bg-panel p-4 font-mono text-[13px] leading-6 text-ink">{children}</pre>
    </figure>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="bg-panel px-1 py-0.5 font-mono text-[0.85em] text-ink">{children}</code>
}

/** Two or more columns of plain data. Rows are keyed by their first cell, which must be unique. */
export function Table({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-[15px] leading-6 text-ink-2">
        <caption className="sr-only">{caption}</caption>
        <thead className="lab border-b-2 border-ink">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-3 py-2.5">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {rows.map((cells) => (
            <tr key={String(cells[0])}>
              {cells.map((cell, i) => <td key={head[i]} className="px-3 py-3 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
