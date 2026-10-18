# Design — cv.shykov.dev

Decided 2026-10-17 (owner pick: variant E, "the sentence", after four rejected
directions). One sentence: **a page that is one headline, one thing to do, and three
plain facts — black on paper, one neon, one grotesk — and everything else is
folded away.** This file records what the look is and why, so the next change does not
drift back to the default SaaS template or grow the page again.

## Why it changed (twice)

1. The old site read as AI-generated: indigo/violet accent and a stock sans, a pill badge
   above the H1, a floating mock "score card", a row of three step cards, a row of grey
   chips, `rounded-2xl` and soft shadows. At ~1024 px the H1 also ran behind the card.
2. The first redesigns (editorial serif, dark terminal, an inspection sheet, then a
   black-and-neon "calm" version) were still **heavy**: the owner's verdict was that the
   problem is *the amount of text and things*, not the palette. The product does one thing.
   A visitor needs to know three facts: it is **free**, nothing is **uploaded**, and there is
   **no AI**. So the page was cut to that.

## What the page contains

| Where | What | Notes |
|---|---|---|
| First screen | wordmark, the three pages, GitHub, language | one header on every page |
| | H1, set huge | the sentence is the design (`messages.home.hero.h1`, unchanged: it carries the local search terms) |
| | "Runs in your browser" set large, then "No account · No AI · No upload to server" with a neon square before each | the privacy claim, said plainly (a struck-through version was tried and dropped: it had to be decoded) |
| | **the upload field**: dashed, rounded box (full width, one row on a laptop), upload icon, "Drop a PDF or DOCX here" underlined in neon (filled on hover/drag), solid "Choose file" button | looks like every upload field on purpose; no explanatory line. The whole hero accepts a dropped file |
| After a CV is dropped | score (huge), band, file name · pages · words | the report scrolls into view |
| | top 3 fixes, "↓ Report", "Analyze another CV" | |
| | **closed** disclosure "Full report and details" | all checks, writing style, job match, extracted data live here |
| Below the fold | FAQ (questions only, closed), guide titles | answers and guide descriptions stay in the HTML for crawlers |
| Footer | one quiet block | disclaimer, source, siblings, languages |

Removed from the page: the lead paragraph, the three steps, the "privacy claims you can
inspect" section (the same claims are the strike-through line and the FAQ), the chips, the
GitHub button in the header, the humanization card next to the score. If something wants back
in, it goes below the fold or into a closed disclosure, never above the drop line.

## Pages and navigation

Four kinds of page, one header (`SiteHeader`: wordmark, **Fast ATS Score · CV builder · Guides**,
GitHub, language) and one footer (`SiteFooter`):

| URL (en / es) | Page | Built how |
|---|---|---|
| `/` · `/es/` | score checker | `App` (mode `analyze`), prerendered |
| `/build` · `/es/build` | CV builder | `App` (mode `build`), prerendered, same bundle |
| `/guides` · `/es/guides` | guide index | `GuidesPage`, static, no JavaScript |
| `/<slug>` | a guide | `ArticlePage`, static, no JavaScript |

Every page change is a **real navigation** (plain `<a href>`), so the browser's Back button
works and each page has its own title, canonical, hreflang and sitemap entry (`scripts/prerender.mjs`,
`buildHead`/`guidesHead` in `src/i18n/head.ts`). The score report is not carried to another page.
On phones the three links drop to a second row under the wordmark.

Every page starts the same distance below the header: `--first-gap` (`index.css`) is the space that
centres the score page's first screen (about 37 rem tall) in the window, never less than 4.5 rem,
and the build, guides and article pages use the same value from 1024 px up.

## The Build view

Same language, smaller scale: an H1 ("ATS-clean CV builder", `messages.builder.heading`), one
toolbar row (live score block, "Import CV" as underlined text, solid "Export PDF"), the form on
the left as titled sections between hairlines with line-style inputs (`.field-line`; textareas
stay boxed), the live preview on the right. The section hints and the intro paragraph are gone;
document settings (accent, size, spacing, page, template) are a closed disclosure under the
preview. The exported PDF template (`ResumeDoc`) is unchanged.

## First screen on a laptop

One window, no scrolling, from 1280×680 up: **the hero** (the headline, with an *example* report
beside it, drawn in type: 90/100, a bar, three fixes; labels come from the scorer's messages, the
numbers are an example and the card says so) and, below it, **two blocks**: the privacy message
("Runs in your browser" + three facts) on the left, the upload field (a rounded dashed card) on
the right. Below 1024 px the example is hidden and everything stacks: headline, message, field.
The headline is capped by the window height as well as its width (`headlineSize`, `min(vw, vh)`).
Check 1440×800 and 1280×680 before changing spacing. Headlines have no full stops: the two
clauses are two lines (`\n` in the message, `white-space: pre-line`).

## Rules

- **Tokens only.** `src/index.css` `@theme` turns the default Tailwind palette, radii and
  shadows off (`--color-*: initial`, `--radius-*: initial`, `--shadow-*: initial`). A colour,
  corner or shadow that is not a token below generates no CSS. Add a token here first.
- **One neon** (`neon`, `#ccff00`), used as a *fill behind ink*, never as text: the facts' bullets, lost points ("−10"), "warn" marks, missing keywords, the bar under a good score.
  It means "look here". Everything else is ink on paper.
- **Hairlines, not cards.** Rows between 1 px rules (`border-rule`), a 2 px ink rule above
  a list. No card inside a card, no shadows. Square corners everywhere except **one**: the
  upload field (`--radius-field`, 1.25 rem), because it has to read as a drop target.
