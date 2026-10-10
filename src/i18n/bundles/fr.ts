import type { LocaleBundle } from '../context.ts'
import { GUIDES } from '../../content/fr/guides.ts'
import { fr } from '../messages/fr.ts'

export const bundle: LocaleBundle = { locale: 'fr', messages: fr, guides: GUIDES }
