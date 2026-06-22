import type { Status } from '../lib/analyze'

// Shared status → Tailwind class mapping, used by the analyzer and the builder.
export const TONE: Record<Status, { dot: string; ring: string; chip: string; text: string }> = {
  pass: { dot: 'bg-emerald-500', ring: 'text-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'text-emerald-600' },
  warn: { dot: 'bg-amber-500', ring: 'text-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'text-amber-600' },
  fail: { dot: 'bg-rose-500', ring: 'text-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200', text: 'text-rose-600' },
}
