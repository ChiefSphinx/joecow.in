# joecow.in

This repository contains the source code for my personal website, featuring a unique terminal-style interface that showcases my projects, skills, and professional experience. The site is built with Python using the FastHTML framework and deployed on Azure App Service.

## Technologies Used

- **Backend:**
  - Python 3.11
  - FastHTML (for HTML generation)
  - Docker

- **Infrastructure:**
  - Azure App Service (Linux)
  - Azure Bicep (IaC)
  - GitHub Actions (CI/CD)

## Project Structure
```
├── .github/
│ ├── workflows/ # GitHub Actions workflows
│ │ ├── app-deploy.yml
│ │ └── infra-deploy.yml
│ └── pull_request_template.md
├── infrastructure/ # Azure Bicep templates
│ ├── deploy.bicep
│ └── webApp.bicep
└── src/ # Main application code
│ ├── main.py 
│ └── requirements.txt
```

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/joecow.in.git
cd joecow.in/src/joecowin
```
2. Install dependencies
```bash
pip install -r requirements.txt
```
3. Run the application
```bash
python main.py
```
The application will be available at http://localhost:5001


Alternatively, using Docker:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:6969`

## Infrastructure Deployment

The website is deployed to Azure using Bicep templates and GitHub Actions. The deployment workflow is triggered automatically when changes are pushed to the `main` branch in the `infrastructure/` directory.

Prerequisites for deployment:
- Azure subscription
- Service Principal with appropriate permissions
- GitHub repository secrets configured:
  - AZURE_CLIENT_ID
  - AZURE_TENANT_ID
  - AZURE_SUBSCRIPTION_ID

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.