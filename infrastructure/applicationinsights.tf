resource "azurerm_application_insights" "example" {
  name                = "${var.name}-appinsights"
  location            = azurerm_resource_group.joecowin_rg.location
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  application_type    = "Node.JS"
}