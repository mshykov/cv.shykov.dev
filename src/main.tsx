import './polyfills' // must run before anything that may load pdf.js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
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
