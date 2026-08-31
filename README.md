<p align="center">
  <img src="public/logo.png" alt="ATS Resume Toolkit logo" width="88" height="88">
</p>

<h1 align="center">ATS Resume Toolkit</h1>

<p align="center">
  Fast ATS resume scoring, writing-style checks, and CV building for PDF/DOCX files.
  <br>
  <strong>Runs in your browser. No uploads. No accounts. No LLM calls.</strong>
</p>

<p align="center">
  <a href="https://cv.shykov.dev">Open the app</a>
  ·
  <a href="#run-locally">Run locally</a>
  ·
  <a href="#how-the-score-works">How scoring works</a>
  ·
  <a href="#writing-style-check">Writing style check</a>
  ·
  <a href="#guides">Guides</a>
</p>

<p align="center">
  <a href="https://github.com/mshykov/cv.shykov.dev/actions/workflows/ci.yml"><img alt="Build" src="https://github.com/mshykov/cv.shykov.dev/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://sonarcloud.io/dashboard?id=mshykov_cv.shykov.dev"><img alt="Quality Gate" src="https://sonarcloud.io/api/project_badges/measure?project=mshykov_cv.shykov.dev&metric=alert_status"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>

## What It Does

`cv.shykov.dev` is a privacy-first resume toolkit with two workflows:

- **Fast ATS Score** — drop a PDF or DOCX and get a 0-100 ATS-readiness score
  plus top fixes. Four tabs: **Full report** (the deterministic score
  breakdown), **Writing style** (habits that make CV prose read as
  boilerplate), **Job match** (keyword coverage against a pasted job
  description), and **Extracted data** (what a parser actually reads out of the
  document).
- **Build** — edit a clean single-column CV with live preview, document settings,
  import from an existing CV, live score feedback, and export to selectable-text
  PDF.

The product is intentionally narrow: it helps you check whether a resume is
parser-friendly and gives concrete fixes without sending the document away.

## Privacy Model

Your CV is read in memory by the browser, analyzed locally, and then discarded.

- No server upload
- No tracking
- No accounts
- No hidden AI or LLM request
- No service worker cache for new installs

`public/sw.js` exists only as a kill switch for older cached installs.

## Feature Summary

