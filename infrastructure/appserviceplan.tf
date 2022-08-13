resource "azurerm_service_plan" "joecowin_asp" {
  name                = "${var.name}-asp"
  resource_group_name = azurerm_resource_group.example.name
  location            = azurerm_resource_group.example.location
  os_type             = "Linux"
  sku_name            = "F1"
}