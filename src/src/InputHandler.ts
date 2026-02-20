import type {
  TerminalUIInterface,
  InputHandlerInterface,
  HistoryState,
  TabCompletionState,
  ThemeManagerInterface,
  SnakeIntegrationInterface,
} from './types'
import { CommandRegistry } from './CommandRegistry'

export class InputHandler implements InputHandlerInterface {
  private terminalUI: TerminalUIInterface
  private commandRegistry: CommandRegistry
  private themeManager: ThemeManagerInterface
  private snakeIntegration: SnakeIntegrationInterface
  private keydownHandler: (e: KeyboardEvent) => void
  private snakeActive = false
  private history: HistoryState = {
    commandHistory: [],
    historyIndex: -1,
    currentInput: '',
  }
  private tabCompletion: TabCompletionState = {
    tabCompletionIndex: -1,
    lastTabInput: '',
  }

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
    document.addEventListener('keydown', this.keydownHandler)
  }

  private setupMobileInput(): void {
    const terminalBody = document.querySelector('.terminal-body') as HTMLDivElement | null
    if (terminalBody) {
      terminalBody.addEventListener('click', () => {
        if (!this.snakeActive && !this.terminalUI.isTyping()) {
          this.terminalUI.getMobileInput().focus()
        }
      })
    }

    const mobileInput = this.terminalUI.getMobileInput()
    mobileInput.addEventListener('input', () => {
      if (this.snakeActive || this.terminalUI.isTyping()) return

      const commandLine = this.terminalUI.getCommandLine()
      let textNode = commandLine.firstChild
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('')
        commandLine.insertBefore(textNode, this.terminalUI.getCursor())
      }
      textNode.textContent = mobileInput.value
      this.terminalUI.scrollToBottom(false)
    })

    mobileInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.snakeActive && !this.terminalUI.isTyping()) {
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
  }

  setSnakeActive(active: boolean): void {
    this.snakeActive = active
  }

  isSnakeActive(): boolean {
    return this.snakeActive
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (this.snakeActive) {
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
      this.terminalUI.scrollToBottom(false)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.navigateHistory(-1, textNode as Text)
      this.terminalUI.getMobileInput().value = textNode.textContent || ''
      this.terminalUI.scrollToBottom(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.navigateHistory(1, textNode as Text)
      this.terminalUI.getMobileInput().value = textNode.textContent || ''
      this.terminalUI.scrollToBottom(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      this.handleTabCompletion(textNode as Text)
      this.terminalUI.scrollToBottom(false)
    } else if (e.key.length === 1) {
      if (document.activeElement === this.terminalUI.getMobileInput()) return
      textNode.textContent = text + e.key
      this.terminalUI.getMobileInput().value = text + e.key
      this.resetTabCompletion()
      this.terminalUI.scrollToBottom(false)
    }
  }

  private async executeCommand(command: string): Promise<void> {
    const cmd = command.trim().toLowerCase()

    if (cmd) {
      this.history.commandHistory.push(command.trim())
    }

    this.history.historyIndex = -1
    this.history.currentInput = ''

    this.terminalUI.addToOutput(`joe@joecow.in:~$ ${command}`)

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
      },
      ''
    )

    if (!executed && cmd !== '') {
      if (cmd.startsWith('sudo ')) {
        await this.terminalUI.typeText('Nice try! ;)\n', 0)
      } else {
        await this.terminalUI.typeText(`Command not found: ${command}\n`, 0)
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

    if (
      this.tabCompletion.lastTabInput &&
      !inputLower.startsWith(this.tabCompletion.lastTabInput)
    ) {
      this.resetTabCompletion()
    }

    const commands = this.commandRegistry.getAllCommandNamesWithAliases()
    const matches = commands.filter(cmd => cmd.toLowerCase().startsWith(inputLower))

    if (matches.length === 0) return

    if (this.tabCompletion.tabCompletionIndex === -1) {
      this.tabCompletion.lastTabInput = inputLower
      this.tabCompletion.tabCompletionIndex = 0
    } else {
      this.tabCompletion.tabCompletionIndex =
        (this.tabCompletion.tabCompletionIndex + 1) % matches.length
    }

    textNode.textContent = matches[this.tabCompletion.tabCompletionIndex]
    this.terminalUI.getMobileInput().value = textNode.textContent || ''
  }

  destroy(): void {
    document.removeEventListener('keydown', this.keydownHandler)
  }
}
