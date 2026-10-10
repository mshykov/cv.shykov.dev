// Shapes shared by every locale's guides. The locale-specific files
// (src/content/<locale>/guides.ts, articles.tsx) fill them in.
import type { ReactNode } from 'react'

/** The six guides. The id is stable across languages; the slug is per language. */
export const GUIDE_IDS = [
  'what-is-an-ats-score',
  'ats-checker-without-upload',
  'pdf-or-docx-for-ats',
  'how-ats-parsing-works',
  'ats-resume-checklist',
  'how-to-check-your-cv-score',
] as const

export type GuideId = (typeof GUIDE_IDS)[number]

// Guide metadata: id, slug, title, description. Data only and deliberately tiny -
// the homepage imports it for its guide list, while the article bodies are
// needed only by the build-time prerender and must stay out of the homepage bundle.
export interface Guide {
  id: GuideId
  /** URL segment, in this language: /<locale>/<slug> (English: /<slug>). */
  slug: string
  /** <title> and the page h1. */
  title: string
  /** <meta name="description">, and the standfirst under the h1. */
  description: string
}

export interface Article extends Guide {
  /** First publication; Article JSON-LD `datePublished`. */
  published: string
  /** Last substantive content change; `dateModified` and the sitemap lastmod. */
  updated: string
  /** Two or three plain sentences that answer the title outright. */
  summary: string
  body: ReactNode
  /** Plain-text answers: they are also emitted verbatim as FAQPage JSON-LD. */
  faq: { q: string; a: string }[]
}
