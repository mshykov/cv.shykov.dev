# cv.shykov.dev — CV ATS Checker

A privacy-first web app that scores a CV's ATS-readiness. Drop in a PDF and get a
0–100 score with concrete fixes across parseability, contact info, sections,
formatting, and content quality.

**Everything runs in the browser** via Mozilla's [pdf.js](https://mozilla.github.io/pdf.js/).
The file is read into memory, analyzed, and discarded — nothing is uploaded, no
tracking, no accounts.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Mirrors the `shykov.dev` setup.

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
