// One headline scale for every page, so the pages line up: the shorter the sentence the bigger
// it is set, but never the huge size of a one-word title. On a laptop it is also capped by the
// height of the window, so the first screen of the score page fits in view.
export function headlineSize(h1: string): string {
  const length = h1.replaceAll('\n', ' ').length
  if (length <= 56) return 'text-[clamp(2.9rem,11.2vw,7.25rem)] lg:text-[clamp(2.5rem,min(5.6vw,13vh),5.25rem)]'
  return 'text-[clamp(2.4rem,8.4vw,5.5rem)] lg:text-[clamp(2.25rem,min(4.2vw,10vh),4rem)]'
}