- **Status without hue.** `StatusMark` + `TONE`: pass = outlined ink square with a check, warn =
  neon square with `!`, fail = solid ink square with a cross. No red/amber/green.
- **One primary action.** The upload field. Secondary actions are underlined text (`.alt`) or
  outlined `.btn-sm`. `.btn` (solid ink) is left for the Build view and the 404 page.
- **Motion: almost none.** The upload field fills neon on drag/focus, colour transitions of
  150 ms; off under `prefers-reduced-motion`. The hero text does not animate in: it is the LCP element.
- **The privacy claim follows [TONE.md](../TONE.md):** "Runs in your browser" and "No upload to server", "No AI" (accurate: no model of any kind). If a feature changes what leaves
  the browser, change `messages.home.hero.runs` / `facts` in the same PR.

## Tokens

| Token | Value | Use |
|---|---|---|
| `paper` | `#f4f4ef` | page |
| `panel` | `#eaeae3` | inset: code, examples, builder preview ground |
| `ink` | `#0a0a0a` | text, primary button, 2 px rules (17.9:1 on paper) |
| `ink-2` | `#4d4d47` | body copy, labels (7.7:1) |
| `mute` | `#6a6a63` | placeholders, loading text (4.9:1 on paper, 4.5:1 on panel) |
| `rule` / `rule-2` | ink at 16% / 50% | hairlines / field and button borders (3.6:1, WCAG 1.4.11) |
| `neon` / `on-neon` | `#ccff00` / `#0a0a0a` | the one accent (16.9:1) |
| `page`, `page-ink`, `page-mute` | white, `#1c1c1a`, `#6a6a63` | the Build preview only: it draws a sheet of paper |

The CV accent presets in `Builder.tsx` and `model.ts` are the user's own choice for the
exported PDF, not site colours; they stay.

## Type

One family: **Schibsted Grotesk** (SIL OFL 1.1, variable), self-hosted. No serif (owner,
2026-10-16). Display is 600 with tracking -0.055em and line-height 0.92; the H1 steps down in
size with its length (`headlineSize` in `App.tsx`) so the long French/Spanish/German
headlines still fit. Labels (`.lab`) are the system mono, so there is no second font to download.

- Files: `src/fonts/schibsted-grotesk-latin-wght-normal.woff2` (35 KB) and the `-latin-ext-`
  file (21 KB, downloaded only when an accent outside Latin-1 appears). Licence next to them.
- The latin file is a subset: `U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153, U+2013-2014,
  U+2018-201E, U+2022, U+2026, U+20AC, U+2122, U+2190-2193, U+2212`, limited to wght 400–700
  (fonttools `varLib.instancer wght=400:700`, then `pyftsubset
  --layout-features=kern,liga,calt,ccmp,locl,mark,mkmk,tnum,case`). Re-cut it from Fontsource's
  `@fontsource-variable/schibsted-grotesk` if the range ever has to grow. Latin-1 covers the
  fr/de/es/pt diacritics.
- Cyrillic (the Ukrainian pages): Schibsted Grotesk has none, so `Onest Cyrillic` (11 KB, wght 400-700, OFL) comes after it in `--font-sans` and is downloaded only for Cyrillic text.
- **LCP:** `index.html` preloads the latin file, and `Schibsted Fallback` (Arial with
  `size-adjust: 103%`) keeps the swap from changing the layout. Without the preload the second
  paint of the lead text (after the font arrived) was a *larger* LCP candidate. Guides get the
  same preload from `scripts/prerender.mjs`.
- Glyphs the font lacks (`↗`, `✓`) are drawn as SVG (`ArrowUpRight`, `StatusMark`).

## Structure of the code

`App.tsx` owns the first screen (`Hero`), the file input and the drag-and-drop, so the upload
field is in the prerendered HTML (the `<input>` itself is rendered on the client only, because
React replaces the prerendered DOM and a file set on the old input would be lost) and works before any other code has loaded. `Analyzer.tsx` is
loaded on the first file (or on hover/focus of the drop line) and is remounted per file
(`key={job.id}`): a slow earlier run can never write over a newer one. `Builder` is loaded
when the Build view opens, as before. The FAQ questions are `<h2>` inside `<summary>`
(`smoke:build` checks that every marked-up question is visible text).

## Icons

`public/favicon.svg`, `favicon.ico`, `logo.png`: neon square with an ink check on ink; the same mark is
the inline logo in the header (`LogoMark`).

The social cards (`public/og-image.png` for English, `public/og/<code>.png`) are drawn by
`npm run og-images` (needs Google Chrome), from `messages.og` and the self-hosted fonts: the
headline (no full stops), a supporting line, three plain facts and one neon block with an example
score. Redraw them whenever the headline or the look changes. A network caches a card per URL, so a
link that was already shared keeps its old picture until its debugger (LinkedIn Post Inspector,
Facebook Sharing Debugger) re-scrapes it.

## Checks before a design PR

1. `npm run lint && npm test && npm run build && npm run smoke:build && npm run test:e2e`.
2. Six locales at 360 and 390 px: no horizontal overflow (every built page).
3. Screenshots at 390 / 768 / 1024 / 1440, then `taste-design-review`; fix P0/P1.
4. Bundle and LCP against the numbers in the PR (`vite preview`, 4× CPU, 1.6 Mbit/s).
5. Tab through: focus is a 3 px ink outline everywhere (`:focus-visible` in `index.css`).
