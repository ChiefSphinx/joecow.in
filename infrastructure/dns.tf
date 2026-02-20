resource "cloudflare_dns_record" "root" {
  zone_id = cloudflare_zone.joecowin.id
  name    = "@"
  content = "joecowin.pages.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "www" {
  zone_id = cloudflare_zone.joecowin.id
  name    = "www"
  content = "joecowin.pages.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
