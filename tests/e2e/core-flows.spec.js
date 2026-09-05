import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('publication analysis reaches an explainable result and its next actions', async ({ page }) => {
  await page.goto('/deal-check')
  await page.getByPlaceholder('Pega el enlace de la publicación').fill('https://example.test/publicacion-valida')
  await page.getByRole('button', { name: 'Analizar gratis' }).click()
  await expect(page.getByRole('heading', { name: 'Estamos preparando una recomendación explicable' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Resultado del análisis' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cómo llegamos a este resultado' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Solicitar inspección' })).toBeVisible()
})

test('plate analysis requires explicit consent', async ({ page }) => {
  await page.goto('/deal-check')
  await page.getByRole('tab', { name: 'Ingresar patente' }).click()
  await page.getByPlaceholder('Ingresa la patente').fill('ABCD12')
  await page.getByRole('button', { name: 'Analizar gratis' }).click()
  await expect(page.getByRole('alert')).toContainText('Confirma el tratamiento')
  await page.getByRole('checkbox', { name: /Autorizo el uso temporal/ }).check()
  await page.getByRole('button', { name: 'Analizar gratis' }).click()
  await expect(page.getByRole('heading', { name: 'Resultado del análisis' })).toBeVisible()
  await expect(page.getByText('Media · 67%')).toBeVisible()
})

test('insufficient data returns a recovery path instead of a fabricated price', async ({ page }) => {
  await page.goto('/deal-check')
  await page.getByRole('tab', { name: 'Ingresar patente' }).click()
  await page.getByPlaceholder('Ingresa la patente').fill('ABCD10')
  await page.getByRole('checkbox', { name: /Autorizo el uso temporal/ }).check()
  await page.getByRole('button', { name: 'Analizar gratis' }).click()
  await expect(page.getByRole('heading', { name: 'Todavía no podemos estimar un precio responsable' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Intentar nuevamente' })).toBeVisible()
})

test('terminal rows and modal controls remain keyboard accessible', async ({ page }) => {
  await page.goto('/terminal/inventario')
  const rowButton = page.getByRole('button', { name: 'Abrir Vehículo A' })
  await rowButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Vehículo A' })).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar detalle' }).click()
  await page.getByRole('button', { name: 'Agregar vehículo' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('privacy and unknown routes have explicit destinations', async ({ page }) => {
  await page.goto('/privacy#patentes')
  await expect(page.getByRole('heading', { name: 'Privacidad y tratamiento de datos' })).toBeVisible()
  await page.goto('/ruta-que-no-existe')
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible()
})

test('inspection request makes its demo behavior and consent explicit', async ({ page }) => {
  await page.goto('/analysis/demo?scenario=high')
  await page.getByRole('button', { name: 'Solicitar inspección' }).click()
  await page.getByLabel('Región de inspección').selectOption({ label: 'Región Metropolitana' })
  await page.getByLabel('Correo de contacto').fill('persona@example.test')
  await page.getByRole('checkbox', { name: /Autorizo el contacto/ }).check()
  await page.getByRole('button', { name: 'Preparar solicitud' }).click()
  await expect(page.getByRole('status')).toContainText('No enviamos ni almacenamos información')
})

test('primary public pages have no serious or critical automated accessibility violations', async ({ page }) => {
  for (const route of ['/deal-check', '/analysis/demo?scenario=high', '/privacy']) {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const material = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact))
    expect(material, `${route}: ${material.map((item) => item.id).join(', ')}`).toEqual([])
  }
})

test('core pages do not create horizontal body overflow', async ({ page }) => {
  for (const route of ['/', '/deal-check', '/analysis/demo?scenario=low', '/terminal/mercado', '/privacy']) {
    await page.goto(route)
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  }
})

test('core routes set meaningful titles and emit no runtime errors', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))
  const routes = [
    ['/', 'AUTOINDEX'],
    ['/deal-check', 'Análisis gratuito'],
    ['/analysis/demo?scenario=high', 'Resultado del análisis'],
    ['/terminal', 'Resumen'],
    ['/privacy', 'Privacidad'],
  ]
  for (const [route, title] of routes) {
    await page.goto(route)
    await expect(page).toHaveTitle(new RegExp(title))
  }
  expect(errors).toEqual([])
})
