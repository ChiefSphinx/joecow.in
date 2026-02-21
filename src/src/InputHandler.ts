import type {
  TerminalUIInterface,
  InputHandlerInterface,
  HistoryState,
  TabCompletionState,
  ThemeManagerInterface,
  SnakeIntegrationInterface,
} from './types'
import { UI } from './types'
import { CommandRegistry } from './CommandRegistry'

export class InputHandler implements InputHandlerInterface {
  private terminalUI: TerminalUIInterface
  private commandRegistry: CommandRegistry
  private themeManager: ThemeManagerInterface
  private snakeIntegration: SnakeIntegrationInterface
  private keydownHandler: (e: KeyboardEvent) => void
  private history: HistoryState = {
    commandHistory: [],
    historyIndex: -1,
    currentInput: '',
  }
  private tabCompletion: TabCompletionState = {
    tabCompletionIndex: -1,
    lastTabInput: '',
  }
  private keyboardResizeHandler: (() => void) | null = null
  private cleanupFns: Array<() => void> = []

  constructor(
    terminalUI: TerminalUIInterface,
    commandRegistry: CommandRegistry,
    themeManager: ThemeManagerInterface,
    snakeIntegration: SnakeIntegrationInterface
  ) {
    this.terminalUI = terminalUI
    this.commandRegistry = commandRegistry
    this.themeManager = themeManager
    this.snakeIntegration = snakeIntegration
    this.keydownHandler = this.handleKeydown.bind(this)
    this.setupMobileInput()
    this.setupKeyboardVisibilityHandler()
    document.addEventListener('keydown', this.keydownHandler)
  }

  private setupMobileInput(): void {
    // Use event delegation on document so the listener survives a terminal:restart
    // (which replaces the terminal-body DOM node entirely).
    const clickHandler = (e: Event) => {
      const target = e.target as Element
      if (
        target.closest('.terminal-body') &&
        !this.snakeIntegration.isActive() &&
        !this.terminalUI.isTyping()
      ) {
        this.terminalUI.getMobileInput().focus()
      }
    }
    document.addEventListener('click', clickHandler)
    this.cleanupFns.push(() => document.removeEventListener('click', clickHandler))

    const mobileInput = this.terminalUI.getMobileInput()
    mobileInput.addEventListener('input', () => {
      if (this.snakeIntegration.isActive() || this.terminalUI.isTyping()) return

      const commandLine = this.terminalUI.getCommandLine()
      let textNode = commandLine.firstChild
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('')
        commandLine.insertBefore(textNode, this.terminalUI.getCursor())
      }
      textNode.textContent = mobileInput.value
      this.terminalUI.scrollToBottom()
    })

    mobileInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.snakeIntegration.isActive() && !this.terminalUI.isTyping()) {
        e.preventDefault()
        e.stopPropagation()
        const commandLine = this.terminalUI.getCommandLine()
        const textNode = commandLine.firstChild
        const command =
          (textNode && textNode.nodeType === Node.TEXT_NODE ? textNode.textContent : '') ||
          mobileInput.value
        mobileInput.value = ''
        this.executeCommand(command)
      }
    })

    mobileInput.addEventListener('focus', () => {
      requestAnimationFrame(() => {
        this.terminalUI.scrollToBottom()
      })
    })

    mobileInput.addEventListener('blur', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px')
      const terminalBody = document.querySelector('.terminal-body')
      if (terminalBody) {
        terminalBody.classList.remove('keyboard-open')
      }
    })
  }

  private handleKeydown(e: KeyboardEvent): void {
    // Global Ctrl shortcuts work regardless of snake / typing state
    if (e.ctrlKey) {
      if (e.key === 'l') {
        e.preventDefault()
        this.terminalUI.clearOutput()
        this.terminalUI.scrollToBottom()
        return
      }
      if (e.key === 'c') {
        e.preventDefault()
        const commandLine = this.terminalUI.getCommandLine()
        const textNode = commandLine.firstChild
        const currentText =
          textNode && textNode.nodeType === Node.TEXT_NODE ? textNode.textContent || '' : ''
        if (currentText) {
          this.terminalUI.addToOutput(`${UI.PROMPT}${currentText}^C`)
        }
        if (textNode && textNode.nodeType === Node.TEXT_NODE) textNode.textContent = ''
        this.terminalUI.getMobileInput().value = ''
        this.resetTabCompletion()
        return
      }
      if (e.key === 'u') {
        e.preventDefault()
        const commandLine = this.terminalUI.getCommandLine()
        const textNode = commandLine.firstChild
        if (textNode && textNode.nodeType === Node.TEXT_NODE) textNode.textContent = ''
        this.terminalUI.getMobileInput().value = ''
        this.resetTabCompletion()
        return
      }
    }

    if (this.snakeIntegration.isActive()) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
      return
    }

    if (this.terminalUI.isTyping()) return

    const commandLine = this.terminalUI.getCommandLine()
    let textNode = commandLine.firstChild
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      textNode = document.createTextNode('')
      commandLine.insertBefore(textNode, this.terminalUI.getCursor())
    }
    const text = textNode.textContent || ''

    if (e.key === 'Enter') {
      const currentText = textNode.textContent || ''
      this.executeCommand(currentText)
      this.resetTabCompletion()
    } else if (e.key === 'Backspace') {
      if (document.activeElement === this.terminalUI.getMobileInput()) return
      textNode.textContent = text.slice(0, -1)
      this.terminalUI.getMobileInput().value = text.slice(0, -1)
      this.resetTabCompletion()
      this.terminalUI.scrollToBottom()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.navigateHistory(-1, textNode as Text)
      this.terminalUI.getMobileInput().value = textNode.textContent || ''
      this.terminalUI.scrollToBottom()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.navigateHistory(1, textNode as Text)
      this.terminalUI.getMobileInput().value = textNode.textContent || ''
      this.terminalUI.scrollToBottom()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      this.handleTabCompletion(textNode as Text)
      this.terminalUI.scrollToBottom()
    } else if (e.key.length === 1) {
      if (document.activeElement === this.terminalUI.getMobileInput()) return
      textNode.textContent = text + e.key
      this.terminalUI.getMobileInput().value = text + e.key
      this.resetTabCompletion()
      this.terminalUI.scrollToBottom()
    }
  }

  private async executeCommand(command: string): Promise<void> {
    const cmd = command.trim().toLowerCase()

    if (cmd) {
      this.history.commandHistory.push(command.trim())
    }

    this.history.historyIndex = -1
    this.history.currentInput = ''

    this.terminalUI.addToOutput(`${UI.PROMPT}${command}`)

    const commandLine = this.terminalUI.getCommandLine()
    if (commandLine.firstChild && commandLine.firstChild.nodeType === Node.TEXT_NODE) {
      commandLine.firstChild.textContent = ''
    }

    const executed = await this.commandRegistry.execute(
      cmd,
      {
        terminalUI: this.terminalUI,
        themeManager: this.themeManager,
        snakeIntegration: this.snakeIntegration,
        commandRegistry: this.commandRegistry,
      },
      ''
    )

    if (!executed && cmd !== '') {
      if (cmd.startsWith('sudo ')) {
        await this.terminalUI.typeText('Nice try! ;)\n')
      } else {
        await this.terminalUI.typeText(`Command not found: ${command}\n`)
      }
    }

    this.terminalUI.showPrompt()
  }

  private navigateHistory(direction: number, textNode: Text): void {
    if (this.history.commandHistory.length === 0) return

    if (direction === -1) {
      if (this.history.historyIndex === -1) {
        this.history.currentInput = textNode.textContent || ''
        this.history.historyIndex = this.history.commandHistory.length - 1
      } else if (this.history.historyIndex > 0) {
        this.history.historyIndex--
      }
    } else {
      if (this.history.historyIndex === -1) {
        return
      } else if (this.history.historyIndex < this.history.commandHistory.length - 1) {
        this.history.historyIndex++
      } else {
        this.history.historyIndex = -1
        textNode.textContent = this.history.currentInput
        return
      }
    }

    textNode.textContent = this.history.commandHistory[this.history.historyIndex]
  }

  private resetTabCompletion(): void {
    this.tabCompletion.tabCompletionIndex = -1
    this.tabCompletion.lastTabInput = ''
  }

  private handleTabCompletion(textNode: Text): void {
    const input = textNode.textContent || ''
    const inputLower = input.toLowerCase()

    const commands = this.commandRegistry.getAllCommandNamesWithAliases()
    const matches = commands.filter(cmd => cmd.toLowerCase().startsWith(inputLower))

    if (matches.length === 0) return

    if (matches.length === 1) {
      // Single match — complete immediately and reset
      textNode.textContent = matches[0]
      this.terminalUI.getMobileInput().value = matches[0]
      this.resetTabCompletion()
      return
    }

    // Multiple matches — show list on first Tab, then cycle on subsequent Tabs
    if (this.tabCompletion.tabCompletionIndex === -1) {
      this.tabCompletion.lastTabInput = inputLower
      this.tabCompletion.tabCompletionIndex = 0
      // Echo the current line and show available completions
      this.terminalUI.addToOutput(`${UI.PROMPT}${input}`)
      this.terminalUI.addToOutput(matches.join('   '))
    } else {
      if (!inputLower.startsWith(this.tabCompletion.lastTabInput)) {
        this.resetTabCompletion()
        return
      }
      this.tabCompletion.tabCompletionIndex =
        (this.tabCompletion.tabCompletionIndex + 1) % matches.length
    }

    textNode.textContent = matches[this.tabCompletion.tabCompletionIndex]
    this.terminalUI.getMobileInput().value = textNode.textContent || ''
  }

  destroy(): void {
    for (const fn of this.cleanupFns) fn()
    this.cleanupFns = []
    document.removeEventListener('keydown', this.keydownHandler)
    if (this.keyboardResizeHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.keyboardResizeHandler)
      window.visualViewport.removeEventListener('scroll', this.keyboardResizeHandler)
    }
  }

  private setupKeyboardVisibilityHandler(): void {
    if (window.visualViewport) {
      const updateLayout = () => {
        if (!window.visualViewport) return
        const vv = window.visualViewport
        const keyboardHeight = Math.max(0, window.innerHeight - vv.height)

        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)

        // Resize #app to match the visual viewport so the keyboard never overlaps the terminal
        const app = document.getElementById('app')
        if (app) {
          app.style.height = keyboardHeight > 0 ? `${vv.height}px` : ''
        }

        const terminalBody = document.querySelector('.terminal-body')
        if (terminalBody) {
          if (keyboardHeight > 0) {
            terminalBody.classList.add('keyboard-open')
          } else {
            terminalBody.classList.remove('keyboard-open')
          }
        }
      }

      this.keyboardResizeHandler = () => {
        updateLayout()
        // Double rAF ensures the browser has finished reflowing before we scroll
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.terminalUI.scrollToBottom()
          })
        })
      }

      window.visualViewport.addEventListener('resize', this.keyboardResizeHandler)
      // iOS can also fire scroll on the visual viewport when the keyboard slides up
      window.visualViewport.addEventListener('scroll', this.keyboardResizeHandler)
      updateLayout()
    }
  }
}
