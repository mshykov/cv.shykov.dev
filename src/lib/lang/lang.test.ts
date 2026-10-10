import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze } from '../analyze.ts'
import { matchJD } from '../jdmatch.ts'
import { parseResume } from '../parse.ts'
import { findDate, hasDate, normalizeHeader } from '../text.ts'
import type { Extracted } from '../pdf.ts'
import { en } from '../../i18n/messages/en.ts'
import { detectLanguage, fold } from './index.ts'

// A CV is read with every supported language at once. These fixtures are real-shaped
// CVs (headings, dates, bullets, numbers) in each language; each must pass the
// section, date and content checks without the page being in that language.

function ex(lines: string[]): Extracted {
  const text = lines.join('\n')
  return { pieces: [], lines, text, numPages: 1, charCount: text.replace(/\s/g, '').length, source: 'pdf' }
}
const score = (lines: string[]) => analyze(ex(lines), en.analysis)
const passes = (lines: string[], ids: string[]) => {
  const report = score(lines)
  for (const id of ids) assert.equal(report.checks.find((c) => c.id === id)?.status, 'pass', `${id}: ${JSON.stringify(report.checks.find((c) => c.id === id))}`)
  return report
}

const FIXTURES: Record<string, string[]> = {
  es: [
    'LAURA GARCÍA', 'laura.garcia@correo.es · +34 612 345 678 · linkedin.com/in/lauragarcia', 'Madrid, España',
    'PERFIL PROFESIONAL', 'Responsable de ingeniería con diez años de experiencia liderando equipos de producto y plataforma en empresas de tecnología.',
    'EXPERIENCIA LABORAL', 'Responsable de Ingeniería — Acme S.L. ene 2022 – actualidad',
    '• Lideré un equipo de 9 ingenieros en web y móvil', '• Reduje el tiempo de despliegue un 40 % con CI/CD', '• Contraté a 6 personas y definí el proceso de promoción',
    'FORMACIÓN', '• Grado en Ingeniería Informática — Universidad Politécnica de Madrid, 2010 – 2014',
    'HABILIDADES', 'Liderazgo, Gestión de equipos, Agile, CI/CD', 'PROYECTOS', '• Plataforma interna de métricas', 'CERTIFICACIONES', '• AWS Certified, 2021',
  ],
  pt: [
    'JOÃO SILVA', 'joao.silva@email.pt · +351 912 345 678 · linkedin.com/in/joaosilva', 'Lisboa, Portugal',
    'RESUMO PROFISSIONAL', 'Gestor de engenharia com dez anos de experiência a liderar equipas de produto e plataforma.',
    'EXPERIÊNCIA PROFISSIONAL', 'Gestor de Engenharia — Acme, Lda. jan 2022 – presente',
    '• Liderei uma equipa de 9 engenheiros em web e mobile', '• Reduzi o tempo de entrega em 40% com CI/CD', '• Contratei 6 pessoas e defini o processo de progressão',
    'FORMAÇÃO ACADÉMICA', '• Licenciatura em Engenharia Informática — Instituto Superior Técnico, 2010 – 2014',
    'COMPETÊNCIAS', 'Liderança, Gestão de equipas, Agile, CI/CD', 'PROJETOS', '• Plataforma interna de métricas', 'CERTIFICAÇÕES', '• AWS Certified, 2021',
  ],
  'pt-br': [
    'MARIA SOUZA', 'maria.souza@email.com.br · +55 11 91234-5678 · linkedin.com/in/mariasouza', 'São Paulo, Brasil',
    'RESUMO', 'Gerente de engenharia com dez anos de experiência liderando times de produto e plataforma.',
    'EXPERIÊNCIA PROFISSIONAL', 'Gerente de Engenharia — Acme Ltda. jan 2022 – atual',
    '• Liderei um time de 9 engenheiros em web e mobile', '• Reduzi o tempo de entrega em 40% com CI/CD', '• Contratei 6 pessoas e defini o processo de promoção',
    'FORMAÇÃO ACADÊMICA', '• Bacharelado em Ciência da Computação — USP, 2010 – 2014',
    'HABILIDADES', 'Liderança, Gestão de pessoas, Agile, CI/CD', 'PROJETOS', '• Plataforma interna de métricas', 'CERTIFICAÇÕES', '• AWS Certified, 2021',
  ],
  fr: [
    'CAMILLE DUBOIS', 'camille.dubois@exemple.fr · +33 6 12 34 56 78 · linkedin.com/in/camilledubois', 'Paris, France',
    'PROFIL', 'Responsable ingénierie avec dix ans d’expérience à la tête d’équipes produit et plateforme.',
    'EXPÉRIENCE PROFESSIONNELLE', 'Responsable Ingénierie — Acme SAS janv. 2022 – présent',
    '• Dirigé une équipe de 9 ingénieurs web et mobile', '• Réduit le délai de livraison de 40 % grâce au CI/CD', '• Recruté 6 personnes et structuré le parcours de promotion',
    'FORMATION', '• Master en informatique — Université Paris-Saclay, 2010 – 2014',
    'COMPÉTENCES', 'Leadership, Gestion d’équipe, Agile, CI/CD', 'PROJETS', '• Plateforme interne de métriques', 'CERTIFICATIONS', '• AWS Certified, 2021',
  ],
  de: [
    'ANNA SCHMIDT', 'anna.schmidt@beispiel.de · +49 151 23456789 · linkedin.com/in/annaschmidt', 'Berlin, Deutschland',
    'PROFIL', 'Engineering Manager mit zehn Jahren Erfahrung in der Leitung von Produkt- und Plattformteams.',
    'BERUFSERFAHRUNG', 'Engineering Manager — Acme GmbH 01/2022 – heute',
    '• Leitete ein Team von 9 Ingenieuren für Web und Mobile', '• Verkürzte die Release-Zeit um 40 % durch CI/CD', '• Stellte 6 Personen ein und baute den Beförderungsprozess auf',
    'AUSBILDUNG', '• Bachelor Informatik — Technische Universität Berlin, 2010 – 2014',
    'KENNTNISSE', 'Führung, Teamentwicklung, Agile, CI/CD', 'PROJEKTE', '• Interne Metrik-Plattform', 'ZERTIFIKATE', '• AWS Certified, 2021',
  ],
}

