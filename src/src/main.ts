import './style.css'
import { initPostHog, trackPageView, trackTerminalSession } from './posthog'
import { ThemeManager } from './ThemeManager'
import { TerminalUI } from './TerminalUI'
import { InputHandler } from './InputHandler'
import { SnakeIntegration } from './SnakeIntegration'
import { createCommandRegistry } from './CommandRegistry'
import { getWelcomeMessages } from './utils/content-loader'
import { TIMING } from './types'

declare global {
  interface Window {
    taskbarClockInterval?: ReturnType<typeof setInterval>
  }
}

setTimeout(() => {
  initPostHog()
}, TIMING.POSTHOG_DELAY)

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
    const welcome = getWelcomeMessages()
    if (welcome.asciiArt && welcome.asciiArt.length > 0) {
      await this.terminalUI.typeText('\n', 0)
      for (const line of welcome.asciiArt) {
        await this.terminalUI.typeText(line + '\n', 0)
      }
      await this.terminalUI.typeText('\n', 0)
    }
    await this.terminalUI.typeText(`${welcome.greeting}\n`, 0)
    await this.terminalUI.typeText(`${welcome.instruction}\n\n`, 0)
    this.terminalUI.showPrompt()
  }

  destroy(): void {
    this.terminalUI.destroy()
    this.inputHandler.destroy()
    this.snakeIntegration.destroy()
  }
}

initPostHog()
trackPageView('Terminal Home')

let terminalInstance: Terminal | null = null

function initTerminal(): void {
  if (terminalInstance) {
    terminalInstance.destroy()
  }
  terminalInstance = new Terminal()
  trackTerminalSession('start')
}

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
