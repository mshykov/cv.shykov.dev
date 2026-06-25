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

- Vite
- React
- TypeScript
- Tailwind CSS v4
- pdf.js
- mammoth
- @react-pdf/renderer

## Non-Goals

- No backend, account system, or resume storage
- No AI rewriting by default
- No graphic-heavy or multi-column templates
- No promise that the score exactly matches every ATS vendor

## Deploy To Cloudflare Pages

1. Connect the GitHub repository in **Cloudflare Workers & Pages**.
2. Use the Vite preset.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Use Node.js 20 or newer.

For the custom domain, add `cv.shykov.dev` in the Pages project custom domain
settings. If DNS is outside Cloudflare, create a CNAME from `cv` to the generated
Pages domain and verify it in Cloudflare.

Security headers, robots.txt, sitemap.xml, favicon, and app icons are already in
`public/`.
