# CLAUDE.md — cv.shykov.dev

Privacy-first **CV Toolkit** (https://cv.shykov.dev). Two modes:
- **Analyze** — drop a PDF/DOCX → ATS-readiness score + fixes, job-description
  keyword match, and the structured data a parser extracts.
- **Build** — form → live preview + live ATS score → export an ATS-clean PDF.

Everything runs **100% in the browser**; nothing is uploaded. Open-source (MIT).

## Stack & deploy
Vite 8 · React 19 · TypeScript · Tailwind v4. `pdf.js` (read PDF), `mammoth`
(read DOCX), `@react-pdf/renderer` (write PDF). Deployed on **Cloudflare Workers
Builds** — auto-deploys on push to `main`; custom domain in `wrangler.jsonc`.

## Commands
```bash
npm run dev      # dev server
npm test         # node:test unit tests (lib + polyfills)
npm run build    # tsc + vite build (CI gate runs lint + test + build)
npm run build:debug # same build with production source maps for stack traces
npx vite preview --port 4319   # serves the prod build WITH the production CSP
```

## Structure
- `src/lib/` — pure logic + colocated tests: `pdf.ts`/`extract.ts` (extract
  text), `parse.ts` (structured résumé), `analyze.ts` (ATS score), `jdmatch.ts`
  (JD keyword match), `report.ts`, `download.ts`.
- `src/components/` — shared UI (`ScoreRing`, `tone`).
- `src/builder/` — Build mode: `Builder.tsx`, `ResumeDoc.tsx` (the react-pdf
  template), `model.ts`.
- `src/` — `App.tsx` (Analyze/Build shell), `Analyzer.tsx`, `ErrorBoundary.tsx`,
  `polyfills.ts` (loaded first in `main.tsx`).
- `public/_headers` — security headers + **CSP** + cache rules. `docs/` — design
  notes & retros. `_do_not_commit/` — gitignored local scratch (test CVs, secrets).

## ⚠️ Landmines — do NOT "simplify" these without reading why
1. **pdf.js: standard build, on the MAIN THREAD** (`src/lib/pdf.ts`). It runs
   in-process (fake worker) — NOT the legacy build (its core-js breaks modern
   Safari) and NOT a real Web Worker (iOS terminates it). Main thread is required
   so `src/polyfills.ts` can reach pd f.js.
2. **`src/polyfills.ts` (loaded first):** patches `Promise.withResolvers` AND
   **`ReadableStream.prototype[Symbol.asyncIterator]`**. The latter is THE fix
   for the iOS failure — Safari can't async-iterate ReadableStream, which pd f.js
   v6's `getTextContent` requires. Removing it re-breaks Analyze on Safari.
3. **CSP (`public/_headers`)** must keep `script-src 'wasm-unsafe-eval'` and
   `connect-src … data: blob:` — react-pdf compiles WASM (yoga) and fetches it
   from a `data:` URL. Removing these re-breaks Export PDF.
4. **HTML is `no-cache`, assets `immutable`.** A cached `index.html` once pinned
   users to old broken builds for days. Don't remove. **No service worker** —
   `public/sw.js` is a self-destruct kill-switch; don't reintroduce caching.
5. **Test on real Safari/WebKit, not just Chromium.** The worst bugs this project
   hit were Safari-only and invisible in Chrome/Node. `vite preview` reproduces
   the prod CSP locally.

## Workflow
`main` is branch-protected: **PR + green `build` check + linear history**;
self-merge via squash. Never commit straight to `main` (check your branch first).

## Code quality rules
- Follow the reusable Sonar checklist in `docs/sonar.md` and the CV toolkit
  rules in `docs/project-quality.md`.
- Keep parser/scorer/extractor functions small. Split by category or stage instead
  of growing one branching function.
- Avoid nested ternaries and dense parser regexes. Prefer named helpers and
  deterministic token logic with regression tests for false positives.
- React editable lists need stable IDs for `key`; never use array indexes as keys.
- Use semantic elements for dynamic result text (`<output>` when appropriate), and
  keep conditional state mutations in clear multiline blocks.

## Read next
- `docs/retrospective.md` — what went well / wrong + lessons.
- `docs/sonar.md` — reusable Sonar/code-quality checklist.
- `docs/project-quality.md` — CV toolkit-specific quality rules.
- `docs/session_2026-06-24_history.md` — last session's work + **current backlog**.
