import './style.css'
import { initPostHog, trackCommandUsage, trackButtonClick, trackTerminalSession, trackPageView } from './posthog'

class Terminal {
  private container: HTMLDivElement;
  private outputContainer!: HTMLDivElement;
  private commandLine!: HTMLDivElement;
  private cursor!: HTMLSpanElement;
  private isTyping = false;

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#app')!;
    this.setupTerminal();
  }

  private setupTerminal() {
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-button close" id="close-btn"></span>
            <span class="terminal-button minimize" id="minimize-btn"></span>
            <span class="terminal-button maximize" id="maximize-btn"></span>
          </div>
          <div class="terminal-title">joe@joecow.in: ~/terminal</div>
        </div>
        <div class="terminal-body">
          <div class="terminal-output" id="terminal-output"></div>
          <div class="terminal-input-line">
            <span class="prompt">joe@joecow.in:~$ </span>
            <span class="command-line" id="command-line"></span>
            <span class="cursor" id="cursor">█</span>
          </div>
        </div>
      </div>
    `;

    this.outputContainer = document.querySelector<HTMLDivElement>('#terminal-output')!;
    this.commandLine = document.querySelector<HTMLDivElement>('#command-line')!;
    this.cursor = document.querySelector<HTMLSpanElement>('#cursor')!;

    this.setupButtonListeners();
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
      terminalWindow.style.transform = 'scale(1)';
      terminalWindow.style.opacity = '1';
    }, 1000);
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
    await this.typeText('Welcome to Joe Cowin\'s Terminal\n', 20);
    await this.typeText('Type "help" for available commands\n\n', 15);
    
    this.showPrompt();
    this.setupEventListeners();
  }

  private showPrompt() {
    this.commandLine.textContent = '';
    this.cursor.style.display = 'inline';
  }

  private setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (this.isTyping) return;

      if (e.key === 'Enter') {
        this.executeCommand(this.commandLine.textContent || '');
      } else if (e.key === 'Backspace') {
        this.commandLine.textContent = this.commandLine.textContent?.slice(0, -1) || '';
      } else if (e.key.length === 1) {
        this.commandLine.textContent += e.key;
      }
    });
  }

  private async executeCommand(command: string) {
    const cmd = command.trim().toLowerCase();
    
    // Track command usage
    trackCommandUsage(cmd);
    
    // Add command to output
    this.addToOutput(`joe@joecow.in:~$ ${command}`);
    
    // Clear command line
    this.commandLine.textContent = '';
    
    switch (cmd) {
      case 'help':
        await this.showHelp();
        break;
      case 'cv':
      case 'cat cv.txt':
        await this.showCV();
        break;
      case 'clear':
        this.clearOutput();
        break;
      case 'ls':
        await this.showFiles();
        break;
      case 'whoami':
        await this.typeText('joe\n', 50);
        break;
      case 'date':
        await this.typeText(new Date().toLocaleString() + '\n', 25);
        break;
      case '':
        break;
      default:
        await this.typeText(`Command not found: ${command}\n`, 25);
        break;
    }
    
    this.showPrompt();
  }

  private async showHelp() {
    const helpText = `
Available commands:
  help          - Show this help message
  cv            - Display my CV/resume
  cat cv.txt    - Display my CV/resume
  ls            - List files
  whoami        - Show current user
  date          - Show current date/time
  clear         - Clear terminal
`;
    await this.typeText(helpText, 15);
  }

  private async showCV() {
    const cvContent = `
Name: Joe Cowin
Title: Software Engineer
About: Passionate developer with experience in web, cloud, and automation. Loves building cool things and learning new tech.

Experience:
  - Software Engineer at ExampleCorp (2022-Present)
  - Junior Developer at WebStart (2020-2022)

Skills: TypeScript, JavaScript, Python, Docker, Azure, Linux, Git

Contact: 
  Email: joe@example.com
  GitHub: https://github.com/joecow
`;
    await this.typeText(cvContent, 10);
  }

  private async showFiles() {
    const files = `
cv.txt
README.md
projects/
  ├── web-apps/
  ├── automation/
  └── cloud/
`;
    await this.typeText(files, 25);
  }

  private addToOutput(text: string) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.textContent = text;
    this.outputContainer.appendChild(line);
    this.scrollToBottom();
  }

  private async typeText(text: string, speed: number = 50) {
    this.isTyping = true;
    this.cursor.style.display = 'none';
    
    const line = document.createElement('div');
    line.className = 'output-line';
    this.outputContainer.appendChild(line);
    
    for (let i = 0; i < text.length; i++) {
      line.textContent += text[i];
      this.scrollToBottom();
      await this.sleep(speed);
    }
    
    this.isTyping = false;
    this.cursor.style.display = 'inline';
  }

  private clearOutput() {
    this.outputContainer.innerHTML = '';
  }

  private scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
