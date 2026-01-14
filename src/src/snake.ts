export type SnakeOptions = {
  startLoop?: boolean;
  tickMs?: number;
  disableDraw?: boolean;
};

export class SnakeGame {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private gridSize = 20;
  private cols: number = 0;
  private rows: number = 0;
  private snake: { x: number; y: number }[] = [];
  private direction: { x: number; y: number } = { x: 1, y: 0 };
  private food: { x: number; y: number } = { x: 0, y: 0 };
  private gameInterval: any;
  private isGameOver = false;
  private isWaitingToStart = true;
  private pendingDirection: { x: number; y: number } | null = null;
  private score = 0;
  private resizeObserver: ResizeObserver;
  private destroyed = false;
  private onExit?: () => void;
  private tickMs: number = 100;
  private disableDraw: boolean = false;

  constructor(container: HTMLElement, onExit?: () => void, options?: SnakeOptions) {
    this.container = container;
    this.onExit = onExit;
    if (options?.tickMs !== undefined) this.tickMs = options.tickMs;
    if (options?.disableDraw !== undefined) this.disableDraw = options.disableDraw;

    this.canvas = document.createElement('canvas');
    this.canvas.style.background = '#111';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    this.handleResize();
    this.listen();
    this.reset();

    // Draw initial start screen
    this.drawStartScreen();

    if (options?.startLoop !== false) {
      // Don't auto-start the game loop, wait for user input
      // The loop will be started when user presses a key
    }
  }

  public destroy() {
    this.destroyed = true;
    this.unlisten();
    if (this.gameInterval) clearTimeout(this.gameInterval);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.onExit) {
      try { this.onExit(); } catch {}
    }
  }

  private handleResize() {
    if (this.destroyed) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // In test/jsdom environments clientWidth/height can be 0; ensure minimum grid of 1x1
    this.cols = Math.max(1, Math.floor(this.width / this.gridSize));
    this.rows = Math.max(1, Math.floor(this.height / this.gridSize));
    // Clamp snake and food positions if needed
    if (this.snake) {
      this.snake = this.snake.filter(s => s.x < this.cols && s.y < this.rows);
      if (this.snake.length === 0) this.reset();
    }
    if (this.food) {
      if (this.food.x >= this.cols || this.food.y >= this.rows) this.placeFood();
    }
    // Redraw start screen if waiting
    if (this.isWaitingToStart) {
      this.drawStartScreen();
    }
  }

  private reset() {
    // Guard against environments where client sizes are 0 (e.g., jsdom)
    this.cols = Math.max(1, Math.floor(this.container.clientWidth / this.gridSize));
    this.rows = Math.max(1, Math.floor(this.container.clientHeight / this.gridSize));
    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: Math.max(0, startX - 1), y: startY },
      { x: Math.max(0, startX - 2), y: startY },
    ];
    this.direction = { x: 1, y: 0 };
    this.pendingDirection = null;
    this.placeFood();
    this.isGameOver = false;
    this.score = 0;
  }

  private listen() {
    window.addEventListener('keydown', this.handleKey);
  }

  private unlisten() {
    window.removeEventListener('keydown', this.handleKey);
  }
  private handleKey = (e: KeyboardEvent) => {
    // ESC exits the game immediately
    if (e.key === 'Escape') {
      this.isGameOver = true;
      this.unlisten();
      this.destroy();
      return;
    }

    // If waiting to start, any valid game key starts the game
    if (this.isWaitingToStart) {
      const validStartKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'Enter'];
      if (validStartKeys.includes(e.key)) {
        this.startGame();
        // If it's a direction key, also set the initial direction
        if (['ArrowUp', 'w'].includes(e.key)) {
          this.direction = { x: 0, y: -1 };
        } else if (['ArrowDown', 's'].includes(e.key)) {
          this.direction = { x: 0, y: 1 };
        } else if (['ArrowLeft', 'a'].includes(e.key)) {
          this.direction = { x: -1, y: 0 };
        } else if (['ArrowRight', 'd'].includes(e.key)) {
          this.direction = { x: 1, y: 0 };
        }
        return;
      }
      return;
    }

    let newDir: { x: number; y: number } | null = null;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        newDir = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
        newDir = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
        newDir = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
        newDir = { x: 1, y: 0 };
        break;
    }
    if (newDir && !this.isGameOver) {
      // Prevent reversing
      if (
        this.snake.length > 1 &&
        this.direction.x === -newDir.x &&
        this.direction.y === -newDir.y
      ) {
        return;
      }
      this.pendingDirection = newDir;
    }
  };

  private loop = () => {
    if (this.destroyed) return;
    if (this.isGameOver) {
      this.drawGameOver();
      this.destroy();
      return;
    }
    this.update();
    this.draw();
    this.gameInterval = setTimeout(this.loop, this.tickMs);
  };

  private update() {
    if (this.pendingDirection) {
      this.direction = this.pendingDirection;
      this.pendingDirection = null;
    }
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    // Check collision with walls
    if (
      head.x < 0 ||
      head.x >= this.cols ||
      head.y < 0 ||
      head.y >= this.rows
    ) {
      this.isGameOver = true;
      this.unlisten();
      return;
    }
    // Check collision with self
    if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this.isGameOver = true;
      this.unlisten();
      return;
    }
    this.snake.unshift(head);
    // Check food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.placeFood();
    } else {
      this.snake.pop();
    }
  }

  private placeFood() {
    // If grid is degenerate, just place at origin to avoid infinite loops
    if (this.cols <= 0 || this.rows <= 0) {
      this.food = { x: 0, y: 0 };
      return;
    }
    let valid = false;
    let safety = 0;
    while (!valid && safety++ < 1000) {
      this.food.x = Math.floor(Math.random() * this.cols);
      this.food.y = Math.floor(Math.random() * this.rows);
      valid = !this.snake.some((s) => s.x === this.food.x && s.y === this.food.y);
    }
    if (!valid) this.food = { x: 0, y: 0 };
  }

  private draw() {
    if (this.disableDraw) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    // Draw snake
    for (let i = 0; i < this.snake.length; i++) {
      this.ctx.fillStyle = i === 0 ? '#0f0' : '#fff';
      this.ctx.fillRect(
        this.snake[i].x * this.gridSize,
        this.snake[i].y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }
    // Draw food
    this.ctx.fillStyle = '#f00';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Fira Mono, monospace';
    this.ctx.fillText('Score: ' + this.score, 10, 20);
  }

  private drawGameOver() {
    this.draw();
    this.ctx.fillStyle = '#f00';
    this.ctx.font = '32px Fira Mono, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over', this.width / 2, this.height / 2);
    this.ctx.font = '18px Fira Mono, monospace';
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'start';
  }

  private drawStartScreen() {
    if (this.disableDraw) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw the snake and food in their starting positions
    this.draw();

    // Draw semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw title
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = 'bold 32px Fira Mono, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SNAKE', this.width / 2, this.height / 2 - 40);

    // Draw start instruction
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px Fira Mono, monospace';
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const startText = isMobile ? 'Tap a direction to start' : 'Press any arrow key to start';
    this.ctx.fillText(startText, this.width / 2, this.height / 2 + 10);

    // Draw controls hint
    this.ctx.fillStyle = '#888';
    this.ctx.font = '14px Fira Mono, monospace';
    const controlsText = isMobile ? 'Use D-pad to control' : 'Arrow keys or WASD to move';
    this.ctx.fillText(controlsText, this.width / 2, this.height / 2 + 40);

    this.ctx.textAlign = 'start';
  }

  private startGame() {
    this.isWaitingToStart = false;
    this.loop();
  }
} 