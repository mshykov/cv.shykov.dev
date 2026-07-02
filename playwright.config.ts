import { defineConfig, devices } from '@playwright/test'

// WebKit-only e2e smoke. The worst bugs this project shipped were
// Safari/WebKit-only and invisible in Chromium and Node (see
// docs/retrospective.md) — so the e2e budget goes to WebKit, under the REAL
// production CSP: `vite preview` mirrors the CSP from public/_headers
// (see vite.config.ts). Run `npm run build` first; CI does.
export default defineConfig({
  testDir: 'e2e',
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'webkit', use: { ...devices['Desktop Safari'] } }],
  use: { baseURL: 'http://localhost:4319' },
  webServer: {
    command: 'npx vite preview --port 4319 --strictPort',
    url: 'http://localhost:4319',
    reuseExistingServer: !process.env.CI,
  },
})
