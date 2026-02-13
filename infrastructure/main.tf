# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "cloudflare" {}

data "cloudflare_accounts" "this" {}

resource "cloudflare_pages_project" "main" {
  account_id        = data.cloudflare_accounts.this.accounts[0].id
  name              = var.project_name
  production_branch = var.production_branch
}