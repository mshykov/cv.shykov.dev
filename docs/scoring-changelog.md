# Scoring changelog

A scoring tool should say when its scoring changes. This lists every change that moved
what a CV scores, or added a signal next to the score, newest first. The 100-point rubric
itself is published check by check, and a test fails if the published table drifts from the code.

The score is an estimate of how well a parser will read the file, not a prediction of a
hiring decision. See "Limitations And Bias" in the [README](../README.md).

## 2026-10-18

- **Ukrainian CVs are read** with Ukrainian section headings, month names, action verbs and units.
  Names with accents or Cyrillic letters are now found by the parser (previously only a-z names).

- **Not scored, new advice** (shown in a separate "Worth a look" card; none of it changes the score):
  - file name that looks like a scratch copy (`cv_final_v3`, `Resume (2)`);
  - a PDF Author that shares no word with the name on the CV, or a scratch Title;
  - PDF only: text in two or more columns, text laid out as a table, and contact details that
    appear only in a header or footer repeating on every page.
- A collapsed note under the result states what the page observed about its own requests
  since the file was chosen.
- Job match (keyword overlap, separate from the score): word forms and a short list of
  equivalents, "only in Skills" tags, "nice to have" keywords weigh half.
- The result now shows the change since the previous file analysed in the same session.

## 2026-10-17

Reported by a reader, reproduced, and fixed. **These changes can lower a score.**

- **A section heading only earns points when text follows it.** Bare Achievements, Projects
  and Certifications headings used to add up to 10 points with no content. A heading that
  carries its own text ("Skills: Go, Rust") still counts.
- **Writing style: text that is too short is not scored.** Empty text used to read 100/100;
  below two sentences or 15 words it now says "not enough text".
- **Writing style: a date no longer takes a sentence out of the checks.** Adding "in 2025" to
  five identical weak sentences lifted the style score from 58 to 86, because every line with
  a date was excluded and a year counted as a figure. Now only dated role headings are
  excluded, and a year is not a figure.
- A line under the score says it is an estimate, not a hiring prediction.
- New advice outside the score: more than 1,000 words, a role with a single bullet, a bullet
  past 40 words, and (English interface only) a graduation year more than 15 years old.

## 2026-10-11

- Spanish, Brazilian and European Portuguese, French and German. The scorer reads CVs in
  these languages with their own section headings; the writing-style check stays English-only.

## 2026-09-26

- Guides rewritten with the rubric table generated from the same data the scorer uses.

## 2026-08-27

- **Fix, can change a score:** three defects in the contact and date helpers, each worth 5
  of the 100 points. A real date after a non-month number on the same line was missed
  ("Reduced latency 300 ms in Jan 24"); metrics such as "96.5 99.5 99.9" and runs of years
  were reported as a phone number; a bare host such as a library name counted as a profile link.
- The writing-style check was added as a separate score that is not part of the 100 points and
  is not an AI detector.

## 2026-06-25

- A link that exists only as a hidden PDF target, not as visible text, is detected and
  reported as a warning instead of a pass.

## 2026-06-22

- First release: a 100-point rubric of 15 checks in five groups: Parseability 25, Contact 15,
  Sections 35, Format 15, Content 10.
