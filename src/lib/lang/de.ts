import type { LangData } from './types.ts'

export const de: LangData = {
  code: 'de',
  scorerSections: {
    experience: [
      'berufserfahrung', 'beruflicher werdegang', 'werdegang', 'arbeitserfahrung', 'berufliche erfahrung', 'praktische erfahrung',
      'berufspraxis', 'erfahrung', 'berufliche stationen', 'beruflicher hintergrund', 'praxiserfahrung', 'berufsweg', 'karriere',
    ],
    education: [
      'ausbildung', 'bildung', 'bildungsweg', 'akademischer werdegang', 'schulbildung', 'studium', 'ausbildung und studium',
      'akademische ausbildung', 'hochschulbildung', 'hochschulausbildung', 'schulische ausbildung', 'bildungsabschlüsse',
    ],
    skills: [
      'kenntnisse', 'fähigkeiten', 'kompetenzen', 'fachkenntnisse', 'it-kenntnisse', 'technische kenntnisse', 'schlüsselqualifikationen',
      'skills', 'fachliche kompetenzen', 'edv-kenntnisse', 'hard skills', 'soft skills', 'expertise', 'stärken',
    ],
    summary: [
      'profil', 'kurzprofil', 'zusammenfassung', 'berufsprofil', 'über mich', 'persönliches profil', 'berufsziel',
      'berufliches profil', 'kurzvorstellung', 'zur person', 'kurzbeschreibung', 'persönliche zusammenfassung',
    ],
    achievements: ['erfolge', 'leistungen', 'errungenschaften', 'highlights', 'wichtigste erfolge', 'besondere erfolge', 'meilensteine'],
    projects: ['projekte', 'projekterfahrung', 'ausgewählte projekte', 'eigene projekte', 'relevante projekte'],
    certifications: [
      'zertifikate', 'zertifizierungen', 'weiterbildung', 'kurse', 'lizenzen', 'fortbildung', 'weiterbildungen',
      'schulungen', 'seminare', 'zertifikate und weiterbildung', 'lizenzen und zertifikate',
    ],
  },
  parserSections: {
    summary: [
      'profil', 'kurzprofil', 'zusammenfassung', 'berufsprofil', 'über mich', 'persönliches profil', 'berufsziel',
      'berufliches profil', 'kurzvorstellung', 'zur person', 'kurzbeschreibung', 'persönliche zusammenfassung',
    ],
    experience: [
      'berufserfahrung', 'beruflicher werdegang', 'werdegang', 'arbeitserfahrung', 'berufliche erfahrung', 'praktische erfahrung',
      'berufspraxis', 'erfahrung', 'beschäftigung', 'berufliche stationen', 'beruflicher hintergrund', 'praxiserfahrung', 'berufsweg',
      'karriere', 'praktika', 'praktische tätigkeiten',
    ],
    education: [
      'ausbildung', 'bildung', 'bildungsweg', 'akademischer werdegang', 'schulbildung', 'studium', 'ausbildung und studium',
      'akademische ausbildung', 'hochschulbildung', 'hochschulausbildung', 'schulische ausbildung', 'bildungsabschlüsse',
    ],
    skills: [
      'kenntnisse', 'fähigkeiten', 'kompetenzen', 'fachkenntnisse', 'it-kenntnisse', 'technische kenntnisse', 'schlüsselqualifikationen',
      'skills', 'technologien', 'fachliche kompetenzen', 'edv-kenntnisse', 'hard skills', 'soft skills', 'expertise', 'stärken',
    ],
    projects: ['projekte', 'projekterfahrung', 'ausgewählte projekte', 'eigene projekte', 'relevante projekte'],
    certifications: [
      'zertifikate', 'zertifizierungen', 'weiterbildung', 'kurse', 'lizenzen', 'fortbildung', 'weiterbildungen',
      'schulungen', 'seminare', 'zertifikate und weiterbildung', 'lizenzen und zertifikate',
    ],
    languages: ['sprachen', 'sprachkenntnisse', 'fremdsprachen'],
    interests: ['interessen', 'hobbys', 'hobbies', 'interessen und hobbys', 'freizeit', 'privates'],
    awards: ['auszeichnungen', 'preise', 'ehrungen', 'erfolge', 'wichtigste erfolge', 'besondere erfolge', 'stipendien'],
    other: [
      'veröffentlichungen', 'publikationen', 'ehrenamt', 'ehrenamtliches engagement', 'ehrenamtliche tätigkeit', 'soziales engagement',
      'referenzen', 'kontakt', 'persönliche daten', 'persönliche angaben', 'angaben zur person', 'führerschein', 'mitgliedschaften',
    ],
  },
  actionVerbs: [
    // Erste Person Präteritum (Satzanfang ohne „ich“)
    'leitete', 'führte', 'entwickelte', 'implementierte', 'konzipierte', 'erstellte', 'startete', 'verbesserte', 'reduzierte',
    'steigerte', 'koordinierte', 'optimierte', 'automatisierte', 'migrierte', 'verhandelte', 'stellte', 'betreute', 'analysierte',
    'baute', 'lieferte', 'skalierte', 'etablierte', 'verantwortete', 'organisierte', 'plante', 'setzte', 'erreichte', 'gestaltete',
    'begleitete', 'unterstützte', 'verwaltete', 'gründete', 'steuerte', 'senkte', 'verkürzte', 'erhöhte', 'beriet', 'schulte',
    'übernahm', 'entwarf', 'schuf', 'gewann', 'sicherte', 'testete', 'programmierte', 'pflegte', 'bearbeitete', 'initiierte',
    'realisierte', 'trieb', 'erweiterte', 'modernisierte', 'strukturierte', 'überarbeitete', 'präsentierte', 'akquirierte',
    'förderte', 'stärkte', 'vereinfachte', 'beschleunigte', 'arbeitete',
    // Infinitiv
    'leiten', 'führen', 'entwickeln', 'implementieren', 'konzipieren', 'erstellen', 'aufbauen', 'verbessern', 'reduzieren',
    'steigern', 'koordinieren', 'optimieren', 'automatisieren', 'migrieren', 'verhandeln', 'betreuen', 'analysieren', 'liefern',
    'skalieren', 'etablieren', 'verantworten', 'organisieren', 'planen', 'umsetzen', 'erreichen', 'gestalten', 'begleiten',
    'verwalten', 'steuern', 'senken', 'verkürzen', 'erhöhen', 'beraten', 'schulen', 'übernehmen', 'entwerfen', 'sichern',
    'testen', 'programmieren', 'pflegen', 'initiieren', 'realisieren', 'einführen', 'einstellen', 'durchführen',
    // Nominalstil, wie er in deutschen Lebensläufen üblich ist
    'leitung', 'aufbau', 'entwicklung', 'verantwortung', 'koordination', 'optimierung', 'einführung', 'führung', 'konzeption',
    'konzeptionierung', 'implementierung', 'erstellung', 'planung', 'umsetzung', 'durchführung', 'betreuung', 'steuerung',
    'verbesserung', 'reduzierung', 'senkung', 'steigerung', 'erhöhung', 'verkürzung', 'automatisierung', 'migration', 'analyse',
    'beratung', 'schulung', 'einstellung', 'weiterentwicklung', 'ausbau', 'pflege', 'wartung', 'sicherstellung', 'unterstützung',
    'mitarbeit', 'organisation', 'verhandlung', 'gestaltung', 'projektleitung', 'teamleitung', 'recruiting', 'mentoring',
    'modernisierung', 'neuaufbau', 'erarbeitung', 'prüfung', 'überwachung', 'abwicklung', 'begleitung', 'zusammenarbeit',
    'vertrieb', 'akquise', 'testing', 'inbetriebnahme', 'bearbeitung', 'verwaltung', 'beschaffung',
  ],
  impactUnits: [
    'nutzer', 'nutzern', 'personen', 'mitarbeiter', 'mitarbeitern', 'mitarbeitende', 'mitarbeitenden', 'ingenieure', 'ingenieuren',
    'entwickler', 'entwicklern', 'kunden', 'stunden', 'tage', 'tagen', 'wochen', 'monate', 'monaten', 'jahre', 'jahren',
    'mio', 'mrd', 'tsd', 'prozent', 'euro', 'projekte', 'projekten', 'länder', 'ländern', 'standorte', 'standorten',
    'teammitglieder', 'teammitgliedern', 'teilnehmer', 'teilnehmern', 'systeme', 'systemen', 'releases', 'sprints', 'schulungen',
    'k€', 'm€',
  ],
  months: [
    'jan', 'januar', 'jänner', 'jän', 'feb', 'februar', 'mär', 'mrz', 'märz', 'maerz', 'apr', 'april', 'mai', 'jun', 'juni', 'jul', 'juli',
    'aug', 'august', 'sep', 'sept', 'september', 'okt', 'oktober', 'nov', 'november', 'dez', 'dezember',
  ],
  ongoing: ['heute', 'aktuell', 'derzeit', 'zurzeit', 'gegenwart', 'gegenwärtig', 'jetzt', 'laufend', 'bis dato'],
  degreeWords: [
    'bachelor', 'master', 'diplom', 'promotion', 'doktor', 'magister', 'staatsexamen', 'ingenieur', 'b.sc', 'm.sc', 'abitur',
    'fachwirt', 'meister', 'mba', 'b. sc', 'm. sc', 'b.eng', 'm.eng', 'dipl.-ing', 'dipl.-inf', 'fachabitur',
    'fachhochschulreife', 'techniker', 'betriebswirt', 'wirtschaftsinformatik',
  ],
  stopwords: (
    'der die das ein eine einen einem einer eines und oder aber wenn dann für von zu in im ins an am auf aus bei beim mit nach vor über unter zwischen durch ohne um als ist sind sein war waren wird werden wurde kann können soll sollen hat haben hast bist seid wir uns unser unsere unseren unserem euch ihr ihre ihren ihrem ihrer sie er es du dich dir dein deine deinen deinem dieser diese dieses diesen jener welche welcher was wer wo wann warum wie auch außerdem mehr sehr viel viele andere anderen anderes solche einschließlich etc rolle team arbeit arbeiten arbeitest erfahrung jahre jahren fähigkeit stark ausgezeichnet gut gute großer helfen aufbauen verwenden nutzung genutzt innerhalb suchen suchst verstärken aufgaben anforderungen qualifikationen unternehmen kandidat kandidaten ideal wünschenswert woche tag tage monat monate jahr vorteile gehalt bewerben bewerbung position möglichkeit umfeld kultur menschen neu neue gern gerne machen gemacht dem den des zum zur vom nicht nur noch schon dass sowie bzw sich bis seit gegen dabei dazu damit bereits weitere weiteren idealerweise fundiert fundierte kenntnisse verfügst verfügen mitbringen bringst bieten vollzeit teilzeit unbefristet flexibel flexible mwd wmd gn stelle stellen aufgabe bereich bereiche zusammenarbeit'
  ).split(/\s+/),
  detectWords: ['der', 'die', 'das', 'und', 'von', 'mit', 'für', 'im', 'in', 'zu', 'ein', 'eine', 'den', 'auf', 'bei', 'erfahrung'],
}
