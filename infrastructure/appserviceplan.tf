resource "azurerm_service_plan" "joecowin_asp" {
  name                = "${var.name}-asp"
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = azurerm_resource_group.joecowin_rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_static_site" "joecowin" {
  name                = var.name
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = "West Europe"
}

resource "azurerm_linux_web_app" "joecowin" {
  name                = var.name
  resource_group_name = azurerm_resource_group.joecowin_rg.name
  location            = azurerm_service_plan.joecowin_asp.location
  service_plan_id     = azurerm_service_plan.joecowin_asp.id
  https_only          = true
  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"                  = "d64eb4f6-db68-4925-9257-42cf401fe8e3"
    "APPINSIGHTS_PROFILERFEATURE_VERSION"             = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION"             = "1.0.0"
    "APPLICATIONINSIGHTS_CONNECTION_STRING"           = "InstrumentationKey=d64eb4f6-db68-4925-9257-42cf401fe8e3;IngestionEndpoint=https://northeurope-0.in.applicationinsights.azure.com/;LiveEndpoint=https://northeurope.livediagnostics.monitor.azure.com/"
    "ApplicationInsightsAgent_EXTENSION_VERSION"      = "~3"
    "DiagnosticServices_EXTENSION_VERSION"            = "~3"
    "InstrumentationEngine_EXTENSION_VERSION"         = "disabled"
    "SnapshotDebugger_EXTENSION_VERSION"              = "disabled"
    "XDT_MicrosoftApplicationInsights_BaseExtensions" = "disabled"
    "XDT_MicrosoftApplicationInsights_Mode"           = "recommended"
    "XDT_MicrosoftApplicationInsights_PreemptSdk"     = "disabled"
  }
  site_config {
    always_on = false
  }
}