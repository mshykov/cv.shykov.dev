import type { Status } from '../lib/analyze'
import { TONE } from './tone'

const GLYPH: Record<Status, string> = {
  pass: 'M4.5 10.5l3.5 3.5 7.5-8',
  warn: 'M10 5v6.5M10 14.5v.5',
  fail: 'M5.5 5.5l9 9M14.5 5.5l-9 9',
}

type StatusMarkProps = Readonly<{ status: Status; className?: string }>

/** A 20px square with a glyph. Decorative: the label next to it says the same in words. */
export function StatusMark({ status, className = '' }: StatusMarkProps) {
  return (
    <span className={`inline-grid h-5 w-5 shrink-0 place-items-center ${TONE[status].mark} ${className}`} aria-hidden>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
        <path d={GLYPH[status]} />
      </svg>
    </span>
  )
}
