import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('pricing switches audiences and explains unavailable purchases accessibly', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/pricing')
  await expect(page).toHaveTitle('Planes y precios — Carbase')
  await expect(page.getByRole('heading', { name: 'Informe individual' })).toBeVisible()
  await expect(page.getByText('$4.990', { exact: false })).toBeVisible()
  await expect(page.getByText(/los planes pagados aún no están disponibles/)).toBeVisible()
  await page.getByRole('button', { name: 'Para mi negocio' }).click()
  await expect(page.getByRole('button', { name: 'Para mi negocio' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { name: 'Automotora' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Informe individual' })).toHaveCount(0)
  await page.getByText('¿Puedo contratar un plan hoy?', { exact: true }).click()
  await expect(page.getByText(/Hoy no se realiza ningún cobro/)).toBeVisible()
  const scan = await new AxeBuilder({ page }).analyze()
  expect(scan.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Para mí', exact: true }).click()
  await page.getByRole('link', { name: 'Ver informe de ejemplo' }).click()
  await expect(page).toHaveURL(/\/analysis\/demo-evaluacion/)
  expect(errors).toEqual([])
})
