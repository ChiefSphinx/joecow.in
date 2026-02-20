import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeManager } from '../src/ThemeManager'

describe('ThemeManager', () => {
  let themeManager: ThemeManager

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.mocked(window.matchMedia).mockClear()
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    themeManager = new ThemeManager()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to dark theme when no saved preference', () => {
    expect(themeManager.getTheme()).toBe('dark')
  })

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('terminal-theme', 'light')
    const manager = new ThemeManager()
    expect(manager.getTheme()).toBe('light')
  })

  it('toggles theme from dark to light', () => {
    expect(themeManager.getTheme()).toBe('dark')
    themeManager.toggleTheme()
    expect(themeManager.getTheme()).toBe('light')
    expect(localStorage.getItem('terminal-theme')).toBe('light')
  })

  it('toggles theme from light to dark', () => {
    localStorage.setItem('terminal-theme', 'light')
    const manager = new ThemeManager()
    manager.toggleTheme()
    expect(manager.getTheme()).toBe('dark')
    expect(localStorage.getItem('terminal-theme')).toBe('dark')
  })

  it('applies theme to document', () => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('generates button HTML with correct aria-label', () => {
    const html = themeManager.getButtonHTML()
    expect(html).toContain('theme-toggle')
    expect(html).toContain('Switch to light mode')
    expect(html).toContain('☀️')
  })

  it('updates button when theme changes', () => {
    const button = document.createElement('button')
    themeManager.setThemeButton(button)
    expect(button.textContent).toBe('☀️')
    
    themeManager.toggleTheme()
    expect(button.textContent).toBe('🌙')
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode')
  })
})
