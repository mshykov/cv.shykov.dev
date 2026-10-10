// English — the source of truth for every string the interface and the build
// emit. Other languages are translations of this file, and TypeScript holds them
// to the same shape: `export const es: Messages = {...}` fails to compile if a
// key is missing, misspelled or has the wrong signature.
//
// Strings that carry a number or a name are functions, so each language can
// inflect them its own way (plurals, word order). Keep them pure.
//
// The guide pages are not here: their bodies are JSX and live in
// src/content/<locale>/. This file is the interface, the scorer's messages, the
// report export, the builder and the <head> of the homepage.

const number = (n: number) => n.toLocaleString('en-US')

export const en = {
  brand: 'ATS Resume Toolkit',

  // <head> of the homepage, its structured data and the social cards. Written for
  // search: the title, description and h1 carry the words people type there.
  meta: {
    title: 'Free CV ATS Score Checker | ATS Resume Checker, No Upload',
    description: 'Free CV score checker: get your CV or resume ATS score in seconds from a PDF or DOCX. Runs 100% in your browser. No upload, no signup, no AI.',
    ogTitle: 'Free CV ATS Score Checker',
    ogDescription: 'Free CV score checker: instant ATS score for PDF and DOCX. Browser-only, privacy-first, no uploads, no LLMs.',
    twitterDescription: 'Instant ATS resume score for PDF and DOCX files. Runs locally in your browser with no uploads and no LLMs.',
    ogImageAlt: 'Fast ATS resume score. Private by default. Runs in your browser with no uploads and no LLM calls.',
    appDescription: 'A free, privacy-first CV ATS score checker (ATS resume checker), job-description keyword matcher, and ATS-clean CV builder that runs in the browser.',
    featureList: [
      'Instant ATS resume score',
      'PDF and DOCX parsing',
      'Browser-only processing',
      'Job-description keyword matching',
      'Writing style check',
      'ATS-clean PDF export',
    ],
    // FAQPage structured data on the homepage.
    faq: [
      { q: 'What is an ATS score?', a: 'An ATS score is heuristic guidance for how easy a resume is for applicant tracking systems to parse, including readable text, standard sections, contact details, dates, bullets, and measurable impact.' },
      { q: 'Is my CV uploaded?', a: 'No. ATS Resume Toolkit processes PDF and DOCX files locally in your browser and does not upload resume content to a server.' },
      { q: 'Does this resume checker use AI?', a: 'No. The ATS score is deterministic and does not use LLMs, model calls, accounts, or API keys.' },
      { q: 'Can I check PDF and DOCX resumes?', a: 'Yes. ATS Resume Toolkit accepts PDF and DOCX files. Text-based PDFs provide the clearest page-count and parseability signals.' },
    ],
  },

  // The 404 page served for a mistyped URL in this language.
  notFound: {
    title: 'Page not found',
    heading: 'This page does not exist',
    body: 'The link may be out of date, or the address mistyped.',
    cta: 'Go to the ATS Resume Toolkit',
  },

  // Text drawn on the social-card image (scripts/og-images.mjs).
  og: {
    badge: '100% local resume analysis',
    headline: ['Fast ATS score.', 'Private by default.'],
    sub: ['Score PDF/DOCX files in seconds.', 'No uploads, accounts, or LLM calls.'],
    chips: ['Runs in browser', 'No uploads', 'No LLM'],
    cardLabel: 'Local parse',
    cardChips: ['No upload', 'No LLM', 'PDF/DOCX'],
  },

  languages: {
    label: 'Language',
    footerLabel: 'Also available in',
  },

  // The page around the tool.
  home: {
    header: {
      primaryMode: 'Primary app mode',
      analyze: 'Fast ATS Score',
      build: 'Build',
      github: 'GitHub',
      githubAria: 'Open source on GitHub',
    },
    hero: {
      badge: '100% local resume analysis',
      h1: 'Free CV ATS score checker. Private by default.',
      lead: 'Get your CV ATS score from a PDF or DOCX in seconds, see the highest-impact fixes first, match keywords, and build an ATS-clean resume without uploads, accounts, or LLM calls.',
      check: 'Check my resume',
      build: 'Build ATS-clean CV',
      runsInBrowser: 'Runs in your browser',
      noUploads: 'No uploads',
      noLlm: 'No LLM',
      pdfDocx: 'PDF & DOCX',
      openSource: 'Open source',
    },
    heroCard: {
      localParse: 'local parse',
      noUpload: 'No upload',
      noLlm: 'No LLM',
      pdfDocx: 'PDF/DOCX',
    },
    heroMini: {
      aria: 'Preview of local ATS scoring',
      localParse: 'Local parse',
      caption: 'Score, top fixes, keyword signals',
      categories: ['Parseability', 'Sections', 'Content'],
    },
    how: {
      aria: 'How the local ATS resume checker works',
      steps: [
        { title: 'Choose PDF/DOCX', body: 'Pick a resume file from your device.' },
        { title: 'Parse locally', body: 'Text extraction and scoring run in this browser.' },
        { title: 'Fix the top issues', body: 'See score, breakdown, keywords, and exportable notes.' },
      ],
      noServerUpload: 'No server upload',
      deterministic: 'Deterministic checks, no LLM calls',
      openSourceMit: 'Open source, MIT license',
    },
    loading: {
      score: 'Loading fast ATS score…',
      builder: 'Loading builder…',
    },
    trust: {
      aria: 'Privacy and trust notes',
      heading: 'Privacy claims you can inspect.',
      body: 'The code is open source under the MIT license, and the product promise stays narrow: local document parsing, deterministic scoring, no account wall, and no AI model call hidden behind the interface.',
      cards: [
        { title: 'Local parser', body: 'PDF and DOCX text is extracted in the browser with client-side libraries.' },
        { title: 'No LLM scoring', body: 'Scores come from repeatable checks for parseability, sections, format, and content signals.' },
      ],
      repoTitle: 'Open source on GitHub',
      repoBody: 'MIT-licensed. Read the scoring checks, parser, and export flow, open an issue, or send a pull request.',
    },
    faq: {
      aria: 'ATS resume checker FAQ',
      items: [
        { q: 'What is an ATS score?', a: 'A fast heuristic check for parser-friendly text, contact details, sections, dates, bullets, and measurable impact.' },
        { q: 'Is my CV uploaded?', a: 'No. PDF and DOCX files are processed locally in your browser and are not sent to a server.' },
        { q: 'Does this use AI?', a: 'No. The score is deterministic and does not use LLMs, model calls, accounts, or API keys.' },
        { q: 'PDF or DOCX?', a: 'Both work. Text-based PDFs give the clearest page-count and parseability signal.' },
      ],
    },
    guides: { aria: 'Guides', heading: 'Guides' },
    footer: {
      disclaimer: 'Heuristic guidance, not a guarantee. Built by',
      author: 'Maksym Shykov',
      noTracking: 'No tracking, no uploads, no accounts.',
      openSource: 'Open source on GitHub',
    },
    errorBoundary: {
      title: 'Something went wrong',
      body: 'This stays on your device — nothing was sent anywhere. Reloading usually fixes it.',
      reload: 'Reload',
    },
  },

  // Chrome of a guide page. The article itself comes from src/content/<locale>/.
  article: {
    check: 'Check my CV',
    breadcrumbAria: 'Breadcrumb',
    guidesCrumb: 'Guides',
    moreGuides: 'More guides',
    shortAnswer: 'Short answer',
    faqHeading: 'Frequently asked questions',
    published: 'Published',
    updated: 'Updated',
    by: 'by',
    footerRuns: 'runs in your browser.',
    footerNo: 'No uploads, no accounts, no tracking.',
    openSource: 'Open source on GitHub',
    bonusPoints: (points: number) => `${points} (bonus)`,
  },

  analyzer: {
    srHeading: 'Upload a resume for a fast ATS score',
    analyzed: 'Analyzed',
    analyzeAnother: 'Analyze another CV',
    dropBusy: 'Scoring your CV…',
    dropIdle: 'Drop your CV here for a fast ATS score',
    dropHint: 'PDF or DOCX · runs in your browser · no upload · no LLM',
    chooseFile: 'Please choose a PDF or DOCX file.',
    // `stage` is one of the stage names below.
    failed: (stage: string) => `Analysis failed while ${stage}. Please tap “Copy details” and send them to me.`,
    stages: { loading: 'loading modules', extracting: 'extracting text', analyzing: 'analyzing', parsing: 'parsing', style: 'checking style' },
    copyDetails: 'Copy details',
    scoreHeading: 'Fast ATS score',
    topFixes: 'Top fixes',
    downloadReport: '↓ Report',
    noPriorityFixes: 'No priority fixes found. The remaining report is mostly confirmation.',
    fix: 'Fix:',
    tabs: { analyze: 'Full report', style: 'Writing style', jd: 'Job match', data: 'Extracted data' },
    pages: (n: number) => `${n} ${n === 1 ? 'page' : 'pages'}`,
    reportMeta: (pages: string, words: string, chars: string) => `${pages ? `${pages} · ` : ''}${words} words · ${chars} readable characters.`,
    humanization: {
      title: 'Humanization score',
      blurb: 'How natural the writing reads: rhythm, filler, repeated openers, passive voice. Not an AI detector.',
      none: 'No writing habits flagged.',
      all: 'All writing checks →',
    },
    style: {
      counts: (sentences: number, words: number) => `${sentences} sentences, ${words} words`,
      intro: 'Deterministic writing checks, run on your device.',
      notDetector: 'This is not an AI detector',
      introRest: '— detecting machine-written text needs a language model, and published detectors are unreliable, especially against writers whose first language is not English. These are concrete habits you can fix instead.',
      englishOnly: 'These writing-style checks are built for English text, so the findings below are in English and may not fit a CV in another language.',
    },
    jd: {
      heading: 'Match against a job description',
      blurb: 'Paste the job posting. We extract the keywords it emphasizes and check which your CV already contains.',
      placeholder: 'Paste the full job description here…',
      button: 'Match keywords',
      coverage: 'keyword coverage',
      matchedOf: (matched: number, total: number) => `${matched}/${total} matched`,
      missing: 'Missing from your CV',
      missingHint: '(add the ones that are genuinely true)',
      covered: 'Already covered',
    },
    data: {
      profile: 'Profile',
      fields: { name: 'Name', email: 'Email', phone: 'Phone', location: 'Location', links: 'Links' },
      notDetected: 'not detected',
      profileNote: 'This is what an ATS-style parser pulls out. Blank fields in red usually mean a formatting issue.',
      experience: 'Experience',
      parsed: (n: number) => `(${n} parsed)`,
      bullets: (n: number) => `${n} bullet${n === 1 ? '' : 's'}`,
      noExperience: 'No experience entries parsed — check the section header and formatting.',
      education: 'Education',
      noneParsed: 'None parsed.',
      skills: 'Skills',
    },
  },

  // Messages of the scorer itself (src/lib/analyze.ts). Pure data + small
  // functions: the scorer decides pass/warn/fail and points, these say it.
  analysis: {
    formatNumber: number,
    categories: { Parseability: 'Parseability', Contact: 'Contact', Sections: 'Sections', Format: 'Format', Content: 'Content' },
    labels: {
      'machine-text': 'Machine-readable text',
      encoding: 'Clean text encoding',
      email: 'Email address',
      phone: 'Phone number',
      links: 'LinkedIn / website link',
      'sec-exp': 'Experience',
      'sec-edu': 'Education',
      'sec-skills': 'Skills',
      'sec-summary': 'Summary',
      'sec-bonus': 'Achievements / Projects / Certifications',
      pages: 'Page count',
      dates: 'Dated history',
      bullets: 'Bulleted structure',
      quant: 'Quantified impact',
      verbs: 'Strong action verbs',
    },
    bands: {
      excellent: 'Excellent — ATS-ready',
      good: 'Good — a few fixes left',
      needsWork: 'Needs work',
      filtered: 'Likely to be filtered out',
    },
    machineText: {
      pass: (chars: string) => `Extracted ${chars} characters of selectable text.`,
      warn: (chars: string) => `Only ${chars} characters extracted — parts may be images.`,
      warnFix: 'Export from your editor as text-based PDF (not “print to image” or a scan).',
      fail: 'Almost no selectable text — this looks like a scanned image.',
      failFix: 'An ATS reads text, not pictures. Re-export a real text-based PDF from Word/Docs/Pages.',
    },
    encoding: {
      pass: 'No ligature glyphs or broken character codes detected.',
      ligatures: 'Ligature glyphs found (e.g. “ﬁ”, “ﬂ”) — keyword search for words like “fintech”/“significant” will miss them.',
      cid: 'Broken character codes “(cid:…)” found in the text stream.',
      fix: 'Disable OpenType ligatures, or re-export with a standard font (Helvetica/Arial/Calibri).',
    },
    email: { found: 'Email found.', missing: 'No email address detected.', fix: 'Add your email as plain text near the top.' },
    phone: { found: 'Phone number found.', missing: 'No phone number detected.', fix: 'Add a phone number as plain text (include country code, e.g. +44…).' },
    links: {
      present: 'A profile or website link is present.',
      hidden: 'Clickable profile or website link target found, but the full URL is not visible as text.',
      missing: 'No LinkedIn/website link found.',
      fix: 'Add the full URL as visible text (e.g. linkedin.com/in/you) — parsers read text, not the link target.',
    },
    section: {
      detected: (label: string) => `“${label}” section detected.`,
      missing: (label: string) => `No “${label}” section header found.`,
      fix: (label: string) => `Add a clearly labeled ${label} section. Use a standard, ideally UPPERCASE, header.`,
    },
    bonus: {
      names: { achievements: 'Achievements', projects: 'Projects', certifications: 'Certifications' },
      found: (list: string) => `Found: ${list}.`,
      none: 'None of these supporting sections were found.',
      fix: 'Add the missing sections (Key Achievements is highest-value — recruiters scan it first).',
    },
    pages: {
      docx: 'Page count is not determinable from a DOCX — export to PDF to verify length (aim for 1–2).',
      ok: (n: number) => `${n} page${n > 1 ? 's' : ''} — within the expected 1–2.`,
      three: '3 pages — on the long side for most roles.',
      threeFix: 'Tighten older roles; aim for 2 pages unless you have 15+ years and deep history.',
      many: (n: number) => `${n} pages — too long; later pages often go unread.`,
      manyFix: 'Cut to 1–2 pages of the most relevant, recent experience.',
    },
    dates: {
      found: 'Dates detected — timeline is parseable.',
      missing: 'No clear dates found.',
      fix: 'Add start/end dates (e.g. “Feb 2023 – now”) to each role.',
    },
    bullets: {
      found: (n: number) => `${n} bullet lines detected.`,
      missing: 'Few or no bullet points found.',
      fix: 'Use bullet points for responsibilities/achievements — easier to parse and to scan.',
    },
    quant: {
      many: (n: number) => `${n} quantified results found (%, ×, counts).`,
      few: (n: number) => `Only ${n} quantified result(s).`,
      none: 'No numbers/metrics detected.',
      fix: 'Quantify impact: “cut release time 2.5×”, “grew the team to 14”, “−30% bugs”.',
    },
    verbs: {
      pass: (n: number) => `${n} bullets start with an action verb.`,
      warn: 'Few bullets start with an action verb.',
      fix: 'Start bullets with verbs: Led, Shipped, Reduced, Built, Owned…',
    },
  },

  // The Markdown report the Analyze tab downloads.
  report: {
    title: (fileName: string) => `CV ATS Report — ${fileName}`, // rendered as a # heading
    score: (score: number, band: string) => `Score: ${score}/100 — ${band}`, // rendered bold
    stats: (pages: string, words: string, chars: string) => `${pages} pages · ${words} words · ${chars} readable characters`,
    fix: 'Fix:', // rendered italic
    jdTitle: (coverage: number) => `Job-description match — ${coverage}% coverage`, // ## heading
    jdMatched: (matched: number, total: number) => `Matched ${matched}/${total} emphasized keywords.`,
    jdMissing: 'Missing keywords (consider adding if true):', // rendered bold
    profileTitle: 'Extracted profile', // ## heading
    fields: { name: 'Name', email: 'Email', phone: 'Phone', location: 'Location', links: 'Links' },
    experienceEntries: 'Experience entries parsed',
    educationEntries: 'Education entries parsed',
    skillsParsed: 'Skills parsed',
    footer: 'Generated locally by cv.shykov.dev — heuristic guidance, not a guarantee.', // rendered italic
    fileSuffix: '-ats-report.md',
  },

  builder: {
    intro: 'Build an ATS-clean resume with plain text, standard sections, and a live preview. Import an existing CV, tune the layout, then export a selectable single-column PDF.',
    liveScore: 'Live score',
    importCv: 'Import CV',
    exportPdf: '↓ Export PDF',
    working: 'Working…',
    exportFailed: 'Export failed.',
    importFailed: 'Could not import that file.',
    imported: (roles: number, file: string) => `Imported ${roles} roles from ${file}. Review and tweak below.`,
    // Headings of the exported CV. They must be headings the scorer recognises.
    docSections: { summary: 'Summary', experience: 'Experience', skills: 'Skills', projects: 'Projects', education: 'Education' },
    docTitle: (name: string) => `${name || 'Resume'} — CV`,
    fileName: (name: string) => `${(name || 'resume').replace(/\s+/g, '_')}_CV.pdf`,
    profile: {
      title: 'Profile',
      hint: 'Keep contact details plain-text so parsers can read them.',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      links: 'Links (comma-separated)',
      linksPlaceholder: 'linkedin.com/in/you, github.com/you',
      summary: 'Summary',
    },
    experience: {
      title: 'Experience',
      hint: 'Use action verbs, measurable impact, and one result per bullet.',
      add: 'Add',
      moveUp: 'Move role up',
      moveDown: 'Move role down',
      delete: 'Delete role',
      jobTitle: 'Title',
      company: 'Company',
      dates: 'Dates',
      datesPlaceholder: 'Jan 2022 – now',
      bullets: 'Bullets (one per line)',
      bulletsPlaceholder: 'Led a team of…\nReduced X by 30%…',
      empty: 'No roles yet — add one.',
    },
    skills: {
      title: 'Skills',
      hint: 'Separate skills by comma or line break; keep terms recruiter-friendly.',
      field: 'Skills (comma or new-line separated)',
    },
    projects: {
      title: 'Projects',
      hint: 'Optional, best for proof of ownership or portfolio-worthy work.',
      add: 'Add',
      delete: 'Delete project',
      name: 'Name',
      description: 'Description',
      empty: 'Optional.',
    },
    education: {
      title: 'Education',
      hint: 'Keep dates and degree names consistent with your experience section.',
      add: 'Add',
      delete: 'Delete education',
      degree: 'Degree',
      school: 'School',
      dates: 'Dates',
      empty: 'Add your degree(s).',
    },
    settings: {
      title: 'Document settings',
      blurb: 'Affects preview and exported PDF.',
      pagePreview: (size: string) => `${size} preview`,
      accent: 'Accent',
      useAccent: (color: string) => `Use ${color} accent`,
      customAccent: 'Choose custom accent',
      size: 'Size',
      spacing: 'Spacing',
      spacingOptions: { compact: 'Tight', standard: 'Std', relaxed: 'Airy' },
      page: 'Page',
      letter: 'Letter',
      template: 'Template',
      templates: { classic: 'Classic', modern: 'Modern' },
    },
    previewNote: 'Live preview · the exported PDF is single-column Helvetica, ATS-clean',
    // What the builder starts with. Dates and headings use this language's own
    // conventions, so the sample also scores well here.
    sample: {
      name: 'Alex Morgan',
      email: 'alex.morgan@email.com',
      phone: '+1 555 0100',
      location: 'Berlin, Germany',
      links: ['linkedin.com/in/alexmorgan', 'github.com/alexmorgan'],
      summary: 'Engineering Manager with 10+ years building and leading product teams. Shipped platforms at scale with a focus on delivery, quality, and engineering culture.',
      experience: [
        {
          title: 'Engineering Manager',
          company: 'Acme Corp',
          date: 'Jan 2022 – now',
          bullets: [
            'Led a cross-functional team of 9 engineers across web and mobile',
            'Cut release cycle time by 40% by streamlining CI/CD and review flow',
            'Hired and onboarded 6 engineers; ran growth and promotion process',
          ],
        },
      ],
      education: [{ school: 'Technical University', degree: "Bachelor's in Computer Science", date: '2010 – 2014' }],
      skills: ['Engineering Leadership', 'People Management', 'Agile', 'CI/CD', 'Hiring', 'Stakeholder Management'],
    },
  },

  // Aria text of the score ring.
  scoreRing: (score: number) => `Score ${score} out of 100`,
}

export type Messages = typeof en
