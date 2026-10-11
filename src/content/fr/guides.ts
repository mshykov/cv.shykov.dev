// Guide metadata (français): slug, titre, description. Data only and deliberately
// tiny - the homepage imports it for its guide list, while the article bodies (in
// articles.tsx) are needed only by the build-time prerender.
import type { Guide } from '../types.ts'

export const GUIDES: Guide[] = [
  {
    id: 'what-is-an-ats-score',
    slug: 'score-ats-cv-cest-quoi',
    title: 'Score ATS d’un CV : c’est quoi, et que mesure-t-il vraiment ?',
    description:
      'Le score ATS mesure la facilité avec laquelle une machine lit votre CV, pas la qualité de votre candidature. Ce que le chiffre couvre, ce qu’il ne voit pas, et le mythe à oublier.',
  },
  {
    id: 'ats-checker-without-upload',
    slug: 'verificateur-cv-ats-sans-envoyer-son-cv',
    title: 'Vérificateur de CV ATS sans envoyer son CV : comment ça marche',
    description:
      'La plupart des vérificateurs de CV exigent un envoi du fichier et une adresse e-mail. Ce que devient le fichier, pourquoi cela compte quand on est encore en poste, et ce qui change avec une analyse purement locale.',
  },
  {
    id: 'pdf-or-docx-for-ats',
    slug: 'cv-pdf-ou-word-pour-ats',
    title: 'CV en PDF ou en Word (DOCX) pour un ATS : lequel envoyer ?',
    description:
      'Envoyez un PDF, sauf si le formulaire demande autre chose. Le raisonnement, le seul PDF qui échoue à tous les coups, et que faire quand l’employeur impose un format.',
  },
  {
    id: 'how-ats-parsing-works',
    slug: 'comment-un-ats-lit-un-cv',
    title: 'Comment un ATS lit un CV : l’analyse du CV, étape par étape',
    description:
      'Ce qui se passe entre l’envoi d’un CV et son affichage chez le recruteur : extraction du texte, découpage en rubriques, extraction des données et indexation, et où chaque étape peut échouer.',
  },
  {
    id: 'ats-resume-checklist',
    slug: 'checklist-cv-compatible-ats',
    title: 'La checklist du CV compatible ATS',
    description:
      'Quinze vérifications concrètes, classées selon les dégâts que cause leur oubli, des fichiers illisibles jusqu’aux finitions.',
  },
  {
    id: 'how-to-check-your-cv-score',
    slug: 'comment-verifier-le-score-de-son-cv-gratuitement',
    title: 'Comment vérifier gratuitement le score de son CV (et que corriger d’abord)',
    description:
      'Vérifiez le score de votre CV en quatre étapes, sans envoyer le fichier ni créer de compte. Ce que signifie le chiffre, ce qu’est un bon score et les corrections qui pèsent le plus.',
  },
]
