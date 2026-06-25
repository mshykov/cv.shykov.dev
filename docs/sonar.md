# Sonar Quality Rules

Use this checklist while writing code, not only after Sonar reports issues. This
file is intentionally project-independent and can be copied into other
TypeScript/React projects.

## Complexity

- Keep functions small and single-purpose. Split logic by stage or responsibility
  before a function becomes a branching coordinator.
- Prefer early returns and named helpers over deeply nested `if`/`else` chains.
- Do not pack business rules, UI copy, calculations, and status decisions into one
  function.
- If a function is becoming a state machine, make the states explicit with guard
  clauses or small helpers.

## Conditionals

- Avoid nested ternaries in production code. They are easy to write and hard to
  review.
- Build optional display fragments in named variables or helpers instead of
  nesting ternaries inside JSX or template literals.
- Use named functions for repeated boolean decisions.
- Use braces and multiline blocks for conditional code that mutates state or swaps
  array items.
- Do not rely on ambiguous JSX whitespace around inline elements. Wrap visible text
  in its own element when spacing matters.

## Regular Expressions

- Avoid dense regexes when deterministic token helpers are clearer.
- Keep regexes linear-time. Avoid patterns with broad repetition that can trigger
  backtracking on long user-provided text.
- Do not use one giant regex for structured data such as URLs, emails, phones, or
  metrics. Prefer tokenization plus small predicates.
- Add regression tests for positive cases and false positives when regex behavior
  affects product logic.
- Prefer `RegExp.exec()` over `String#match()` for extraction.

## Collections And Membership

- Use `Set` plus `.has()` for repeated membership checks such as keywords, units,
  supported names, and character classes.
- Keep shared predicates in one helper module when multiple features need the same
  concept. Duplicated regexes and duplicated classification logic drift quickly.
- Prefer `.at(-1)` when reading the last item of an array.

## React

- Never use array indexes as React keys for editable, reorderable, filtered, or
  parsed content.
- Use stable domain keys: IDs from state, unique domain identifiers, or
  content-derived keys for read-only parsed data.
- Mark component props as `Readonly<...>` with named prop aliases once a component
  has props.
- Expose selected state for toggle buttons with `aria-pressed` or `aria-current`.
- Prefer semantic elements for dynamic output. Use `<output>` for visible result
  text when a generic `role="status"` is not required.
- Reset file inputs after handling imports so selecting the same file again still
  triggers `onChange`.

## Accessibility And Markup

- Decorative visual markers need `aria-hidden`.
- Buttons need clear accessible names, especially icon-only buttons.
- SVGs that carry meaning should expose a `<title>` with `aria-labelledby`.
  Avoid `role="img"` when a semantic alternative is available.
- If content scrolls to a fixed-header target, set enough `scroll-margin-top`.
- Keep dynamic text readable by assistive technology without duplicating noisy
  live-region announcements.

## Async And Expressions

- Do not assign values inside return expressions or conditions. Initialize state in
  a separate statement, then return it.
- Prefer `await` with `try`/`catch` over `.then().catch()` chains in app startup
  code.
- Prefer `globalThis` over environment-specific globals such as `window` or
  service-worker `self`.
- Keep cleanup tasks explicit, even when they are best-effort.

## Strings And Output

- Avoid nested template literals. Build optional suffixes first, then interpolate a
  flat string.
- Put report/export row formatting in named helpers when the line contains both
  content and optional metadata.
- Use `String.raw` for replacement strings that otherwise need escaped
  backslashes.
- Avoid repeated `Array#push()` calls when building structured output. Compose
  arrays with helpers and spread sections together.

## Modern JavaScript APIs

- Prefer `String#codePointAt()` over `String#charCodeAt()`.
- Prefer optional chaining over repeated truthy guards when it preserves clarity.
- Prefer nullish coalescing for defaults where `0`, `false`, or an empty string are
  valid values.

## Before Push

Run the project-specific verification commands before pushing a PR update.
