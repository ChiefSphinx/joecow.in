# joecow.in

This repository contains the source code for my personal website, featuring a unique terminal-style interface that showcases my projects, skills, and professional experience. The site is built with [Vite](https://vitejs.dev/) (Node.js) and deployed on Cloudflare Pages, with infrastructure managed via Terraform.

## Technologies Used

- **Frontend:**
  - Vite
  - TypeScript (vanilla)
  - Node.js

- **Testing:**
  - Vitest (unit tests)
  - Playwright (E2E tests)

- **Code Quality:**
  - ESLint
  - Prettier

- **Infrastructure:**
  - Cloudflare Pages
  - Terraform (IaC)
  - GitHub Actions (CI/CD)

## Project Structure
```
├── .github/
│   ├── workflows/
│   │   └── cloudflare-pages.yml
│   └── pull_request_template.md
├── infrastructure/
│   ├── cloudflare.tf
│   ├── dns.tf
│   ├── main.tf
│   ├── variables.tf
│   ├── .gitignore
│   └── README.md
├── src/
│   ├── src/                    # Application source
│   │   ├── TerminalUI.ts
│   │   ├── CommandRegistry.ts
│   │   ├── ThemeManager.ts
│   │   ├── InputHandler.ts
│   │   ├── SnakeIntegration.ts
│   │   ├── main.ts
│   │   ├── snake.ts
│   │   ├── posthog.ts
│   │   ├── types.ts
│   │   ├── vite-env.d.ts
│   │   └── utils/              # Utility functions
│   │       └── content-loader.ts
│   ├── tests/                  # Tests
│   │   ├── setup.ts
│   │   ├── CommandRegistry.test.ts
│   │   ├── ThemeManager.test.ts
│   │   ├── content-loader.test.ts
│   │   ├── snake.test.ts
│   │   └── e2e/              # E2E tests
│   │       └── terminal.spec.ts
│   ├── data/                   # JSON content files
│   │   ├── cv.json
│   │   ├── terminal-content.json
│   │   └── README.md
│   ├── public/                 # Static assets
│   │   ├── favicon.ico
│   │   ├── og-image.png
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   ├── _headers
│   │   └── _routes.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── eslint.config.mjs
│   ├── .prettierrc
│   └── .gitignore
├── LICENSE
└── README.md
```

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/joecow.in.git
cd joecow.in
```
2. Install dependencies
```bash
cd src
npm install
```
3. Run the application
```bash
npm run dev
```
The application will be available at http://localhost:5173 (or the port specified by Vite).

## Testing

Run from the `src` directory:

**Unit tests (Vitest):**
```bash
npm run test
```

**E2E tests (Playwright):**
```bash
npm run test:e2e
```

## Code Quality

Run from the `src` directory:

**Linting:**
```bash
npm run lint
```

**Type checking:**
```bash
npm run typecheck
```

**Formatting:**
```bash
npm run format
```

## Mobile Features

The terminal UI is optimized for mobile devices:

- **Responsive ASCII Art**: Condensed version on screens < 480px
- **Inline Input Overlay**: Input appears over command-line when focused
- **Safe Area Support**: Proper spacing on notched devices (iPhone X+)
- **Touch Controls**: D-pad for snake game, larger tap targets
- **iOS Optimizations**: 16px font prevents auto-zoom, pull-to-refresh blocked

Viewport detection occurs at load time via `isMobileViewport()` in `main.ts`.

## Infrastructure Deployment

The production site runs on Cloudflare Pages. The GitHub Actions workflow at `.github/workflows/cloudflare-pages.yml` builds and deploys the site whenever changes land on `main`.

Required GitHub secrets for the workflow:
- VITE_POSTHOG_KEY
- VITE_POSTHOG_HOST
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

Terraform in `infrastructure/` provisions the Cloudflare resources (zone, pages project). Run it manually as needed:

1. Install [Terraform](https://www.terraform.io/downloads.html).
2. Navigate to the infrastructure directory:
   ```sh
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

> **Note:** State files and sensitive files are ignored via `.gitignore` in the infrastructure directory.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.