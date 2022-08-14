resource "azurerm_dns_zone" "joecowin_dns" {
  name                = "joecow.in"
  resource_group_name = azurerm_resource_group.joecowin_rg.name
}

