import { describe, it, expect, vi } from 'vitest'
import { SnakeGame } from '../src/snake'

// Unit test to ensure ESC triggers exit callback fast

describe('SnakeGame', () => {
  it('pressing Escape exits the game and calls onExit', () => {
    // Arrange DOM container
    const container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)

    const onExit = vi.fn()
    // Start without loop and disable drawing to avoid timers and canvas work
    const game = new SnakeGame(container, onExit, { startLoop: false, disableDraw: true })

    try {
      // Act: press Escape
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      // Assert: onExit called
      expect(onExit).toHaveBeenCalled()
    } finally {
      // Cleanup to avoid any open handles
      game.destroy()
    }
  })
})
