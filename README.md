# joecow.in

This repository contains the source code for my personal website, featuring a unique terminal-style interface that showcases my projects, skills, and professional experience. The site is built with [Vite](https://vitejs.dev/) (Node.js) and deployed on Azure App Service, with infrastructure managed via Terraform.

## Technologies Used

- **Frontend:**
  - Vite
  - React (or your chosen framework)
  - Node.js
  - Docker

- **Infrastructure:**
  - Azure App Service (Linux)
  - Terraform (IaC)
  - GitHub Actions (CI/CD)

## Project Structure
```
├── .github/
│   ├── workflows/ # GitHub Actions workflows
│   │   ├── app-deploy.yml
│   │   └── infra-deploy.yml
│   └── pull_request_template.md
├── infrastructure/ # Terraform templates
│   ├── main.tf
│   ├── resourcegroup.tf
│   ├── variables.tf
│   ├── .gitignore
│   └── README.md
├── src/ # Main application code
│   ├── public/
│   ├── main.js (or main.tsx)
│   ├── App.jsx (or App.tsx)
│   ├── favicon.ico
│   └── node_modules/
├── .gitignore
├── Dockerfile
├── docker-compose.yml
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

Alternatively, using Docker:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:6969`

## Infrastructure Deployment

The website is deployed to Azure using Terraform and GitHub Actions. The deployment workflow is triggered automatically when changes are pushed to the `main` branch in the `infrastructure/` directory.

Prerequisites for deployment:
- Azure subscription
- Service Principal with appropriate permissions
- GitHub repository secrets configured:
  - AZURE_CLIENT_ID
  - AZURE_TENANT_ID
  - AZURE_SUBSCRIPTION_ID

### Manual Terraform Usage

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