import type { TerminalUIInterface, SnakeIntegrationInterface } from './types'
import { UI } from './types'
import { SnakeGame } from './snake'

export class SnakeIntegration implements SnakeIntegrationInterface {
  private snakeInstance: SnakeGame | null = null
  private snakeMobileControls: HTMLDivElement | null = null
  private active = false

  async startSnakeGame(terminalUI: TerminalUIInterface): Promise<void> {
    if (this.snakeInstance) {
      this.snakeInstance.destroy()
      this.snakeInstance = null
    }

    const outputContainer = terminalUI.getOutputContainer()
    Array.from(outputContainer.querySelectorAll('.snake-terminal-container')).forEach(el =>
      el.remove()
    )

    this.active = true

    terminalUI.getInputLine().style.visibility = 'hidden'
    terminalUI.getInputLine().style.pointerEvents = 'none'
    terminalUI.getCursor().style.display = 'none'

    terminalUI.getMobileInput().blur()

    const isMobile = window.matchMedia(`(max-width: ${UI.MOBILE_BREAKPOINT}px)`).matches
    const instructions = isMobile
      ? '\nStarting Snake Game...\nUse the on-screen controls to play. Tap EXIT to quit.\n\n'
      : '\nStarting Snake Game...\nUse arrow keys to control the snake. Press ESC to exit.\n\n'
    await terminalUI.typeText(instructions, 0)

    const snakeDiv = document.createElement('div')
    snakeDiv.className = 'snake-terminal-container'
    snakeDiv.style.display = 'flex'
    snakeDiv.style.justifyContent = 'center'
    snakeDiv.style.alignItems = 'center'
    snakeDiv.style.height = '100%'
    snakeDiv.style.width = '100%'
    outputContainer.appendChild(snakeDiv)

    terminalUI.scrollToBottom()

    this.createSnakeMobileControls(outputContainer)

    this.snakeInstance = new SnakeGame(snakeDiv, () => {
      this.active = false
      const container = outputContainer.querySelector('.snake-terminal-container')
      if (container) container.remove()
      this.removeSnakeMobileControls()
      terminalUI.showPrompt()
    })
  }

  private createSnakeMobileControls(outputContainer: HTMLDivElement): void {
    this.removeSnakeMobileControls()

    this.snakeMobileControls = document.createElement('div')
    this.snakeMobileControls.className = 'snake-mobile-controls'
    this.snakeMobileControls.innerHTML = `
      <div class="snake-dpad">
        <button class="snake-dpad-btn up" aria-label="Move up">▲</button>
        <button class="snake-dpad-btn left" aria-label="Move left">◀</button>
        <div class="snake-dpad-center"></div>
        <button class="snake-dpad-btn right" aria-label="Move right">▶</button>
        <button class="snake-dpad-btn down" aria-label="Move down">▼</button>
      </div>
      <button class="snake-exit-btn" aria-label="Exit game">EXIT</button>
    `

    outputContainer.appendChild(this.snakeMobileControls)

    const simulateKey = (key: string, e: Event) => {
      e.stopPropagation()
      window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    }

    this.snakeMobileControls
      .querySelector('.up')
      ?.addEventListener('click', e => simulateKey('ArrowUp', e))
    this.snakeMobileControls
      .querySelector('.down')
      ?.addEventListener('click', e => simulateKey('ArrowDown', e))
    this.snakeMobileControls
      .querySelector('.left')
      ?.addEventListener('click', e => simulateKey('ArrowLeft', e))
    this.snakeMobileControls
      .querySelector('.right')
      ?.addEventListener('click', e => simulateKey('ArrowRight', e))
    this.snakeMobileControls
      .querySelector('.snake-exit-btn')
      ?.addEventListener('click', e => simulateKey('Escape', e))
  }

  private removeSnakeMobileControls(): void {
    if (this.snakeMobileControls) {
      this.snakeMobileControls.remove()
      this.snakeMobileControls = null
    }
  }

  isActive(): boolean {
    return this.active
  }

  destroy(): void {
    if (this.snakeInstance) {
      this.snakeInstance.destroy()
      this.snakeInstance = null
    }
    this.removeSnakeMobileControls()
    this.active = false
  }
}
