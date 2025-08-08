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

// Mock CanvasRenderingContext2D for jsdom to avoid "getContext not implemented" errors
// Override regardless of presence because jsdom's implementation throws by default
// and our unit tests don't depend on actual canvas drawing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HTMLCanvasElement.prototype as any).getContext = vi.fn(() => {
  const ctx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    // properties used by code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set fillStyle(_v: any) {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set font(_v: any) {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set textAlign(_v: any) {},
  } as unknown as CanvasRenderingContext2D
  return ctx
})

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  // Ensure no stray timers keep the process alive
  try { vi.clearAllTimers() } catch {}
})

