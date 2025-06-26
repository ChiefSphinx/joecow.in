resource "azurerm_resource_group" "main" {
  name     = "rg-${var.product}-${var.environment}"
  location = var.location
}
