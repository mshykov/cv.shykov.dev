# Sonar Quality Rules

Use this checklist while writing code, not only after Sonar reports issues. These
rules are based on findings that already appeared in this project.

## Complexity

- Keep functions small and single-purpose. Split parser, analyzer, extractor, and
  UI logic by stage or category before a function becomes a branching coordinator.
- Prefer early returns and named helpers over deeply nested `if`/`else` chains.
- Do not pack scoring rules, UI copy, point calculations, and status decisions into
  one function. Use helpers such as `scoreBand()`, `linkDetail()`, or
  `addContactChecks()`.
- If a function is becoming a state machine, make the states explicit with guard
  clauses.

## Conditionals

- Avoid nested ternaries in production code. They are easy to write and hard to
  review.
- Use named functions for repeated boolean decisions, for example
  `jdCoverageClass()` or `missingSectionStatus()`.
- Use braces and multiline blocks for conditional code that mutates state or swaps
  array items. One-line mutation conditionals are too easy to misread.
- Do not rely on ambiguous JSX whitespace around inline elements. Wrap visible text
  in its own element when spacing matters.

## Regular Expressions

- Avoid dense regexes for parser/scorer behavior when deterministic token helpers
  are clearer.
- Keep regexes linear-time. Avoid patterns with broad repetition that can trigger
  backtracking on long CV text.
- Add regression tests for both positive and false-positive cases.
- For URL/email/contact parsing, prefer small token/host helpers over one giant
  pattern.

## React

- Never use array indexes as React keys for editable, reorderable, filtered, or
  parsed content.
- Use stable domain keys: IDs from UI state, check IDs, labels that are unique in
  the local list, or content-derived keys for read-only parsed data.
- Expose selected state for toggle buttons with `aria-pressed` or `aria-current`.
- Prefer semantic elements for dynamic output. Use `<output>` for visible result
  text when a generic `role="status"` is not required.
- Reset file inputs after handling imports so selecting the same file again still
  triggers `onChange`.

## Accessibility And Markup

- Decorative visual markers need `aria-hidden`.
- Buttons need clear accessible names, especially icon-only buttons.
- If content scrolls to a fixed-header target, set enough `scroll-margin-top`.
- Keep dynamic text readable by assistive technology without duplicating noisy
  live-region announcements.

## Parser And Analyzer Tests

- Every parser/analyzer change needs a regression test with realistic CV text.
- Include false-positive tests for ordinary words, email domains, hidden links, and
  URL-like text.
- If a PDF hyperlink target affects scoring, test both visible text and hidden
  target behavior.
- Keep scoring deterministic: no network calls, no API keys, no LLM dependency.

## Before Push

Run the same checks before pushing a PR update:

```bash
npm run lint
npm test
npm run build
npm run smoke:build
```
