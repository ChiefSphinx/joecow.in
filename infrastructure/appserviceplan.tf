resource "azurerm_static_site" "joecowin" {
  name                = var.name
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = "West Europe"
}
