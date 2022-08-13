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

resource "azurerm_virtual_network" "joecowin_vnet" {
  name                = "${var.name}-network"
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = azurerm_resource_group.joecowin_rg.location
  address_space       = ["10.0.0.0/16"]
}