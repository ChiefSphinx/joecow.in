import { describe, it, expect } from 'vitest'
import { formatCV, formatFiles, formatHelp, getWelcomeMessages } from '../utils/content-loader'
import cv from '../data/cv.json'
import terminal from '../data/terminal-content.json'

// Sanity checks on JSON structure

describe('content data', () => {
  it('cv.json has required fields', () => {
    expect(cv).toHaveProperty('name')
    expect(cv).toHaveProperty('title')
    expect(cv).toHaveProperty('experience')
    expect(Array.isArray((cv as any).experience)).toBe(true)
  })

  it('terminal-content.json has welcome/help/files', () => {
    expect(terminal).toHaveProperty('welcome')
    expect(terminal).toHaveProperty('help')
    expect(terminal).toHaveProperty('files')
  })
})

describe('content-loader formatting', () => {
  it('formatCV includes name and title', () => {
    const s = formatCV()
    expect(s).toContain('Name:')
    expect(s).toContain((cv as any).name)
    expect(s).toContain('Title:')
    expect(s).toContain((cv as any).title)
  })

  it('formatHelp includes Available commands title and a command', () => {
    const s = formatHelp()
    expect(s).toContain((terminal as any).help.title)
    const firstCmd = (terminal as any).help.commands[0].command
    expect(s).toContain(firstCmd)
  })

  it('formatFiles lists files lines', () => {
    const s = formatFiles()
    const files: string[] = (terminal as any).files
    for (const f of files) {
      expect(s).toContain(f)
    }
  })

  it('getWelcomeMessages returns greeting and instruction', () => {
    const w = getWelcomeMessages()
    expect(w.greeting).toBe((terminal as any).welcome.greeting)
    expect(w.instruction).toBe((terminal as any).welcome.instruction)
  })
})

