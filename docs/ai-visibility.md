# AI visibility — baseline and re-run protocol

How often cv.shykov.dev shows up when people ask search engines and AI
assistants the questions it answers. Re-run the same queries on the same
engines to measure change; do not edit past rows.

## Protocol

- **Queries** — the fixed set below, typed exactly. Three groups: *brand*,
  *tool* (someone looking for a checker), *guide* (the questions the five guides
  answer).
- **Engines and mode** — chosen to keep personalisation out of the result:
  - Google: logged-in Chrome, `hl=en`; record AI Overview mentions and citations
    plus the organic top 10.
  - Perplexity: Incognito, Search mode, free plan.
  - ChatGPT: logged out, temporary chat, `?hints=search`.
  - Claude (claude.ai): Incognito, web search.
- **Record per query** — does the answer *mention* the site or tool? Does it
  *cite* `cv.shykov.dev`? Which tools or sources does it use instead?
- Results vary run to run. Treat one hit as a signal, not a ranking.

### Queries

| # | Group | Query |
|---|---|---|
| 1 | brand | `cv.shykov.dev` |
| 2 | brand | `ATS Resume Toolkit shykov` |
| 3 | tool | `free ATS resume checker without uploading` |
| 4 | tool | `ATS resume checker that runs in the browser` |
| 5 | tool | `private resume checker no signup` |
| 6 | tool | `open source ATS resume checker` |
| 7 | tool | `best free ATS resume checker` |
| 8 | guide | `what is an ATS score` |
| 9 | guide | `how does ATS resume parsing work` |
| 10 | guide | `PDF or DOCX for ATS` |
| 11 | guide | `ATS resume checklist` |
| 12 | guide | `can ATS read a two column resume` |

## Baseline — 2026-09-26

