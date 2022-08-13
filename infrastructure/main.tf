terraform {
  backend "remote" {
    organization = "joecowin"
    workspaces {
      name = "joecowin"
    }

  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "joecowin_rg" {
  name     = var.name
  location = var.location
}
