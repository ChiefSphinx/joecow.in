import { afterEach, vi } from 'vitest'

// JSDOM does not implement scrollIntoView by default; stub it for tests
if (!Element.prototype.scrollIntoView) {
  // @ts-ignore
  Element.prototype.scrollIntoView = vi.fn()
}

// Stub ResizeObserver for jsdom environment
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  // Ensure no stray timers keep the process alive
  try { vi.clearAllTimers() } catch {}
})

