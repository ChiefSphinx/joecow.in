import { describe, it, expect } from 'vitest'
import { formatCV, formatFiles, formatHelp, getWelcomeMessages, getCVData, getTerminalContent } from '../src/utils/content-loader'

describe('content data', () => {
  it('cv.json has required fields', () => {
    const cv = getCVData()
    expect(cv).toHaveProperty('name')
    expect(cv).toHaveProperty('title')
    expect(cv).toHaveProperty('experience')
    expect(Array.isArray(cv.experience)).toBe(true)
  })

  it('terminal-content.json has welcome/help/files', () => {
    const terminal = getTerminalContent()
    expect(terminal).toHaveProperty('welcome')
    expect(terminal).toHaveProperty('help')
    expect(terminal).toHaveProperty('files')
  })
})

describe('content-loader formatting', () => {
  it('formatCV includes name and title', () => {
    const cv = getCVData()
    const s = formatCV()
    expect(s).toContain('Name:')
    expect(s).toContain(cv.name)
    expect(s).toContain('Title:')
    expect(s).toContain(cv.title)
  })

  it('formatHelp includes Available commands title and a command', () => {
    const terminal = getTerminalContent()
    const s = formatHelp()
    expect(s).toContain(terminal.help.title)
    const firstCmd = terminal.help.commands[0].command
    expect(s).toContain(firstCmd)
  })

  it('formatFiles lists files lines', () => {
    const terminal = getTerminalContent()
    const s = formatFiles()
    for (const f of terminal.files) {
      expect(s).toContain(f)
    }
  })

  it('getWelcomeMessages returns greeting and instruction', () => {
    const terminal = getTerminalContent()
    const w = getWelcomeMessages()
    expect(w.greeting).toBe(terminal.welcome.greeting)
    expect(w.instruction).toBe(terminal.welcome.instruction)
  })
})

