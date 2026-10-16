# Design — cv.shykov.dev

Decided 2026-10-16 (owner pick: variant D1 after three rejected directions). One
sentence: **black ink on warm paper, one neon, hairlines, one grotesk — a calm page
where the privacy claim is the only loud object.** This file records what the look is
and why, so the next change does not drift back to the default SaaS template.

## Why it changed

The old site read as AI-generated: indigo/violet accent and a stock sans, a pill badge
above the H1, a floating mock "score card" beside the hero, a row of three equal step
cards, a row of grey chips ("Runs in your browser", "No uploads", …), `rounded-2xl`
and soft shadows everywhere. At ~1024 px the H1 also ran behind the mock card
("Private by def…"). All of it is on the "never list" of the `design-taste` skill.

## Rules

- **Tokens only.** `src/index.css` `@theme` turns the default Tailwind palette, radii and
  shadows off (`--color-*: initial`, `--radius-*: initial`, `--shadow-*: initial`). A
  colour, corner or shadow that is not a token below generates no CSS. Add a token here
  first, then use it.
- **One neon** (`neon`, `#ccff00`), used as a *fill behind ink*, never as text: the
  `0` privacy block, the score block, the highlighted last clause of the H1, lost points,
  missing keywords, "warn" marks. It means "look here". Everything else is ink on paper.
- **Hairlines, not cards.** Sections are rows between 1 px rules (`border-rule`) with a 2 px
  ink rule on top; no card inside a card, no shadows, no radius (except `rounded-full`,
  which is not used). Buttons and inputs are square.
- **Status without hue.** `StatusMark` + `TONE`: pass = outlined ink square with a check,
  warn = neon square with `!`, fail = solid ink square with a cross. Glyphs differ, so it
  survives greyscale. There is no red/amber/green anywhere; errors use a fail mark and a 2 px
  ink border.
- **One primary button per view** (`.btn`: ink fill, neon on hover). Secondary actions are
  `.btn-sm` (outlined) or `.alt` (underlined text).
- **Privacy is a designed object**, not chips: the `0` block + four rows
  (`messages.home.hero.privacy`). The wording follows [TONE.md](../TONE.md): "sent to a
  server", never "100% local". If a feature changes what leaves the browser, change that
  block in the same PR.
- **Motion: almost none.** Highlighter sweep behind the H1 clause (CSS, 0.8 s, once),
  `.rise` on the score block, colour transitions of 150 ms. All of it is off under
  `prefers-reduced-motion` (`index.css`). The hero text does **not** animate in: an
  entrance animation delays the LCP.

## Tokens

| Token | Value | Use |
|---|---|---|
| `paper` | `#f4f4ef` | page |
| `panel` | `#eaeae3` | inset: code, examples, builder preview ground |
| `ink` | `#0a0a0a` | text, primary button, 2 px rules (17.9:1 on paper) |
| `ink-2` | `#4d4d47` | body copy, labels (7.7:1) |
| `mute` | `#6a6a63` | placeholders, empty-state text (4.9:1 on paper, 4.5:1 on panel) |
| `rule` / `rule-2` | ink at 16% / 50% | hairlines / field and button borders (3.6:1, WCAG 1.4.11) |
| `neon` / `on-neon` | `#ccff00` / `#0a0a0a` | the one accent (16.9:1) |
| `page`, `page-ink`, `page-mute` | white, `#1c1c1a`, `#6a6a63` | the Build preview only: it draws a sheet of paper |

The CV accent presets in `Builder.tsx` and `model.ts` are the user's own choice for the
exported PDF, not site colours; they stay.

## Type

One family: **Schibsted Grotesk** (SIL OFL 1.1, variable), self-hosted. No serif (owner,
2026-10-16). Display is 700 with tracking -0.045em and line-height ≈ 1.04; body 17–20 px;
labels (`.lab`) are the system mono (`ui-monospace`) in small caps-like uppercase, so there is
no second font to download.

- Files: `src/fonts/schibsted-grotesk-latin-wght-normal.woff2` (35 KB) and the
  `-latin-ext-` file (21 KB, downloaded only when an accent outside Latin-1 appears).
  Licence next to them.
- The latin file is a subset: `U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153,
  U+2013-2014, U+2018-201E, U+2022, U+2026, U+20AC, U+2122, U+2190-2193, U+2212`, limited to
  wght 400–700 (fonttools `varLib.instancer wght=400:700`, then `pyftsubset
  --layout-features=kern,liga,calt,ccmp,locl,mark,mkmk,tnum,case`). Re-cut it from
  Fontsource's `@fontsource-variable/schibsted-grotesk` if the range ever has to grow.
  Latin-1 covers fr/de/es/pt diacritics (checked on all six homepages).
- **LCP:** `index.html` preloads the latin file, and `Schibsted Fallback` (Arial with
  `size-adjust: 103%`) keeps the swap from changing the layout. Without the preload the
  second paint of the lead paragraph (after the font arrived) was a *larger* LCP candidate
  and moved LCP from ~0.9 s to ~2.2 s on the throttled profile. Guides get the same
  preload from `scripts/prerender.mjs`.
- Glyphs the font lacks (`↗`, `✓`) are drawn as SVG (`ArrowUpRight`, `StatusMark`).

## Layout

Hero: 7.4 / 4 columns. Left: H1, lead, one primary button + one text link. Right: the privacy
readout. Below: the dropzone as a hairline box, the three steps as a numbered list, the
trust notes, FAQ and guides as 4 / 8 two-column sections with a 2 px rule on top. The report
is a sticky score column (4) beside fixes and the rubric (8). The header is a plain
bar: logo, mode tabs, GitHub, language; on phones the tabs drop to a second row.

## Icons

`public/favicon.svg`, `favicon.ico`, `logo.png`: neon square with an ink check on ink.
The social cards (`public/og-image.png`, `public/og/*.png`) still show the previous
indigo look: they are already shared and cached by networks, so they are redrawn on the
owner's say-so (`npm run og-images -- --en`), not as a side effect of a redesign.

## Checks before a design PR

1. `npm run lint && npm test && npm run build && npm run smoke:build && npm run test:e2e`.
2. Six locales at 390 px: no horizontal overflow (the long H1s of fr/es/de step down a size).
3. Screenshots at 390 / 768 / 1024 / 1440, then `taste-design-review`; fix P0/P1.
4. Bundle and LCP against the numbers in the PR (`vite preview`, 4× CPU, 1.6 Mbit/s).
5. Tab through: focus is a 3 px ink outline everywhere (`:focus-visible` in `index.css`).
