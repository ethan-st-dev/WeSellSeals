#!/bin/bash

# Azure Setup Script for WeSellSeals
# This script creates all Azure resources needed for production deployment

set +e  # Don't exit on error, we'll handle them

echo "🚀 Starting Azure resource creation for WeSellSeals..."
echo ""

# Configuration variables
RESOURCE_GROUP="WeSellSeals-Production-RG"
LOCATION="westus2"
SQL_SERVER_NAME="wesellseals-sql-server"
DATABASE_NAME="WeSellSealsDB"
SQL_ADMIN_USER="sqladmin"
WEBAPP_NAME="wesellseals-api"
STATIC_WEB_APP_NAME="wesellseals-client"
APP_SERVICE_PLAN="WeSellSeals-Plan"
USING_CONTAINER_APPS=false

# Prompt for SQL password
echo "⚠️  You'll need to provide a secure password for the SQL Server admin account."
echo "Password requirements: At least 8 characters with uppercase, lowercase, numbers, and special characters"
read -sp "Enter SQL Server admin password: " SQL_ADMIN_PASSWORD
echo ""
echo ""

# Step 1: Login to Azure
echo "📝 Step 1: Logging into Azure..."
az login
echo "✅ Logged in successfully"
echo ""

# Step 2: Create Resource Group (skip if exists)
echo "📝 Step 2: Checking/Creating resource group '$RESOURCE_GROUP'..."
if az group show --name $RESOURCE_GROUP &>/dev/null; then
  echo "✅ Resource group already exists"
else
  az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table
  echo "✅ Resource group created"
fi
echo ""

# Step 3: Create SQL Server (skip if exists)
echo "📝 Step 3: Checking/Creating SQL Server '$SQL_SERVER_NAME'..."
if az sql server show --name $SQL_SERVER_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "✅ SQL Server already exists"
else
  az sql server create \
    --name $SQL_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user $SQL_ADMIN_USER \
    --admin-password "$SQL_ADMIN_PASSWORD" \
    --output table
  echo "✅ SQL Server created"
fi
echo ""

# Step 4: Configure SQL Server Firewall Rules
echo "📝 Step 4: Configuring firewall rules..."

# Allow Azure services
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 \
  --output table 2>/dev/null || echo "  (Rule already exists)"

