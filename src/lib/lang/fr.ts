import type { LangData } from './types.ts'

// French (France). Headings are matched as substrings of a short line (see
// hasHeader in analyze.ts), so a very short or generic entry would fire inside
// ordinary words: "cours" lives in "parcours" and "en cours", and "projet" in
// "chef de projet". Keep entries specific.
export const fr: LangData = {
  code: 'fr',
  scorerSections: {
    experience: ['expérience', 'expérience professionnelle', 'expériences professionnelles', 'parcours professionnel', 'historique professionnel', 'expérience de travail', 'carrière'],
    education: ['formation', 'formations', 'études', 'parcours académique', 'parcours universitaire', 'formation académique', 'diplômes', 'scolarité', 'éducation', 'cursus'],
    skills: ['compétences', 'compétences clés', 'compétences techniques', 'savoir-faire', 'connaissances', 'expertise', 'expertises', 'aptitudes', 'environnement technique', 'stack technique'],
    summary: ['profil', 'profil professionnel', 'résumé', 'résumé professionnel', 'synthèse', 'objectif', 'objectif professionnel', 'à propos', 'à propos de moi', 'présentation', 'accroche'],
    achievements: ['réalisations', 'réalisations clés', 'principales réalisations', 'réussites', 'accomplissements', 'points forts', 'faits marquants'],
    projects: ['projets', 'projets personnels', 'projets marquants', 'projets open source'],
    certifications: ['certifications', 'certification', 'certificats', 'habilitations', 'formations complémentaires', 'licences', 'formations et certifications'],
  },
  parserSections: {
    summary: ['profil', 'profil professionnel', 'résumé', 'résumé professionnel', 'synthèse', 'objectif', 'objectif professionnel', 'à propos', 'à propos de moi', 'présentation', 'accroche'],
    experience: ['expérience', 'expérience professionnelle', 'expériences professionnelles', 'parcours professionnel', 'historique professionnel', 'expérience de travail', 'carrière', 'emploi', 'emplois'],
    education: ['formation', 'formations', 'études', 'parcours académique', 'parcours universitaire', 'formation académique', 'diplômes', 'scolarité', 'éducation', 'cursus'],
    skills: ['compétences', 'compétences clés', 'compétences techniques', 'savoir-faire', 'connaissances', 'expertise', 'expertises', 'aptitudes', 'technologies', 'environnement technique', 'stack technique'],
    projects: ['projets', 'projets personnels', 'projets marquants', 'projets open source'],
    certifications: ['certifications', 'certification', 'certificats', 'habilitations', 'formations complémentaires', 'licences', 'formations et certifications'],
    languages: ['langues', 'langue', 'langues étrangères'],
    interests: ['centres d’intérêt', 'centres d\'intérêt', 'centres d’intérêts', 'loisirs', 'intérêts', 'loisirs et centres d’intérêt', 'hobbies'],
    awards: ['distinctions', 'prix', 'récompenses', 'récompenses et distinctions', 'réalisations', 'réalisations clés'],
    other: ['publications', 'bénévolat', 'vie associative', 'références', 'contact', 'coordonnées', 'informations personnelles', 'permis de conduire', 'permis'],
  },
  // The first word of a bullet, accents ignored. French CVs mostly open with the
  // past participle ("Piloté une équipe de…", the subject dropped), sometimes the
  // infinitive ("Piloter…") or the present ("Pilote…"). Nominal openers
  // ("Pilotage de…", "Mise en place de…") are deliberately not counted: they are
  // not verbs.
  actionVerbs: [
    'dirigé', 'géré', 'développé', 'conçu', 'créé', 'lancé', 'amélioré', 'réduit', 'augmenté', 'coordonné', 'optimisé',
    'automatisé', 'migré', 'négocié', 'recruté', 'formé', 'analysé', 'construit', 'livré', 'piloté', 'encadré', 'mené',
    'déployé', 'supervisé', 'réalisé', 'instauré', 'établi', 'accompagné', 'structuré', 'mis', 'conduit', 'implémenté',
    'animé', 'accru', 'élaboré', 'rédigé', 'renforcé', 'standardisé', 'simplifié', 'sécurisé', 'refondu', 'revu',
    'intégré', 'industrialisé', 'initié', 'organisé', 'planifié', 'proposé', 'réorganisé', 'résolu',
    'rationalisé', 'testé', 'documenté', 'maintenu', 'contribué', 'assuré', 'défini', 'étendu', 'fondé', 'identifié',
    'mesuré', 'modernisé', 'obtenu', 'présenté', 'prototypé', 'redéfini', 'réussi', 'sélectionné', 'stabilisé',
    'transformé', 'unifié', 'validé', 'accéléré', 'consolidé', 'diminué', 'doublé', 'triplé', 'multiplié', 'économisé',
    'généré', 'fiabilisé', 'remplacé', 'réécrit', 'cofondé', 'bâti', 'mobilisé', 'fédéré', 'supprimé', 'effectué',
    'orchestré', 'évalué', 'conseillé', 'audité', 'administré', 'configuré', 'exécuté', 'entraîné', 'embauché',
    'diffusé', 'publié', 'introduit', 'inauguré', 'remporté', 'décroché',
    'diriger', 'gérer', 'développer', 'concevoir', 'créer', 'lancer', 'améliorer', 'réduire', 'augmenter', 'coordonner',
    'optimiser', 'automatiser', 'migrer', 'négocier', 'recruter', 'former', 'analyser', 'construire', 'livrer', 'piloter',
    'encadrer', 'mener', 'déployer', 'superviser', 'réaliser', 'instaurer', 'établir', 'implémenter',
    'animer', 'accroître', 'élaborer', 'rédiger', 'renforcer', 'standardiser', 'simplifier', 'sécuriser', 'refondre',
    'intégrer', 'industrialiser', 'organiser', 'planifier', 'proposer', 'réorganiser', 'rationaliser', 'tester',
    'documenter', 'maintenir', 'contribuer', 'assurer', 'définir', 'fonder', 'identifier', 'moderniser', 'obtenir',
    'présenter', 'valider', 'accélérer', 'consolider', 'diminuer', 'doubler', 'générer', 'fiabiliser', 'remplacer',
    'mettre', 'participer', 'collaborer', 'conseiller', 'auditer', 'administrer', 'configurer', 'embaucher',
    'dirige', 'gère', 'développe', 'conçois', 'crée', 'lance', 'améliore', 'réduis', 'augmente', 'coordonne', 'optimise',
    'automatise', 'analyse', 'construis', 'livre', 'pilote', 'encadre', 'mène', 'déploie', 'supervise', 'réalise',
    'anime', 'élabore', 'rédige', 'renforce', 'sécurise', 'simplifie', 'organise', 'planifie', 'propose', 'teste',
    'documente', 'maintiens', 'assure', 'définis', 'identifie', 'modernise', 'valide', 'accélère', 'consolide',
    'conçoit', 'recrute', 'migre', 'négocie', 'intègre',
  ],
  impactUnits: [
    'utilisateurs', 'personnes', 'ingénieurs', 'développeurs', 'collaborateurs', 'salariés', 'membres', 'clients',
    'équipes', 'sites', 'projets', 'pays', 'applications', 'heures', 'jours', 'semaines', 'fois',
    'millions', 'milliards', 'm€', 'k€', 'euros', '€',
  ],
  months: [
    'janv', 'janvier', 'févr', 'fév', 'février', 'mars', 'avr', 'avril', 'mai', 'juin', 'juil', 'juill', 'juillet',
    'août', 'aout', 'sept', 'septembre', 'oct', 'octobre', 'nov', 'novembre', 'déc', 'décembre',
  ],
  ongoing: ['présent', 'actuel', 'actuelle', 'actuellement', 'aujourd[’\']hui', 'ce jour', 'en cours'],
  degreeWords: [
    'licence', 'master', 'mastère', 'doctorat', 'ingénieur', 'diplôme', 'bachelor', 'bts', 'dut', 'mba',
    'baccalauréat', 'bac', 'cycle ingénieur', 'maîtrise', 'deug', 'classes préparatoires',
  ],
  stopwords: (
    'le la les un une des du de d l et ou mais si alors pour par en dans sur sous avec sans entre depuis jusqu comme est sont être été sera seront peut peuvent doit doivent a ont nous notre nos votre vos vous ils elles leur leurs ce cet cette ces ça cela qui que quoi dont où quand pourquoi comment aussi également plus très beaucoup autres autre tel y compris etc rôle équipe travail travailler expérience années capacité solide excellent bon bonne grand aider construire utilisant utilisation utilisé au sein recherchons rejoindre responsabilités exigences qualifications entreprise candidat candidats idéal souhaité semaine jour jours mois année avantages salaire postuler poste opportunité environnement culture personnes nouveau nouvelle bien faire fait aux ses son sa mes mon ma tout tous toute toutes même chez vers après avant pendant lors selon afin ainsi donc ni ne pas moins déjà encore avons avez sommes êtes serez aura avoir qu mission missions principales cdi cdd'
  ).split(/\s+/),
  detectWords: ['le', 'la', 'les', 'de', 'des', 'du', 'et', 'en', 'dans', 'pour', 'avec', 'une', 'un', 'sur', 'au', 'expérience', 'est', 'nous', 'par', 'sont'],
}
