import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { readFileSync } from 'node:fs'

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
  // Source maps so production stack traces are decodable when debugging.
  build: { sourcemap: true },
})
