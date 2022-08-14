resource "azurerm_service_plan" "joecowin_asp" {
  name                = "${var.name}-asp"
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = azurerm_resource_group.joecowin_rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "joecowin" {
  name                = var.name
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = azurerm_service_plan.joecowin_asp.location
  service_plan_id     = azurerm_service_plan.joecowin_asp.id
  https_only          = true


  site_config {
    always_on = false
  }
}