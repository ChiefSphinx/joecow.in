import './style.css'
import { initPostHog, trackCommandUsage, trackButtonClick, trackTerminalSession, trackPageView } from './posthog'
import { SnakeGame } from './snake'

class Terminal {
  private container: HTMLDivElement;
  private outputContainer!: HTMLDivElement;
  private commandLine!: HTMLDivElement;
  private cursor!: HTMLSpanElement;
  private isTyping = false;
  private snakeInstance: SnakeGame | null = null;
  private inputLine!: HTMLDivElement;

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
          <div class="terminal-input-line" id="terminal-input-line">
            <span class="prompt">joe@joecow.in:~$ </span>
            <span class="command-line" id="command-line"><span class="cursor" id="cursor">█</span></span>
          </div>
        </div>
      </div>
    `;

    this.outputContainer = document.querySelector<HTMLDivElement>('#terminal-output')!;
    this.commandLine = document.querySelector<HTMLDivElement>('#command-line')!;
    this.cursor = document.querySelector<HTMLSpanElement>('#cursor')!;
    this.inputLine = document.querySelector<HTMLDivElement>('#terminal-input-line')!;

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
    await this.typeText('Welcome to Joe Cowin\'s Terminal\n', 0);
    await this.typeText('Type "help" for available commands\n\n', 0);
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
  }

  private setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (this.isTyping) return;
      // Get the text node before the cursor
      let textNode = this.commandLine.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('');
        this.commandLine.insertBefore(textNode, this.cursor);
      }
      let text = textNode.textContent || '';
      if (e.key === 'Enter') {
        this.executeCommand(text);
      } else if (e.key === 'Backspace') {
        textNode.textContent = text.slice(0, -1);
      } else if (e.key.length === 1) {
        textNode.textContent = text + e.key;
      }
    });
  }

  private async executeCommand(command: string) {
    const cmd = command.trim().toLowerCase();
    
    // Track command usage
    trackCommandUsage(cmd);
    
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
        // Destroy previous SnakeGame if it exists
        if (this.snakeInstance) {
          this.snakeInstance.destroy();
          this.snakeInstance = null;
        }
        // Remove any previous snake containers from output
        Array.from(this.outputContainer.querySelectorAll('.snake-terminal-container')).forEach(el => el.remove());
        // Render Snake game in terminal output
        const snakeDiv = document.createElement('div');
        snakeDiv.className = 'snake-terminal-container';
        snakeDiv.style.display = 'flex';
        snakeDiv.style.justifyContent = 'center';
        snakeDiv.style.alignItems = 'center';
        snakeDiv.style.height = '100%';
        snakeDiv.style.width = '100%';
        this.outputContainer.appendChild(snakeDiv);
        this.snakeInstance = new SnakeGame(snakeDiv);
        break;
      case '':
        break;
      default:
        await this.typeText(`Command not found: ${command}\n`, 0);
        break;
    }
    
    this.showPrompt();
  }

  private async showHelp() {
    const helpText = `\nAvailable commands:\n  help          - Show this help message\n  cv            - Display my CV/resume\n  cat cv.txt    - Display my CV/resume\n  ls            - List files\n  whoami        - Show current user\n  date          - Show current date/time\n  clear         - Clear terminal\n`;
    await this.typeText(helpText, 0);
  }

  private async showCV() {
    const cvContent = `\nName: Joe Cowin\nTitle: Information Security Engineer\nAbout: Passionate engineer with expertise in DevSecOps, cloud security, and infrastructure automation. Specializes in Azure technologies, security compliance, and building scalable cloud-native solutions.\n\nExperience:\n\n🏢 Derivco Málaga (Full-time · 3 yrs 2 mos) | Málaga, Andalusia, Spain\n\n  📍 Information Security Engineer (Feb 2025 - Jul 2025 · 6 mos)\n  • Administered and enhanced Azure policy management, transitioning to Azure EPAC for improved compliance\n  • Implemented AzGovViz for governance visualisation, strengthening control coverage and best practices\n  • Drove the adoption of Wiz, enabling teams to proactively identify security risks earlier in the software lifecycle\n  Skills: Azure Policy, Azure EPAC, Wiz, Governance, Compliance\n\n  📍 Senior IT Engineer (Feb 2024 - Jan 2025 · 1 yr)\n  • Led DevSecOps initiatives, collaborating with cross-functional teams to launch an AI promotions tool on Azure Kubernetes Service\n  • Engineered secure Azure environments using Terraform, enhancing deployment efficiency through robust CI/CD pipelines\n  • Implemented CNCF best practices, resulting in accelerated delivery of scalable cloud-native solutions\n  • Proactively managed post-launch operations, resolving critical production issues to ensure optimal performance\n  Skills: DevSecOps, Azure Kubernetes Service (AKS), Terraform, CI/CD, CNCF\n\n  📍 IT Engineer (Jun 2022 - Feb 2024 · 1 yr 9 mos)\n  • Seeded and trained a new technical team, enhancing operational capabilities\n  • Automated cloud infrastructure deployments using Terraform, significantly improving scalability and maintainability\n  • Proactively monitored and resolved production incidents, ensuring minimal business disruption and high system uptime\n  Skills: Terraform, Observability, Team Leadership, Infrastructure Automation\n\n🏢 Derivco Isle of Man (3 yrs 10 mos)\n\n  📍 IT Engineer (May 2021 - Jun 2022 · 1 yr 2 mos) | Douglas, Isle of Man\n  • Collaborated on internal projects to modernise business infrastructure, enhancing overall efficiency\n  • Implemented Azure cloud technologies, resulting in improved operational workflows\n  • Developed custom Helm charts for Kubernetes deployments, simplifying application configurations\n  • Created CI/CD pipelines that automated deployment processes, significantly increasing release frequency\n  Skills: Microsoft Azure, Azure DevOps, Helm, Kubernetes, CI/CD\n\n  📍 IT Apprentice (Sep 2018 - May 2021 · 2 yrs 9 mos) | Douglas, Isle of Man\n  • Provided live systems support across multiple teams, enhancing operational efficiency\n  • Collaborated with internal teams to improve player experience and streamline processes\n  • Developed internal tools and scripts, laying a strong foundation for operations\n  Skills: Technical Support, Customer Support, Scripting, Operations\n\nCore Skills: Azure, DevSecOps, Terraform, Kubernetes, Security Compliance, CI/CD, Infrastructure as Code, Observability, Team Leadership\n\nContact: \n  Email: joe@joecow.in\n  GitHub: https://github.com/joecow\n  LinkedIn: https://linkedin.com/in/joecowin\n`;
    await this.typeText(cvContent, 0);
  }

  private async showFiles() {
    const files = `\ncv.txt\nREADME.md\nprojects/\n  ├── web-apps/\n  ├── automation/\n  └── cloud/\n`;
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
    for (let i = 0; i < text.length; i++) {
      line.textContent += text[i];
      this.scrollToBottom();
      await this.sleep(speed);
    }
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
