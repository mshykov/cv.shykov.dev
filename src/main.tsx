import './polyfills' // must run before anything that may load pdf.js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadLocale } from './i18n/load.ts'
import { DEFAULT_LOCALE, isLocale, localeFromHtmlLang, localeFromPath } from './i18n/locales.ts'

// The URL names the language (/es/ → Spanish) and the build writes the matching
// <html lang> into each page. The path comes first because the dev server serves
// every route from the one index.html, whose lang is always "en".
//
// In development the dev server answers /es/ with a 404 (the Worker's 404-page
// handling), so there the language comes from ?lang=es instead.
const fromQuery = import.meta.env.DEV ? new URLSearchParams(location.search).get('lang') : null
const fromPath = localeFromPath(location.pathname)
const locale = fromQuery && isLocale(fromQuery)
  ? fromQuery
  : fromPath === DEFAULT_LOCALE ? (localeFromHtmlLang(document.documentElement.lang) ?? DEFAULT_LOCALE) : fromPath
const bundle = await loadLocale(locale)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App bundle={bundle} />
  </StrictMode>,
)

// We no longer use a service worker — a cached one trapped iOS users on stale
// bundles. Proactively unregister any that remain (the kill-switch sw.js also
// self-destructs for clients still controlled by the old one).
if ('serviceWorker' in navigator) {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  } catch {
    // Best-effort cleanup only.
  }
}
