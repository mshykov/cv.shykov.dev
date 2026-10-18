/** The favicon, inline: an ink square, a neon square, an ink check. Decorative: the wordmark beside it names the site. */
export function LogoMark({ className = 'size-6' }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" fill="#0a0a0a" />
      <rect x="12" y="12" width="40" height="40" fill="#ccff00" />
      <path d="M22 33l8 8 14-16" fill="none" stroke="#0a0a0a" strokeWidth="6" strokeLinecap="square" />
    </svg>
  )
}
