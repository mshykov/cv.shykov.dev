import type { Status } from '../lib/analyze'
import { useMessages } from '../i18n/context.ts'

type ScoreRingProps = Readonly<{ score: number; tone: Status; className?: string }>

// Still called ScoreRing for the callers; it is type now: the number, and a thin bar
// that fills to the score (neon when the band is good).
export function ScoreRing({ score, tone, className = '' }: ScoreRingProps) {
  const { scoreRing } = useMessages()
  return (
    <div role="img" aria-label={scoreRing(score)} className={className}>
      <div aria-hidden className="flex items-end gap-2">
        <span className="text-[clamp(9rem,36vw,15rem)] font-semibold leading-[0.78] tracking-[-0.08em] tabular-nums">{score}</span>
        <span className="pb-[0.3em] text-2xl font-medium text-ink-2">/100</span>
      </div>
      <div aria-hidden className="mt-5 h-2 bg-rule">
        <div className={`h-full ${tone === 'pass' ? 'bg-neon outline outline-1 outline-ink' : 'bg-ink'}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
