resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.joecowin.id
  name    = "@"
  value   = "joecowin.pages.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.joecowin.id
  name    = "www"
  value   = "joecowin.pages.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