| Area | What You Get |
|------|--------------|
| ATS scoring | Parseability, contact, sections, format, and content checks |
| Top fixes | Highest-impact failed or warning checks first |
| Writing style | Rhythm, filler, repeated openers, unquantified claims, passive voice |
| Job matching | Deterministic keyword coverage against a pasted job description |
| Extracted data | Contact details, links, sections, entries, dates, and skills |
| CV builder | Form-driven editor, live preview, document settings, import, export |
| PDF export | ATS-clean single-column PDF with selectable text |

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173`.

Useful commands:

```bash
npm run lint
npm test
npm run build
npm run smoke:build
```

## How The Score Works

The score is deterministic and lives in `src/lib/analyze.ts`. It is heuristic
guidance, not a guarantee; real ATS platforms differ.

| Category | Points | Checks |
|----------|--------|--------|
| Parseability | 25 | Machine-readable text, clean encoding |
| Contact | 15 | Email, phone, LinkedIn or website |
| Sections | 35 | Experience, Education, Skills, Summary, Achievements, Projects, Certifications |
| Format | 15 | Page count, dated history, bulleted structure |
| Content | 10 | Quantified impact, strong action verbs |

PDF text extraction uses `pdf.js`. DOCX extraction uses `mammoth`.
PDF export uses `@react-pdf/renderer`.

## Writing Style Check

A second, separate score for how the CV *reads*. It lives in `src/lib/style.ts`
and is deliberately kept out of `analyze.ts` so that adding it could not shift
the 100-point ATS rubric above.

| Signal | What it looks for |
|--------|-------------------|
| Sentence rhythm | Every sentence the same length. Measured as coefficient of variation, so short bullets are not punished for being short |
| Repeated openers | The same word starting bullet after bullet. Dated role headings are excluded — they are headings, not bullets |
| Filler phrases | Stock CV language: "results-driven", "proven track record", "team player" |
| Claims without numbers | "Significantly improved" with no figure anywhere on the line |
| Passive voice | "was implemented by" where "implemented" would do |
| Punctuation tics | Em-dash overuse in prose. Role-heading separators are not counted |
| Vocabulary range | Type-token ratio — how much the wording repeats itself |

Bands: **85+** reads naturally · **65-84** a few habits to fix · **under 65**
reads formulaic.

### Is this an AI detector?

**No, and it is not trying to be.** Detecting machine-written text requires a
language model, which this app does not have and will not ship — everything
here runs on your device with no model call. Published AI detectors are also
unreliable, and they misfire hardest on writers whose first language is not
English, which is a large share of the people writing a CV in English.

What this does instead is name concrete habits and let you decide. Every signal
points at a specific line you can rewrite. A CV can score badly here because a
human wrote it in a hurry, and that is still worth fixing.

## Guides

Static, JavaScript-free pages generated at build time by
`scripts/prerender.mjs` from `src/content/articles.tsx`. They share the app's
stylesheet, ship no bundle, and exist because a single URL can rank for a
handful of queries at most.

| Page | Covers |
|------|--------|
| [`/what-is-an-ats-score`](https://cv.shykov.dev/what-is-an-ats-score) | What the number measures, and the debunked "75% are auto-rejected" claim |
| [`/ats-checker-without-upload`](https://cv.shykov.dev/ats-checker-without-upload) | What "upload your resume" usually means, and what to ask any checker |
| [`/pdf-or-docx-for-ats`](https://cv.shykov.dev/pdf-or-docx-for-ats) | Which format to send, and the one PDF that fails every time |
| [`/how-ats-parsing-works`](https://cv.shykov.dev/how-ats-parsing-works) | The four parsing stages, and which formatting rule maps to each |
| [`/ats-resume-checklist`](https://cv.shykov.dev/ats-resume-checklist) | Fifteen checks ordered by what each one costs you |

Adding one means adding an entry to `ARTICLES`. The sitemap, `llms.txt`, and the
homepage guide list are all generated from that array, so none of them can drift
out of step with the pages that actually exist.

## Tech Stack

| Package | Version |
|---------|---------|
| Vite | 8.2.2 |
| React | 19.2.8 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.3.3 |
| pdf.js (`pdfjs-dist`) | 6.2.108 |
| mammoth | 1.12.1 |
| @react-pdf/renderer | 4.8.1 |

Versions tracked from `package.json`; Dependabot keeps them current.

## Project Health

**Code quality** — [SonarCloud](https://sonarcloud.io/dashboard?id=mshykov_cv.shykov.dev), last analysis 2026-08-27, 3.1k lines of code (TypeScript, HTML):

| Security | Reliability | Maintainability | Hotspots Reviewed | Coverage | Duplications |
|----------|-------------|------------------|--------------------|----------|---------------|
| A (0 issues) | A (0 issues) | A (7 issues) | 100% | – | 0.0% |

**Tests** — 95 unit tests (`node:test`) plus 3 Playwright end-to-end tests that
run WebKit under the production CSP, because this project's worst bugs have all
been Safari-only.

**Lighthouse** (mobile, cv.shykov.dev/, Lighthouse 12.8.2, 2026-08-27):

| Performance | Accessibility | Best Practices | SEO |
|--------------|----------------|-----------------|-----|
| 96 | 100 | 93 | 100 |

LCP 2.2 s · TBT 0 ms · CLS 0.

Best Practices is not 100 because Cloudflare auto-injects its Web Analytics
beacon and this site's own CSP blocks it, logging a violation in every
visitor's console. Nothing is tracked — the script never runs — but the fix is
to turn the injection off in the Cloudflare dashboard rather than to widen the
CSP, which would trade the "no tracking" promise for a green number.

## Non-Goals

- No backend, account system, or resume storage
- No AI rewriting by default
- No AI-text detection — see [above](#is-this-an-ai-detector) for why
- No graphic-heavy or multi-column templates
- No promise that the score exactly matches every ATS vendor

## Deploy To Cloudflare (Workers Builds)

Production deploys automatically on push to `main` via **Cloudflare Workers
Builds** — there is no manual deploy path. To reproduce the setup:

1. Connect the GitHub repository in **Cloudflare Workers & Pages** (Worker,
   not a Pages project — config lives in `wrangler.jsonc`).
2. Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
3. Production branch: `main`. Use a Worker-scoped API token (Account Settings
   Read, Workers Scripts Write, Workers Routes Write).

The custom domain (`cv.shykov.dev`) is declared in `wrangler.jsonc` and
provisioned automatically on deploy (DNS record + TLS cert).

Security headers, robots.txt, sitemap.xml, favicon, and app icons are already in
`public/`.
