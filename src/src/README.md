# Source Architecture

Core application modules for the terminal-style interface.

## Modules

### TerminalUI.ts
Main terminal interface manager.
- Output rendering with typing effects
- Scrolling and prompt display
- BSOD easter egg
- Minimize/maximize animations

### CommandRegistry.ts
Command dispatch system.
- `Command` interface: name, description, aliases, execute function
- `CommandContext`: injected dependencies (terminalUI, themeManager, snakeIntegration)
- Returns command output or executes actions

### ThemeManager.ts
Theme persistence and switching.
- Stores preference in localStorage
- Toggles between 'light' and 'dark'
- Updates document class and button state

### InputHandler.ts
Keyboard input processing.
- Command history navigation (up/down arrows)
- Tab completion for commands
- Enter to submit command
- Delegates to CommandRegistry

### SnakeIntegration.ts
Snake game easter egg.
- Triggered by `snake` command
- Renders in terminal output
- Keyboard controls (arrow keys)

### types.ts
Shared types and constants.
- `TIMING`: animation delays
- `SNAKE`: game configuration
- `UI`: prompt text, breakpoints
- Interfaces: `Command`, `CommandContext`, `TerminalUIInterface`, etc.

### utils/content-loader.ts
JSON data loading and validation.
- Loads `cv.json` and `terminal-content.json`
- Runtime type validation
- Formatting functions for terminal output

## Data Flow

```
User Input → InputHandler → CommandRegistry.dispatch()
                                    ↓
                            Command.execute(context, args)
                                    ↓
                            TerminalUI.addToOutput() / typeText()
```

## Dependency Injection

Components receive interfaces rather than concrete implementations, enabling testability via mocks.
