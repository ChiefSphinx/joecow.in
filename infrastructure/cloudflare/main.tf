terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {}

data "cloudflare_account" "main" {}

resource "cloudflare_pages_project" "main" {
  account_id        = data.cloudflare_account.main.id
  name              = var.project_name
  production_branch = var.production_branch
}