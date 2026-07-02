# Security Policy

## Reporting a vulnerability

If you find a security issue in this project, please report it privately —
do **not** open a public issue.

- **Preferred:** [GitHub private vulnerability reporting](https://github.com/mshykov/cv.shykov.dev/security/advisories/new)
- **Email:** maksym.shykov@gmail.com (subject: `[SECURITY] cv.shykov.dev`)

You can expect an acknowledgement within a few days. Please include steps to
reproduce and, if relevant, a proof-of-concept file (the app parses untrusted
PDF/DOCX input, so malformed-document findings are in scope).

## Scope

- The deployed app at https://cv.shykov.dev and this repository's code.
- In scope: XSS or code execution via crafted PDF/DOCX input, CSP or header
  bypasses, cache-poisoning of the deployed assets, supply-chain issues in the
  build pipeline.
- Out of scope: issues requiring a compromised browser or machine,
  denial-of-service of your own tab via pathological input (the app is
  client-side only — there is no server to attack and no user data at rest).

## Privacy model (context for researchers)

The app runs entirely in the browser: no uploads, no accounts, no telemetry,
no storage of document content. A finding that causes CV content to leave the
page (any network request carrying document data) would violate the core
guarantee and is the highest-severity class of report we can receive.
