data "cloudflare_accounts" "this" {
  name = var.account_name
}

resource "cloudflare_zone" "joecowin" {
  account = {
    id = data.cloudflare_accounts.this.result[0].id
  }
  name = var.zone_name
}

resource "cloudflare_pages_project" "joecowin" {
  account_id        = data.cloudflare_accounts.this.result[0].id
  name              = var.project_name
  production_branch = var.production_branch
}
