import type { Status } from '../lib/analyze'
import { TONE } from './tone'

export function ScoreRing({ score, tone }: { score: number; tone: Status }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center">
      <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90" role="img" aria-label={`Score ${score} out of 100`}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="currentColor" strokeWidth="11" className="text-stone-200" />
        <circle cx="66" cy="66" r={r} fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className={TONE[tone].ring} style={{ transition: 'stroke-dashoffset 700ms ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-semibold tabular-nums text-stone-900">{score}</div>
        <div className="text-xs font-medium tracking-wide text-stone-400">/ 100</div>
      </div>
    </div>
  )
}
