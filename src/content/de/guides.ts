// Ratgeber-Metadaten: Slug, Titel, Beschreibung. Nur Daten – die Startseite
// importiert sie für die Ratgeberliste, die Artikeltexte (articles.tsx) braucht
// nur der Prerender und gehören nicht ins Bundle der Startseite.
import type { Guide } from '../types.ts'

export const GUIDES: Guide[] = [
  {
    id: 'what-is-an-ats-score',
    slug: 'was-ist-ein-ats-score',
    title: 'Was ist ein ATS-Score und was misst er wirklich?',
    description:
      'Ein ATS-Score misst, wie sauber eine Maschine Ihren Lebenslauf lesen kann – nicht, wie gut Sie als Bewerber sind. Was die Zahl abdeckt, was sie nicht sehen kann und welchen Mythos Sie vergessen sollten.',
  },
  {
    id: 'ats-checker-without-upload',
    slug: 'ats-lebenslauf-check-ohne-upload',
    title: 'ATS-Lebenslauf-Check ohne Upload: Checker, die Ihren CV nicht hochladen',
    description:
      'Die meisten Lebenslauf-Checker verlangen, dass Sie Ihren CV hochladen und eine E-Mail-Adresse angeben. Was mit der Datei passiert, warum das bei laufendem Arbeitsverhältnis zählt und wie sich eine rein lokale Prüfung unterscheidet.',
  },
  {
    id: 'pdf-or-docx-for-ats',
    slug: 'lebenslauf-pdf-oder-docx-ats',
    title: 'Lebenslauf als PDF oder DOCX: Was liest ein ATS besser?',
    description:
      'Senden Sie ein PDF, es sei denn, das Bewerbungsformular verlangt etwas anderes. Die Begründung, das eine PDF, an dem jedes ATS scheitert, und was gilt, wenn der Arbeitgeber ein Format vorgibt.',
  },
  {
    id: 'how-ats-parsing-works',
    slug: 'so-funktioniert-ats-parsing-lebenslauf',
    title: 'So funktioniert das Parsing von Lebensläufen im ATS',
    description:
      'Was zwischen dem Hochladen eines Lebenslaufs und dem Blick des Recruiters passiert: Textextraktion, Abschnittserkennung, Extraktion von Angaben und Indexierung – und wo jede Stufe scheitern kann.',
  },
  {
    id: 'ats-resume-checklist',
    slug: 'ats-lebenslauf-checkliste',
    title: 'Die ATS-Checkliste für Ihren Lebenslauf',
    description:
      'Fünfzehn konkrete Prüfpunkte, geordnet danach, wie viel Schaden jeder anrichtet, wenn Sie ihn auslassen – von unlesbaren Dateien bis zum Feinschliff.',
  },
  {
    id: 'how-to-check-your-cv-score',
    slug: 'cv-check-kostenlos-ats-score-pruefen',
    title: 'CV Check kostenlos: Lebenslauf-Score prüfen und richtig verbessern',
    description:
      'Prüfen Sie Ihren CV-Score in vier Schritten – ohne Upload und ohne Konto. Was die Zahl bedeutet, was ein guter Score ist und welche Korrekturen am meisten bringen.',
  },
]
