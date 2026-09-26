// Static guide pages, rendered to standalone HTML at build time by
// scripts/prerender.mjs. They ship no JavaScript at all - a guide is prose, and
// the app bundle would only slow it down.
//
// They live in src/ so Tailwind's scanner sees these class names and emits the
// same stylesheet the app uses. Do not move them outside src/ or the guides
// will render unstyled.
import type { ReactNode } from 'react'
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from './prose.tsx'
import { RUBRIC } from './rubric.ts'
import { GUIDES, type Guide } from './guides.ts'
import { BONUS_SECTION_KEYWORDS, SECTION_KEYWORDS } from '../lib/sections.ts'

export interface Article extends Guide {
  /** First publication; Article JSON-LD `datePublished`. */
  published: string
  /** Last substantive content change; `dateModified` and the sitemap lastmod. */
  updated: string
  /** Two or three plain sentences that answer the title outright. */
  summary: string
  body: ReactNode
  /** Plain-text answers: they are also emitted verbatim as FAQPage JSON-LD. */
  faq: { q: string; a: string }[]
}

function guide(slug: string): Guide {
  const meta = GUIDES.find((g) => g.slug === slug)
  if (!meta) throw new Error(`articles: no entry for "${slug}" in guides.ts`)
  return meta
}

const quoted = (words: string[]) => words.map((w) => `“${w}”`).join(', ')

