# AGENTS.md

Context for AI assistants working on this codebase.

## Project Overview

Personal terminal-style website deployed on Cloudflare Pages. Built with Vite + TypeScript (vanilla).

## Key Commands

All commands run from the `src/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:5173) |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |

## Architecture

### Core Modules (`src/src/`)

| File | Purpose |
|------|---------|
| `TerminalUI.ts` | Main terminal interface, output rendering, typing effects |
| `CommandRegistry.ts` | Command definitions and dispatch logic |
| `ThemeManager.ts` | Light/dark theme switching with localStorage |
| `InputHandler.ts` | Keyboard input, command history, tab completion |
| `SnakeIntegration.ts` | Snake game easter egg |
| `types.ts` | TypeScript interfaces and constants |
| `main.ts` | Application entry point |
| `snake.ts` | Snake game logic |
| `posthog.ts` | Analytics integration |

### Data (`src/data/`)

| File | Purpose |
|------|---------|
| `cv.json` | CV/resume data |
| `terminal-content.json` | Terminal welcome messages, help text, file listing |

### Utilities (`src/src/utils/`)

| File | Purpose |
|------|---------|
| `content-loader.ts` | JSON loading with runtime validation |

### Tests (`src/tests/`)

Unit tests mirror the source structure. E2E tests in `src/tests/e2e/`.

## Code Style

- TypeScript strict mode
- ES modules
- No comments unless explicitly requested
- Interfaces for type safety and dependency injection
- Constants defined in `types.ts`

## Mobile Support

The terminal UI is fully responsive with mobile-first optimizations.

### Breakpoint

- Mobile: < 480px width (condensed ASCII art)
- Tablet/Desktop: >= 480px width (full ASCII art)

### Responsive Features

| Feature | Mobile (<480px) | Desktop |
|---------|-----------------|---------|
| ASCII Art | Condensed (32-char) | Full banner (73-char) |
| Input | Inline overlay on focus | Keystroke capture |
| Snake Controls | D-pad touch controls | Keyboard arrows |

### Mobile Input Implementation

On mobile devices, the input is styled as an inline overlay:
- Positioned absolutely within `.terminal-input-line`
- Hidden by default (transparent), captures touch events
- Text syncs to `.command-line` for visual feedback
- 16px font-size prevents iOS auto-zoom
- `visualViewport` API scrolls input into view when keyboard opens
- Focus event triggers scroll to keep input visible

### Safe Area Insets

Support for notched devices (iPhone X+) via `env(safe-area-inset-*)`:
- Header padding-top
- Terminal body scroll padding

### Touch Optimizations

- `touch-action: manipulation` prevents double-tap zoom
- `-webkit-tap-highlight-color: transparent`
- `overscroll-behavior: contain` prevents pull-to-refresh
- Expanded touch targets (28px buttons)
