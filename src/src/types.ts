export const TIMING = {
  BSOD_INTERVAL: 500,
  BSOD_RESTART_DELAY: 2000,
  MINIMIZE_ANIMATION: 300,
  MAXIMIZE_ANIMATION: 200,
} as const

export const SNAKE = {
  GRID_SIZE: 20,
  MAX_PLACE_ATTEMPTS: 1000,
  DEFAULT_TICK_MS: 100,
} as const

export const UI = {
  PROMPT: 'joe@joecow.in:~$ ',
  MOBILE_BREAKPOINT: 768,
} as const

export type Theme = 'light' | 'dark'

export interface CommandRegistryInterface {
  generateHelpText(): string
}

export interface CommandContext {
  terminalUI: TerminalUIInterface
  themeManager: ThemeManagerInterface
  snakeIntegration: SnakeIntegrationInterface
  commandRegistry: CommandRegistryInterface
}

export interface Command {
  name: string
  description: string
  aliases?: string[]
  hidden?: boolean
  execute: (context: CommandContext, args: string) => Promise<void> | void
}

export interface TerminalUIInterface {
  addToOutput(text: string): void
  typeText(text: string): Promise<void>
  clearOutput(): void
  scrollToBottom(): void
  showPrompt(): void
  showBSOD(): void
  minimizeTerminal(): void
  maximizeTerminal(): void
  restartTerminal(): void
  getOutputContainer(): HTMLDivElement
  getInputLine(): HTMLDivElement
  getCommandLine(): HTMLDivElement
  getCursor(): HTMLSpanElement
  getMobileInput(): HTMLInputElement
  isTyping(): boolean
  setIsTyping(value: boolean): void
}

export interface ThemeManagerInterface {
  getTheme(): Theme
  toggleTheme(): void
  updateThemeButton(): void
}

export interface SnakeIntegrationInterface {
  startSnakeGame(ui: TerminalUIInterface): Promise<void>
  isActive(): boolean
  destroy(): void
}

export interface InputHandlerInterface {
  destroy(): void
}

export interface HistoryState {
  commandHistory: string[]
  historyIndex: number
  currentInput: string
}

export interface TabCompletionState {
  tabCompletionIndex: number
  lastTabInput: string
}
