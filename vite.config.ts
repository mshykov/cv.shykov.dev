import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { readFileSync } from 'node:fs'

const debugSourcemaps = process.env.VITE_SOURCEMAPS === 'true'

// Mirror the production CSP (single source of truth: public/_headers) onto the
// `vite preview` server so we can verify the production build under the real
// CSP. NOT applied to the dev server — Vite's HMR relies on inline scripts that
// a strict `script-src 'self'` would block.
function prodCsp(): Record<string, string> {
  try {
    const txt = readFileSync(new URL('./public/_headers', import.meta.url), 'utf8')
    const m = txt.match(/Content-Security-Policy:\s*(.+)/i)
    return m ? { 'Content-Security-Policy': m[1].trim() } : {}
  } catch {
    return {}
  }
}

// Served at the root of a custom subdomain (cv.shykov.dev) -> base '/'.
// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), cloudflare()],
  preview: { headers: prodCsp() },
  build: {
    // Default deploys stay lean; use `npm run build:debug` when decoding a
    // production stack trace needs source maps.
    sourcemap: debugSourcemaps,
    // The only chunks near this size are intentionally lazy: pdf.js worker and
    // react-pdf/yoga for PDF export. Warn only if something grows past them.
    chunkSizeWarningLimit: 1500,
  },
})