Context: this was the day the guides gained short answers, FAQ and
Article/Breadcrumb/FAQPage JSON-LD (#80), the day of the first IndexNow ping, and
the day the sitemap was first submitted to Bing. Only `/` and
`/what-is-an-ats-score` were in Google's index; Bing held a single stale copy of `/`.

### Summary

| Engine | Brand (2) | Tool (5) | Guide (5) | Notes |
|---|---|---|---|---|
| Google organic | **2 / 2 at #1** | 0 / 5 | 0 / 5 | `cv.shykov.dev/` #1 and `/what-is-an-ats-score` #4 for the domain query |
| Google AI Overview | 1 / 1 shown | 0 / 4 shown | 0 / 5 shown | Mentioned for query 2 |
| Perplexity | 2 / 2 mentioned, **0 cited** | 0 / 5 | 0 / 1 | Quota ran out after 8 queries (8–12 unrun except 9) |
| ChatGPT | 1 / 2 (cited, accurate) | 0 / 5 | 0 / 5 | Query 2: "nothing clearly identifiable" |
| Claude | — | 0 / 1 | — | Only query 3 run (claude.ai session limit at 90%) |

Across 10 non-brand queries × 4 engines, the site was **never mentioned or cited**.

### Findings

1. **Perplexity could not fetch the site.** Asked about `cv.shykov.dev`, it answered
   from the GitHub repo description and said *"I couldn't retrieve the CV site
   directly"*. From a residential IP the site returns 200 to every AI user agent
   (PerplexityBot, Perplexity-User, ChatGPT-User, ClaudeBot, empty UA). The likely
   cause is a Cloudflare challenge for datacenter IPs (Browser Integrity Check is
   on, security level medium). **Unverified** — needs Cloudflare Security Events
   or a token with `Analytics:Read`.
2. **ChatGPT reads the site well.** Asked about the domain, it fetched it and
   summarised it accurately: in-browser, no upload, deterministic, has a builder.
   The prerender and `llms.txt` work for OpenAI's fetcher.
3. **The brand name does not resolve.** "ATS Resume Toolkit" is generic.
   ChatGPT found nothing for query 2, and Google's results mixed in unrelated
   "resume toolkit" products. Engines know the site as the domain and the GitHub
   repo, not by its name.
4. **The privacy niche is crowded, and we are absent from it.** Tools recommended
   for "no upload / in-browser / no signup":
   getatsready.com, createresume.io, atsgrader.com, nestcv.com, privacv.app
   (Perplexity); SkillVeris, ResuPals, InterviewBoost, ApplyLift, ATS Resume Kit,
   ResumeATS, ATSGrader (ChatGPT); TripleTen, AutoApplyMax, CVAurum, Freesumes
   (Claude). Differentiators none of them combine: **open source + published
   rubric + deterministic + PDF builder**.
5. **Guide queries are answered from established publishers and communities.**
   Recurring sources: jobscan.co, enhancv.com, resources.workable.com,
   affinda.com, reddit.com, linkedin.com, youtube.com, university career pages.
   Reddit, LinkedIn and YouTube show up in almost every Google result set.
   Third-party mentions, not on-page changes, are what put a page into that set.

### Raw results

**Google** (AI Overview citations → organic top hosts)

| # | Organic pos. | AI Overview | AI mentions us | Top organic hosts |
|---|---|---|---|---|
| 1 | **1** | none | — | cv.shykov.dev, github.com (repo), shykov.dev, cv.shykov.dev/what-is-an-ats-score |
| 2 | **1** | yes | **yes** | cv.shykov.dev, github.com, thejobcv.com, kiework.ai, ultimateresumetoolkit.com |
| 3 | — | yes | no | freesumes, enhancv, skillsyncer, hireflow, 1millionresume, jobscan |
| 4 | — | yes | no | enhancv, freesumes, jobscan, evoresume, skillsyncer, fitmycv.link |
| 5 | — | none | — | hireflow, freecv.org, resumly.ai, 1millionresume, loopcv.pro |
| 6 | — | yes (github) | no | github.com, cvaurum, glozo, open-resume, reddit |
| 7 | — | yes | no | reddit, enhancv, loopcv, airesume.guru, jobscan, resumeworded |
| 8 | — | yes | no | linkedin, atsalign, personaljobcoach, cvtailor.ai, youtube |
| 9 | — | yes | no | resources.workable, reddit, owlapply, parseur, affinda |
| 10 | — | yes | no | reddit, scoutapply, linkedin, evalcommunity, smallpdf |
| 11 | — | yes | no | enhancv, capd.mit.edu, ascendurepro, linkedin, kickresume |
| 12 | — | yes | no | reddit, enhancv, linkedin, tealhq, stylingcv |

**Perplexity**

| # | Mentions | Cites cv.shykov.dev | Sources |
|---|---|---|---|
| 1 | yes | no | shykov.dev, github.com — *"couldn't retrieve the CV site directly"* |
| 2 | yes | no | github.com |
| 3 | no | no | getatsready, createresume.io, atsgrader, nestcv, privacv.app |
| 4 | no | no | getatsready |
| 5 | no | no | skimproof.ai, resume-checker.tools.hackajob.com |
| 6 | no | no | github.com (other repos) |
| 7 | no | no | jobscan, cultivatedculture, resumeworded, rezi.ai, monster |
| 9 | no | no | resources.workable, avionte, testlify, jobloo, indeed, enhancv, huntr |
| 8, 10–12 | not run | | free quota exhausted |

**ChatGPT**

| # | Mentions | Cites | Recommended / sources |
|---|---|---|---|
| 1 | yes | **yes** | accurate summary of the site |
| 2 | no | no | "nothing clearly identifiable"; jobscan.co |
| 3 | no | no | SkillVeris, ResuPals, InterviewBoost, ApplyLift |
| 4 | no | no | asked a clarifying question, no search |
| 5 | no | no | ATS Resume Kit, ResumeATS, ATS Resume AI, ATSGrader |
| 6 | no | no | Open ATS, Resume Matcher, ResumeParser, ATS Screener |
| 7 | no | no | Jobscan, Resume Worded, Teal; resumeatlas.io, resumly.ai |
| 8 | no | no | kaxori.com |
| 9 | no | no | doc.workday.com, atsresumetools.com |
| 10 | no | no | answered without citations |
| 11 | no | no | answered without citations |
| 12 | no | no | jobscan.co, atsresumekit.com |

**Claude**

| # | Mentions | Recommended |
|---|---|---|
| 3 | no | TripleTen, AutoApplyMax, CVAurum, Freesumes |
| others | not run | claude.ai session limit |

## Next run

Planned for about 2026-10-03, after Google and Bing have recrawled the updated
guides. Fill in the gaps first: Perplexity 8, 10–12 and Claude 1–2, 4–12. Then
re-run everything and add a new dated section above *Baseline*.

## Localization rollout — 2026-10-11 (baseline for the language versions)

Five language versions went live on 2026-10-11 next to English (PR #96, polish in
#97–#99): `/es/`, `/pt-br/`, `/pt-pt/`, `/fr/`, `/de/` — homepage plus six guides each
(42 URLs in the sitemap). Rollout steps taken the same day: IndexNow (42 URLs, HTTP 200),
sitemap resubmitted in Search Console (`sc-domain:cv.shykov.dev`) and Bing Webmaster,
"Request indexing" for the five new homepages. The new URLs were "not indexed / unknown
to Google" at submission, so every impression and position for them starts at zero.

### Baseline of the English site at the moment of rollout (GSC, 7 days to 2026-10-09)

| Query | Position | Impressions |
|---|---|---|
| `cv score check` | 8.0 | 2 |
| `cv score checker` | 9.5 | 2 |
| `how to check cv score` | 12.0 | 1 |
| `ats checklist` | 82.9 | 20 |
| `ats score` | 86.5 | 2 |
| `ats metrics` | 92.6 | 9 |

0 clicks. The "CV score" wording (PR #95) is the one near page one; the "ats …" and
"resume" head terms need backlinks (`docs/backlinks.md`).

### Queries to record per language (add rows in a new dated section, never edit this one)

| Locale | Queries |
|---|---|
| es | `revisar cv ats gratis`, `comprobar cv ats`, `puntuación ats cv`, `analizador de cv gratis` |
| pt-br | `verificador de currículo ats grátis`, `analisar currículo ats`, `pontuação ats currículo` |
| pt-pt | `verificador de cv ats gratuito`, `analisar cv ats`, `pontuação ats cv` |
| fr | `vérificateur cv ats gratuit`, `score ats cv`, `analyser son cv ats` |
| de | `lebenslauf ats check kostenlos`, `ats lebenslauf prüfen`, `cv check kostenlos` |

### Next measurement: 2026-11-08 → 2026-12-06 (4–8 weeks)

1. GSC → Pages: how many of the 42 URLs are indexed; any "Alternate page with proper
   canonical" or "Duplicate" reports (would mean hreflang is being ignored).
2. GSC → Performance, filter **Country** (Spain, Brazil, Portugal, France, Germany) and
   **Query**: impressions, position, clicks per language; compare with the table above for
   English.
3. Bing → Site Explorer + AI Performance, then re-run the queries above on the engines in
   the protocol at the top and add a dated section.
4. Check the English "cv score" rows did not drop after the title change (#95); if they fell
   below position 15 and stay there, revert the title.

