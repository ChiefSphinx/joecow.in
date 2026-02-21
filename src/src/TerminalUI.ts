import type { TerminalUIInterface } from './types'
import { TIMING, UI } from './types'
import { trackButtonClick } from './posthog'
import { ThemeManager } from './ThemeManager'

function assertElement<T extends HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): T {
  const el = parent.querySelector<T>(selector)
  if (!el) {
    throw new Error(`Element not found: ${selector}`)
  }
  return el
}

export class TerminalUI implements TerminalUIInterface {
  private container: HTMLDivElement
  private outputContainer!: HTMLDivElement
  private commandLine!: HTMLDivElement
  private cursor!: HTMLSpanElement
  private inputLine!: HTMLDivElement
  private mobileInput!: HTMLInputElement
  private typing = false
  private themeManager: ThemeManager
  private cleanupFns: Array<() => void> = []

  constructor(container: HTMLDivElement, themeManager: ThemeManager) {
    this.container = container
    this.themeManager = themeManager
    this.setupTerminal()
  }

  private setupTerminal(): void {
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-button close" id="close-btn" role="button" aria-label="Close terminal"></span>
            <span class="terminal-button minimize" id="minimize-btn" role="button" aria-label="Minimize terminal"></span>
            <span class="terminal-button maximize" id="maximize-btn" role="button" aria-label="Maximize terminal"></span>
          </div>
          <div class="terminal-title">joe@joecow.in: ~/terminal</div>
          ${this.themeManager.getButtonHTML()}
        </div>
        <div class="terminal-body">
          <div class="terminal-output" id="terminal-output"></div>
          <div class="terminal-input-line" id="terminal-input-line">
            <span class="prompt">${UI.PROMPT}</span>
            <span class="command-line" id="command-line"><span class="cursor" id="cursor">█</span></span>
            <input type="text" class="mobile-input" id="mobile-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input" placeholder="Type a command..." />
          </div>
        </div>
      </div>
    `

    this.outputContainer = assertElement<HTMLDivElement>('#terminal-output', this.container)
    this.commandLine = assertElement<HTMLDivElement>('#command-line', this.container)
    this.cursor = assertElement<HTMLSpanElement>('#cursor', this.container)
    this.inputLine = assertElement<HTMLDivElement>('#terminal-input-line', this.container)
    this.mobileInput = assertElement<HTMLInputElement>('#mobile-input', this.container)

    this.setupButtonListeners()
  }

  private setupButtonListeners(): void {
    const closeBtn = assertElement<HTMLSpanElement>('#close-btn', this.container)
    const minimizeBtn = assertElement<HTMLSpanElement>('#minimize-btn', this.container)
    const maximizeBtn = assertElement<HTMLSpanElement>('#maximize-btn', this.container)
    const themeToggleBtn = assertElement<HTMLButtonElement>('#theme-toggle', this.container)

    this.themeManager.setThemeButton(themeToggleBtn)

    const closeHandler = () => {
      trackButtonClick('close')
      this.showBSOD()
    }
    const minimizeHandler = () => {
      trackButtonClick('minimize')
      this.minimizeTerminal()
    }
    const maximizeHandler = () => {
      trackButtonClick('maximize')
      this.maximizeTerminal()
    }
    const themeHandler = () => {
      this.themeManager.toggleTheme()
    }

    closeBtn.addEventListener('click', closeHandler)
    minimizeBtn.addEventListener('click', minimizeHandler)
    maximizeBtn.addEventListener('click', maximizeHandler)
    themeToggleBtn.addEventListener('click', themeHandler)

    this.cleanupFns.push(
      () => closeBtn.removeEventListener('click', closeHandler),
      () => minimizeBtn.removeEventListener('click', minimizeHandler),
      () => maximizeBtn.removeEventListener('click', maximizeHandler),
      () => themeToggleBtn.removeEventListener('click', themeHandler)
    )
  }

  destroy(): void {
    for (const fn of this.cleanupFns) {
      fn()
    }
    this.cleanupFns = []
  }

  getOutputContainer(): HTMLDivElement {
    return this.outputContainer
  }

  getInputLine(): HTMLDivElement {
    return this.inputLine
  }

  getCommandLine(): HTMLDivElement {
    return this.commandLine
  }

  getCursor(): HTMLSpanElement {
    return this.cursor
  }

  getMobileInput(): HTMLInputElement {
    return this.mobileInput
  }

  isTyping(): boolean {
    return this.typing
  }

  setIsTyping(value: boolean): void {
    this.typing = value
    if (value) {
      this.inputLine.style.visibility = 'hidden'
      this.inputLine.style.pointerEvents = 'none'
      this.cursor.style.display = 'none'
    } else {
      this.inputLine.style.visibility = 'visible'
      this.inputLine.style.pointerEvents = 'auto'
      this.cursor.style.display = 'inline'
    }
  }

  addToOutput(text: string): void {
    const line = document.createElement('div')
    line.className = 'output-line'
    line.textContent = text
    this.outputContainer.appendChild(line)
    this.scrollToBottom()
  }

  async typeText(text: string, speed: number = 0): Promise<void> {
    this.setIsTyping(true)
    const line = document.createElement('div')
    line.className = 'output-line'
    this.outputContainer.appendChild(line)

    if (speed === 0) {
      line.textContent = text
    } else {
      for (let i = 0; i < text.length; i++) {
        line.textContent += text[i]
        await this.sleep(speed)
      }
    }

    this.scrollToBottom()
    this.setIsTyping(false)
  }

  clearOutput(): void {
    this.outputContainer.innerHTML = ''
  }

  scrollToBottom(smooth: boolean = true): void {
    requestAnimationFrame(() => {
      const terminalBody = this.container.querySelector<HTMLDivElement>('.terminal-body')
      if (!terminalBody) return

      const inputRect = this.inputLine.getBoundingClientRect()
      const bodyRect = terminalBody.getBoundingClientRect()
      const isVisible = inputRect.bottom <= bodyRect.bottom + 50

      if (isVisible && !smooth) return

      terminalBody.scrollTop = terminalBody.scrollHeight
      this.container.scrollTop = this.container.scrollHeight

      if (this.inputLine.isConnected) {
        this.inputLine.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' })
      }
    })
  }

  showPrompt(): void {
    if (this.commandLine.firstChild && this.commandLine.firstChild.nodeType === Node.TEXT_NODE) {
      this.commandLine.firstChild.textContent = ''
    } else {
      this.commandLine.insertBefore(document.createTextNode(''), this.cursor)
    }
    this.cursor.style.display = 'inline'
    this.inputLine.style.visibility = 'visible'
    this.inputLine.style.pointerEvents = 'auto'

    if (this.mobileInput) {
      this.mobileInput.value = ''
    }

    this.scrollToBottom()
  }

  showBSOD(): void {
    this.container.innerHTML = `
      <div class="bsod">
        <div class="bsod-content">
          <div class="bsod-header">
            <div class="sad-face">:(</div>
            <div class="bsod-title">Your PC ran into a problem and needs to restart.</div>
          </div>
          <div class="bsod-body">
            <p>We're just collecting some error info, and then we'll restart for you.</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p class="progress-text">0% complete</p>
          </div>
          <div class="bsod-footer">
            <p>For more information about this issue and possible fixes, visit</p>
            <p>https://www.joecow.in/bsod</p>
            <p>If you call a support person, give them this info:</p>
            <p class="error-code">Stop code: TERMINAL_CLOSE_ERROR</p>
          </div>
        </div>
      </div>
    `

    const progressFill = this.container.querySelector<HTMLDivElement>('.progress-fill')
    const progressText = this.container.querySelector<HTMLDivElement>('.progress-text')

    if (!progressFill || !progressText) return

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 100) progress = 100

      progressFill.style.width = `${progress}%`
      progressText.textContent = `${Math.round(progress)}% complete`

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          this.restartTerminal()
        }, TIMING.BSOD_RESTART_DELAY)
      }
    }, TIMING.BSOD_INTERVAL)
  }

  minimizeTerminal(): void {
    const terminalWindow = this.container.querySelector<HTMLDivElement>('.terminal-window')
    if (!terminalWindow) return

    terminalWindow.style.transform = 'scale(0.1)'
    terminalWindow.style.opacity = '0'
    terminalWindow.style.transition = 'all 0.3s ease'

    setTimeout(() => {
      const desktopDiv = document.getElementById('desktop')
      if (!desktopDiv) return

      this.container.style.display = 'none'
      desktopDiv.style.display = 'flex'
      desktopDiv.innerHTML = `
        <div class="desktop-icons">
          <div class="desktop-icon" id="restore-terminal">
            <img src="/favicon.ico" alt="Terminal Icon" />
            <span>Terminal</span>
          </div>
        </div>
        <div class="taskbar">
          <span class="taskbar-title">joecow.in</span>
          <span class="taskbar-clock" id="taskbar-clock"></span>
        </div>
      `
      this.startTaskbarClock()
    }, TIMING.MINIMIZE_ANIMATION)
  }

  private startTaskbarClock(): void {
    if (window.taskbarClockInterval) {
      clearInterval(window.taskbarClockInterval)
    }
    const updateClock = () => {
      const clock = document.getElementById('taskbar-clock')
      if (clock) {
        clock.textContent = new Date().toLocaleString()
      }
    }
    updateClock()
    window.taskbarClockInterval = setInterval(updateClock, 1000)
  }

  maximizeTerminal(): void {
    const terminalWindow = this.container.querySelector<HTMLDivElement>('.terminal-window')
    if (!terminalWindow) return

    terminalWindow.style.transform = 'scale(1.05)'
    terminalWindow.style.transition = 'all 0.2s ease'

    setTimeout(() => {
      terminalWindow.style.transform = 'scale(1)'
    }, TIMING.MAXIMIZE_ANIMATION)
  }

  restartTerminal(): void {
    this.destroy()
    this.setupTerminal()
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
