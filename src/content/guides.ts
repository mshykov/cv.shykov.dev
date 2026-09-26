// Guide metadata: slug, title, description. Data only and deliberately tiny -
// the homepage imports it for its guide list, while the article bodies (in
// articles.tsx) are needed only by the build-time prerender and must stay out
// of the homepage bundle.
export interface Guide {
  slug: string
  /** <title> and the page h1. */
  title: string
  /** <meta name="description">, and the standfirst under the h1. */
  description: string
}

export const GUIDES: Guide[] = [
  {
    slug: 'what-is-an-ats-score',
    title: 'What Is an ATS Score, and What Does It Actually Measure?',
    description:
      'An ATS score measures how cleanly a machine can read your CV — not how good a candidate you are. Here is what the number covers, what it cannot see, and the myth to ignore.',
  },
  {
    slug: 'ats-checker-without-upload',
    title: 'ATS Resume Checkers That Do Not Upload Your CV',
    description:
      'Most resume checkers require you to upload your CV and hand over an email address. Here is what happens to the file, why it matters while you are still employed, and how a local-only check differs.',
  },
  {
    slug: 'pdf-or-docx-for-ats',
    title: 'PDF or DOCX for an ATS: Which Should You Send?',
    description:
      'Send a PDF, unless the application form asks for something else. The reasoning, the one PDF that will fail every time, and what to do when the employer names a format.',
  },
  {
    slug: 'how-ats-parsing-works',
    title: 'How ATS Resume Parsing Actually Works',
    description:
      'What happens between uploading a CV and a recruiter seeing it: text extraction, section segmentation, entity extraction and search indexing — and where each stage breaks.',
  },
  {
    slug: 'ats-resume-checklist',
    title: 'The ATS Resume Checklist',
    description:
      'Fifteen concrete checks, ordered by how much damage each one does if you skip it — from unreadable files down to the finishing touches.',
  },
]
