import { test, expect } from '@playwright/test'

// Minimal smoke tests for the terminal UI

test('loads and shows welcome, prompt, and can run basic commands', async ({ page }) => {
  await page.goto('/')
  // Welcome text should appear
  await expect(page.getByText("Welcome to Joe Cowin's Terminal")).toBeVisible()
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  // Type 'help' and press Enter
  await page.keyboard.type('help')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Available commands:')).toBeVisible()

  // Type 'cv' and press Enter - expect name appears
  await page.keyboard.type('cv')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Joe Cowin')).toBeVisible()

  // Clear output
  await page.keyboard.type('clear')
  await page.keyboard.press('Enter')
  // After clear, there should still be a prompt
  await expect(page.locator('#terminal-input-line')).toBeVisible()
})

// E2E: start snake and exit with ESC, then prompt returns

test('snake game can start and exit with ESC to restore prompt', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  await page.keyboard.type('snake')
  await page.keyboard.press('Enter')

  // Snake container should appear
  const snakeContainer = page.locator('.snake-terminal-container')
  await expect(snakeContainer).toBeVisible()

  // Press Escape to exit
  await page.keyboard.press('Escape')

  // Snake container should disappear and prompt should be visible again
  await expect(snakeContainer).toHaveCount(0)
  await expect(page.locator('#terminal-input-line')).toBeVisible()
})

// E2E: BSOD close button triggers restart back to terminal

test('BSOD flow restarts back to terminal', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  // Click the close button to trigger BSOD
  await page.locator('#close-btn').click()

  // Expect BSOD content
  await expect(page.locator('.bsod')).toBeVisible()

  // Wait for restart: terminal should reappear with welcome or prompt
  await expect(page.locator('#terminal-input-line')).toBeVisible({ timeout: 15000 })
})

