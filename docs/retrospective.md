# Session Retrospective — building & debugging cv.shykov.dev

A single extended session took this project from a one-off ATS scorer to a full
**parser + analyzer + builder** (Phases 0–3), through a **tech-debt hardening
pass**, and then into a long tail of debugging an **iOS-Safari-only failure**
that turned out to be a WebKit gap. This is the honest retro.

## What went well — keep doing

- **Small PRs through a protected `main`.** Every change went branch → CI
  (`build` + tests) → squash-merge: isolated, reviewed, reversible, linear
  history. Made it easy to bisect and to back changes out.
- **Privacy-first, in-browser architecture.** No backend / accounts / uploads —
  simpler ops, security, and product story. Clean-room MIT reimplementation kept
  us clear of OpenResume's AGPL. Worth defending.
- **A real test suite + CI gate, added before it hurt.** Pure-function lib tests
  (parser / analyzer / jdmatch) via Node's built-in `node:test` — zero new deps,
  no bleeding-edge-Vite peer issues — caught the exact parser regressions we'd
  previously hit by hand. Continue: add a test with each parser tweak.
- **Escalating to real on-device debugging when stuck.** Safari Web Inspector
  over USB + a *reproduce-and-fix* loop (delete the native API to simulate
  Safari, prove the polyfill fixes it) is what finally cracked the bug.
- **In-app error capture.** Stage + error name + stack + UA with a Copy button
  turned a truncated WebKit message into the exact failing line. Observability
  paid for itself instantly — keep building it in.
- **Persisting decisions.** Architecture constraints and the Safari/pdf.js
  gotchas are written down so the next session doesn't repeat the detour.

## What went wrong — and the lessons

1. **Tested only in Chromium/Node → missed a Safari-only bug for ~6 rounds.**
   The real cause — Safari can't async-iterate `ReadableStream`, which pdf.js
   v6's `getTextContent` relies on — is invisible in Chrome and Node. I shipped
   several plausible-but-wrong fixes before getting on the real device.
   **Lesson:** test the **real target browser early**, especially Safari/WebKit.
   "Works in my Chromium preview" is not verification for a public web app.

2. **Caching masked every deploy.** A cached `index.html` (no `Cache-Control`)
   plus a service worker pinned the device to old, broken builds — so
   "verified deployed" fixes never actually loaded on the user's phone.
   **Lesson:** from day one, serve **`no-cache` HTML + immutable hashed assets**.
   Before trusting a fix reached the user, confirm the **deployed chunk hash
   matches local**. Treat service workers as a liability without an update plan.

3. **"Verified" that wasn't.** I claimed PDF export worked under the production
   CSP by reasoning, then later checked the export *blob* but not the *console* —
   missing the WASM CSP violations.
   **Lesson:** verify the **actual failing condition** (real CSP, real browser)
   and check **console + network**, not just the happy-path output. A green
   output can hide caught or secondary errors.

4. **Theorized before gathering facts.** I inferred "old Safari" from the error
   text and detoured into pdf.js's legacy build — which then broke on the user's
   *modern* Safari. One data point (the User-Agent: Safari 26) would have ruled
   that out immediately.
   **Lesson:** get the **environment facts (UA / version)** up front, before
   building a theory on top of a guess.

5. **Added complexity that became a trap.** The offline service worker (a
   tech-debt "nice to have") later trapped users on stale builds.
   **Lesson:** weigh failure modes before adding caching/offline. A nice-to-have
   with a bad failure mode isn't worth it without guardrails.

6. **CSP whack-a-mole with a heavy dependency.** Each export fix surfaced the
   next CSP need (`wasm-unsafe-eval`, then `connect-src data:`).
   **Lesson:** when integrating a heavy lib (react-pdf + WASM), exercise it
   **under the production CSP up front** and enumerate all its resource needs
   (`script` / `connect` / `font` / `img` / `worker`) in one pass.

7. **Slipped a commit onto `main` directly** during a fix (caught and corrected
   via PR).
   **Lesson:** check the current branch before committing; let the protected
   flow do its job.

## Guardrails added this session (so these don't recur)

- `no-cache` HTML + immutable hashed assets in `public/_headers`; the service
  worker is now a self-destruct kill-switch.
- Production source maps + on-screen error capture with a Copy button.
- `node:test` suite wired into the CI `build` gate; Dependabot enabled.
- pdf.js pinned to the **standard build on the main thread** with the required
  polyfills (`Promise.withResolvers`, `ReadableStream[Symbol.asyncIterator]`) —
  see the comments in `src/lib/pdf.ts` and `src/polyfills.ts`.

## One-line takeaway

The build was fast and clean; the pain was all in **verification and delivery**
— testing the wrong engine, and shipping into a cache that hid the result. Fix
those two habits and most of the lost rounds disappear.
