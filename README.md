# cv.shykov.dev — CV Toolkit

A privacy-first CV toolkit that runs **100% in your browser**. Two modes:

- **Analyze** — drop a PDF/DOCX for a 0–100 ATS-readiness score with concrete
  fixes, a **job-description keyword match**, and the exact structured data a
  parser extracts.
- **Build** — a form-driven editor with live preview and a **live ATS score**
  that exports a single-column, ATS-clean PDF (real selectable text, no
  ligatures). Import an existing CV to prefill (round-trip).

The file is read into memory, processed, and discarded — nothing is uploaded,
no tracking, no accounts. Works offline (service worker) and is installable (PWA).

## Stack

Vite + React + TypeScript + Tailwind CSS v4. PDF read: [pdf.js](https://mozilla.github.io/pdf.js/).
DOCX read: mammoth. PDF write: [@react-pdf/renderer](https://react-pdf.org/). Mirrors the `shykov.dev` setup.

## Non-goals (deliberately skipped)

- **No backend / accounts / storage** — the privacy model depends on staying static.
- **No AI rewrite for now** — it would send CV text to a third-party LLM, which
  breaks "nothing leaves your browser". A future opt-in *bring-your-own-key* mode
  is the only acceptable form.
- **No multi-language UI** (yet) — English-first.
- **No graphic/multi-column templates** — they look nice but tank ATS parsing.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the built dist/ locally
```

## How the score works

`src/lib/pdf.ts` extracts text (with positions + bold hints) from the PDF.
`src/lib/analyze.ts` runs transparent, weighted checks (100 pts total):

| Category      | Pts | Checks |
|---------------|-----|--------|
| Parseability  | 25  | machine-readable text, clean encoding (no ligatures / `(cid:)`) |
| Contact       | 15  | email, phone, LinkedIn/website link |
| Sections      | 35  | Experience, Education, Skills, Summary, + Achievements/Projects/Certifications |
| Format        | 15  | page count, dated history, bulleted structure |
| Content       | 10  | quantified impact, action verbs |

It's heuristic guidance, not a guarantee — real ATS platforms differ.

## Deploy — Cloudflare Pages (Git integration)

1. Push this folder to a GitHub repo (e.g. `mshykov/cv.shykov.dev`).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**,
   pick the repo.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20+ (set env var `NODE_VERSION=20` if needed)
4. Deploy. You'll get a `*.pages.dev` URL.

### Custom domain `cv.shykov.dev`

In the Pages project → **Custom domains → Set up a custom domain** → enter
`cv.shykov.dev`.

- If `shykov.dev`'s DNS is **on Cloudflare**, it adds the CNAME automatically.
- If DNS is **elsewhere** (the main site is on Firebase), add a CNAME record at
  your DNS host: `cv` → `<project>.pages.dev`, then verify in Cloudflare.

`_headers` (security headers incl. CSP) and the icon/PWA set are already wired up.
