import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommandRegistry, createDefaultCommands, createCommandRegistry } from '../src/CommandRegistry'
import type { CommandContext, TerminalUIInterface, ThemeManagerInterface, SnakeIntegrationInterface } from '../src/types'

function createMockUI(): TerminalUIInterface {
  return {
    addToOutput: vi.fn(),
    typeText: vi.fn().mockResolvedValue(undefined),
    clearOutput: vi.fn(),
    scrollToBottom: vi.fn(),
    showPrompt: vi.fn(),
    showBSOD: vi.fn(),
    minimizeTerminal: vi.fn(),
    maximizeTerminal: vi.fn(),
    restartTerminal: vi.fn(),
    getOutputContainer: vi.fn().mockReturnValue(document.createElement('div')),
    getInputLine: vi.fn().mockReturnValue(document.createElement('div')),
    getCommandLine: vi.fn().mockReturnValue(document.createElement('div')),
    getCursor: vi.fn().mockReturnValue(document.createElement('span')),
    getMobileInput: vi.fn().mockReturnValue(document.createElement('input')),
    isTyping: vi.fn().mockReturnValue(false),
    setIsTyping: vi.fn(),
  }
}

function createMockThemeManager(): ThemeManagerInterface {
  return {
    getTheme: vi.fn().mockReturnValue('dark'),
    toggleTheme: vi.fn(),
    updateThemeButton: vi.fn(),
  }
}

function createMockSnakeIntegration(): SnakeIntegrationInterface {
  return {
    startSnakeGame: vi.fn().mockResolvedValue(undefined),
    isActive: vi.fn().mockReturnValue(false),
    destroy: vi.fn(),
  }
}

describe('CommandRegistry', () => {
  let registry: CommandRegistry

  beforeEach(() => {
    registry = new CommandRegistry()
  })

  it('registers and retrieves commands', () => {
    const command = {
      name: 'test',
      description: 'Test command',
      execute: vi.fn(),
    }
    registry.register(command)
    expect(registry.get('test')).toBe(command)
  })

  it('returns undefined for unknown commands', () => {
    expect(registry.get('unknown')).toBeUndefined()
  })

  it('registers aliases', () => {
    const command = {
      name: 'test',
      description: 'Test command',
      aliases: ['t', 'tst'],
      execute: vi.fn(),
    }
    registry.register(command)
    expect(registry.get('t')).toBe(command)
    expect(registry.get('tst')).toBe(command)
  })

  it('checks if command exists', () => {
    const command = {
      name: 'test',
      description: 'Test command',
      execute: vi.fn(),
    }
    registry.register(command)
    expect(registry.has('test')).toBe(true)
    expect(registry.has('unknown')).toBe(false)
  })

  it('returns all commands', () => {
    const command1 = { name: 'test1', description: 'Test 1', execute: vi.fn() }
    const command2 = { name: 'test2', description: 'Test 2', execute: vi.fn() }
    registry.register(command1)
    registry.register(command2)
    expect(registry.getAllCommands()).toHaveLength(2)
  })

  it('generates help text', () => {
    const command = {
      name: 'help',
      description: 'Show help',
      execute: vi.fn(),
    }
    registry.register(command)
    const helpText = registry.generateHelpText()
    expect(helpText).toContain('Available commands')
    expect(helpText).toContain('help')
    expect(helpText).toContain('Show help')
  })

  it('executes commands', async () => {
    const execute = vi.fn().mockResolvedValue(undefined)
    const command = {
      name: 'test',
      description: 'Test command',
      execute,
    }
    registry.register(command)
    const context: CommandContext = {
      terminalUI: createMockUI(),
      themeManager: createMockThemeManager(),
      snakeIntegration: createMockSnakeIntegration(),
    }
    const result = await registry.execute('test', context, '')
    expect(result).toBe(true)
    expect(execute).toHaveBeenCalledWith(context, '')
  })

  it('returns false for unknown command execution', async () => {
    const context: CommandContext = {
      terminalUI: createMockUI(),
      themeManager: createMockThemeManager(),
      snakeIntegration: createMockSnakeIntegration(),
    }
    const result = await registry.execute('unknown', context, '')
    expect(result).toBe(false)
  })
})

describe('createDefaultCommands', () => {
  it('creates all expected commands', () => {
    const commands = createDefaultCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('help')
    expect(names).toContain('cv')
    expect(names).toContain('clear')
    expect(names).toContain('ls')
    expect(names).toContain('whoami')
    expect(names).toContain('date')
    expect(names).toContain('theme')
    expect(names).toContain('snake')
    expect(names).toContain('exit')
    expect(names).toContain('sudo')
    expect(names).toContain('rm')
  })
})

describe('createCommandRegistry', () => {
  it('creates registry with all default commands', () => {
    const registry = createCommandRegistry()
    expect(registry.has('help')).toBe(true)
    expect(registry.has('cv')).toBe(true)
    expect(registry.has('cat cv.txt')).toBe(true)
    expect(registry.has('cat readme.md')).toBe(true)
    expect(registry.has('clear')).toBe(true)
    expect(registry.has('ls')).toBe(true)
    expect(registry.has('whoami')).toBe(true)
    expect(registry.has('date')).toBe(true)
    expect(registry.has('theme')).toBe(true)
    expect(registry.has('snake')).toBe(true)
    expect(registry.has('exit')).toBe(true)
    expect(registry.has('sudo')).toBe(true)
    expect(registry.has('rm')).toBe(true)
    expect(registry.has('rm -rf')).toBe(true)
  })

  it('clear command clears output', async () => {
    const registry = createCommandRegistry()
    const mockUI = createMockUI()
    const context: CommandContext = {
      terminalUI: mockUI,
      themeManager: createMockThemeManager(),
      snakeIntegration: createMockSnakeIntegration(),
    }
    await registry.execute('clear', context, '')
    expect(mockUI.clearOutput).toHaveBeenCalled()
  })

  it('theme command toggles theme', async () => {
    const registry = createCommandRegistry()
    const mockUI = createMockUI()
    const mockTheme = createMockThemeManager()
    const context: CommandContext = {
      terminalUI: mockUI,
      themeManager: mockTheme,
      snakeIntegration: createMockSnakeIntegration(),
    }
    await registry.execute('theme', context, '')
    expect(mockTheme.toggleTheme).toHaveBeenCalled()
  })
})
