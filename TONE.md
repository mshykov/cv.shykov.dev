# TONE.md — cv.shykov.dev

How the site and everything published about it sounds, and what it may claim. The
product is a static, browser-only tool, so there is no dashboard or bot to style:
the voice has two jobs — **say nothing untrue about privacy and scoring**, and
**stay plain**. Per-language form of address and terminology live in
[docs/localization.md](docs/localization.md) §Writing guidelines; this file does
not repeat them.

## Voice

Plain, concrete, a little dry. The reader is a job seeker, often mid-application and
sceptical of CV tools that want an email address.

- **Do** — say what the tool does and what it cannot: "an ATS score estimates how
  cleanly a parser reads your CV", not "beat the ATS".
- **Do** — show the mechanism: the published rubric, the exact headings the checker
  accepts, a before/after of what a parser receives.
- **Don't** — promise outcomes (interviews, "pass the ATS", "75% of CVs are
  rejected" — the guides debunk that figure, so never repeat it).
- **Don't** — use exclamation marks, emoji, ALL CAPS, or filler adjectives
  (`powerful`, `seamless`, `effortless`, `supercharge`, `unlock`, `leverage`,
  `AI-powered`, `best-in-class`).

## Claims that must stay exact

These are the sentences where an imprecise word has already cost us once ("100%
local" read as "local install"). Use the wording on the right.

| Topic | Say | Never say |
|---|---|---|
| Privacy | "Runs in your browser", "your file is not uploaded", "no account" | "100% local", "offline", "secure" (as a promise), "we don't store" (nothing is sent to us at all) |
| Why it holds | The CSP sets `connect-src 'self' data: blob:` and there is no backend that could receive a file. Checkable in the Network tab | "trust us" |
| AI | "No LLM calls", "deterministic checks". "No AI" is used in the homepage meta description and is accurate there (no model of any kind) | Wording that implies a model is used anywhere, or "AI-powered" |
| Score | "an estimate of how well a parser will read the document" | "your ATS score" as if one exists; "real ATS" — each employer's system differs |
| Writing-style tab | English CVs only; say so | Implying it reviews other languages |
| Network panel | what was observed: "this page made N requests, all to this site; none went to another site and none was a fetch, XHR or beacon" | "secure", "nothing was stored", "we cannot see your file" (a page cannot prove a body was not sent) |
| Accuracy and bias | "an estimate", "a heuristic", "not validated against hiring outcomes"; the rules carry assumptions even though there is no model or training data | "accurate", "unbiased", "fair", "proven", or any outcome claim |
| Languages | The CV may be in any supported language; the interface in seven | "supports every language" |

If a new feature changes any row (a network call, an optional AI step, an account),
update this table and the FAQ answers in the same PR — `messages/en.ts`
(`Is my CV uploaded?`, `Does this use AI?`) and the guide FAQs repeat these claims.

## Mechanics

- Headings in sentence case, no terminal period.
- Spelling: en-US in the interface; guides follow the same.
- Spaced em dash for asides; numerals for numbers; curly quotes in prose.
- Buttons: verb first, ≤ 4 words.
- Product name: **ATS Resume Toolkit** in titles and the README; "free CV score
  checker" is the descriptive anchor, never a brand.
- No competitor is named in product copy.

## Outside the site

Cross-posts (dev.to, Hashnode), directory listings, outreach and replies follow the
same voice and the same claims table.

- Canonical to the original page; disclose AI assistance where the platform has a
  field for it.
- Write in first person singular for posts ("my checker"), because it is one
  person's open-source project.
- A listing or post may be shorter than the page, never bolder than it.
- Do not engage with unsolicited "try my tool" outreach on the strength of the
  message alone; check the sender and the domain first.

## Where to enforce

Review any PR that changes rendered text against the claims table. Translated
strings follow the same table in their own language — back-translate with DeepL
when in doubt (see `docs/localization.md` §Validate).
