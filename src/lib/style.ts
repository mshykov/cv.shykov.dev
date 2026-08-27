// Writing-style analysis — deterministic stylometrics, run entirely in the
// browser on the extracted CV text. No model, no network, no LLM.
//
// This is deliberately NOT an "AI detector". Detection needs a language model
// to estimate perplexity, and published detectors are unreliable — notably
// biased against writers whose first language is not English, who get flagged
// far more often than native speakers. Shipping a verdict like that would be
// dishonest guidance dressed up as a signal.
//
// What this does instead is flag concrete, fixable writing patterns: monotone
// sentence rhythm, repeated openers, filler phrases, claims without numbers,
// passive voice, punctuation tics. Every signal names what to change. The
// patterns overlap with what detectors key on, so tightening them tends to help
// there too — but the advice stands on its own merit.
//
// Kept separate from analyze.ts on purpose: the ATS score is a fixed 100-point
// rubric (25/15/35/15/10) documented in the README, and style findings must not
// silently move it.

import { hasDate } from './text.ts'

export type StyleLevel = 'ok' | 'minor' | 'major'

export interface StyleSignal {
  id: string
  label: string
  level: StyleLevel
  /** What was measured, in plain language. */
  detail: string
  /** Concrete action. Absent when the signal is clean. */
  fix?: string
  /** Offending snippets, for the UI to show as examples. */
  examples?: string[]
}

export interface StyleReport {
  signals: StyleSignal[]
  /** 0–100. Higher is better. Advisory only — not part of the ATS score. */
  score: number
  band: { label: string; tone: StyleLevel }
  meta: { sentences: number; words: number }
}

/** Phrases that read as filler on a CV: they occupy space without evidence. */
const FILLER_PHRASES = [
  'results-driven', 'results driven', 'proven track record', 'track record of success',
  'detail-oriented', 'detail oriented', 'self-starter', 'self starter',
  'team player', 'go-getter', 'think outside the box', 'hit the ground running',
  'wear many hats', 'synergy', 'synergies', 'value-add', 'value add',
  'best-in-class', 'best in class', 'world-class', 'world class',
  'cutting-edge', 'cutting edge', 'state-of-the-art', 'state of the art',
  'passionate about', 'dynamic professional', 'seasoned professional',
  'delve into', 'delve', 'tapestry', 'testament to', 'navigating the complexities',
  'in today’s fast-paced', 'in today’s ever-evolving', 'ever-evolving',
  'it is worth noting', 'it’s worth noting', 'furthermore', 'moreover',
  'leverage synergies', 'spearheaded', 'utilize', 'utilized', 'utilizing',
]

/** Vague intensifiers that weaken a claim instead of quantifying it. */
const VAGUE_QUANTIFIERS = [
  'significantly', 'substantially', 'dramatically', 'drastically', 'considerably',
  'greatly', 'various', 'numerous', 'several', 'many', 'multiple',
]

const PASSIVE_RE = /\b(?:was|were|is|are|been|being|be)\s+(?:\w+ly\s+)?\w+(?:ed|en)\b/gi
const NUMBER_RE = /\d/

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'’-]*/g) ?? []
}

function countOccurrences(haystack: string, needle: string): number {
  // Word-boundary-ish match that tolerates hyphens and apostrophes in the term.
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
  const re = new RegExp(`(?:^|[^a-z])${escaped}(?![a-z])`, 'gi')
  return (haystack.match(re) ?? []).length
}

function pct(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100)
}

/** Standard deviation of sentence word-counts — "burstiness". */
function sentenceLengthVariation(sents: string[]): { mean: number; stdev: number } {
  const lengths = sents.map((s) => wordsOf(s).length).filter((n) => n > 0)
  if (lengths.length < 2) return { mean: lengths[0] ?? 0, stdev: 0 }
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((sum, n) => sum + (n - mean) ** 2, 0) / lengths.length
  return { mean, stdev: Math.sqrt(variance) }
}

