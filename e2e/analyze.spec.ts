import { test, expect } from '@playwright/test'

// Regression guards for the June 2026 iOS-Safari outage class: pdf.js text
// extraction on WebKit under the production CSP (`vite preview` mirrors the
// CSP from public/_headers — see vite.config.ts).

async function analyzeFixture(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/sample-cv.pdf')
  // pdf.js parse + score render; generous timeout for CI hardware. The
  // historical failure surfaced as the on-screen error capture (role=alert)
  // instead of a score.
  await expect(page.getByRole('heading', { name: 'Fast ATS score' })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('alert')).toHaveCount(0)
}

test('analyzes a PDF on WebKit under the production CSP', async ({ page }) => {
  await analyzeFixture(page)
})

// Playwright's WebKit implements Promise.withResolvers and ReadableStream
// async iteration natively, so stock WebKit can't represent the released
// iOS-Safari engines that lack them. Recreate that engine by deleting both
// APIs before the app loads — the delete-the-native-API technique that
// originally cracked the bug (see docs/retrospective.md).
//
// Negative-control finding (2026-07-02): with BOTH polyfills disabled and
// both APIs deleted, analyze still works on pdfjs-dist 6.1.200 — upstream
// dropped its hard dependency on these APIs somewhere in 6.0.227→6.1.200
// (verified for small single-chunk PDFs only). The polyfills are now
// defense-in-depth, and this test guards the user-facing invariant itself:
// Analyze must keep working on an engine WITHOUT these APIs, under the real
// CSP — whichever layer (polyfill or pdf.js) provides that.
test('analyzes a PDF when the engine lacks the APIs the polyfills patch', async ({ page }) => {
  await page.addInitScript(() => {
    delete (Promise as unknown as Record<string, unknown>).withResolvers
    delete (ReadableStream.prototype as unknown as Record<symbol, unknown>)[Symbol.asyncIterator]
  })
  await analyzeFixture(page)
})
