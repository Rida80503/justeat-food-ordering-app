# Deployment Guide

This guide covers production deployment for the JustEat application on Azure.

## 1. Architecture

- Backend: Azure App Service (Linux container)
- Frontend: Azure Static Web Apps or App Service
- Database: Azure Database for PostgreSQL Flexible Server
- Cache: Azure Cache for Redis (optional)
- CI-CD: GitHub Actions in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

## 2. Prerequisites

- Azure subscription
- Azure CLI installed and logged in
- GitHub repository with required secrets configured

## 3. Azure Resources

Use these commands as a baseline:

```bash
az group create --name rg-justeat-prod --location eastus

az postgres flexible-server create \
  --resource-group rg-justeat-prod \
  --name justeat-postgres-prod \
  --location eastus \
  --admin-user justeatadmin \
  --admin-password "<strong-password>" \
  --sku-name Standard_B1ms \
  --version 14

az appservice plan create \
  --name justeat-app-plan \
  --resource-group rg-justeat-prod \
  --is-linux \
  --sku B1

az webapp create \
  --resource-group rg-justeat-prod \
  --plan justeat-app-plan \
  --name justeat-backend-prod \
  --deployment-container-image-name myregistry.azurecr.io/justeat-backend:latest
```

## 4. Required GitHub Secrets

Configure these in repository settings:

- AZURE_CREDENTIALS
- AZURE_WEBAPP_NAME
- AZURE_RESOURCE_GROUP
- ACR_LOGIN_SERVER
- ACR_USERNAME
- ACR_PASSWORD
- DATABASE_URL
- JWT_SECRET_KEY

## 5. Backend Configuration

Set these App Service environment variables:

- APP_ENV=production
- APP_DEBUG=false
- DATABASE_URL=<postgres connection string>
- JWT_SECRET_KEY=<strong secret>
- JWT_ALGORITHM=HS256
- ACCESS_TOKEN_EXPIRE_MINUTES=15
- REFRESH_TOKEN_EXPIRE_DAYS=7
- ALLOWED_ORIGINS=<frontend production url>

## 6. Frontend Configuration

Set frontend environment variables:

- VITE_API_URL=https://justeat-backend-prod.azurewebsites.net/api

For Static Web Apps, configure VITE_API_URL in workflow or app settings.

## 7. Database Migration

Run migrations during release:

```bash
alembic upgrade head
```

If using container startup scripts, include migration execution before app launch.

## 8. Post-Deployment Validation

- Verify API health endpoint: GET /health
- Verify OpenAPI docs load at /docs
- Test register/login/order flow from frontend
- Check logs for startup errors

## 9. Rollback Strategy

- Keep previous container images tagged by commit SHA
- Swap App Service image tag back to known-good version
- Re-run smoke tests

## 10. Monitoring

- Enable Application Insights for backend telemetry
- Configure alerts for 5xx rate and latency
- Monitor PostgreSQL CPU, storage, and connections
