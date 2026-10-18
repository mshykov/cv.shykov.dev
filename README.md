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
  <a href="#design">Design</a>
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

`cv.shykov.dev` is a privacy-first resume toolkit with three pages, each a real URL (so the browser's
Back button works) and each in seven languages:

- **Fast ATS Score** (`/`) — the first screen is one headline, an example of what a report looks like,
  and a drop target. Drop a PDF or DOCX and get a 0-100 ATS-readiness score, the top three fixes and a
  few advisories. Everything else is in a closed **Full report and details** disclosure with four tabs:
  **Full report** (the deterministic score breakdown), **Writing style** (habits that make CV prose read
  as boilerplate), **Job match** (keyword coverage against up to five pasted postings) and **Extracted
  data** (what a parser actually reads out of the document). A second file in the same tab shows what
  changed since the previous one.
- **CV builder** (`/build`) — edit a clean single-column CV with live preview, document settings,
  import from an existing CV, live score feedback, and export to selectable-text PDF.
- **Guides** (`/guides`) — a static index of the long-form guides (see [Guides](#guides)).

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

The Content-Security-Policy (`public/_headers`) sets `connect-src 'self' data: blob:`, so the
page cannot send your file to another origin even by mistake, and fonts are self-hosted
(`font-src 'self'`): there is no Google Fonts request. After an analysis, a collapsed note
shows what the page actually requested (see [Check what this page sent](#check-what-this-page-sent)).

## Feature Summary

| Area | What You Get |
|------|--------------|
| First screen | One headline, an example report, a drop target, and the facts that matter: runs in your browser, no account, no AI, no upload to a server |
| ATS scoring | Parseability, contact, sections, format, and content checks |
| Top fixes | Highest-impact failed or warning checks first |
| Writing style | Rhythm, filler, repeated openers, unquantified claims, passive voice |
| Job matching | Deterministic keyword coverage against up to five pasted postings |
| Score change | What moved since the previous file in the same tab (in memory only) |
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
npm test               # unit tests (node:test)
npm run build          # type-check, build, prerender every page in every language
npm run smoke:build    # checks every built page: lang, hreflang, canonical, JSON-LD, links
npm run test:e2e       # WebKit under the production CSP (build first)
```

To preview a build the way production serves it, `npx vite preview --port 4319` (it applies the
production CSP). For a Lighthouse run, serve `dist/` with compression: `vite preview` does not
compress, which makes every number look worse than it is on Cloudflare.

Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md) and the
[`good first issue`](https://github.com/mshykov/cv.shykov.dev/labels/good%20first%20issue) label.

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

A section heading only earns points when text follows it (or it carries its own, as in
"Skills: Go, Rust"); a bare heading is a label, not a section.

### Advisories (not scored)

Conventions are shown in a separate "Worth a look" card and never change the score,
because they vary by country, seniority and sector (`src/lib/advisories.ts`):

| Advisory | Shown when |
|----------|------------|
| Length | the CV has more than 1,000 words |
| Thin role | the CV has at least two roles and one of them has exactly one bullet |
| Long bullets | a bullet runs past 40 words |
| Graduation year | English interface only: an education entry whose latest year is more than 15 years back |
| Columns / table | PDF only: two or more text columns side by side (a sidebar), or three or more aligned columns; right-aligned dates and indented bullets are not columns |
| Contacts in header/footer | PDF with 2+ pages only: your email or phone appears only in a header or footer that repeats on every page |
| File name | the file is called something like `cv_final_v3` or `Resume (2)` |
| Document properties | a PDF whose Author shares no word with the name on the CV, or whose Title looks like a scratch name |

PDF text extraction uses `pdf.js`. DOCX extraction uses `mammoth`.
PDF export uses `@react-pdf/renderer`.

## Job Match

The Job match tab extracts the keywords a pasted posting emphasises and checks your CV
(`src/lib/jdmatch.ts`). It is a keyword overlap, not a prediction, and it never rewrites the CV.

- **Forms and equivalents.** A light English stemmer meets "managing" with "managed" and
  "management" (words of five letters or more, exact stem equality only). A short, conservative
  list treats acronyms and their expansions as the same thing (SEO / search engine optimization,
  CI/CD / continuous integration, ML / machine learning, k8s / Kubernetes…). It is kept short on
  purpose: a wrong equivalence invents a match.
- **Where it appears.** A matched keyword found only in the Skills list, and in no experience
  bullet, is tagged "only in Skills": a keyword reads as stronger when a bullet shows what you
  did with it.
- **Nice to have.** A keyword that the posting mentions only under a "Nice to have" /
  "Preferred" heading or marker is tagged and weighs half as much in the coverage number; one
  mentioned both as required and as preferred stays a must-have. English markers only.
- **Job title.** Whether the posting names one of your job titles (whole phrase, ignoring case and
  accents; a team after a comma is ignored). Recruiters often search by title.
- **Years of experience.** The largest number of years the posting asks for ("8+ years", "3-5 years",
  also in Ukrainian, Spanish, Portuguese, French and German), counted only in an experience sentence or a
  line under a requirements heading, and not when it is about the company or a warranty. It is compared
  with the span from your earliest dated role to today. A comparison of numbers, not a verdict.
- **Your CV with the matches highlighted.** Matched keywords (and their listed equivalents) are marked in
  the extracted text of your CV, on request. It is rendered from plain text, never as HTML.
- **Compare up to five postings.** Add more postings, match them all against the same CV, and read
  a table of coverage and missing keywords with the best match marked; pick a row to see its detail.
  The postings stay when you analyse another CV, so you can try the same ones against a new version.
- **Copy the missing list** with one click.

The history of every change that moved a score is in [docs/scoring-changelog.md](docs/scoring-changelog.md).

## Limitations And Bias

Read this before you trust a number.

- **It estimates how well a parser will read a document.** It does not predict a
  recruiter's decision, an interview, or what any employer's system does. Nothing
  here has been validated against hiring outcomes, and no published ATS score is
  standardized: other checkers give the same file different numbers because they
  measure different things.
- **There is no model and no training data**, so there is no dataset to be biased
  in the machine-learning sense. That does not make the rules neutral. They encode
  assumptions: the section headings the scorer accepts are a list per language
  (`src/lib/sections.ts`), and the format checks (page count, dated history,
  bullets) follow common Western CV conventions that differ in other countries and
  in academic CVs.
- **The writing-style score covers English CVs only** and is built from word lists
  and sentence statistics. It can flag perfectly good writing, and habits that are
  more common among non-native English writers can lower it. It is not an AI
  detector and must not be used to judge who or what wrote a text.
- **Where a human comes in.** The tool scores a file, never a person, and decides
  nothing about anyone. Every point shows the rule behind it; the person decides
  what to change. Nothing is sent to an employer.

### What the evidence is, and what it is not

- Every rule has unit tests (`src/lib/*.test.ts`), and the published rubric is
  checked against the scoring code.
- [`src/lib/benchmark.test.ts`](src/lib/benchmark.test.ts) is a small public
  sanity benchmark on invented CVs: a complete CV must outscore the same CV with
  sections removed, which must outscore one with no contact details, which must
  outscore a scan with no extractable text; and natural wording must outscore
  boilerplate on the style score. It checks that the order is sensible. It does
  not show that the score predicts anything outside this tool.
- A cross-check of one CV against five other free checkers is recorded in
  [docs/comparison-2026-10-16.md](docs/comparison-2026-10-16.md). It is an anecdote, not
  a study, and it shows this tool scoring more leniently than the others.

If the score is wrong for your CV, or you can break the order above, open a
[Wrong score](https://github.com/mshykov/cv.shykov.dev/issues/new?template=wrong-score.md)
issue (do not attach your CV; paste the line involved).

### "Check what this page sent"

After an analysis, a collapsed note states what the page observed about its own network
activity since the file was chosen, using Resource Timing (`src/lib/network.ts`): how many
requests it made, how many went to another site (expected: none) and how many were `fetch`,
XHR or beacon requests (expected: none; `data:` and `blob:` URLs do not leave the page). A page
cannot read a request body, so this is what was counted, not a guarantee; the note tells the
reader how to check in the browser's Network tab.

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

A CV with too little text (empty, or a couple of words) is reported as "not enough text"
rather than scored. A line that mentions a date still counts as an achievement; only
dated role headings are left out, and a year does not count as a figure backing a claim.

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
`scripts/prerender.mjs` from `src/content/<locale>/articles.tsx`, indexed by the **Guides** page
(`/guides`, `src/content/GuidesPage.tsx`). They share the app's stylesheet and header, ship no bundle,
and exist because a single URL can rank for a handful of queries at most.

| Page | Covers |
|------|--------|
| [`/what-is-an-ats-score`](https://cv.shykov.dev/what-is-an-ats-score) | What the number measures, and the debunked "75% are auto-rejected" claim |
| [`/ats-checker-without-upload`](https://cv.shykov.dev/ats-checker-without-upload) | What "upload your resume" usually means, and what to ask any checker |
| [`/pdf-or-docx-for-ats`](https://cv.shykov.dev/pdf-or-docx-for-ats) | Which format to send, and the one PDF that fails every time |
| [`/how-ats-parsing-works`](https://cv.shykov.dev/how-ats-parsing-works) | The four parsing stages, and which formatting rule maps to each |
| [`/ats-resume-checklist`](https://cv.shykov.dev/ats-resume-checklist) | Fifteen checks ordered by what each one costs you |
| [`/how-to-check-your-cv-score`](https://cv.shykov.dev/how-to-check-your-cv-score) | Checking a score for free in four steps, what the number means and which fixes move it |

Adding one means adding an entry to `ARTICLES` (and `GUIDES`) in every language.
The sitemap, `llms.txt`, the guides index and the homepage guide list are all generated from those
arrays, so none of them can drift out of step with the pages that actually exist.

## Languages

The toolkit and the guides are published in English (`/`), Spanish (`/es/`),
Brazilian Portuguese (`/pt-br/`), European Portuguese (`/pt-pt/`), French (`/fr/`),
German (`/de/`) and Ukrainian (`/uk/`). Each language has its own homepage, Build page
(`/<code>/build`) and guides index (`/<code>/guides`). The interface, the scorer's messages,
the report export and the builder are translated, and the scorer reads CVs written in any of
these languages whatever language the page is in. The web font has no Cyrillic, so the
Ukrainian pages draw Cyrillic in Onest (see [Design](#design)). `docs/localization.md` describes
the architecture and how to add another language.

## Design

Black ink on warm paper, one neon (`#ccff00`) used only as a fill behind ink, hairlines instead of
cards, square corners (the upload field is the one rounded shape), and one self-hosted grotesk
(Schibsted Grotesk, plus Onest for Cyrillic). The page was cut down on purpose: a visitor needs to know
that it is free, that nothing is uploaded and that there is no AI, so everything else (questions, guides,
the full report) is folded away or sits below the first screen. Colours, radii and shadows are tokens
only: the default Tailwind palette is switched off in `src/index.css`.

The rules, the tokens, the font subset, why the previous template was dropped and what has to stay true
are in [docs/design.md](docs/design.md). Read it before changing a class name.

## Tech Stack

| Package | Version |
|---------|---------|
| Vite | 8.3.4 |
| React | 19.3.1 |
| TypeScript | 7.0.2 (`tsc`; 6.0 API kept for typescript-eslint) |
| Tailwind CSS | 4.3.3 |
| pdf.js (`pdfjs-dist`) | 6.4.299 |
| mammoth | 1.13.0 |
| @react-pdf/renderer | 4.9.0 |
| Playwright (e2e) | 1.64.1 |

Versions tracked from `package-lock.json`; a monthly dependency sweep keeps them current.

## Project Health

**Code quality** — [SonarCloud](https://sonarcloud.io/dashboard?id=mshykov_cv.shykov.dev), analysis of 2026-10-18, 15k lines of code (TypeScript, CSS, HTML):

| Security | Reliability | Maintainability | Hotspots Reviewed | Coverage | Duplications |
|----------|-------------|------------------|--------------------|----------|---------------|
| A (0 issues) | A (0 bugs) | A (52 code smells) | 100% | – | 0.0% |

**Tests** — 246 unit tests (`node:test`) plus 22 Playwright end-to-end tests that
run WebKit under the production CSP, because this project's worst bugs have all
been Safari-only. The end-to-end suite scores a CV in every language, opens the builder in
every language and exports a PDF, and checks that the Back button returns from `/build` to the
score page.

**Lighthouse** (mobile, cv.shykov.dev/, simulated slow 4G with a 4x CPU slowdown, Lighthouse 13.4.1, 2026-10-18, after the redesign):

| Performance | Accessibility | Best Practices | SEO |
|--------------|----------------|-----------------|-----|
| 100 | 100 | 100 | 100 |

FCP 0.9 s · LCP 1.1 s · TBT 0 ms · CLS 0 · Speed Index 0.9 s · 153 KiB transferred · zero console errors.

Best Practices was 93 until 2026-09-01. Cloudflare was auto-injecting its Web
Analytics beacon, and this site's own CSP blocked it, logging a violation in
every visitor's console. Nothing was ever tracked — the script never ran — and
the fix was to turn RUM off in the Cloudflare dashboard rather than widen the
CSP, which would have traded the "no tracking" promise for a green number.

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