for (const [name, lines] of Object.entries(FIXTURES)) {
  test(`a ${name} CV is scored on its own headings, dates and bullets`, () => {
    const report = passes(lines, ['sec-exp', 'sec-edu', 'sec-skills', 'sec-summary', 'dates', 'email', 'phone', 'links', 'bullets'])
    assert.ok(report.score >= 80, `${name} fixture scored ${report.score}`)
    const checks = Object.fromEntries(report.checks.map((c) => [c.id, c]))
    assert.ok(checks['verbs'].points >= 3, `${name}: action verbs should be recognised (${checks['verbs'].detail})`)
    assert.ok(checks['quant'].points >= 3, `${name}: numbers with units should count (${checks['quant'].detail})`)
    assert.equal(checks['sec-bonus'].points, 6, `${name}: projects (3) + certifications (3) headings`)
  })

  test(`a ${name} CV parses into structured sections`, () => {
    const resume = parseResume(ex(lines))
    assert.ok(resume.experience.length >= 1, `${name}: experience entries`)
    assert.ok(resume.education.length >= 1, `${name}: education entries`)
    assert.ok(resume.skills.length >= 2, `${name}: skills`)
    assert.ok(resume.profile.email.includes('@'))
  })
}

test('headings fold accents, case and ß', () => {
  assert.equal(normalizeHeader('FORMAÇÃO ACADÊMICA'), 'formacao academica')
  assert.equal(normalizeHeader('Fähigkeiten'), 'fahigkeiten')
  assert.equal(normalizeHeader('À propos de moi'), 'a propos de moi')
  assert.equal(normalizeHeader('Schlüsselqualifikationen'), 'schlusselqualifikationen')
  assert.equal(normalizeHeader('Straße'), 'strasse')
  assert.equal(fold('Œuvre'), 'oeuvre')
})

