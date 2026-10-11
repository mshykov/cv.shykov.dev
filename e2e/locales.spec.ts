import { test, expect } from '@playwright/test'
import { LOCALES, homePath } from '../src/i18n/locales.ts'
import { es } from '../src/i18n/messages/es.ts'
import { ptBR } from '../src/i18n/messages/pt-br.ts'
import { ptPT } from '../src/i18n/messages/pt-pt.ts'
import { fr } from '../src/i18n/messages/fr.ts'
import { de } from '../src/i18n/messages/de.ts'

// One real run per language, on WebKit under the production CSP: the page comes
// up in its language (the locale chunk loads), a CV is scored with that
// language's messages, and the builder opens with that language's sample and
// exports a PDF. A language whose chunk 404s, or whose messages throw, fails here
// instead of for a visitor.

const MESSAGES = { es, 'pt-br': ptBR, 'pt-pt': ptPT, fr, de }

for (const loc of LOCALES.filter((l) => l.code !== 'en')) {
  const m = MESSAGES[loc.code as keyof typeof MESSAGES]

  test.describe(`[${loc.code}]`, () => {
    test('the page is in its language and links its siblings', async ({ page }) => {
      await page.goto(homePath(loc.code))
      await expect(page.locator('html')).toHaveAttribute('lang', loc.htmlLang)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(m.home.hero.h1)
      await expect(page.getByRole('link', { name: m.home.hero.openSource }).first()).toBeVisible()
      // The language switcher lists every language, this one marked current.
      for (const other of LOCALES) await expect(page.locator(`details a[hreflang="${other.htmlLang}"]`)).toHaveCount(1)
      await expect(page.locator(`details a[hreflang="${loc.htmlLang}"]`)).toHaveAttribute('aria-current', 'true')
    })

    test('scores a CV with this language’s messages', async ({ page }) => {
      await page.goto(homePath(loc.code))
      await page.setInputFiles('input[type="file"]', 'e2e/fixtures/sample-cv.pdf')
      await expect(page.getByRole('heading', { name: m.analyzer.scoreHeading, exact: true })).toBeVisible({ timeout: 30_000 })
      await expect(page.getByRole('alert')).toHaveCount(0)
      // The report is rendered by the scorer in this language, not just the chrome.
      await expect(page.getByRole('heading', { name: m.analysis.categories.Parseability })).toBeVisible()
      await expect(page.getByText(m.analysis.labels['machine-text'], { exact: true }).first()).toBeVisible()
      await expect(page.getByRole('button', { name: m.analyzer.tabs.jd })).toBeVisible()
    })

    test('the builder opens in this language and exports a PDF', async ({ page }) => {
      await page.goto(homePath(loc.code))
      await page.getByRole('button', { name: m.home.header.build, exact: true }).click()
      await expect(page.getByText(m.builder.sample.name).first()).toBeVisible({ timeout: 30_000 })
      await expect(page.getByText(m.builder.docSections.experience, { exact: true }).first()).toBeVisible()
      const download = page.waitForEvent('download', { timeout: 60_000 })
      await page.getByRole('button', { name: m.builder.exportPdf }).click()
      // Browsers may hand the name back decomposed (é as e + accent); compare as text.
      expect((await download).suggestedFilename().normalize('NFC')).toBe(m.builder.fileName(m.builder.sample.name).normalize('NFC'))
    })
  })
}
