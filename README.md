<p align="center">
  <img src="public/logo.png" alt="ATS Resume Toolkit logo" width="88" height="88">
</p>

<h1 align="center">ATS Resume Toolkit</h1>

<p align="center">
  Fast ATS resume scoring and CV building for PDF/DOCX files.
  <br>
  <strong>Runs in your browser. No uploads. No accounts. No LLM calls.</strong>
</p>

<p align="center">
  <a href="https://cv.shykov.dev">Open the app</a>
  ·
  <a href="#run-locally">Run locally</a>
  ·
  <a href="#how-the-score-works">How scoring works</a>
</p>

<p align="center">
  <a href="https://github.com/mshykov/cv.shykov.dev/actions/workflows/ci.yml"><img alt="Build" src="https://github.com/mshykov/cv.shykov.dev/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://sonarcloud.io/dashboard?id=mshykov_cv.shykov.dev"><img alt="Quality Gate" src="https://sonarcloud.io/api/project_badges/measure?project=mshykov_cv.shykov.dev&metric=alert_status"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>

## What It Does

`cv.shykov.dev` is a privacy-first resume toolkit with two workflows:

- **Fast ATS Score** — drop a PDF or DOCX and get a 0-100 ATS-readiness score,
  top fixes, deterministic score breakdown, keyword match against a job
  description, and the structured data extracted from the document.
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

## Tech Stack

| Package | Version |
|---------|---------|
| Vite | 8.1.0 |
| React | 19.2.6 |
| TypeScript | 6.0.2 |
| Tailwind CSS | 4.3.1 |
| pdf.js (`pdfjs-dist`) | 6.1.200 |
| mammoth | 1.12.0 |
| @react-pdf/renderer | 4.5.1 |

Versions tracked from `package.json`; Dependabot keeps them current.

## Project Health

**Code quality** — [SonarCloud](https://sonarcloud.io/dashboard?id=mshykov_cv.shykov.dev), last analysis 2026-06-30, 2.7k lines of code (TypeScript, HTML):

| Security | Reliability | Maintainability | Hotspots Reviewed | Coverage | Duplications |
|----------|-------------|------------------|--------------------|----------|---------------|
| A (0 issues) | A (0 issues) | A (3 issues) | 100% | – | 0.0% |

**Lighthouse** (mobile, cv.shykov.dev/, 2026-07-01):

| Performance | Accessibility | Best Practices | SEO |
|--------------|----------------|-----------------|-----|
| 100 | 100 | 100 | 100 |

## Non-Goals

- No backend, account system, or resume storage
- No AI rewriting by default
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
