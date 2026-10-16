import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LOCALES } from '../i18n/locales.ts'
import { splitHeadline } from './headline.ts'

test('splits at the last sentence break', () => {
  assert.deepEqual(splitHeadline('Free CV ATS score checker. Private by default.'), {
    lead: 'Free CV ATS score checker.',
    mark: 'Private by default.',
  })
})

test('splits at a colon, including the French spaced one', () => {
  assert.deepEqual(splitHeadline('Vérificateur de CV ATS gratuit : votre score, sans envoi du fichier'), {
    lead: 'Vérificateur de CV ATS gratuit :',
    mark: 'votre score, sans envoi du fichier',
  })
})

test('a headline without a break is left whole', () => {
  assert.deepEqual(splitHeadline('One clause only'), { lead: 'One clause only', mark: '' })
  assert.deepEqual(splitHeadline('Ends with a stop.'), { lead: 'Ends with a stop.', mark: '' })
})

const EXPORT_NAME: Record<string, string> = { en: 'en', es: 'es', 'pt-br': 'ptBR', 'pt-pt': 'ptPT', fr: 'fr', de: 'de' }

test('every language headline has something to highlight', async () => {
  for (const { code } of LOCALES) {
    const mod = await import(`../i18n/messages/${code}.ts`)
    const { lead, mark } = splitHeadline(mod[EXPORT_NAME[code]].home.hero.h1)
    assert.ok(lead && mark, `${code}: headline did not split`)
  }
})
