terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
  cloud {
    organization = "joecowin"
    workspaces {
      name = "joecowin"
    }
  }
}

provider "cloudflare" {}
