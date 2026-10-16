# Cross-check against other free checkers (2026-10-16)

One CV, run through five other free checkers and this tool, to see whether this
tool's rubric is out of line with the field. **This is an anecdote, not a study:**
a single CV, written by the author of this tool, scored by the author's own tool.
It is recorded because a public question asked for evidence, and because it found
gaps.

## Method

The same CV (the author's own Engineering Manager CV, 2 pages, English) was uploaded
to each tool on 2026-10-16, by hand, from the tool's free tier. Numbers were read
off the result screen and screenshotted. The CV itself is not published. What each
number means differs from tool to tool, so they are **not** directly comparable.

## Results

| Tool | Result | What the number is | Sign-up needed to see it |
|---|---|---|---|
| Resume Worded | 70 / 100 | "30+ recruiter and ATS screening checks" | Yes, a free account (score shown only after registering) |
| AIResume.guru | 78 / 100 | 17 rule-based checks; capped at 86 until an AI review | No |
| Enhancv | 80 / 100 | 27 checks; the site says "there is no such thing as an ATS score" | No |
| Scale.jobs | 87 / 100 (content score 86) | keyword, structure and parse-rate score | No |
| Jobscan | 100 % match rate | match against a pasted job description, not a general score | Yes, plus a job description |
| This tool | 100 / 100 (writing style 94) | 100-point parseability rubric | No |

The four general scores range from 70 to 87 (mean about 79). This tool gave the same
CV 100, so **its rubric is more lenient than the others on this CV**. It was not
calibrated against them.

## What the others flagged that this tool does not

| Finding | Seen in | Tracked as |
|---|---|---|
| Graduation years more than 15 years old (age-bias risk) | AIResume.guru, Enhancv | [#106](https://github.com/mshykov/cv.shykov.dev/issues/106) |
| Resume over ~1,000 words | Jobscan | [#107](https://github.com/mshykov/cv.shykov.dev/issues/107) |
| A role with a single bullet; very short or very long bullets | AIResume.guru | [#108](https://github.com/mshykov/cv.shykov.dev/issues/108) |

Each has a `todo` test in `src/lib/benchmark.test.ts` that is switched on when the
rule ships.

## What it does not show

- It does not show that any tool's number predicts a hiring decision.
- It does not show which tool is right. A higher or lower number is not better.
- Free-tier terms and scoring change; re-run before quoting any of this.
