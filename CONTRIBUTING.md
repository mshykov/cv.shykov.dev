# Contributing

Thanks for looking. This is a small, deliberately narrow tool: a resume checker
and builder that runs **entirely in the browser**. Contributions that keep it that
way are very welcome.

## Ground rules

These are the product, not preferences. A change that breaks one will not be merged.

- **No upload, no backend, no accounts.** A CV is read in memory in the browser and
  discarded. No network request may carry document content.
- **No LLM or model calls.** Scores come from deterministic, repeatable checks.
- **No tracking, and no service worker caching** (`public/sw.js` is only a kill switch).
- **The writing-style score is not an AI detector** and must not be presented as one.

## Run it locally

```bash
npm install
npm run dev        # Vite dev server
npm run lint
npm test           # node:test unit tests in src/**/*.test.ts
npm run build      # tsc + vite build + prerender
npm run test:e2e   # Playwright (installs browsers on first run)
```

CI runs lint, tests and build. Please run them before opening a pull request.

## Where things live

| You want to change | Look at |
|---|---|
| The ATS score and its checks | `src/lib/analyze.ts` (+ `analyze.test.ts`) |
| The published scoring table | `src/content/rubric.ts`. `rubric.test.ts` fails if it drifts from `analyze.ts` |
| Section headings the scorer recognises | `src/lib/sections.ts` |
| The writing-style score and its word lists | `src/lib/style.ts` (+ `style.test.ts`) |
| Job-description keyword match | `src/lib/jdmatch.ts` |
| Reading PDF / DOCX | `src/lib/pdf.ts`, `src/lib/extract.ts` |
| The CV builder and PDF export | `src/builder/` |
| The guide pages | `src/content/articles.tsx` |

Read the "Landmines" section in [CLAUDE.md](CLAUDE.md) before touching `pdf.ts`,
`polyfills.ts`, `public/_headers` or the TypeScript setup. Several of those look
like candidates for simplification and are not.

## Making a change

1. Open an issue first for anything bigger than a word list or a typo, so we agree on
   the shape before you spend the time. Issues labelled
   [`good first issue`](https://github.com/mshykov/cv.shykov.dev/labels/good%20first%20issue)
   are a good place to start.
2. Branch from `main`. Keep the change small and focused: one idea per pull request.
3. Add or update a test next to the code. Scoring and style rules need a case that
   proves the new behaviour **and** a case that proves it does not fire on clean text
   (false positives are the common failure).
4. Open a pull request. `main` needs a green `build` check and linear history; the
   maintainer squash-merges.

Code style: small functions split by stage or category, named helpers instead of dense
regexes, no nested ternaries, stable ids as React keys (never array indexes).

## Reporting a wrong score

Use the *Wrong score* issue template. **Do not attach your CV.** Paste the single line
or heading that was scored wrongly, with the personal details removed.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contribution is licensed under the MIT License.
