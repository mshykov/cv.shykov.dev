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
