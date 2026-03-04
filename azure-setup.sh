#!/bin/bash

# Azure FREE Setup Script for WeSellSeals
# This script creates all Azure resources using FREE tiers only

set +e  # Don't exit on error, we'll handle them

echo "🚀 Starting FREE Azure resource creation for WeSellSeals..."
echo ""
echo "💰 This setup uses ONLY free Azure tiers:"
echo "   • Azure Static Web Apps (Free)"
echo "   • Azure App Service (F1 Free)"
echo "   • Azure Blob Storage (5GB free + ~$0.02/GB after)"
echo "   • PostgreSQL database (Supabase free tier - 500MB)"
echo ""

# Configuration variables
RESOURCE_GROUP="WeSellSeals-Free-RG"
LOCATION="westus2"
WEBAPP_NAME="wesellseals-api-free"
STATIC_WEB_APP_NAME="wesellseals-client-free"
APP_SERVICE_PLAN="WeSellSeals-Free-Plan"
STORAGE_ACCOUNT="wesellsealsstorage"  # Must be lowercase, no hyphens

# Step 1: Login to Azure
echo "📝 Step 1: Logging into Azure..."
az login
echo "✅ Logged in successfully"
echo ""

# Step 2: Create Resource Group
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

# Step 3: Create Storage Account for Blob Storage and SQLite backup
echo "📝 Step 3: Creating Storage Account '$STORAGE_ACCOUNT'..."
if az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "✅ Storage account already exists"
else
  az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --allow-blob-public-access true \
    --output table
  echo "✅ Storage account created"
fi
echo ""

# Step 4: Get Storage Account Connection String
echo "📝 Step 4: Getting storage connection string..."
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv)
echo "✅ Connection string retrieved"
echo ""

# Step 5: Create Blob Containers
echo "📝 Step 5: Creating blob containers..."

# Container for uploaded 3D models
az storage container create \
  --name sealmodels \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob \
  --output table 2>/dev/null || echo "  (sealmodels container already exists)"

echo "✅ Blob containers created"
echo ""

# Step 6: Create FREE App Service Plan (F1 tier)
echo "📝 Step 6: Creating FREE App Service Plan '$APP_SERVICE_PLAN'..."
if az appservice plan show --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "✅ App Service Plan already exists"
else
  az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux \
    --output table
  echo "✅ FREE App Service Plan created (F1 tier)"
  echo "   ⚠️  Limitations: 60 CPU minutes/day, 1GB RAM, no custom domain SSL"
fi
echo ""

# Step 7: Create Web App for .NET API
echo "📝 Step 7: Creating Web App '$WEBAPP_NAME'..."
if az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "✅ Web App already exists"
else
  az webapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "DOTNET:8.0" \
    --output table
  echo "✅ Web App created"
fi
WEBAPP_URL="${WEBAPP_NAME}.azurewebsites.net"
echo ""

# Step 8: Configure Web App Settings
echo "📝 Step 8: Configuring Web App environment variables..."

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --settings \
    "FileStorage__AzureBlobConnectionString=$STORAGE_CONNECTION_STRING" \
    "FileStorage__ContainerName=sealmodels" \
    "FileStorage__BaseUrl=https://${STORAGE_ACCOUNT}.blob.core.windows.net/sealmodels" \
    "ASPNETCORE_ENVIRONMENT=Production" \
  --output table

echo "✅ Web App configured (PostgreSQL connection string must be set separately)"
echo ""

# Step 9: Enable Always On (not available in F1, but try anyway)
echo "📝 Step 9: Configuring Web App settings..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --always-on false \
  --http20-enabled true \
  --output table 2>/dev/null || echo "  ⚠️  Always On not available in F1 tier (this is expected)"
echo ""

# Step 10: Create FREE Static Web App for React Client
echo "📝 Step 10: Creating FREE Static Web App '$STATIC_WEB_APP_NAME'..."
if az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "✅ Static Web App already exists"
else
  az staticwebapp create \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Free \
    --output table
  echo "✅ FREE Static Web App created"
fi
STATIC_APP_URL="${STATIC_WEB_APP_NAME}.azurestaticapps.net"
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

# Step 12: Get Storage Account Key
STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query "[0].value" \
  --output tsv)

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "🎉 FREE Azure resources created successfully!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Resource Summary:"
echo "  • Resource Group: $RESOURCE_GROUP"
echo "  • Web App (API): https://${WEBAPP_URL}"
echo "  • Static Web App: https://${STATIC_APP_URL}"
echo "  • Storage Account: $STORAGE_ACCOUNT"
echo "  • Database: Supabase PostgreSQL (configure separately)"
echo ""
echo "💰 TOTAL COST: \$0/month (completely FREE!)"
echo ""
echo "⚠️  FREE Tier Limitations:"
echo "  • App Service F1: 60 CPU minutes/day max"
echo "  • App Service: Goes to sleep after 20 min inactivity"
echo "  • Static Web App: 100GB bandwidth/month"
echo "  • Storage: First 5GB free, then ~\$0.02/GB/month"
echo ""
echo "🔐 GitHub Secrets to Add:"
echo ""
echo "  1. AZURE_WEBAPP_NAME"
echo "     Value: $WEBAPP_NAME"
echo ""
echo "  2. AZURE_API_URL"
echo "     Value: https://${WEBAPP_URL}"
echo ""
echo "  3. AZURE_STATIC_WEB_APPS_API_TOKEN"
echo "     Value: $STATIC_WEB_APP_TOKEN"
echo ""
echo "  4. AZURE_STORAGE_CONNECTION_STRING"
echo "     Value: $STORAGE_CONNECTION_STRING"
echo ""
echo "  5. AZURE_STORAGE_ACCOUNT_NAME"
echo "     Value: $STORAGE_ACCOUNT"
echo ""
echo "  6. AZURE_STORAGE_ACCOUNT_KEY"
echo "     Value: $STORAGE_KEY"
echo ""
echo "  7. AZURE_CREDENTIALS (create service principal)"
echo "     Run: az ad sp create-for-rbac --name \"WeSellSeals-GitHub-Actions\" --role contributor --scopes /subscriptions/\$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"
echo ""
echo "📝 Next Steps:"
echo "  1. Set up FREE Supabase PostgreSQL database (see SUPABASE_SETUP.md)"
echo "  2. Add the GitHub secrets listed above to your repository"
echo "  3. Add PostgreSQL connection string to Azure Web App settings"
echo "  4. Add Stripe and Clerk secrets to GitHub and Azure Web App"
echo "  5. Push to main branch to trigger deployment"
echo "  6. Run database migrations after first deployment"
echo ""
echo "🔗 Useful Commands:"
echo "  • View Web App logs: az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
echo "  • Restart Web App: az webapp restart --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
echo "  • SSH into Web App: az webapp ssh --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "════════════════════════════════════════════════════════════════"
