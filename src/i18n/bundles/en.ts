import type { LocaleBundle } from '../context.ts'
import { GUIDES } from '../../content/en/guides.ts'
import { en } from '../messages/en.ts'

export const bundle: LocaleBundle = { locale: 'en', messages: en, guides: GUIDES }
