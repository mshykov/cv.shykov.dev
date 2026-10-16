import type { Status } from '../lib/analyze'
import { TONE } from './tone'
import { useMessages } from '../i18n/context.ts'

type ScoreRingProps = Readonly<{ score: number; tone: Status; compact?: boolean; className?: string }>

// Still called ScoreRing for the callers; it is a block now. The fill says the band
// (neon good, outlined middling, ink low) and the number says the score.
export function ScoreRing({ score, tone, compact = false, className = '' }: ScoreRingProps) {
  const { scoreRing } = useMessages()
  return (
    <div role="img" aria-label={scoreRing(score)} className={`flex items-end gap-1.5 px-5 pb-5 pt-6 ${TONE[tone].block} ${className}`}>
      <span aria-hidden className={`font-bold leading-[0.78] tracking-[-0.07em] tabular-nums ${compact ? 'text-[4.5rem]' : 'text-[clamp(6rem,26vw,9rem)]'}`}>{score}</span>
      <span aria-hidden className="pb-1 font-mono text-lg font-medium">/100</span>
    </div>
  )
}
