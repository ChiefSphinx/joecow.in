import './style.css'
import { initPostHog, trackPageView, trackTerminalSession } from './posthog'
import { ThemeManager } from './ThemeManager'
import { TerminalUI } from './TerminalUI'
import { InputHandler } from './InputHandler'
import { SnakeIntegration } from './SnakeIntegration'
import { createCommandRegistry } from './CommandRegistry'
import { getWelcomeMessages } from './utils/content-loader'
import { UI } from './types'

declare global {
  interface Window {
    taskbarClockInterval?: ReturnType<typeof setInterval>
  }
}

function isMobileViewport(): boolean {
  return window.innerWidth < UI.MOBILE_BREAKPOINT
}

class Terminal {
  private container: HTMLDivElement
  private themeManager: ThemeManager
  private terminalUI: TerminalUI
  private commandRegistry: ReturnType<typeof createCommandRegistry>
  private inputHandler: InputHandler
  private snakeIntegration: SnakeIntegration

  constructor() {
    const container = document.querySelector<HTMLDivElement>('#app')
    if (!container) {
      throw new Error('Terminal container #app not found')
    }
    this.container = container

    this.themeManager = new ThemeManager()
    this.terminalUI = new TerminalUI(this.container, this.themeManager)
    this.commandRegistry = createCommandRegistry()
    this.snakeIntegration = new SnakeIntegration()

    this.inputHandler = new InputHandler(
      this.terminalUI,
      this.commandRegistry,
      this.themeManager,
      this.snakeIntegration
    )

    this.startTerminal()
  }

  private async startTerminal(): Promise<void> {
    const welcome = getWelcomeMessages(isMobileViewport())
    if (welcome.asciiArt && welcome.asciiArt.length > 0) {
      await this.terminalUI.typeText('\n')
      for (const line of welcome.asciiArt) {
        await this.terminalUI.typeText(line + '\n')
      }
      await this.terminalUI.typeText('\n')
    }
    await this.terminalUI.typeText(`${welcome.greeting}\n`)
    await this.terminalUI.typeText(`${welcome.instruction}\n\n`)
    this.terminalUI.showPrompt()
  }

  destroy(): void {
    this.terminalUI.destroy()
    this.inputHandler.destroy()
    this.snakeIntegration.destroy()
  }
}

let terminalInstance: Terminal | null = null

function initTerminal(): void {
  if (terminalInstance) {
    terminalInstance.destroy()
  }
  terminalInstance = new Terminal()
  trackTerminalSession('start')
}

// Full reinitialisation triggered by BSOD / restartTerminal().
// Using a custom event keeps TerminalUI decoupled from main.ts.
document.addEventListener('terminal:restart', initTerminal)

// Initialise PostHog, then track the page view once the library has loaded.
initPostHog().then(() => trackPageView('Terminal Home'))

initTerminal()

const desktopDiv = document.getElementById('desktop')
if (desktopDiv) {
  desktopDiv.addEventListener('click', e => {
    const target = e.target as HTMLElement
    if (target.closest('#restore-terminal')) {
      const appDiv = document.getElementById('app')
      if (appDiv) {
        appDiv.innerHTML = ''
        appDiv.style.display = 'block'
        desktopDiv.style.display = 'none'
        initTerminal()
      }
    }
  })
}
