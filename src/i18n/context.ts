import { createContext, useContext } from 'react'
import type { Guide } from '../content/types.ts'
import type { Locale } from './locales.ts'
import type { Messages } from './messages/en.ts'

/** Everything one rendered page needs to speak its language. */
export interface LocaleBundle {
  locale: Locale
  messages: Messages
  /** This language's guide list: slug, title, description. Data only. */
  guides: Guide[]
}

const LocaleContext = createContext<LocaleBundle | null>(null)

export const LocaleProvider = LocaleContext.Provider

export function useLocale(): LocaleBundle {
  const bundle = useContext(LocaleContext)
  if (!bundle) throw new Error('useLocale: render inside <LocaleProvider>')
  return bundle
}

/** Shorthand: the messages of the current page. */
export function useMessages(): Messages {
  return useLocale().messages
}
