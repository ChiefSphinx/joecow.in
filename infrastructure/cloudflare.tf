resource "cloudflare_zone" "joecowin" {
  account = {
    id = var.account_id
  }
  name = var.zone_name
}

resource "cloudflare_pages_project" "joecowin" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch
}
