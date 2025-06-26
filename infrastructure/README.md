# Infrastructure

This directory contains the infrastructure-as-code (IaC) configuration for provisioning and managing cloud resources for this project.

## Contents
- `main.tf`: Main Terraform configuration file.
- `resourcegroup.tf`: Defines the Azure resource group.
- `variables.tf`: Input variables for Terraform modules and resources.

## Usage

1. Install [Terraform](https://www.terraform.io/downloads.html).
2. Initialize the working directory:
   ```sh
   terraform init
   ```
3. Review and apply the configuration:
   ```sh
   terraform plan
   terraform apply
   ```

> **Note:** State files and sensitive files are ignored via `.gitignore` in this directory. 