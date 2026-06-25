# cv.shykov.dev — Project Rules

This project is a privacy-first ATS resume toolkit. Keep changes small, browser-only,
and easy to inspect.

## Code Quality Guardrails

- Follow the detailed Sonar checklist in `docs/sonar.md`.
- Keep scoring, parsing, PDF extraction, and UI helpers split into small functions.
  If a function starts collecting unrelated branches, extract category-specific
  helpers before Sonar has to complain.
- Avoid nested ternaries in production code. Use named helpers or early returns for
  scoring bands, status labels, point calculations, and UI copy.
- Avoid dense regular expressions for parser/scorer logic when small deterministic
  token helpers are clearer. If regex is necessary, keep it linear-time, scoped, and
  covered by regression tests for false positives.
- React lists must use stable domain IDs for `key`; never use array indexes as keys
  for editable/reorderable content.
- Use braces and multiline statements for conditional branches that mutate state.
  Do not hide multiple mutations after a one-line `if`.
- For user-visible dynamic status/result text, prefer semantic elements such as
  `<output>` over generic ARIA status patches unless live-region behavior is truly
  needed.

## Tests And Verification

- Parser/analyzer changes need regression tests with realistic CV text snippets,
  especially for false positives and hidden PDF link targets.
- Before pushing a PR update, run:
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - `npm run smoke:build`

## Product Constraints

- No uploads, no accounts, no LLM/API calls in the core flow.
- PDF/DOCX extraction and scoring must remain client-side.
- Keep Safari/WebKit compatibility in mind for PDF parsing and export behavior.
