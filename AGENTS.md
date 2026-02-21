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
