# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "cloudflare" {}

data "cloudflare_accounts" "this" {
  name = var.account_name
}

locals {
  account_id = data.cloudflare_accounts.this.result[0].id
}

resource "cloudflare_zone" "joecowin" {
  account = {
    id = local.account_id
  }
  name = var.zone_name
}

resource "cloudflare_pages_project" "joecowin" {
  account_id        = local.account_id
  name              = var.project_name
  production_branch = var.production_branch
}