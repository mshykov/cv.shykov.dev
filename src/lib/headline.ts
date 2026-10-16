// Splits the H1 into a lead part and the phrase the page highlights. Every
// language writes the headline as two clauses ("Free CV ATS score checker. Private
// by default." / "Vérificateur de CV ATS gratuit : votre score, …"), so the cut is
// the last sentence break or colon. No break, no highlight.
export function splitHeadline(h1: string): { lead: string; mark: string } {
  const breaks = [...h1.matchAll(/[.:]\s+/g)]
  const last = breaks.at(-1)
  if (last?.index === undefined || last.index + last[0].length >= h1.length) return { lead: h1, mark: '' }
  const cut = last.index + last[0].length
  return { lead: h1.slice(0, cut).trimEnd(), mark: h1.slice(cut) }
}