const SECTION_ROWS = [
  ['Experience', quoted(SECTION_KEYWORDS.experience), '8'],
  ['Education', quoted(SECTION_KEYWORDS.education), '6'],
  ['Skills', quoted(SECTION_KEYWORDS.skills), '6'],
  ['Summary', quoted(SECTION_KEYWORDS.summary), '5'],
  ['Achievements', quoted(BONUS_SECTION_KEYWORDS.achievements), '4 (bonus)'],
  ['Projects', quoted(BONUS_SECTION_KEYWORDS.projects), '3 (bonus)'],
  ['Certifications', quoted(BONUS_SECTION_KEYWORDS.certifications), '3 (bonus)'],
]

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-09-26',
    summary:
      'An ATS score estimates how cleanly applicant tracking software can pull your text, contact details, sections and dates out of your CV. It says nothing about whether you fit the job. Above roughly 85, nothing important is getting lost — spend the time on the content instead.',
    body: (
      <>
        <P>
          An applicant tracking system is the software an employer uses to receive, store and search
          applications. Before a recruiter reads your CV, the system parses it: it pulls out your
          name, your contact details, your job titles, your dates and your skills, and writes them
          into database fields. An <strong>ATS score</strong> is an estimate of how well that step
          will go.
        </P>
        <P>
          That is a narrower claim than it sounds, and the narrowness is the point. The score does
          not know whether you are right for the job. It measures one thing: whether the document
          survives being read by a machine.
        </P>

        <H2>The myth worth dropping first</H2>
        <P>
          You have probably read that <em>“75% of resumes are rejected by an ATS before a human sees
          them.”</em> That figure has been repeated for over a decade and has no credible source
          behind it. Applicant tracking systems are search and storage tools. They rank and filter
          on criteria a recruiter sets; they do not autonomously bin three quarters of applicants.
        </P>
        <P>
          The real risk is duller and more fixable. If a parser cannot find your email, your
          application arrives with an empty contact field. If it cannot read your job titles, you do
          not appear in the recruiter's search for “engineering manager”. Nobody rejected you — you
          were never in the result set.
        </P>

        <H2>What a score can reasonably measure</H2>
        <P>
          Every honest ATS score is a heuristic built from a handful of checks. On this site the
          rubric is fixed at 100 points and published, so you can see exactly where each point comes
          from. In five groups:
        </P>
        <UL>
          <LI><strong>Parseability (25)</strong> — is there real, selectable text, or is the page an image?</LI>
          <LI><strong>Contact details (15)</strong> — email, phone, and a link written out as visible text.</LI>
          <LI><strong>Sections (35)</strong> — headings a parser recognises: Experience, Education, Skills, Summary.</LI>
          <LI><strong>Format (15)</strong> — page count, dated roles, real bullet structure.</LI>
          <LI><strong>Content (10)</strong> — quantified impact and verb-led bullets.</LI>
        </UL>
        <P>And check by check — this table is the one the scorer runs, not a summary of it:</P>
        <Table
          caption="ATS Resume Toolkit scoring rubric, check by check"
          head={['Check', 'Group', 'Points']}
          rows={RUBRIC.map((r) => [r.label, r.category, String(r.max)])}
        />
        <P>
          Two details are easy to miss. A missing phone number or summary only costs its own points —
          they are warnings, not failures — while a missing Experience, Education or Skills heading
          fails outright. And the last Sections row is a bonus: an Achievements heading is worth 4,
          Projects 3, Certifications 3.
        </P>
        <P>
          Sections carry the most weight because they are what turns a wall of text into structured
          data. A parser that finds a heading called “Experience” knows the entries beneath it are
          jobs. Without it, it is guessing.
        </P>

        <H2>What no score can measure</H2>
        <UL>
          <LI>Whether your experience matches the role. That is the recruiter's judgement.</LI>
          <LI>Which specific ATS the employer runs. Vendors parse differently, and none publish their rules.</LI>
          <LI>Whether your writing is persuasive. A perfectly parseable CV can still be dull.</LI>
        </UL>
        <P>
          Treat a score above roughly 85 as “nothing here will get lost in transit” and move on to
          the content. Chasing the last few points is almost always wasted effort.
        </P>

        <H2>Why two checkers give you two different scores</H2>
        <P>
          There is no standard ATS score. Each checker invents its own rubric, weights it however it
          likes, and — usually — does not tell you what it is. A 62 on one site and an 81 on another
          are not a contradiction; they are two different tests. The useful question is never
          “which number is right” but “which specific check failed, and do I agree it matters?”.
          That is only answerable when the rules are published.
        </P>

        <Note>
          <strong>Check yours in a few seconds.</strong> The{' '}
          <A href="/">ATS Resume Toolkit</A> scores a PDF or DOCX entirely inside your browser — the
          file is never uploaded, there is no account, and no language model is involved. You can
          read the exact scoring rules in the public source.
        </Note>

        <H2>Related</H2>
        <UL>
          <LI><A href="/how-ats-parsing-works">How ATS resume parsing actually works</A></LI>
          <LI><A href="/ats-resume-checklist">The ATS resume checklist</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'What is a good ATS score?',
        a: 'On this checker, 85 or above means a parser will read the document cleanly and nothing important is lost. 70 to 84 is good with a few specific fixes left. 50 to 69 needs work, usually a missing section heading or contact detail. Below 50 something structural is wrong, most often text the parser cannot extract.',
      },
      {
        q: 'Do employers see my ATS score?',
        a: 'Not a score from a checker like this one. It is computed on your device and sent nowhere. The employer’s own system may rank applications against the job, but that ranking uses its rules and the recruiter’s search terms, not any third-party score.',
      },
      {
        q: 'Why does my CV get a different score on every checker?',
        a: 'Because there is no standard. Each checker defines its own checks and weights. Compare the individual checks that failed rather than the headline numbers.',
      },
      {
        q: 'Is it true that 75% of resumes are rejected by an ATS?',
        a: 'That figure has circulated for over a decade without a credible source. Applicant tracking systems store and search applications; recruiters set the filters. The real risk is a CV the parser misreads, which then fails to appear in a recruiter’s search.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-09-26',
    summary:
      'A browser can read and score a PDF or DOCX without sending it anywhere, so an upload is a design choice, not a technical necessity. You can verify a checker yourself in under a minute: open the browser’s Network panel, drop your CV in, and look for a request that carries the file.',
    body: (
      <>
        <P>
          A CV is one of the most sensitive documents most people own. It carries your full name,
          your personal email, your phone number, your home city, and a complete timeline of who has
          employed you. Handing it to a website is a bigger decision than it feels like.
        </P>
        <P>
          It matters most in the situation people are usually in when they reach for a resume
          checker: <strong>job hunting while still employed.</strong> At that point the document is
          not just personal data, it is evidence of intent.
        </P>

        <H2>What “upload your resume” usually means</H2>
        <P>
          When a tool asks you to upload, the file leaves your device and lands on a server. From
          there, some combination of the following is normal and often disclosed in the terms:
        </P>
        <UL>
          <LI>The file is stored, sometimes indefinitely, and tied to the account you created.</LI>
          <LI>The text is sent to a third-party language model for scoring or rewriting.</LI>
          <LI>The email you registered with enters a marketing sequence.</LI>
          <LI>Aggregate data feeds a recruiting product sold to employers.</LI>
        </UL>
        <P>
          None of that is necessarily malicious. It is simply the business model: the check is free
          because you and your document are the product. But it is worth knowing before you click,
          rather than after.
        </P>

        <H2>The questions worth asking of any checker</H2>
        <UL>
          <LI><strong>Does the file leave the device?</strong> If there is no upload, most other questions stop mattering.</LI>
          <LI><strong>Is an account required?</strong> An email wall exists to capture the email, not to improve the score.</LI>
          <LI><strong>Is scoring deterministic or generated?</strong> If a model writes the feedback, your CV was sent to that model.</LI>
          <LI><strong>Can you read the rules?</strong> A published rubric can be argued with. A hidden one cannot.</LI>
          <LI><strong>What is the deletion path?</strong> If the answer is a support email, assume the file stays.</LI>
        </UL>

        <H2>How a local-only check works</H2>
        <P>
          Modern browsers can read a PDF or DOCX without any server involved. The file is opened
          into memory, the text is extracted by a JavaScript library, the checks run over that text,
          and the result is rendered — all inside the tab you already have open. Close the tab and
          the document is gone.
        </P>
        <P>
          The trade-off is real and worth stating: a local checker cannot compare you against a
          database of other candidates, and it cannot rewrite your bullets for you. What it can do
          is tell you whether a parser will read the document correctly, and which specific lines
          are weak — which is the part that actually affects whether your application arrives intact.
        </P>

        <H2>How to check that a checker really does not upload</H2>
        <P>
          “We never store your file” is a promise. Whether the file leaves your machine at all is
          something you can watch happen — or not happen — in any desktop browser:
        </P>
        <OL>
          <li>Open the checker, then open the browser’s developer tools: <Code>F12</Code> on Windows and Linux, <Code>⌥ ⌘ I</Code> on a Mac.</li>
          <li>Switch to the <strong>Network</strong> tab and clear it, so only new requests show.</li>
          <li>Drop your CV into the checker and wait for the result.</li>
          <li>
            Look through the new requests. An upload is a <Code>POST</Code> or <Code>PUT</Code> whose
            request size is roughly the size of your file. Scripts and fonts the page loads for itself
            are not uploads.
          </li>
        </OL>
        <P>
          If no request carries the file, the file did not leave. This works on any site, including
          this one — which is the point: the claim should be checkable by you, not taken on trust.
        </P>
        <P>
          This site adds a second, browser-enforced guarantee. Its Content-Security-Policy header sets{' '}
          <Code>connect-src 'self' data: blob:</Code>, which means the browser itself refuses any
          network connection to another domain, and the one domain it may talk to serves static files
          only — there is no endpoint to receive a CV.
        </P>

        <Note>
          <strong>This site is the local kind.</strong>{' '}
          <A href="/">ATS Resume Toolkit</A> parses your PDF or DOCX in the browser with{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> and{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          scores it with fixed rules, and has no backend that could receive a file. It is MIT
          licensed, so the claim is checkable rather than promised.
        </Note>

        <H2>Related</H2>
        <UL>
          <LI><A href="/what-is-an-ats-score">What an ATS score actually measures</A></LI>
          <LI><A href="/pdf-or-docx-for-ats">PDF or DOCX: which should you send?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Is it safe to upload my resume to an online resume checker?',
        a: 'It depends on what happens to the file, which is usually described only in the terms. Uploaded CVs are commonly stored, tied to an account, and sometimes sent to third-party language models. If you are job hunting while employed, prefer a checker that never receives the file.',
      },
      {
        q: 'How can a website read my CV without uploading it?',
        a: 'Browsers can open a file you select into the page’s own memory. JavaScript libraries such as pdf.js and mammoth then extract the text, and the checks run on your device. Nothing needs a server.',
      },
      {
        q: 'How do I know a resume checker is not uploading my file?',
        a: 'Open the browser’s developer tools, go to the Network tab, clear it, then drop your CV in. An upload shows up as a POST or PUT request roughly the size of your file. If there is none, the file stayed on your device.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-09-26',
    summary:
      'Send a text-based PDF unless the application asks for another format — then send exactly what it asks for. The only PDF that reliably fails is one with no real text in it, such as a scan or an export with outlined fonts, and you can test for that in seconds.',
    body: (
      <>
        <P>
          The short answer: <strong>send a text-based PDF, unless the employer asks for something
          else — in which case send exactly what they asked for.</strong> The longer answer is worth
          two minutes, because the usual advice (“always use Word, ATS cannot read PDFs”) is a decade
          out of date.
        </P>

        <H2>Why PDF is the default now</H2>
        <UL>
          <LI><strong>It looks the same everywhere.</strong> A DOCX re-flows depending on the fonts and Word version at the other end. Your careful two-page layout can arrive as three ragged pages.</LI>
          <LI><strong>Modern parsers handle it.</strong> PDF text extraction is a solved problem; the major systems have supported it for years.</LI>
          <LI><strong>It is harder to mangle.</strong> Nobody accidentally edits your PDF between upload and review.</LI>
        </UL>

        <H2>The one PDF that fails every time</H2>
        <P>
          A PDF is a container. It can hold real text, or it can hold a picture of text. If you
          exported from a design tool with the text outlined, or scanned a printout, or screenshotted
          your CV and saved it as a PDF, then the file contains <em>no text at all</em>. A parser
          reads it as a blank document.
        </P>
        <P>
          The test takes three seconds: open the PDF and try to select a line of text with your
          cursor. If you cannot highlight it, neither can the ATS.
        </P>

        <H2>A 30-second test for any PDF</H2>
        <P>Selecting text proves the text exists. Two more steps show whether it comes out usable:</P>
        <OL>
          <li><strong>Select a line.</strong> If nothing highlights, the page is an image. Re-export from the original document.</li>
          <li>
            <strong>Search for your email</strong> with <Code>Ctrl F</Code> / <Code>⌘ F</Code>. If
            the viewer cannot find it, a parser will not either — often because it lives in a header,
            an image, or a text box.
          </li>
          <li>
            <strong>Select all, copy, and paste into a plain-text editor</strong> (Notepad, or TextEdit
            in plain-text mode). What you see is close to what a parser receives. If two columns come
            out interleaved line by line, or your job titles appear far from their dates, fix the layout
            before you worry about anything else.
          </li>
        </OL>
        <P>
          Exporting from Word, Google Docs or Pages with their normal <em>Download as PDF</em> or{' '}
          <em>Export to PDF</em> produces text-based PDFs. The risky routes are “print to image”,
          scanning, and design tools with an option to convert text to outlines.
        </P>

        <H2>When DOCX is the right answer</H2>
        <UL>
          <LI><strong>The form says so.</strong> If the upload field lists <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code> only, that is the answer. Do not out-clever the form.</LI>
          <LI><strong>A recruiter asked for it.</strong> Agencies often re-brand your CV onto their template, which needs an editable file.</LI>
          <LI><strong>The employer runs an older system.</strong> Rare now, but harmless to comply with.</LI>
        </UL>

        <H2>Things that matter more than the extension</H2>
        <P>
          Format is the easiest decision you will make about your CV. These are the ones that
          actually move the needle:
        </P>
        <UL>
          <LI><strong>One column.</strong> Multi-column layouts can be read in the wrong order, interleaving two unrelated lines.</LI>
          <LI><strong>No text inside images.</strong> A logo is fine; your job title rendered as a graphic is not.</LI>
          <LI><strong>No critical detail in the header or footer.</strong> Some parsers skip those regions. Put your email in the body.</LI>
          <LI><strong>Real bullet characters,</strong> not manually drawn dashes inside a table cell.</LI>
          <LI><strong>A sensible filename</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Firstname_Lastname_CV.pdf</code>. A human sees it in a folder of hundreds.</LI>
        </UL>

        <Note>
          <strong>Not sure which category your file falls into?</strong> Drop it on the{' '}
          <A href="/">ATS Resume Toolkit</A> — it reads both PDF and DOCX in your browser and tells
          you straight away whether there is extractable text, how many pages a parser sees, and
          which sections it managed to identify.
        </Note>

        <H2>Related</H2>
        <UL>
          <LI><A href="/how-ats-parsing-works">How ATS resume parsing actually works</A></LI>
          <LI><A href="/ats-resume-checklist">The ATS resume checklist</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Can an ATS read a PDF resume?',
        a: 'Yes, as long as the PDF contains real text. Modern applicant tracking systems extract text from PDFs routinely. A scanned or image-only PDF has no text to extract and reads as blank.',
      },
      {
        q: 'Should I send .doc or .docx?',
        a: 'Prefer .docx, the current Word format, unless the employer specifically asks for .doc. Better still, send a text-based PDF unless the form limits you to Word files.',
      },
      {
        q: 'How do I know if my PDF is text-based?',
        a: 'Open it and try to highlight a line with your cursor, then search for your email address. If you can select text and the search finds your email, the PDF is text-based.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-09-26',
    summary:
      'An ATS parses a CV in four mechanical stages: it extracts the text, splits it into sections by their headings, pulls out entities such as email, dates and job titles, and indexes the result for recruiters to search. Nearly every piece of CV formatting advice exists because one of those stages breaks.',
    body: (
      <>
        <P>
          Most CV advice treats the applicant tracking system as a black box with opinions. It is
          simpler than that. Parsing runs in stages, each one mechanical, and almost every piece of
          real formatting advice is downstream of a specific stage failing.
        </P>

        <H2>Stage 1 — Text extraction</H2>
        <P>
          The file is opened and characters are pulled out of it. For a DOCX this is mostly reading
          XML. For a PDF it is harder: a PDF does not store lines or paragraphs, it stores fragments
          of text with coordinates. Reconstructing “this fragment and that fragment are on the same
          line” is geometry, and it is where multi-column layouts fall apart — two columns can be
          stitched into one nonsensical line.
        </P>
        <P>
          Here is what that looks like. A two-column CV, as a reader sees it, and the text a
          line-by-line extractor — this site’s included — actually gets back:
        </P>
        <Pre label="What the reader sees">{`EXPERIENCE                        SKILLS
Engineering Manager, Acme         Kubernetes, Go
Jan 2020 – now                    Terraform, AWS`}</Pre>
        <Pre label="What the parser receives">{`EXPERIENCE SKILLS
Engineering Manager, Acme Kubernetes, Go
Jan 2020 – now Terraform, AWS`}</Pre>
        <P>
          Every line is now a hybrid. The Experience heading shares a line with Skills, your job title
          has two skills glued to it, and the date range is followed by cloud providers. Nothing was
          lost — it was just put back together in the wrong order, which for a parser is the same thing.
        </P>
        <P><strong>Fails when:</strong> the page is an image, the text is outlined, or the layout is multi-column.</P>

        <H2>Stage 2 — Section segmentation</H2>
        <P>
          The text is cut into regions by looking for headings. This is why the boring heading beats
          the clever one: a parser matching against a list of known words finds{' '}
          <em>Experience</em>, <em>Work Experience</em> and <em>Employment History</em>. It does not
          find <em>Where I've Made a Dent</em>.
        </P>
        <P>
          To make this concrete: these are the exact headings this site’s checker looks for. It
          accepts a short line — 45 characters or fewer, in any capitalisation — that contains one
          of them, so <em>Relevant Work Experience</em> counts as Experience.
        </P>
        <Table
          caption="Section headings the ATS Resume Toolkit recognises"
          head={['Section', 'Headings it accepts', 'Points']}
          rows={SECTION_ROWS}
        />
        <P>
          Commercial parsers use longer lists, but the principle is identical — and none of them has
          your invented heading on it.
        </P>
        <P><strong>Fails when:</strong> headings are creative, styled only by colour, or absent.</P>

        <H2>Stage 3 — Entity extraction</H2>
        <P>
          Within each section the parser looks for specific things: an email is a pattern, a phone
          number is a pattern, a date range marks the start of a role. Job title and employer are
          inferred from position relative to the date.
        </P>
        <P>
          This is why <strong>dates matter more than people expect</strong>. A dated line is the
          anchor that tells the parser “a new job starts here”. Undated roles collapse into whatever
          came before them, and your three years somewhere land inside the previous employer's entry.
        </P>
        <P><strong>Fails when:</strong> dates are missing, written only as “2 yrs”, or drawn as a graphic timeline.</P>

        <H2>Stage 4 — Indexing and search</H2>
        <P>
          The extracted fields go into a database. A recruiter then searches it — by title, by skill,
          by location. Your CV is not being judged at this point; it is being <em>queried</em>.
        </P>
        <P>
          Which reframes the keyword question. The goal is not to stuff terms in to please an
          algorithm. It is to make sure the words a recruiter would plausibly type appear somewhere
          you have honestly earned them. If you led Kubernetes migrations and never wrote the word
          “Kubernetes”, you will not be in that result set.
        </P>
        <P><strong>Fails when:</strong> the vocabulary of your CV and the vocabulary of the job ad have no overlap.</P>

        <H2>What this implies</H2>
        <UL>
          <LI>Formatting advice is not superstition — each rule maps to a stage above.</LI>
          <LI>Keyword advice is about vocabulary overlap, not density. Never claim a skill you lack.</LI>
          <LI>Nothing in this pipeline evaluates you. It moves you into a searchable shape, or fails to.</LI>
        </UL>

        <Note>
          <strong>See it from the parser's side.</strong> The{' '}
          <A href="/">ATS Resume Toolkit</A> has an <em>Extracted data</em> tab that shows exactly
          what came out of your file — the name, contact details, links, and each role it managed to
          identify. If something is missing there, it will be missing for the employer too.
        </Note>

        <H2>Related</H2>
        <UL>
          <LI><A href="/what-is-an-ats-score">What an ATS score actually measures</A></LI>
          <LI><A href="/ats-checker-without-upload">Checkers that do not upload your CV</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Can an ATS read a two-column resume?',
        a: 'Often not in the right order. Text extraction rebuilds lines from positions on the page, so two columns can be stitched together line by line, mixing a job title with a skills list. A single-column layout avoids the problem entirely.',
      },
      {
        q: 'Do applicant tracking systems read headers and footers?',
        a: 'Some parsers skip those regions or treat them unreliably. Keep your name, email and phone number in the main body of the page so they are extracted whichever parser reads the file.',
      },
      {
        q: 'Does hiding keywords in white text help?',
        a: 'No. White text is still text: it is extracted into the parsed profile a recruiter reads, where it looks like an attempt to game the search. Use the job ad’s vocabulary only where you have genuinely earned it.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-09-26',
    summary:
      'Fix five things first: selectable text, your email in the body, a single column, standard section headings, and a date on every role. They decide whether the application arrives intact. Everything else decides whether it is found in a search, and then whether a human enjoys reading it.',
    body: (
      <>
        <P>
          Ordered by consequence, not by convention. The first group decides whether your application
          arrives at all; the last is polish. If you only have ten minutes, do the first group.
        </P>

        <H2>Critical — skip these and the application may not arrive</H2>
        <UL>
          <LI><strong>The text is selectable.</strong> Open the file and try to highlight a line. If you cannot, the parser sees a blank page.</LI>
          <LI><strong>Your email is plain text in the body.</strong> Not in the header, not only behind a mail icon, not only as a hyperlink.</LI>
          <LI><strong>One column.</strong> Sidebars are the single most common cause of scrambled extraction.</LI>
          <LI><strong>Standard section headings.</strong> Experience, Education, Skills, Summary. Boring wins here.</LI>
          <LI><strong>Every role carries dates.</strong> Month and year, in a consistent format, on the same line as the role.</LI>
        </UL>

        <H2>Important — these decide whether you show up in a search</H2>
        <UL>
          <LI><strong>Job titles are recognisable.</strong> If your internal title is “Delivery Ninja”, put the industry-standard title alongside it.</LI>
          <LI><strong>The vocabulary of the job ad appears</strong> — but only where you have honestly earned it.</LI>
          <LI><strong>A skills section exists,</strong> as plain comma-separated text rather than a chart of skill bars.</LI>
          <LI><strong>Your links are written out</strong> as visible text: <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/you</code>. A parser reads text, not link targets.</LI>
          <LI><strong>No text lives inside an image or a text box.</strong></LI>
        </UL>

        <H2>Worth doing — these are read by the human</H2>
        <UL>
          <LI><strong>Bullets start with a verb.</strong> Led, shipped, cut, rebuilt, owned.</LI>
          <LI><strong>Impact carries a number.</strong> “Improved reliability” is a claim; “crash-free sessions from 96% to 99.5%” is evidence.</LI>
          <LI><strong>No stock phrasing.</strong> “Results-driven professional with a proven track record” tells a reader nothing.</LI>
          <LI><strong>Length matches your career.</strong> One page early on, two is normal after a decade. Three needs a reason.</LI>
          <LI><strong>The filename is a name</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Firstname_Lastname_CV.pdf</code>, not <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">cv_final_v3_REAL.pdf</code>.</LI>
        </UL>

        <H2>Which of these a checker can verify for you</H2>
        <P>
          Most of the list is mechanical, so software can check it. Some of it is judgement, so it
          cannot. Here is the split for this site’s checker:
        </P>
        <H3>Checked automatically</H3>
        <UL>
          <LI>Selectable text, and clean character encoding</LI>
          <LI>Email, phone, and a profile link visible as text — it also flags a link that exists only as a hidden hyperlink</LI>
          <LI>Standard headings for Experience, Education, Skills and Summary, plus Achievements, Projects and Certifications</LI>
          <LI>Dates, bullet structure and page count</LI>
          <LI>Numbers in your bullets, and bullets that open with a verb</LI>
          <LI>Stock phrasing and vague claims, in the separate writing-style tab</LI>
          <LI>The job ad’s vocabulary, if you paste the ad into the job-description match</LI>
        </UL>
        <H3>Still on you</H3>
        <UL>
          <LI>Whether a sidebar or second column scrambles the reading order — use the copy-and-paste test</LI>
          <LI>Whether your job titles are ones a recruiter would search for</LI>
          <LI>Whether every keyword you added is one you have earned</LI>
          <LI>The filename</LI>
        </UL>

        <Note>
          <strong>Most of this list is checkable automatically.</strong> The{' '}
          <A href="/">ATS Resume Toolkit</A> runs the parseability, contact, section, format and
          content checks in your browser and orders the failures by how many points each one costs —
          so you fix the expensive things first. The writing-style tab covers the stock-phrasing and
          unquantified-claim items.
        </Note>

        <H2>Related</H2>
        <UL>
          <LI><A href="/how-ats-parsing-works">How ATS resume parsing actually works</A></LI>
          <LI><A href="/pdf-or-docx-for-ats">PDF or DOCX: which should you send?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'How long should an ATS-friendly resume be?',
        a: 'One page early in a career, two pages is normal after about a decade. Length does not stop a parser reading the file, but pages beyond the second are often not read by the recruiter.',
      },
      {
        q: 'Are tables and text boxes safe in an ATS resume?',
        a: 'Avoid them for anything important. Text inside text boxes can be skipped or extracted out of order, and tables used for layout create the same reading-order problems as columns. Plain paragraphs and bullet lists are safest.',
      },
      {
        q: 'What should I fix first on my resume for ATS?',
        a: 'Make sure the text is selectable, your email is in the body, the layout is a single column, section headings are standard, and every role has dates. Those five decide whether the application is read correctly at all.',
      },
    ],
  },
]