test('dates in every supported language', () => {
  for (const sample of [
    'ene 2022 – actualidad', 'septiembre de 2021', 'mar 2019', 'jan 2022 – atual', 'março 2021', 'dez 2020', 'out 2021', 'set 2021',
    'janv. 2022 – présent', 'févr. 2020', 'août 2019', 'décembre 2018', 'Jan. 2022 – heute', 'März 2020', 'Okt 2019', 'Dezember 2018',
    '03/2022 – 09/2023', '3.2022', 'Juli 2020 – aktuell', 'desde 2019 hasta el presente',
  ]) assert.equal(hasDate(sample), true, sample)
})

test('words that look like another language’s month are not dates without a full year', () => {
  assert.equal(hasDate('pulled out 30 people from the pilot'), false)
  assert.equal(hasDate('set 40 goals for the team'), false)
  assert.equal(hasDate('led the work 5 days ago 12'), false)
  assert.equal(hasDate('out 2021'), true)
  assert.equal(hasDate('Managed 12 people'), false)
})

test('findDate reports the date itself, not the delimiter in front of it', () => {
  const match = findDate('Responsable — Acme (ene 2022 – actualidad)')
  assert.equal(match?.[0], 'ene 2022')
  assert.equal(match?.index, 'Responsable — Acme ('.length)
  const ongoing = findDate('Berlin, heute')
  assert.equal(ongoing?.[0], 'heute')
})

test('job-description matching folds accents and keeps them for display', () => {
  const jd = 'Buscamos experiencia en gestión de equipos. La gestión de equipos y la planificación son clave. Planificación ágil.'
  const cv = 'Gestion de equipos y planificacion agil en proyectos de producto.'
  const result = matchJD(cv, [], jd)
  const terms = [...result.matched, ...result.missing].map((k) => k.term)
  assert.ok(terms.includes('gestión'), `terms: ${terms.join(', ')}`)
  assert.ok(result.matched.some((k) => k.term === 'gestión'), 'gestion in the CV should match gestión in the ad')
  assert.ok(!terms.includes('buscamos'), 'stop words of the ad’s language are filtered')
})

test('language detection tells English from the rest, and stays quiet on short text', () => {
  const english = 'Led a team of eight engineers and shipped the platform with a focus on delivery. Worked with the product group to plan the roadmap for the year and mentored the team in the use of the tools. Responsible for the hiring and the onboarding of new engineers in the company and for the quality of the work.'
  assert.equal(detectLanguage(english), 'en')
  assert.equal(detectLanguage(FIXTURES.es.join(' ').repeat(2)), 'es')
  assert.equal(detectLanguage(FIXTURES.fr.join(' ').repeat(2)), 'fr')
  assert.equal(detectLanguage(FIXTURES.de.join(' ').repeat(2)), 'de')
  assert.equal(detectLanguage('Short text only'), 'unknown')
})

test('a heading must contain a keyword as a whole word', () => {
  const sections = (lines: string[]) => Object.fromEntries(score(lines).checks.filter((c) => c.id.startsWith('sec-')).map((c) => [c.id, c.status]))
  assert.equal(sections(['Informations personnelles'])['sec-edu'], 'fail')
  assert.equal(sections(['Sprachkenntnisse'])['sec-skills'], 'fail')
  assert.equal(sections(['Weiterbildung'])['sec-edu'], 'fail')
  assert.equal(sections(['Relevant Work Experience'])['sec-exp'], 'pass')
  assert.equal(sections(['Technical Skills & Tools'])['sec-skills'], 'pass')
  assert.equal(sections(['IT-Kenntnisse'])['sec-skills'], 'pass')
})
