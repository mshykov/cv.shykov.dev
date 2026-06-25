# Project Quality Rules

These rules are specific to `cv.shykov.dev`. Pair them with the reusable Sonar
checklist in `docs/sonar.md`.

## Product Constraints

- Keep the core flow browser-only: no uploads, no accounts, no LLM/API calls.
- PDF/DOCX extraction, scoring, parsing, JD matching, and report generation must
  remain client-side.
- Keep scoring deterministic and explainable. Every score-impacting check should
  have visible detail and a practical fix.
- Do not add competitor-parity features that require accounts, server storage, or
  AI rewriting unless the product direction changes explicitly.

## Parser And Analyzer Design

- Keep scoring, parsing, PDF extraction, and UI helpers split into small functions.
  If a function starts collecting unrelated branches, extract category-specific
  helpers early.
- Do not pack scoring rules, UI copy, point calculations, and status decisions into
  one function. Use helpers such as `scoreBand()`, `linkDetail()`, or
  `addContactChecks()`.
- Prefer deterministic token helpers for parser/scorer logic. Avoid dense regexes
  for contact data, profile URLs, dates, skills, metrics, and section parsing.
- Shared concepts such as email, phone, and profile-link detection belong in shared
  helpers, not duplicated analyzer/parser regexes.
- Keep hidden PDF link targets separate from visible text. ATS-style scoring should
  reward visible text, and warnings should explain when only a clickable target was
  found.

## Regression Tests

- Every parser/analyzer change needs a regression test with realistic CV text.
- Include false-positive tests for ordinary words, email domains, hidden links, and
  URL-like text.
- Test visible profile links and bare portfolio domains such as `jane.dev` and
  `www.jane.dev`, alongside path URLs such as `jane.dev/portfolio`.
- If a PDF hyperlink target affects scoring, test both visible text and hidden
  target behavior.
- For date parsing, include ordinary words that contain date-like substrings, such
  as `Knowledge`, `Presentation`, and `Concurrent`.

## Browser And Export Constraints

- Keep Safari/WebKit compatibility in mind for PDF parsing and export behavior.
- `public/sw.js` is a self-destruct kill-switch. Do not reintroduce app-shell
  caching without retesting stale-bundle behavior on iOS Safari.
- CSP in `public/_headers` must keep the allowances required by PDF parsing and
  PDF export.
- Exported PDFs should stay ATS-clean: selectable text, standard fonts, single
  column, and no decorative layout that harms parsing.

## UI And Accessibility

- Preserve the two primary modes: Fast ATS Score and Build.
- The Analyze flow should surface top fixes and score breakdown before detailed
  checks.
- The Build flow should keep controls compact, preview accurate, and exported PDF
  behavior aligned with the live preview.
- Do not add decorative UI that makes the app feel less utilitarian or obscures the
  privacy-first promise.

## Verification

Run the same checks before pushing a PR update:

```bash
npm run lint
npm test
npm run build
npm run smoke:build
```
