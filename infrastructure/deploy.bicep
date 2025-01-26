targetScope = 'subscription'

@description('The location for all resources')
param location string = 'westeurope'

@description('The name of the application')
param application string = 'joecowin'

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-${application}-prod-westeurope'
  location: location
}

// Deploy Web App resources
module webApp 'webApp.bicep' = {
  scope: rg
  name: 'webAppDeployment'
  params: {
    location: location
    application: application
  }
}

// Outputs
output resourceGroupName string = rg.name
output webAppUrl string = webApp.outputs.webAppUrl 
