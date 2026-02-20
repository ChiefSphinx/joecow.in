import type { Theme, ThemeManagerInterface } from './types'

const STORAGE_KEY = 'terminal-theme'

export class ThemeManager implements ThemeManagerInterface {
  private currentTheme: Theme
  private themeButton: HTMLButtonElement | null = null

  constructor() {
    this.currentTheme = this.loadTheme()
    this.applyTheme()
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme)
  }

  getTheme(): Theme {
    return this.currentTheme
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme()
    localStorage.setItem(STORAGE_KEY, this.currentTheme)
    this.updateThemeButton()
  }

  setThemeButton(button: HTMLButtonElement): void {
    this.themeButton = button
    this.updateThemeButton()
  }

  updateThemeButton(): void {
    if (this.themeButton) {
      this.themeButton.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙'
      this.themeButton.setAttribute(
        'aria-label',
        `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`
      )
    }
  }

  getButtonHTML(): string {
    return `<button class="theme-toggle" id="theme-toggle" aria-label="Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode">${this.currentTheme === 'dark' ? '☀️' : '🌙'}</button>`
  }
}