function checkRhythm(sents: string[]): StyleSignal {
  const { mean, stdev } = sentenceLengthVariation(sents)
  // Coefficient of variation, not raw stdev. CV bullets are short by nature, and
  // an absolute threshold punishes them for it: ±2.4 words around a 7-word mean
  // is well varied, but would fail any fixed cutoff tuned for prose. Dividing by
  // the mean makes the measure scale-independent.
  const cv = mean > 0 ? stdev / mean : 0
  const detail = `Average sentence ${Math.round(mean)} words, variation ±${stdev.toFixed(1)} (${Math.round(cv * 100)}%).`

  if (sents.length < 4 || mean < 5) {
    return { id: 'rhythm', label: 'Sentence rhythm', level: 'ok', detail: 'Too little prose to judge rhythm.' }
  }
  if (cv < 0.15) {
    return {
      id: 'rhythm', label: 'Sentence rhythm', level: 'major', detail,
      fix: 'Sentences are nearly all the same length, which reads flat. Break one or two into short, blunt statements.',
    }
  }
  if (cv < 0.28) {
    return {
      id: 'rhythm', label: 'Sentence rhythm', level: 'minor', detail,
      fix: 'Vary length a little more. A couple of short sentences among longer ones adds momentum.',
    }
  }
  return { id: 'rhythm', label: 'Sentence rhythm', level: 'ok', detail }
}

function checkOpeners(lines: string[]): StyleSignal {
  const openers = lines
    .map((l) => wordsOf(l)[0])
    .filter((w): w is string => Boolean(w))
  const counts = new Map<string, number>()
  for (const w of openers) counts.set(w, (counts.get(w) ?? 0) + 1)

  const repeated = [...counts.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])

  if (openers.length < 4 || repeated.length === 0) {
    return { id: 'openers', label: 'Repeated openers', level: 'ok', detail: 'Line openings are varied.' }
  }

  const worst = repeated[0]
  const share = pct(worst[1], openers.length)
  const examples = repeated.slice(0, 3).map(([w, n]) => `"${w}" ×${n}`)
  const level: StyleLevel = share >= 30 || worst[1] >= 5 ? 'major' : 'minor'
  return {
    id: 'openers', label: 'Repeated openers', level,
    detail: `${worst[1]} lines start with the same word (${share}% of lines).`,
    fix: 'Vary how bullets begin. Repeating one verb makes the whole section blur together.',
    examples,
  }
}

function checkFiller(text: string): StyleSignal {
  const hits: string[] = []
  for (const phrase of FILLER_PHRASES) {
    const n = countOccurrences(text, phrase)
    if (n > 0) hits.push(n > 1 ? `${phrase} ×${n}` : phrase)
  }
  if (hits.length === 0) {
    return { id: 'filler', label: 'Filler phrases', level: 'ok', detail: 'No stock CV phrases found.' }
  }
  return {
    id: 'filler', label: 'Filler phrases', level: hits.length >= 3 ? 'major' : 'minor',
    detail: `${hits.length} stock phrase${hits.length === 1 ? '' : 's'} found.`,
    fix: 'Replace each with the specific thing you did. "Proven track record" says nothing a result would not say better.',
    examples: hits.slice(0, 6),
  }
}

function checkVagueClaims(lines: string[]): StyleSignal {
  const vague = lines.filter((line) => {
    if (NUMBER_RE.test(line)) return false
    return VAGUE_QUANTIFIERS.some((w) => countOccurrences(line, w) > 0)
  })
  if (vague.length === 0) {
    return { id: 'vague', label: 'Claims without numbers', level: 'ok', detail: 'Scale words are backed by figures.' }
  }
  return {
    id: 'vague', label: 'Claims without numbers', level: vague.length >= 3 ? 'major' : 'minor',
    detail: `${vague.length} line${vague.length === 1 ? '' : 's'} claim scale without a figure.`,
    fix: 'Swap the adverb for the number. "Significantly reduced" becomes "cut by 30%".',
    examples: vague.slice(0, 3).map((l) => l.slice(0, 90)),
  }
}

