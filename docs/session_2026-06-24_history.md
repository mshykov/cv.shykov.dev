# Session history — 2026-06-24

Handoff for resuming work on cv.shykov.dev in a fresh session. Pairs with
`CLAUDE.md` (constraints) and `docs/retrospective.md` (lessons).

## Current state — LIVE & working
- **Analyze** (PDF/DOCX → score + JD match + extracted data) — works on modern
  Safari (26.x), iOS, and Chromium.
- **Build** (form → live preview + live score → ATS-clean PDF export) — works;
  PDF export verified under the production CSP.
- `main` protected (PR + `build` check + linear history); CI runs lint + 16
  tests + build; Dependabot on. Deploys to https://cv.shykov.dev via Cloudflare.

## What was done this session
- **Built the toolkit** from a single ATS scorer → full parser + analyzer +
  builder (Phases 0–3): structured parser, JD match, DOCX import, report export,
  form builder with live preview/score, ATS-clean PDF export, 2 templates.
- **Tech-debt pass:** error boundary, shared UI dedup, 16 `node:test` unit tests
  wired into CI, Dependabot, code-splitting, a11y, CSP parity in `vite preview`.
- **Merged all Dependabot bumps**; set up branch protection + custom domain.
- **Fixed a long iOS-Safari outage** (the hard part) — chain of real causes:
  1. browser/SW **caching** pinned the device to old builds → `no-cache` HTML +
     immutable assets + self-destruct service worker (removed the SW).
  2. **`Promise.withResolvers`** polyfill (Safari < 17.4).
  3. **THE bug:** Safari can't async-iterate `ReadableStream`, which pd f.js v6's
     `getTextContent` uses → polyfilled `ReadableStream[Symbol.asyncIterator]`.
  4. Reverted a wrong "legacy pd f.js build" detour; settled on **standard build
     on the main thread** + polyfills.
  5. **Export PDF under CSP:** added `wasm-unsafe-eval` (react-pdf/yoga WASM) and
     `connect-src data: blob:` (WASM fetched from a data: URL).
- Added on-screen error capture (stage + stack + UA + Copy) + source maps.

## Backlog — start here next session
1. **Parser quality (HIGH).** On a real CV (`olenashykova-data-engineer-resume.pdf`):
   - "Bulleted structure" scored 0/5 even though the doc is all bullets →
     bullet-glyph detection in `analyze.ts` misses that PDF's bullet char.
   - **Experience not parsed** on import into Build (only Education) →
     section/entry detection in `parse.ts` doesn't recognize that CV's layout.
   - "Headers off" in the build preview.
   → **Needs the real file.** Drop test CVs in `_do_not_commit/` and debug
     `parse.ts` / `analyze.ts` against them (they're pure functions — add fixtures
     to the `*.test.ts` suite once reproduced).
2. **Per-section help text** (e.g. Experience vs Projects) — quick UX add, no file
   needed. Inline hints under each builder section.
3. **Favicon** — user reported "no favicon"; re-check on a clean load (was likely
   a stale-cache artifact, now that HTML is no-cache).
4. **Optional / later:** BYO-key AI rewrite (opt-in only — never auto-send CV text
   to an LLM); i18n (English-only today); more ATS-safe templates; the accepted
   dual-renderer drift (HTML preview vs react-pdf — see retrospective #unify);
   bundle perf (react-pdf chunk is large, already lazy-loaded).

## How to resume
```bash
cd ~/Projects/MSH/cv.shykov.dev
npm install
npm run dev
# read CLAUDE.md first (landmines), then this file's backlog
```
Personal CV materials live in `~/Projects/MSH/CV/` (not a git repo). Open PRs:
none. Recent PR history: #1–#26 (see GitHub).
