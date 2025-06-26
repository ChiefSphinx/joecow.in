resource "azurerm_app_service_plan" "main" {
  name                = "asp-${var.product}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Free"
    size = "F1"
  }
}

resource "azurerm_app_service" "main" {
  name                = "app-${var.product}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id

  site_config {
    linux_fx_version = "DOCKER|<DOCKER_IMAGE_NAME>:<TAG>"
  }

  app_settings = {
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
  }
}

# Replace <DOCKER_IMAGE_NAME>:<TAG> with your actual Docker image (e.g., joecowin/vite-app:latest)
