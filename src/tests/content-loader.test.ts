import { describe, it, expect } from 'vitest'
import { formatCV, formatFiles, getWelcomeMessages, getCVData, getTerminalContent } from '../src/utils/content-loader'

describe('content data', () => {
  it('cv.json has required fields', () => {
    const cv = getCVData()
    expect(cv).toHaveProperty('name')
    expect(cv).toHaveProperty('title')
    expect(cv).toHaveProperty('experience')
    expect(Array.isArray(cv.experience)).toBe(true)
  })

  it('terminal-content.json has welcome and files', () => {
    const terminal = getTerminalContent()
    expect(terminal).toHaveProperty('welcome')
    expect(terminal).toHaveProperty('files')
  })

  it('terminal-content.json has mobile ASCII art', () => {
    const terminal = getTerminalContent()
    expect(terminal.welcome).toHaveProperty('mobileAsciiArt')
    expect(Array.isArray(terminal.welcome.mobileAsciiArt)).toBe(true)
    expect(terminal.welcome.mobileAsciiArt?.length).toBeGreaterThan(0)
  })
})

describe('content-loader formatting', () => {
  it('formatCV includes name and title', () => {
    const cv = getCVData()
    const s = formatCV()
    expect(s).toContain(cv.name)
    expect(s).toContain(cv.title)
    expect(s).toContain('Summary:')
    expect(s).toContain('Experience:')
  })

  it('formatCV includes contact URLs', () => {
    const cv = getCVData()
    const s = formatCV()
    expect(s).toContain(cv.contact.github)
    expect(s).toContain(cv.contact.linkedin)
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

  it('getWelcomeMessages returns desktop ASCII art when isMobile is false', () => {
    const terminal = getTerminalContent()
    const w = getWelcomeMessages(false)
    expect(w.asciiArt).toEqual(terminal.welcome.asciiArt)
  })

  it('getWelcomeMessages returns mobile ASCII art when isMobile is true', () => {
    const terminal = getTerminalContent()
    const w = getWelcomeMessages(true)
    expect(w.asciiArt).toEqual(terminal.welcome.mobileAsciiArt)
  })

  it('mobile ASCII art width is <= 32 characters', () => {
    const terminal = getTerminalContent()
    const mobileArt = terminal.welcome.mobileAsciiArt
    if (mobileArt) {
      for (const line of mobileArt) {
        expect(line.length).toBeLessThanOrEqual(32)
      }
    }
  })

  it('desktop ASCII art contains full JOE COWIN banner', () => {
    const terminal = getTerminalContent()
    const desktopArt = terminal.welcome.asciiArt
    if (desktopArt) {
      const joined = desktopArt.join('\n')
      expect(joined).toContain('█████')
    }
  })
})
