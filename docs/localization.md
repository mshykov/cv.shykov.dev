# Localization — how cv.shykov.dev speaks more than one language

The site ships in six language versions: English (the original, at the root) and
Spanish (`/es/`), Brazilian Portuguese (`/pt-br/`), European Portuguese
(`/pt-pt/`), French (`/fr/`) and German (`/de/`). This document is the contract
for all of them and the procedure for adding the next one. If you only read one
section, read [Adding a language](#adding-a-language).

## The decision record

| Question | Decision | Why |
|---|---|---|
| URL scheme | English at the root, every other language in a **subdirectory**: `/es/`, `/pt-br/`… | One domain keeps all links and authority together. English URLs do not move — they are already indexed and ranking. A subdomain or a ccTLD would split that authority for no gain. |
| One page per language, or auto-redirect? | One crawlable page per language, **no automatic redirect by browser language** | Redirects by `Accept-Language` hide pages from crawlers (which send no language) and trap users. People choose in the language switcher; search engines pick via `hreflang`. |
| Translate how? | Written natively per market with Claude, **not literal translation**. Title, description, h1 and guide slugs are written for what people in that market type into a search box. | A literal translation of "free ATS resume checker" is not what a Spaniard, a Brazilian or a German searches. |
| Slugs | Translated per language (`/es/que-es-una-puntuacion-ats`), English slugs untouched | The slug is a ranking signal and a promise to the reader. |
| Tool, or only the text around it? | **The tool too**: scorer messages, report export, builder, the exported PDF's headings, and — separately from the interface language — the word lists the scorer reads a CV with | A Spanish interface that scores a Spanish CV as "no Experience section" is worse than no Spanish at all. |
| How is the interface built? | Static HTML per language at build time (`scripts/prerender.mjs`), then the React app on top | AI crawlers and no-JS clients read the HTML; they must get the page in its language. |
| Where do translations live? | Typed TypeScript objects, not JSON | The compiler rejects a missing key, a misspelled key and a wrong function signature. No runtime i18n library, no bundle cost. |

## Map of the code

```
src/i18n/
  locales.ts          THE registry: code, <html lang>, OG locale, native name. Start here.
  messages/en.ts      Every UI string, scorer message, report string, builder string,
                      <head> text. Source of truth; the others are translations of it.
  messages/<code>.ts  One file per language, typed as Messages (see the variable names
                      in bundles/). Cannot compile with a missing or extra key.
  bundles/<code>.ts   messages + that language's guide list, as one importable unit.
  load.ts             Browser loader: English in the main bundle, every other language
                      its own chunk, fetched only on its own pages.
  all.ts              Every language statically — the prerender only.
  seo.ts, head.ts     hreflang, JSON-LD, <head> tags. Pure functions, unit-tested.
  context.ts          useLocale() / useMessages().
  locales.test.ts     The contract tests every language must pass (see Validation).
src/content/
  types.ts            Guide / Article types and GUIDE_IDS (the six stable guide ids).
  tables.ts           The rubric table and the section-heading table, built from the
                      scorer's own data, so a guide can never state something the code
                      does not do.
  <code>/guides.ts    Per-language guide list: id, slug, title, description. Data only.
  <code>/articles.tsx Per-language article bodies (JSX), short answers, FAQs.
src/lib/lang/
  <lang>.ts           What the scorer, parser and job-matcher know about a *CV language*:
                      section headings, action verbs, units, months, stop words, degrees.
  index.ts            Merges them. A CV is read with ALL languages at once.
src/components/LanguageSwitcher.tsx   <details>-based; plain links, works without JS.
scripts/prerender.mjs                 Writes every page, sitemap, llms.txt, 404s.
scripts/og-images.mjs                 Renders public/og/<code>.png from the messages.
scripts/smoke-built.mjs               Post-build checks across every language.
```

### Two different "languages"

Do not conflate these; they are separate on purpose.

* **Interface language** (`Locale`: `es`, `pt-br`, `pt-pt`…) — what the page says.
  `pt-br` and `pt-pt` are two locales.
* **CV language** (`LangCode`: `en`, `es`, `pt`, `fr`, `de`) — what the scorer
  understands. Portuguese is one `LangCode` (`src/lib/lang/pt.ts`) holding both
  Brazilian and European headings, because a CV is rarely sorted by variant.

The scorer matches the **union of all CV languages** whatever the page language is:
a Spanish CV dropped on `/de/` is scored correctly, and so is an English one on
`/es/`. The one exception is the writing-style tab (below).

## URL map

| Language | Homepage | A guide |
|---|---|---|
| English | `/` | `/what-is-an-ats-score` |
| Spanish | `/es/` | `/es/<slug-in-spanish>` |
| Portuguese (Brazil) | `/pt-br/` | `/pt-br/<slug>` |
| Portuguese (Portugal) | `/pt-pt/` | `/pt-pt/<slug>` |
| French | `/fr/` | `/fr/<slug>` |
| German | `/de/` | `/de/<slug>` |

Files are written as `dist/<code>/index.html` (served at `/es/`) and
`dist/<code>/<slug>.html` (served at `/es/<slug>` with a 200 — not
`<slug>/index.html`, which Cloudflare would 307-redirect to a trailing slash and
make every canonical point at a redirect).

Each language also has its own `404.html`; Cloudflare serves the nearest one up
the path, so `/de/nope` gets the German 404.

## What every page carries (the SEO/GEO checklist, automated)

Generated by `scripts/prerender.mjs`; asserted by `scripts/smoke-built.mjs`.

* `<html lang>` = the locale's `htmlLang` (`es-ES`, `pt-BR`, …).
* `<title>`, meta description, canonical (**self-referencing**), Open Graph and
  Twitter tags, all from that language's messages, with `og:locale` and
  `og:locale:alternate`.
* `hreflang` for **every** language including itself, plus `x-default` → English,
  on every page; and the same alternates in `sitemap.xml` (`xhtml:link`).
  Alternates are reciprocal by construction — they come from one function.
* JSON-LD per page: `SoftwareApplication` / `Article` with `inLanguage`,
  `BreadcrumbList`, `FAQPage` (the FAQ shown on the page, verbatim).
* A social card per language (`public/og/<code>.png`, 1200×630), text from
  `messages.og`.
* A visible language switcher (header) and a language footer (every page), both
  plain links, so every language is one click from every page for users and
  crawlers.
* `llms.txt` lists every language's homepage and guides for answer engines.
* `_headers`: the homepage of each language revalidates like the English one.

## How the scorer reads CVs in other languages

`src/lib/lang/<lang>.ts` is data only. Per language:

| Field | Used by | Notes |
|---|---|---|
| `scorerSections` | the ATS score; published in that language's guide | Headings the score looks for. Short lines (≤ 45 chars) containing one of these count. Accents and case are ignored (`Formação` = `formacao`). |
| `parserSections` | "Extracted data" tab, builder import | Superset of the above, plus languages/interests/awards/other, so they terminate sections cleanly. |
| `actionVerbs` | "Strong action verbs" check | First word of a bullet. Include the first-person past tense (what CVs use), the infinitive and the present. Accents ignored. |
| `impactUnits` | "Quantified impact" | Words after a number that make it a measurable result: `12 usuarios`, `3 Wochen`. |
| `months`, `ongoing` | "Dated history" | `ene 2022 – actualidad`, `März 2020 – heute`. `set`, `out`, `ago` need a 4-digit year (they are English words too). `03/2022` is also a date. |
| `degreeWords` | parser | Splits "Licenciatura en X, Universidad Y". |
| `stopwords` | job-description match | Merged across languages; keeps filler out of the keyword list. |
| `detectWords` | style-tab gate | ~16 very common function words. |

**The writing-style tab is English-only.** Its checks (stock CV phrases, English
passive voice, vague scale words) have no equivalent in the other languages, and a
check that measures nothing is worse than none. `detectLanguage()` guesses the CV's
language; for a CV clearly not in English the tab shows an honest notice instead of
meaningless findings. A language-specific style engine would be its own project.

## Adding a language

Say the new locale is Italian, `it` (`it-IT`). Work top to bottom; the compiler and
the tests tell you what you missed.

1. **Registry** — add a row to `LOCALES` in `src/i18n/locales.ts`
   (`code: 'it'`, `htmlLang: 'it-IT'`, `lang: 'it'`, `ogLocale: 'it_IT'`,
   `nativeName: 'Italiano'`, `intl: 'it-IT'`). Everything downstream (switcher,
   hreflang, sitemap, prerender, OG images) now includes it.
2. **CV language data** — if the CV language is new, write
   `src/lib/lang/it.ts` (copy `es.ts`, replace every list) and register it in
   `src/lib/lang/index.ts` (`LANGS`) and `LangCode` in `src/lib/lang/types.ts`.
   Reusing an existing one (e.g. a second Spanish variant) needs no new file.
3. **Messages** — copy `src/i18n/messages/en.ts` to `messages/it.ts`, change the
   export to `export const it: Messages = {…}`, translate every value. Do not
   translate keys, brand names (`ATS Resume Toolkit`, `GitHub`), or code.
   Functions (`(n) => …`) take the same arguments; adapt word order and plurals.
4. **Bundle** — copy `src/i18n/bundles/es.ts` to `it.ts`; register a `case` in
   `src/i18n/load.ts` and the entries in `src/i18n/all.ts`
   (`BUNDLES` and `ARTICLES`).
5. **Guides** — `src/content/it/guides.ts` (six entries, same `id`s, **new
   slugs**) and `src/content/it/articles.tsx` (copy `en/articles.tsx`, translate
   body, `summary`, `faq`; link to `/it/<slug>` and `/it/`; use `rubricRows` /
   `sectionRows` from `../tables.ts` with the new messages and `LangCode`).
6. **`_headers`** — add the `/it/` and `/it/index.html` no-cache pair.
7. **OG image fonts/text** — nothing to do unless the language needs a glyph the
   card font lacks; then see `scripts/og-images.mjs`.
8. **Generate the social card** — `npm run og-images` (needs Google Chrome), commit
   `public/og/it.png`.
9. **Validate** — `npm run lint && npm test && npm run build && npm run smoke:build`.
   `locales.test.ts` checks the messages, `smoke-built.mjs` checks every built page.
10. **After deploy** — IndexNow ping and GSC/Bing sitemap resubmit (see
    [Rollout](#rollout-of-a-new-language)).

## Writing guidelines

**Voice.** The English is plain, concrete and a little dry. Keep that: no
marketing inflation, no exclamation marks, no emoji, no calques. Write as a
native career writer for that country would. Decide the form of address once per
language and never mix it:

| Language | Address | Note |
|---|---|---|
| es-ES | *tú* | "Sube tu CV". Spain says **CV** and **currículum** |
| pt-BR | *você* | Brazil says **currículo**; "enviar", "arquivo", "baixar" |
| pt-PT | formal imperative, no *tu*/*você* | "Carregue o seu CV". Portugal says **CV**; "ficheiro", "carregar", "descarregar" — never "arquivo", "upload", "baixar" |
| fr-FR | *vous* | "CV" is the everyday word; "candidat", "recruteur" |
| de-DE | *Sie* | **Lebenslauf**; "Bewerbung"; "hochladen" |

**Terminology (keep consistent inside a language).**

| English | es | pt-BR | pt-PT | fr | de |
|---|---|---|---|---|---|
| CV / resume | CV / currículum | currículo | CV | CV | Lebenslauf |
| ATS | ATS (sistema de seguimiento de candidatos) | ATS (sistema de rastreamento de candidatos) | ATS (sistema de acompanhamento de candidaturas) | ATS (logiciel de suivi des candidatures) | ATS (Bewerbermanagementsystem) |
| ATS score | puntuación ATS | pontuação ATS | pontuação ATS | score ATS | ATS-Score |
| parser | analizador / parser | analisador / parser | analisador / parser | analyseur / parser | Parser |
| upload | subir | enviar | carregar | téléverser / importer | hochladen |
| recruiter | reclutador/a | recrutador/a | recrutador/a | recruteur/se | Recruiter / Personalverantwortliche |

Keep **ATS**, **PDF**, **DOCX**, **LLM** as is. "No LLM" may be written "sin IA"
where a human would; the facts (deterministic, no model call) must stay exact.

**SEO.** Title, description and h1 of the homepage and of each guide carry the
phrase people actually search. The tests cap title ≤ 70 chars and description
100–170. Primary phrases (verify against what you know of the market; they are
the targets, not a script):

| Locale | Homepage target phrases |
|---|---|
| es | revisar CV ATS gratis · comprobar CV ATS · puntuación ATS de tu CV · analizador de CV gratis |
| pt-br | verificador de currículo ATS grátis · analisar currículo ATS · pontuação ATS do currículo |
| pt-pt | verificador de CV ATS gratuito · analisar CV ATS · pontuação ATS do CV |
| fr | vérificateur de CV ATS gratuit · score ATS de son CV · analyser son CV ATS gratuitement |
| de | Lebenslauf ATS Check kostenlos · ATS Lebenslauf prüfen · CV Check kostenlos |

**Honesty.** The claims are factual and checkable: runs in the browser, no upload,
deterministic, no LLM, open source, heuristic not a guarantee. Never add claims the
code does not back (no "used by recruiters at…", no "guaranteed interviews").
Numbers in guides (25/15/35/15/10 rubric, 85 = good) must stay identical — they
come from `analyze.ts`.

**Do not invent legal or local-practice facts.** Where a guide is stronger with a
local note (a photo on a German CV, Europass in Portugal), only state it if it is
well-established and phrase it as a common convention, not a rule. When unsure,
leave it out.

**The sample CV in the builder** (`builder.sample`) must use realistic local data
(a plausible local city and phone format, local month names and the local word for
"present"), headings the scorer recognises, and must score at least as well as the
English one — `locales.test.ts` enforces it.

## Seeing a language while developing

`npm run dev` serves one `index.html`, and the Worker's 404 handling answers `/es/`
with a 404, so in development the language comes from the query string:
`http://localhost:5173/?lang=es`. That exercises the translated interface, scorer
and builder (everything that runs in the browser). To see the real prerendered pages,
URLs, hreflang and 404s run `npm run build && npx wrangler dev` and open
`http://127.0.0.1:8787/es/`.

## Validation

```bash
npm run lint
npm test              # includes src/i18n/locales.test.ts — the messages contract
npm run build         # tsc + vite + prerender (all languages)
npm run smoke:build   # every built page: lang, canonical, hreflang, JSON-LD, links, 404s…
```

`locales.test.ts` fails when a language: has a missing/extra key; leaves English in
place (>4% of strings unchanged); has a message function that drops its argument;
has an over-long title/description; or ships a builder sample that does not score
well with its own headings. `smoke-built.mjs` fails on a missing `hreflang`, a
dead internal link, a non-reciprocal alternate, a canonical that is not
self-referencing, a missing social card, an English URL that moved, or a sitemap
that does not list every page.

## Rollout of a new language

Order matters; each write needs the owner's go-ahead in this repo's workflow.

1. PR → green CI → merge → Cloudflare deploys.
2. `npm run indexnow` (submits the sitemap's URLs; the new ones are what matter).
3. Search Console (`sc-domain:cv.shykov.dev`): resubmit `sitemap.xml`; request
   indexing for each new homepage. International Targeting is gone from GSC —
   `hreflang` is the signal.
4. Bing Webmaster: resubmit the sitemap.
5. After 4–8 weeks, read GSC Performance filtered by country and by query for the
   new language; compare against the baseline recorded in `docs/ai-visibility.md`.

Do not add `Accept-Language` redirects, do not auto-translate on the fly, and do
not delete or move an English URL.

## Known limits

* Writing-style tab: English CVs only (above).
* The job-description keyword extractor has an English tech-skill lexicon
  (`SKILL_LEXICON`); in other languages it relies on word frequency, which is
  weaker. Its stop words are merged across languages.
* Numbers written with a decimal comma (`2,5×`) are not recognised as quantified
  impact; `30 %` with a space is not either.
* Guide bodies are translated, not independently researched per country. Local
  conventions that differ materially from the English text are noted per guide
  only where well established.
* The 404 page is generic per language, with no site search.
