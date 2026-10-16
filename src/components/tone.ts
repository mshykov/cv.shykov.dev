import type { Status } from '../lib/analyze'

// Shared status → Tailwind class mapping, used by the analyzer and the builder.
// No hue carries the meaning (docs/design.md): pass is an outlined ink mark,
// warn is the neon fill, fail is a solid ink fill. Each one also has its own glyph
// (StatusMark), so the state survives greyscale and colour-blindness.
export const TONE: Record<Status, { mark: string; block: string; text: string }> = {
  pass: { mark: 'border border-ink bg-transparent text-ink', block: 'neon-block', text: 'text-ink' },
  warn: { mark: 'border border-ink bg-neon text-on-neon', block: 'border-2 border-ink bg-transparent text-ink', text: 'text-ink' },
  fail: { mark: 'border border-ink bg-ink text-paper', block: 'bg-ink text-paper', text: 'text-ink' },
}
