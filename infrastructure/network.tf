resource "azurerm_dns_zone" "joecowin_dns" {
  name                = "joecow.in"
  resource_group_name = azurerm_resource_group.joecowin_rg.name
}

resource "azurerm_dns_cname_record" "joecowin_cname" {
  name                = "www"
  zone_name           = azurerm_dns_zone.joecowin_dns.name
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  ttl                 = 3600
  record              = "gray-tree-0954c2203.1.azurestaticapps.net"
}