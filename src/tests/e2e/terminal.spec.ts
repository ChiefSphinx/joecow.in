import { test, expect } from '@playwright/test'

test('loads and shows welcome, prompt, and can run basic commands', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText("Welcome to Joe Cowin's Terminal")).toBeVisible()
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  await page.keyboard.type('help')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Available commands:')).toBeVisible()

  await page.keyboard.type('cv')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Name: Joe Cowin')).toBeVisible()

  await page.keyboard.type('clear')
  await page.keyboard.press('Enter')
  await expect(page.locator('#terminal-input-line')).toBeVisible()
})

test('snake game can start and exit with ESC to restore prompt', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  await page.keyboard.type('snake')
  await page.keyboard.press('Enter')

  const snakeContainer = page.locator('.snake-terminal-container')
  await expect(snakeContainer).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(snakeContainer).toHaveCount(0)
  await expect(page.locator('#terminal-input-line')).toBeVisible()
})

test('BSOD flow restarts back to terminal', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#terminal-input-line')).toBeVisible()

  await page.locator('#close-btn').click()

  await expect(page.locator('.bsod')).toBeVisible()

  await expect(page.locator('#terminal-input-line')).toBeVisible({ timeout: 15000 })
})

test.describe('Mobile viewport (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('shows condensed ASCII art on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.output-line').getByText('Joe Cowin').first()).toBeVisible()
    await expect(page.locator('.output-line').getByText('DevSecOps Engineer').first()).toBeVisible()
  })

  test('does not show full desktop ASCII art on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('██╗ ██████╗')).not.toBeVisible()
  })

  test('mobile input is positioned inline within input line', async ({ page }) => {
    await page.goto('/')
    const mobileInput = page.locator('#mobile-input')
    const inputLine = page.locator('#terminal-input-line')
    await expect(mobileInput).toBeAttached()
    const inputBox = await mobileInput.boundingBox()
    const lineBox = await inputLine.boundingBox()
    expect(inputBox).not.toBeNull()
    expect(lineBox).not.toBeNull()
    if (inputBox && lineBox) {
      expect(inputBox.x).toBeGreaterThanOrEqual(lineBox.x - 1)
      expect(inputBox.y).toBeGreaterThanOrEqual(lineBox.y - 1)
    }
  })

  test('mobile input is functional when focused', async ({ page }) => {
    await page.goto('/')
    const mobileInput = page.locator('#mobile-input')
    await mobileInput.focus()
    await mobileInput.fill('help')
    await mobileInput.press('Enter')
    await expect(page.getByText('Available commands:')).toBeVisible()
  })

  test('tapping input line focuses mobile input', async ({ page }) => {
    await page.goto('/')
    await page.locator('#terminal-input-line').click()
    const mobileInput = page.locator('#mobile-input')
    await expect(mobileInput).toBeFocused()
  })

  test('tapping terminal body focuses mobile input', async ({ page }) => {
    await page.goto('/')
    await page.locator('.terminal-body').click()
    const mobileInput = page.locator('#mobile-input')
    await expect(mobileInput).toBeFocused()
  })

  test('mobile input has font-size >= 16px to prevent iOS zoom', async ({ page }) => {
    await page.goto('/')
    const mobileInput = page.locator('#mobile-input')
    const fontSize = await mobileInput.evaluate(el => 
      window.getComputedStyle(el).fontSize
    )
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16)
  })

  test('snake game shows mobile controls on mobile', async ({ page }) => {
    await page.goto('/')
    await page.locator('#mobile-input').focus()
    await page.locator('#mobile-input').fill('snake')
    await page.locator('#mobile-input').press('Enter')
    await expect(page.locator('.snake-mobile-controls')).toBeVisible()
    await expect(page.locator('.snake-dpad')).toBeVisible()
  })
})

test.describe('Desktop viewport (1280x720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('shows full ASCII art on desktop', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('██╗ ██████╗')).toBeVisible()
  })

  test('mobile input is hidden on desktop', async ({ page }) => {
    await page.goto('/')
    const mobileInput = page.locator('#mobile-input')
    const opacity = await mobileInput.evaluate(el => 
      window.getComputedStyle(el).opacity
    )
    expect(parseFloat(opacity)).toBe(0)
  })
})