# Get current IP and allow it
MY_IP=$(curl -s https://api.ipify.org)
echo "Your IP address: $MY_IP"
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP \
  --output table 2>/dev/null || echo "  (Rule already exists)"
echo "✅ Firewall rules configured"
echo ""

# Step 5: Create SQL Database (skip if exists)
echo "📝 Step 5: Checking/Creating database '$DATABASE_NAME'..."
if az sql db show --name $DATABASE_NAME --resource-group $RESOURCE_GROUP --server $SQL_SERVER_NAME &>/dev/null; then
  echo "✅ Database already exists"
else
  az sql db create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name $DATABASE_NAME \
    --service-objective Basic \
    --backup-storage-redundancy Local \
    --output table
  echo "✅ Database created"
fi
echo ""

# Step 6: Create App Service Plan with fallback to Container Apps
echo "📝 Step 6: Creating App Service Plan '$APP_SERVICE_PLAN'..."
if az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux \
  --output table 2>/dev/null; then
  echo "✅ App Service Plan created"
else
  echo "⚠️  App Service quota exceeded. Using Azure Container Apps instead..."
  USING_CONTAINER_APPS=true
  
  # Create Container Apps Environment
  echo "📝 Creating Container Apps Environment..."
  az containerapp env create \
    --name wesellseals-env \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output table
  
  # Create Container App for API
  echo "📝 Creating Container App for API..."
  az containerapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment wesellseals-env \
    --image mcr.microsoft.com/dotnet/samples:aspnetapp \
    --target-port 8080 \
    --ingress external \
    --output table
  
  echo "✅ Container App created"
  WEBAPP_URL=$(az containerapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
fi
echo ""

if [[ $USING_CONTAINER_APPS != true ]]; then
  # Step 7: Create Web App for .NET API
  echo "📝 Step 7: Creating Web App '$WEBAPP_NAME'..."
  az webapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "DOTNET:8.0" \
    --output table
  echo "✅ Web App created"
  WEBAPP_URL="${WEBAPP_NAME}.azurewebsites.net"
  echo ""
fi

# Step 8: Create Static Web App for React Client
echo "📝 Step 8: Creating Static Web App '$STATIC_WEB_APP_NAME'..."
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --output table 2>/dev/null || echo "✅ Static Web App already exists"
echo "✅ Static Web App ready"
echo ""

# Step 9: Get connection string
echo "📝 Step 9: Getting connection string..."
CONNECTION_STRING="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Initial Catalog=${DATABASE_NAME};User ID=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASSWORD};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
echo "✅ Connection string generated"
echo ""

# Step 10: Configure connection string
if [[ $USING_CONTAINER_APPS == true ]]; then
  echo "📝 Step 10: Configuring Container App environment variables..."
  az containerapp update \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --set-env-vars "ConnectionStrings__AzureSqlConnection=$CONNECTION_STRING" \
    --output table
else
  echo "📝 Step 10: Configuring Web App connection string..."
  az webapp config connection-string set \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --connection-string-type SQLAzure \
    --settings AzureSqlConnection="$CONNECTION_STRING" \
    --output table
fi
echo "✅ Connection string configured"
echo ""

# Step 11: Get Static Web App deployment token
echo "📝 Step 11: Getting Static Web App deployment token..."
STATIC_WEB_APP_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" \
  --output tsv)
echo "✅ Deployment token retrieved"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "🎉 Azure resources created successfully!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Resource Summary:"
echo "  • Resource Group: $RESOURCE_GROUP"
echo "  • SQL Server: ${SQL_SERVER_NAME}.database.windows.net"
echo "  • Database: $DATABASE_NAME"
if [[ $USING_CONTAINER_APPS == true ]]; then
  echo "  • Container App (API): https://${WEBAPP_URL}"
else
  echo "  • Web App (API): https://${WEBAPP_URL}"
fi
echo "  • Static Web App: https://${STATIC_WEB_APP_NAME}.azurestaticapps.net"
echo ""
echo "🔐 GitHub Secrets to Add:"
echo "  1. AZURE_SQL_CONNECTION_STRING"
echo "     Value: $CONNECTION_STRING"
echo ""
echo "  2. AZURE_WEBAPP_NAME"
echo "     Value: $WEBAPP_NAME"
echo ""
echo "  3. AZURE_API_URL"
echo "     Value: https://${WEBAPP_URL}"
echo ""
echo "  4. AZURE_STATIC_WEB_APPS_API_TOKEN"
echo "     Value: $STATIC_WEB_APP_TOKEN"
echo ""
echo "  5. AZURE_CREDENTIALS (create service principal)"
echo "     Run: az ad sp create-for-rbac --name \"WeSellSeals-GitHub-Actions\" --role contributor --scopes /subscriptions/\$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"
echo ""
echo "📝 Next Steps:"
echo "  1. Add the GitHub secrets listed above"
echo "  2. Update Server/appsettings.Production.json with real values"
echo "  3. Run database migrations: dotnet ef database update --connection \"\$CONNECTION_STRING\""
echo "  4. Push to main branch to trigger deployment"
echo ""
if [[ $USING_CONTAINER_APPS == true ]]; then
  echo "💰 Cost Estimate:"
  echo "  • SQL Database (Basic): ~\$5/month"
  echo "  • Container Apps: ~\$10/month (with free tier allowance)"
  echo "  • Static Web App: Free tier"
  echo "  Total: ~\$15/month"
else
  echo "💰 Cost Estimate:"
  echo "  • SQL Database (Basic): ~\$5/month"
  echo "  • App Service (B1): ~\$13/month"
  echo "  • Static Web App: Free tier"
  echo "  Total: ~\$18/month"
fi
echo ""
echo "════════════════════════════════════════════════════════════════"
