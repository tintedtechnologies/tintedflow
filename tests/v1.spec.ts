import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function dragLocatorToLocator(page: Page, sourceSelector: string, targetSelector: string) {
  const source = page.locator(sourceSelector)
  const target = page.locator(targetSelector)
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()

  if (!sourceBox || !targetBox) {
    throw new Error('Unable to resolve drag coordinates.')
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 })
  await page.mouse.up()
}

test('creates boards, groups them, and persists the grouped view', async ({ page }) => {
  await page.goto('./')

  await page.evaluate(async () => {
    window.localStorage.clear()

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }

    if ('caches' in window) {
      const cacheKeys = await window.caches.keys()
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
    }
  })

  await page.goto('./')

  await expect(page.getByRole('heading', { name: 'No boards yet' })).toBeVisible()

  await page.getByRole('button', { name: 'Create first board' }).click()
  await expect(page.getByRole('heading', { name: 'Board 1' })).toBeVisible()

  await page.getByRole('button', { name: 'New board' }).click()
  await page.getByRole('button', { name: 'Add card to Backlog' }).click()
  await page.locator('.card-title-input').last().fill('Nested board task')

  page.once('dialog', (dialog) => dialog.accept())

  await dragLocatorToLocator(
    page,
    '[data-board-name="Board 2"]',
    '[data-board-name="Board 1"]',
  )

  await expect(page.locator('[data-board-name]')).toHaveCount(1)
  await expect(page.locator('[data-board-name="Board 1"]')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Board 1' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Board 2' })).toBeVisible()
  await expect(page.locator('.card-title-input').last()).toHaveValue('Nested board task')

  await expect
    .poll(async () =>
      page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
          return false
        }

        const registration = await navigator.serviceWorker.getRegistration()
        return Boolean(registration?.active || registration?.waiting || registration?.installing)
      }),
    )
    .toBe(true)

  await page.reload()

  await expect(page.locator('[data-board-name]')).toHaveCount(1)
  await expect(page.locator('[data-board-name="Board 1"]')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Board 2' })).toBeVisible()

  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Board 2' })).toBeVisible()
  await page.context().setOffline(false)
})