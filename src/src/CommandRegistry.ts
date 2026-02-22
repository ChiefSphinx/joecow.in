import type { Command, CommandContext } from './types'
import { UI } from './types'
import { formatCV, formatFiles, formatContact } from './utils/content-loader'
import { trackCommandUsage } from './posthog'

export class CommandRegistry {
  private commands: Map<string, Command> = new Map()
  private aliases: Map<string, string> = new Map()

  register(command: Command): void {
    this.commands.set(command.name, command)
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name)
      }
    }
  }

  get(name: string): Command | undefined {
    const resolvedName = this.aliases.get(name) ?? name
    return this.commands.get(resolvedName)
  }

  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name)
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  getCommandNames(): string[] {
    return Array.from(this.commands.keys())
  }

  getAllCommandNamesWithAliases(): string[] {
    const names = new Set<string>()
    for (const name of this.commands.keys()) {
      names.add(name)
    }
    for (const alias of this.aliases.keys()) {
      names.add(alias)
    }
    return Array.from(names)
  }

  async execute(name: string, context: CommandContext, args: string): Promise<boolean> {
    const command = this.get(name)
    if (command) {
      trackCommandUsage(name)
      await command.execute(context, args)
      return true
    }
    return false
  }

  generateHelpText(): string {
    const commands = this.getAllCommands().filter(cmd => !cmd.hidden)
    let content = '\nAvailable commands:\n'
    for (const cmd of commands) {
      const padding = ' '.repeat(Math.max(2, 14 - cmd.name.length))
      content += `  ${cmd.name}${padding}- ${cmd.description}\n`
    }
    return content
  }
}

export function createDefaultCommands(): Command[] {
  return [
    {
      name: 'help',
      description: 'Show available commands',
      execute: async context => {
        await context.terminalUI.typeText(context.commandRegistry.generateHelpText())
      },
    },
    {
      name: 'cv',
      description: 'Display CV/resume',
      aliases: ['cat cv.txt'],
      execute: async context => {
        const cvContent = formatCV()
        await context.terminalUI.typeText(cvContent)
      },
    },
    {
      name: 'cat readme.md',
      description: 'Display README file',
      hidden: true,
      execute: async context => {
        try {
          const res = await fetch('/README.md', { cache: 'no-cache' })
          if (!res.ok) throw new Error('Failed to load README')
          const text = await res.text()
          await context.terminalUI.typeText(`\n${text}\n`)
        } catch {
          await context.terminalUI.typeText('\nError: Unable to load README.md\n')
        }
      },
    },
    {
      name: 'clear',
      description: 'Clear the terminal',
      execute: context => {
        context.terminalUI.clearOutput()
      },
    },
    {
      name: 'ls',
      description: 'List files',
      execute: async context => {
        const files = formatFiles()
        await context.terminalUI.typeText(files)
      },
    },
    {
      name: 'contact',
      description: 'Show contact information',
      aliases: ['cat contact.txt'],
      execute: async context => {
        await context.terminalUI.typeText(formatContact())
      },
    },
    {
      name: 'whoami',
      description: 'Display current user',
      execute: async context => {
        await context.terminalUI.typeText('joe\n')
      },
    },
    {
      name: 'date',
      description: 'Display current date and time',
      execute: async context => {
        await context.terminalUI.typeText(new Date().toLocaleString() + '\n')
      },
    },
    {
      name: 'theme',
      description: 'Toggle light/dark theme',
      execute: async context => {
        context.themeManager.toggleTheme()
        await context.terminalUI.typeText(
          `Theme switched to ${context.themeManager.getTheme()} mode\n`
        )
      },
    },
    {
      name: 'snake',
      description: 'Play snake game',
      execute: async context => {
        await context.snakeIntegration.startSnakeGame(context.terminalUI)
      },
    },
    {
      name: 'exit',
      description: 'Exit the terminal',
      hidden: true,
      execute: async context => {
        await context.terminalUI.typeText('Goodbye!\n')
        context.terminalUI.showBSOD()
      },
    },
    {
      name: 'sudo',
      description: 'Try to gain root access',
      hidden: true,
      execute: async context => {
        await context.terminalUI.typeText('Nice try! ;)\n')
      },
    },
    {
      name: 'rm',
      description: 'Remove files (not really)',
      hidden: true,
      aliases: ['rm -rf', 'rm -rf /', 'rm -rf /*'],
      execute: async context => {
        await context.terminalUI.typeText("I don't think so...\n")
        context.terminalUI.showBSOD()
      },
    },
    {
      name: 'neofetch',
      description: 'System information',
      hidden: true,
      execute: async context => {
        const theme = context.themeManager.getTheme()
        const res = `${window.innerWidth}x${window.innerHeight}`
        const content =
          `\njoe@joecow.in\n` +
          `─────────────\n` +
          `OS:         joecow.in Terminal\n` +
          `Shell:      browser\n` +
          `Theme:      ${theme}\n` +
          `Resolution: ${res}\n`
        await context.terminalUI.typeText(content)
      },
    },
  ]
}

export function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry()
  for (const command of createDefaultCommands()) {
    registry.register(command)
  }
  return registry
}

// Re-export UI.PROMPT for use in InputHandler
export { UI }
