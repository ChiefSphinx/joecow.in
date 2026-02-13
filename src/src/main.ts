import './style.css'
import { initPostHog, trackCommandUsage, trackButtonClick, trackTerminalSession, trackPageView } from './posthog'
import { SnakeGame } from './snake'
import { formatCV, formatHelp, formatFiles, getWelcomeMessages } from '../utils/content-loader'

class Terminal {
  private container: HTMLDivElement;
  private outputContainer!: HTMLDivElement;
  private commandLine!: HTMLDivElement;
  private cursor!: HTMLSpanElement;
  private isTyping = false;
  private snakeInstance: SnakeGame | null = null;
  private inputLine!: HTMLDivElement;
  private isSnakeActive = false;
  private keydownHandler!: (e: KeyboardEvent) => void;
  private mobileInput!: HTMLInputElement;
  private snakeMobileControls: HTMLDivElement | null = null;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private currentInput: string = '';
  private tabCompletionIndex: number = -1;
  private lastTabInput: string = '';
  private readonly commands: string[] = [
    'help', 'cv', 'snake', 'clear', 'ls', 'whoami', 'date',
    'cat cv.txt', 'cat readme.md', 'exit', 'sudo', 'rm -rf'
  ];
  private readonly fileArguments: Record<string, string[]> = {
    'cat': ['cv.txt', 'readme.md'],
    'ls': [],
  };

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#app')!;
    this.setupTerminal();
  }

  private setupTerminal() {
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-button close" id="close-btn" role="button" aria-label="Close terminal"></span>
            <span class="terminal-button minimize" id="minimize-btn" role="button" aria-label="Minimize terminal"></span>
            <span class="terminal-button maximize" id="maximize-btn" role="button" aria-label="Maximize terminal"></span>
          </div>
          <div class="terminal-title">joe@joecow.in: ~/terminal</div>
        </div>
        <div class="terminal-body">
          <div class="terminal-output" id="terminal-output"></div>
          <div class="terminal-input-line" id="terminal-input-line">
            <span class="prompt">joe@joecow.in:~$ </span>
            <span class="command-line" id="command-line"><span class="cursor" id="cursor">█</span></span>
          </div>
          <input type="text" class="mobile-input" id="mobile-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input" />
        </div>
      </div>
    `;

    this.outputContainer = document.querySelector<HTMLDivElement>('#terminal-output')!;
    this.commandLine = document.querySelector<HTMLDivElement>('#command-line')!;
    this.cursor = document.querySelector<HTMLSpanElement>('#cursor')!;
    this.inputLine = document.querySelector<HTMLDivElement>('#terminal-input-line')!;
    this.mobileInput = document.querySelector<HTMLInputElement>('#mobile-input')!;

    this.setupButtonListeners();
    this.setupMobileInput();
    this.startTerminal();
  }

  private setupButtonListeners() {
    const closeBtn = document.querySelector<HTMLSpanElement>('#close-btn')!;
    const minimizeBtn = document.querySelector<HTMLSpanElement>('#minimize-btn')!;
    const maximizeBtn = document.querySelector<HTMLSpanElement>('#maximize-btn')!;

    closeBtn.addEventListener('click', () => {
      trackButtonClick('close');
      this.showBSOD();
    });
    minimizeBtn.addEventListener('click', () => {
      trackButtonClick('minimize');
      this.minimizeTerminal();
    });
    maximizeBtn.addEventListener('click', () => {
      trackButtonClick('maximize');
      this.maximizeTerminal();
    });
  }

  private setupMobileInput() {
    // Focus the hidden input when tapping the terminal body
    const terminalBody = document.querySelector('.terminal-body') as HTMLDivElement;
    terminalBody.addEventListener('click', () => {
      if (!this.isSnakeActive && !this.isTyping) {
        this.mobileInput.focus();
      }
    });

    // Handle input from the mobile keyboard
    this.mobileInput.addEventListener('input', () => {
      if (this.isSnakeActive || this.isTyping) return;

      // Get the text node before the cursor
      let textNode = this.commandLine.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('');
        this.commandLine.insertBefore(textNode, this.cursor);
      }
      textNode.textContent = this.mobileInput.value;
    });

    // Handle Enter key from mobile keyboard
    this.mobileInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.isSnakeActive && !this.isTyping) {
        e.preventDefault();
        e.stopPropagation();
        // Read from textNode.textContent to get tab-completed value
        const textNode = this.commandLine.firstChild;
        const command = (textNode && textNode.nodeType === Node.TEXT_NODE ? textNode.textContent : '') || this.mobileInput.value;
        this.mobileInput.value = '';
        this.executeCommand(command);
      }
    });
  }

  private showBSOD() {
    this.container.innerHTML = `
      <div class="bsod">
        <div class="bsod-content">
          <div class="bsod-header">
            <div class="sad-face">:(</div>
            <div class="bsod-title">Your PC ran into a problem and needs to restart.</div>
          </div>
          <div class="bsod-body">
            <p>We're just collecting some error info, and then we'll restart for you.</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p class="progress-text">0% complete</p>
          </div>
          <div class="bsod-footer">
            <p>For more information about this issue and possible fixes, visit</p>
            <p>https://www.joecow.in/bsod</p>
            <p>If you call a support person, give them this info:</p>
            <p class="error-code">Stop code: TERMINAL_CLOSE_ERROR</p>
          </div>
        </div>
      </div>
    `;

    // Animate progress bar
    const progressFill = document.querySelector<HTMLDivElement>('.progress-fill')!;
    const progressText = document.querySelector<HTMLDivElement>('.progress-text')!;
    let progress = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}% complete`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          this.restartTerminal();
        }, 2000);
      }
    }, 500);
  }

  private minimizeTerminal() {
    // Add minimize animation
    const terminalWindow = document.querySelector<HTMLDivElement>('.terminal-window')!;
    terminalWindow.style.transform = 'scale(0.1)';
    terminalWindow.style.opacity = '0';
    terminalWindow.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      // Hide terminal, show desktop
      const appDiv = document.getElementById('app')!;
      const desktopDiv = document.getElementById('desktop')!;
      appDiv.style.display = 'none';
      desktopDiv.style.display = 'flex';
      // Add desktop icon for restoring terminal
      desktopDiv.innerHTML = `
        <div class="desktop-icons">
          <div class="desktop-icon" id="restore-terminal">
            <img src="/favicon.ico" alt="Terminal Icon" />
            <span>Terminal</span>
          </div>
        </div>
        <div class="taskbar">
          <span class="taskbar-title">joecow.in</span>
          <span class="taskbar-clock" id="taskbar-clock"></span>
        </div>
      `;
      // Start the clock
      if ((window as any).taskbarClockInterval) clearInterval((window as any).taskbarClockInterval);
      const updateClock = () => {
        const clock = document.getElementById('taskbar-clock');
        if (clock) {
          const now = new Date();
          clock.textContent = now.toLocaleString();
        }
      };
      updateClock();
      (window as any).taskbarClockInterval = setInterval(updateClock, 1000);
    }, 300);
  }

  private maximizeTerminal() {
    // Add maximize animation
    const terminalWindow = document.querySelector<HTMLDivElement>('.terminal-window')!;
    terminalWindow.style.transform = 'scale(1.05)';
    terminalWindow.style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
      terminalWindow.style.transform = 'scale(1)';
    }, 200);
  }

  private restartTerminal() {
    this.setupTerminal();
  }

  private async startTerminal() {
    const welcome = getWelcomeMessages();
    await this.typeText(`${welcome.greeting}\n`, 0);
    await this.typeText(`${welcome.instruction}\n\n`, 0);
    this.showPrompt();
    this.setupEventListeners();
  }

  private showPrompt() {
    // Clear only the text node before the cursor
    if (this.commandLine.firstChild && this.commandLine.firstChild.nodeType === Node.TEXT_NODE) {
      this.commandLine.firstChild.textContent = '';
    } else {
      this.commandLine.insertBefore(document.createTextNode(''), this.cursor);
    }
    this.cursor.style.display = 'inline';
    // Show and enable the input line
    this.inputLine.style.visibility = 'visible';
    this.inputLine.style.pointerEvents = 'auto';

    // Clear mobile input
    if (this.mobileInput) {
      this.mobileInput.value = '';
    }

    // Ensure the prompt is visible after showing it
    this.scrollToBottom();
  }

  private setupEventListeners() {
    // Remove existing handler to avoid duplicating listeners on restart
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }

    this.keydownHandler = (e: KeyboardEvent) => {
      // If snake is active, prevent all CLI input and arrow key scrolling
      if (this.isSnakeActive) {
        // Prevent arrow keys from scrolling the page/terminal
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
        // Allow snake game to handle its own input
        return;
      }

      if (this.isTyping) return;

      // Get the text node before the cursor
      let textNode = this.commandLine.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('');
        this.commandLine.insertBefore(textNode, this.cursor);
      }
      const text = textNode.textContent || '';

      if (e.key === 'Enter') {
        // Re-read text in case tab completion modified it
        const currentText = textNode.textContent || '';
        this.executeCommand(currentText);
        this.resetTabCompletion();
      } else if (e.key === 'Backspace') {
        if (document.activeElement === this.mobileInput) return;
        textNode.textContent = text.slice(0, -1);
        this.mobileInput.value = text.slice(0, -1);
        this.resetTabCompletion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1, textNode as Text);
        this.mobileInput.value = textNode.textContent || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1, textNode as Text);
        this.mobileInput.value = textNode.textContent || '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTabCompletion(textNode as Text);
      } else if (e.key.length === 1) {
        if (document.activeElement === this.mobileInput) return;
        textNode.textContent = text + e.key;
        this.mobileInput.value = text + e.key;
        this.resetTabCompletion();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  private async executeCommand(command: string) {
    const cmd = command.trim().toLowerCase();
    
    // Track command usage
    trackCommandUsage(cmd);

    // Save to history if not empty
    if (cmd) {
      this.commandHistory.push(command.trim());
    }
    
    // Reset history navigation
    this.historyIndex = -1;
    this.currentInput = '';
    
    // Add command to output
    this.addToOutput(`joe@joecow.in:~$ ${command}`);
    
    // Clear command line (only the text node before the cursor)
    if (this.commandLine.firstChild && this.commandLine.firstChild.nodeType === Node.TEXT_NODE) {
      this.commandLine.firstChild.textContent = '';
    }
    
    switch (cmd) {
      case 'help':
        await this.showHelp();
        break;
      case 'cv':
      case 'cat cv.txt':
        await this.showCV();
        break;
      case 'cat readme.md':
        await this.showReadme();
        break;
      case 'clear':
        this.clearOutput();
        break;
      case 'ls':
        await this.showFiles();
        break;
      case 'whoami':
        await this.typeText('joe\n', 0);
        break;
      case 'date':
        await this.typeText(new Date().toLocaleString() + '\n', 0);
        break;
      case 'snake':
        await this.startSnakeGame();
        return;
      case 'exit':
        await this.typeText('Goodbye!\n', 0);
        this.showBSOD();
        return;
      case 'sudo':
        await this.typeText('Nice try! ;)\n', 0);
        break;
      case 'rm':
      case 'rm -rf':
      case 'rm -rf /':
      case 'rm -rf /*':
        await this.typeText('I don\'t think so...\n', 0);
        this.showBSOD();
        return;
      case '':
        break;
      default:
        if (cmd.startsWith('sudo ')) {
          await this.typeText('Nice try! ;)\n', 0);
        } else {
          await this.typeText(`Command not found: ${command}\n`, 0);
        }
        break;
    }
    
    this.showPrompt();
  }

  private async showHelp() {
    const helpText = formatHelp();
    await this.typeText(helpText, 0);
  }

  private async showCV() {
    const cvContent = formatCV();
    await this.typeText(cvContent, 0);
  }

  private async showReadme() {
    try {
      const res = await fetch('/README.md', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load README');
      const text = await res.text();
      await this.typeText(`\n${text}\n`, 0);
    } catch (err) {
      await this.typeText(`\nError: Unable to load README.md\n`, 0);
    }
  }

  private async showFiles() {
    const files = formatFiles();
    await this.typeText(files, 0);
  }

  private addToOutput(text: string) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.textContent = text;
    this.outputContainer.appendChild(line);
    this.scrollToBottom();
  }

  private async typeText(text: string, speed: number = 0) {
    this.isTyping = true;
    // Hide or disable the input line while typing
    this.inputLine.style.visibility = 'hidden';
    this.inputLine.style.pointerEvents = 'none';
    this.cursor.style.display = 'none';
    const line = document.createElement('div');
    line.className = 'output-line';
    this.outputContainer.appendChild(line);

    // If speed is 0, output instantly (no character-by-character loop)
    if (speed === 0) {
      line.textContent = text;
    } else {
      for (let i = 0; i < text.length; i++) {
        line.textContent += text[i];
        await this.sleep(speed);
      }
    }

    this.scrollToBottom();
    this.isTyping = false;
    this.cursor.style.display = 'inline';
    // Show and enable the input line after typing
    this.inputLine.style.visibility = 'visible';
    this.inputLine.style.pointerEvents = 'auto';
  }

  private clearOutput() {
    this.outputContainer.innerHTML = '';
  }

  private scrollToBottom() {
    // Use requestAnimationFrame to ensure DOM updates are processed first
    requestAnimationFrame(() => {
      // Scroll the terminal body to show the latest content
      const terminalBody = document.querySelector('.terminal-body') as HTMLDivElement;
      if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
      
      // Also scroll the container as fallback
      this.container.scrollTop = this.container.scrollHeight;
      
      // Ensure the input line is visible using scrollIntoView
      if (this.inputLine && this.inputLine.isConnected) {
        this.inputLine.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private navigateHistory(direction: number, textNode: Text) {
    if (this.commandHistory.length === 0) return;

    if (direction === -1) {
      if (this.historyIndex === -1) {
        this.currentInput = textNode.textContent || '';
        this.historyIndex = this.commandHistory.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      if (this.historyIndex === -1) {
        return;
      } else if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        textNode.textContent = this.currentInput;
        return;
      }
    }

    textNode.textContent = this.commandHistory[this.historyIndex];
  }

  private resetTabCompletion() {
    this.tabCompletionIndex = -1;
    this.lastTabInput = '';
  }

  private handleTabCompletion(textNode: Text) {
    const input = textNode.textContent || '';
    const inputLower = input.toLowerCase();

    // If user typed something new, reset the cycle
    if (this.lastTabInput && !inputLower.startsWith(this.lastTabInput)) {
      this.resetTabCompletion();
    }

    // Parse the input to get command and argument parts
    const parts = inputLower.split(/\s+/);
    const baseCommand = parts[0] || '';
    const currentArg = parts[1] || '';

    // If we're completing an argument (command already typed with space)
    if (parts.length > 1 || input.endsWith(' ')) {
      this.completeArgument(textNode, baseCommand, currentArg, input);
    } else {
      // Complete the command
      this.completeCommand(textNode, inputLower);
    }

    // Sync mobile input with the completed text
    this.mobileInput.value = textNode.textContent || '';
  }

  private completeCommand(textNode: Text, input: string) {
    const matches = this.commands.filter(cmd => 
      cmd.toLowerCase().startsWith(input)
    );

    if (matches.length === 0) return;

    // Cycle through matches
    if (this.tabCompletionIndex === -1) {
      this.lastTabInput = input;
      this.tabCompletionIndex = 0;
    } else {
      this.tabCompletionIndex = (this.tabCompletionIndex + 1) % matches.length;
    }

    textNode.textContent = matches[this.tabCompletionIndex];
  }

  private completeArgument(textNode: Text, baseCommand: string, currentArg: string, originalInput: string) {
    const validArgs = this.fileArguments[baseCommand];
    if (!validArgs || validArgs.length === 0) return;

    const matches = validArgs.filter(arg => 
      arg.toLowerCase().startsWith(currentArg)
    );

    if (matches.length === 0) return;

    // Preserve original spacing - find where the argument starts
    const lastSpaceIndex = originalInput.lastIndexOf(' ');
    const prefix = originalInput.substring(0, lastSpaceIndex + 1);

    // Cycle through matches
    if (this.tabCompletionIndex === -1) {
      this.lastTabInput = currentArg;
      this.tabCompletionIndex = 0;
    } else {
      this.tabCompletionIndex = (this.tabCompletionIndex + 1) % matches.length;
    }

    textNode.textContent = prefix + matches[this.tabCompletionIndex];
  }

  private async startSnakeGame() {
    // Destroy previous SnakeGame if it exists
    if (this.snakeInstance) {
      this.snakeInstance.destroy();
      this.snakeInstance = null;
    }

    // Remove any previous snake containers from output
    Array.from(this.outputContainer.querySelectorAll('.snake-terminal-container')).forEach(el => el.remove());

    // Set snake active state
    this.isSnakeActive = true;

    // Hide the input line while snake is active
    this.inputLine.style.visibility = 'hidden';
    this.inputLine.style.pointerEvents = 'none';
    this.cursor.style.display = 'none';

    // Hide mobile keyboard by blurring the input
    if (this.mobileInput) {
      this.mobileInput.blur();
    }

    // Add instructions (different for mobile)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const instructions = isMobile
      ? '\nStarting Snake Game...\nUse the on-screen controls to play. Tap EXIT to quit.\n\n'
      : '\nStarting Snake Game...\nUse arrow keys to control the snake. Press ESC to exit.\n\n';
    await this.typeText(instructions, 0);

    // Render Snake game in terminal output
    const snakeDiv = document.createElement('div');
    snakeDiv.className = 'snake-terminal-container';
    snakeDiv.style.display = 'flex';
    snakeDiv.style.justifyContent = 'center';
    snakeDiv.style.alignItems = 'center';
    snakeDiv.style.height = '100%';
    snakeDiv.style.width = '100%';
    this.outputContainer.appendChild(snakeDiv);

    // Scroll to ensure the snake game is visible
    this.scrollToBottom();

    // Create mobile controls
    this.createSnakeMobileControls();

    // Create snake game with exit callback
    this.snakeInstance = new SnakeGame(snakeDiv, () => {
      // Cleanup when snake exits
      this.isSnakeActive = false;
      // Remove snake container if it exists
      const container = this.outputContainer.querySelector('.snake-terminal-container');
      if (container) container.remove();
      // Remove mobile controls
      this.removeSnakeMobileControls();
      // Restore prompt for further input
      this.showPrompt();
    });
  }

  private createSnakeMobileControls() {
    // Remove existing controls if any
    this.removeSnakeMobileControls();

    this.snakeMobileControls = document.createElement('div');
    this.snakeMobileControls.className = 'snake-mobile-controls';
    this.snakeMobileControls.innerHTML = `
      <div class="snake-dpad">
        <button class="snake-dpad-btn up" aria-label="Move up">▲</button>
        <button class="snake-dpad-btn left" aria-label="Move left">◀</button>
        <div class="snake-dpad-center"></div>
        <button class="snake-dpad-btn right" aria-label="Move right">▶</button>
        <button class="snake-dpad-btn down" aria-label="Move down">▼</button>
      </div>
      <button class="snake-exit-btn" aria-label="Exit game">EXIT</button>
    `;

    // Append to output container so it's in the document flow, below the snake canvas
    this.outputContainer.appendChild(this.snakeMobileControls);

    // Add event listeners for touch controls
    const simulateKey = (key: string) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    };

    this.snakeMobileControls.querySelector('.up')?.addEventListener('click', () => simulateKey('ArrowUp'));
    this.snakeMobileControls.querySelector('.down')?.addEventListener('click', () => simulateKey('ArrowDown'));
    this.snakeMobileControls.querySelector('.left')?.addEventListener('click', () => simulateKey('ArrowLeft'));
    this.snakeMobileControls.querySelector('.right')?.addEventListener('click', () => simulateKey('ArrowRight'));
    this.snakeMobileControls.querySelector('.snake-exit-btn')?.addEventListener('click', () => simulateKey('Escape'));

    // Scroll to show the controls
    this.scrollToBottom();
  }

  private removeSnakeMobileControls() {
    if (this.snakeMobileControls) {
      this.snakeMobileControls.remove();
      this.snakeMobileControls = null;
    }
  }

}

// Initialize PostHog
initPostHog();

// Track page view
trackPageView('Terminal Home');

// Initialize terminal when page loads
new Terminal();

// Track terminal session start
trackTerminalSession('start');

// Add global restore logic for desktop icon
const desktopDiv = document.getElementById('desktop')!;
desktopDiv.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('#restore-terminal')) {
    // Clear and show terminal
    const appDiv = document.getElementById('app')!;
    appDiv.innerHTML = '';
    appDiv.style.display = 'block';
    desktopDiv.style.display = 'none';
    // Re-initialize terminal
    new Terminal();
  }
});
