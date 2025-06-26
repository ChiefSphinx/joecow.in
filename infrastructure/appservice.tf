resource "azurerm_service_plan" "main" {
  name                = "asp-${var.product}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${var.product}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  site_config {
    application_stack {
      docker_image_name = "chiefsphinx/joecow.in:latest"
    }
    always_on = false
    ftps_state = "Disabled"
    http2_enabled = true
    minimum_tls_version = "1.2"
  }

  app_settings = {
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
  }
}
