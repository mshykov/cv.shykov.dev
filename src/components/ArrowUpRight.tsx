/** External-link arrow, drawn: the web font has no glyph for it. */
export function ArrowUpRight({ className = 'h-3.5 w-3.5' }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  )
}
