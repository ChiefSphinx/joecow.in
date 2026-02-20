# joecow.in

This repository contains the source code for my personal website, featuring a unique terminal-style interface that showcases my projects, skills, and professional experience. The site is built with [Vite](https://vitejs.dev/) (Node.js) and deployed on Cloudflare Pages, with infrastructure managed via Terraform.

## Technologies Used

- **Frontend:**
  - Vite
  - TypeScript (vanilla)
  - Node.js

- **Infrastructure:**
  - Cloudflare Pages
  - Terraform (IaC)
  - GitHub Actions (CI/CD)

## Project Structure
```
├── .github/
│   ├── workflows/ # GitHub Actions workflows
│   │   └── cloudflare-pages.yml
│   └── pull_request_template.md
├── infrastructure/ # Terraform templates
│   ├── main.tf
│   ├── variables.tf
│   ├── .gitignore
│   └── README.md
├── src/ # Vite application (Node.js)
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── _headers
│   │   └── _routes.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── posthog.ts
│   │   ├── snake.ts
│   │   ├── style.css
│   │   └── vite-env.d.ts
│   └── utils/
│       └── content-loader.ts
├── .gitignore
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