# CLAUDE.md

Context for Claude Code working on this repository.

## Project Overview

Personal terminal-style website at joecow.in. Built with Vite + TypeScript (vanilla, no framework). Deployed on Cloudflare Pages via GitHub Actions. Infrastructure managed with Terraform.

## Key Commands

All commands run from the `src/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |

## Pre-Commit Checklist

Before committing, all three must pass:

```bash
npm run lint
npm run typecheck
npm run test
```

## Repository Structure

```
├── .claude/                    # Claude Code config (settings.local.json gitignored)
├── .github/workflows/          # CI/CD — cloudflare-pages.yml
├── infrastructure/             # Terraform (Cloudflare zone, pages project)
├── src/                        # All application code
│   ├── src/                    # TypeScript source
│   │   ├── main.ts             # Entry point — wires all modules, handles terminal:restart
│   │   ├── TerminalUI.ts       # Output rendering, typeText, linkify, aria-live
│   │   ├── CommandRegistry.ts  # Command definitions, dispatch, generateHelpText
│   │   ├── InputHandler.ts     # Keyboard input, history, tab completion, Ctrl shortcuts
│   │   ├── ThemeManager.ts     # Light/dark theme with localStorage
│   │   ├── SnakeIntegration.ts # Snake game easter egg + mobile D-pad controls
│   │   ├── types.ts            # All interfaces and constants (UI, TIMING)
│   │   ├── snake.ts            # Snake game logic
│   │   ├── posthog.ts          # Analytics (dynamic import, returns Promise<void>)
│   │   └── utils/
│   │       └── content-loader.ts  # JSON loading with runtime type guards
│   ├── data/
│   │   ├── cv.json             # CV/resume data — update here to change CV output
│   │   └── terminal-content.json  # Welcome messages, ASCII art, ls file listing
│   ├── tests/
│   │   ├── *.test.ts           # Unit tests (Vitest)
│   │   └── e2e/terminal.spec.ts  # Playwright E2E
│   └── public/                 # Static assets (favicon, og-image, robots, sitemap)
├── AGENTS.md                   # AI assistant context (kept in sync with this file)
└── CLAUDE.md                   # This file
```

## Architecture

### Module Wiring

`main.ts` creates all modules and injects dependencies:

```
CommandRegistry → registered in context passed to each command execute()
TerminalUI      → passed to InputHandler, SnakeIntegration
ThemeManager    → passed to CommandContext
SnakeIntegration → passed to InputHandler (for isActive() guard)
```

`terminal:restart` custom event is dispatched by `TerminalUI.restartTerminal()` and listened to in `main.ts` to re-run `initTerminal()` (used for BSOD recovery).

### Command Pattern

Commands are registered in `CommandRegistry.ts` via `register()`. Each command has:

```typescript
{
  name: string
  description: string
  aliases?: string[]     // e.g. 'cv' has alias 'cat cv.txt'
  hidden?: boolean       // true = excluded from help output (easter eggs)
  execute(context, args): void | Promise<void>
}
```

Easter egg commands (`exit`, `sudo`, `rm`) are marked `hidden: true` and excluded from `generateHelpText()`.

The `help` command calls `context.commandRegistry.generateHelpText()` — do not maintain a separate help string.

### Content Updates

**To update CV content:** edit `src/data/cv.json`. If adding new top-level fields, also update:
- `CVData` interface in `content-loader.ts`
- Corresponding type guard function
- `formatCV()` rendering function
- `isCVData()` validator

**To update welcome message or file listing:** edit `src/data/terminal-content.json`.

## Code Style

- TypeScript strict mode, ES modules
- No comments unless the logic is genuinely non-obvious
- No `any` — use interfaces and type guards
- Constants live in `types.ts` (`UI.*`, `TIMING.*`)
- `UI.MOBILE_BREAKPOINT` is `768` — use this constant, never hardcode the value
- Interfaces for dependency injection — all cross-module dependencies use the `*Interface` types from `types.ts`

## Mobile Support

### Breakpoints

| Width | Behaviour |
|-------|-----------|
| < 768px | Mobile: condensed ASCII art (≤32 chars wide), inline input overlay, D-pad for snake |
| ≥ 768px | Desktop: full ASCII banner, keystroke capture |

### iOS Keyboard Handling

`visualViewport` resize and scroll events drive keyboard detection. When the keyboard opens, `#app` height is set to `vv.height` so the terminal body shrinks to the visible area. On close, the style is cleared. This is the correct approach — do not use `window.innerHeight` or CSS `padding-bottom` hacks.

### Touch Optimisations

- `font-size: 16px` on mobile input prevents iOS auto-zoom
- `touch-action: manipulation` prevents double-tap zoom
- `overscroll-behavior: contain` blocks pull-to-refresh
- D-pad button clicks call `e.stopPropagation()` to prevent bubbling to the terminal-body click handler (which would re-focus the input mid-game)

## Infrastructure

Cloudflare Pages deployment is automatic on push to `main` via `.github/workflows/cloudflare-pages.yml`.

Required GitHub secrets: `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Terraform in `infrastructure/` provisions Cloudflare resources. Run manually — state files are gitignored.