function checkPassive(sents: string[]): StyleSignal {
  const passive = sents.filter((s) => PASSIVE_RE.test(s))
  PASSIVE_RE.lastIndex = 0
  const share = pct(passive.length, sents.length)
  const detail = `${share}% of sentences look passive.`

  if (sents.length < 4) {
    return { id: 'passive', label: 'Passive voice', level: 'ok', detail: 'Too little text to judge.' }
  }
  if (share >= 30) {
    return {
      id: 'passive', label: 'Passive voice', level: 'major', detail,
      fix: 'Lead with the verb you did. "A system was implemented" hides who did it; "Implemented a system" does not.',
      examples: passive.slice(0, 3).map((s) => s.slice(0, 90)),
    }
  }
  if (share >= 18) {
    return {
      id: 'passive', label: 'Passive voice', level: 'minor', detail,
      fix: 'A few sentences hide the actor. Rewrite them to start with what you did.',
      examples: passive.slice(0, 2).map((s) => s.slice(0, 90)),
    }
  }
  return { id: 'passive', label: 'Passive voice', level: 'ok', detail }
}

function checkPunctuation(text: string, words: number): StyleSignal {
  const emDashes = (text.match(/—/g) ?? []).length
  const per100 = words === 0 ? 0 : (emDashes / words) * 100
  const detail = `${emDashes} em-dash${emDashes === 1 ? '' : 'es'} (${per100.toFixed(1)} per 100 words).`

  if (per100 >= 1.2) {
    return {
      id: 'punctuation', label: 'Punctuation tics', level: 'major', detail,
      fix: 'Heavy em-dash use is a recognisable tic. Swap most for a full stop, comma, or colon.',
    }
  }
  if (per100 >= 0.6) {
    return {
      id: 'punctuation', label: 'Punctuation tics', level: 'minor', detail,
      fix: 'Slightly em-dash heavy. A few could be full stops.',
    }
  }
  return { id: 'punctuation', label: 'Punctuation tics', level: 'ok', detail }
}

function checkVocabulary(words: string[]): StyleSignal {
  if (words.length < 80) {
    return { id: 'vocabulary', label: 'Vocabulary range', level: 'ok', detail: 'Too little text to judge.' }
  }
  // Type-token ratio over a fixed window, so longer CVs are not penalised.
  const window = words.slice(0, 400)
  const ratio = new Set(window).size / window.length
  const detail = `${Math.round(ratio * 100)}% unique words in the first ${window.length}.`

  if (ratio < 0.38) {
    return {
      id: 'vocabulary', label: 'Vocabulary range', level: 'minor', detail,
      fix: 'Wording repeats a lot. Check whether several bullets are describing the same thing.',
    }
  }
  return { id: 'vocabulary', label: 'Vocabulary range', level: 'ok', detail }
}

const WEIGHT: Record<StyleLevel, number> = { ok: 0, minor: 6, major: 14 }

function styleBand(score: number): StyleReport['band'] {
  if (score >= 85) return { label: 'Reads naturally', tone: 'ok' }
  if (score >= 65) return { label: 'A few habits to fix', tone: 'minor' }
  return { label: 'Reads formulaic', tone: 'major' }
}

export function analyzeStyle(text: string, lines: string[]): StyleReport {
  const sents = sentences(text)
  const words = wordsOf(text)
  // Prose/bullet lines only. Job-title rows ("QA Engineer — MacPaw … Jul 2019 –
  // Mar 2020") carry dates and would otherwise dominate the opener check with
  // role names, producing advice about bullets that is really about headings.
  const contentLines = lines.filter((l) => wordsOf(l).length >= 4 && !hasDate(l))

  const signals: StyleSignal[] = [
    checkRhythm(sents),
    checkOpeners(contentLines),
    checkFiller(text),
    checkVagueClaims(contentLines),
    checkPassive(sents),
    checkPunctuation(text, words.length),
    checkVocabulary(words),
  ]

  const penalty = signals.reduce((sum, s) => sum + WEIGHT[s.level], 0)
  const score = Math.max(0, 100 - penalty)

  return { signals, score, band: styleBand(score), meta: { sentences: sents.length, words: words.length } }
}
