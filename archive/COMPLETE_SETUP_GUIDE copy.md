# Complete Setup Guide

This document explains how to run **BrainBytes** locally, how to run the **monitoring stack**, and how to deploy to **production (Render + Grafana Cloud)**.

---

## Setup & Installation


### Prerequisites
This project is containerized using **Docker**, ensuring a consistent environment across all operating systems.

Therefore, ensure the following software is installed on your machine:

- **Docker Desktop** (v20.10+ or latest stable)
- **Docker Compose** (usually included with Docker Desktop)
- **Git**
- **Node.js** (v24+)



**Hardware:** Ensure you have at least **4GB of RAM** available for Docker containers to run smoothly.

**OS:** No specific OS version is required. The application runs identically on Windows, macOS, and Linux as long as Docker is properly configured.

---

### 2) Environment variables
1. .env
 - Copy `.env.template` → `.env`. (proejct root)

``` .env.template
# BrainBytes Multi-Container Environment Configuration
# This file is used by docker-compose.yml for local development
# Copy this file to an .env and fill in the values below

# ============================================================================
#  BACKEND ENVIRONMENT VARIABLES
# ============================================================================

# Hugging Face API Token (required for both local and production)
# Get your token at: https://huggingface.co/docs/hub/en/security-tokens
# Permissions needed:
#   - Make calls to inference providers
#   - Make calls to Inference Endpoints
HF_TOKEN=your_hugging_face_token_here

# MongoDB Atlas Connection String (required for both local and production)
# Create a free cluster at: https://www.mongodb.com/cloud/atlas
# Ensure your IP is whitelisted in Network Access settings
# Common Format: mongodb+srv://<username>:<password>@<cluster-url>/<database_name>
MONGO_URI=mongodb+srv://username:password@cluster-url/brainbytes

# JWT Secret for signing authentication tokens (MUST be strong in production)
# Generate a secure random value: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# CRITICAL: Use a strong secret in production, never commit real values
JWT_SECRET=your_strong_secret_key_here_min_32_characters

# Node Environment (development or production)
# Local development: development (enables debug logging)
# Production (Render): production (enables info-level logging)
NODE_ENV=development

# ============================================================================
# MONITORING ENVIRONMENT VARIABLES
# ============================================================================
# Setup Guide: 
# 1. Log in to your Grafana Cloud account: https://grafana.com/
# 2. Go to your Cloud Portal Dashboard (https://grafana.com/profile/orgs)
# 3. Look for the "Prometheus" and "Grafana" cards to find the values below.

# ----------------------------------------------------------------------------
# Grafana Cloud Connection (Data Reading)
# ----------------------------------------------------------------------------

# Your Grafana Cloud Instance ID (Found under the "Grafana" card -> Details)
GRAFANA_CLOUD_USER=your_grafana_instance_id

# A Grafana Cloud Service Account token or API key with "Viewer" or "Admin" role
# Generated in Grafana Cloud: Administration -> Service Accounts
GRAFANA_CLOUD_PASSWORD=glc_your_read_token_here

# The base URL of your Grafana Cloud instance (e.g., https://your-org.grafana.net)
GRAFANA_CLOUD_URL=https://your-instance.grafana.net

# ----------------------------------------------------------------------------
# Prometheus Remote Write (Data Pushing)
# ----------------------------------------------------------------------------

# The Remote Write Endpoint URL (Found under the "Prometheus" card -> Details)
# Example: https://prometheus-prod-01.grafana.net/api/prom/push
GRAFANA_CLOUD_URL_PUSH=https://prometheus-xxxx.grafana.net/api/prom/push

# A Grafana Cloud Access Policy token with "metrics:write" permissions
# Generated in your Cloud Portal under "Access Policies"
GRAFANA_CLOUD_WRITE_PASSWORD=glc_your_write_token_here

# ----------------------------------------------------------------------------
# Local Metrics Endpoint Security (CRITICAL FOR PRODUCTION)
# ----------------------------------------------------------------------------
# These credentials secure your application's raw metrics endpoint (e.g., /metrics).
# Your local Prometheus agent uses these to scrape your app, preventing the public 
# from viewing internal performance data.

# Define a strong, unique username for scraping authentication
METRICS_AUTH_USERNAME=app_metrics_scraper

# Define a strong, random password or token
METRICS_AUTH_PASSWORD=generate_a_secure_random_string_here

# ----------------------------------------------------------------------------
# Alerting & Notifications (SMTP Configuration)
# ----------------------------------------------------------------------------
# Used by the local Grafana/Alertmanager instance to route critical alerts via SMTP.
#
# WHERE TO GET YOUR SMTP APP PASSWORD:
# - Gmail: Google Account -> Security -> 2-Step Verification -> App passwords.
# - Outlook/Office 365: Microsoft Account -> Security -> Advanced security options -> App passwords.
# - SendGrid/Mailgun: Create an API key under your provider's settings dashboard.

# The sender email address or username for system alerts
ALERTS_EMAIL=alerts@example.com

# The 16-character App Password (Gmail/Outlook) or API key (SendGrid/Mailgun)
# DO NOT use your regular personal login password.
ALERTS_PASSWORD=your_16_char_app_password_here

# ----------------------------------------------------------------------------
# Quick Access (not required in an .env file)
# ----------------------------------------------------------------------------
# Used by prometheus
BACKEND_URL=your_live_server_url

#============================================================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================================================

# Frontend Environment Variables
# Note: Variables starting with NEXT_PUBLIC_ are exposed to the browser

# API endpoint for frontend API calls (used by browser client)
# Local (docker-compose): /api/ (uses next.config.js rewrites to http://backend:3000)
# Local (npm start): http://localhost:3000/api/
# Production (Render): /api/ (Render proxy will route to backend)
NEXT_PUBLIC_API_URL=/api/

# Backend URL for Next.js server-side rewrites and internal communication
# Local (docker-compose): http://backend:3000 (docker network communication)
# Local (npm start): http://localhost:3000
# Production (Render): https://your-backend-service-name.onrender.com (set in Render dashboard)
BACKEND_URL=http://localhost:3000

# ============================================================================
# PRODUCTION (RENDER) SETUP
# ============================================================================

# For Render deployment, set these environment variables in the Render dashboard:
#
# BACKEND SERVICE:
#   - HF_TOKEN: your_hugging_face_token
#   - MONGO_URI: your_mongodb_atlas_connection_string
#   - JWT_SECRET: strong_random_secret (different from dev)
#   - NODE_ENV: production
#   - FE_URL: https://your-frontend-service.onrender.com
#   - ENABLE_METRICS=true
#   - METRICS_AUTH_USERNAME= your_metrics_auth_username
#   - METRICS_AUTH_PASSWORD= your_metrics_auth_password
#
# FRONTEND SERVICE:
#   - NEXT_PUBLIC_API_URL: /api/
#   - BACKEND_URL: https://your-backend-service.onrender.com
#   - NODE_ENV: production
#
# Note: Never commit .env to version control. Add to .gitignore if not already there.
```

2. Prometheus config
   - Copy `monitoring/prometheus.template.yml` → `monitoring/prometheus.yml`.
``` prometheus.template.yml
# ============================================================
# PROMETHEUS CONFIGURATION TEMPLATE
# ============================================================
# HOW TO USE:
#   1. Copy this file and rename it to `prometheus.yml`
#   2. Replace every ${VARIABLE} and the 'servicehere.onrender.com' placeholder with real values
#   3. Never commit the completed `prometheus.yml` to version control
#
# PLACEHOLDERS TO REPLACE:
#   GRAFANA_CLOUD_URL_PUSH      → Grafana Cloud → Metrics → Remote Write URL
#   GRAFANA_CLOUD_USER          → Grafana Cloud → Metrics → Username
#   GRAFANA_CLOUD_WRITE_PASSWORD→ Grafana Cloud → Metrics → Password/API Key
#   servicehere.onrender.com    → Your deployed backend URL on Render
#   METRICS_AUTH_USERNAME       → Username for backend /metrics basic auth
#   METRICS_AUTH_PASSWORD       → Password for backend /metrics basic auth
#
# If you have set these variables up in your `.env` file, just directly copy and paste it
#
# ============================================================

global:
  scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - "/etc/prometheus/alert_rules.yml"
  - 'recording_rules.yml'

remote_write:
  - url: ${GRAFANA_CLOUD_URL_PUSH
    basic_auth:
      username: ${GRAFANA_CLOUD_USER}
      password: ${GRAFANA_CLOUD_WRITE_PASSWORD}

scrape_configs:
  - job_name: 'prometheus'
    scrape_timeout: 10s
    sample_limit: 1500
    static_configs:
      - targets: ['localhost:9090']

  # Uses basic auth to securely scrape the /metrics endpoint.
  - job_name: 'backend'
    scrape_timeout: 10s
    sample_limit: 5000
    body_size_limit: 10MB
    static_configs:
      - targets: ['backend:9080']
    basic_auth:
      username: ${METRICS_AUTH_USERNAME}
      password: ${METRICS_AUTH_PASSWORD}

  # Production backend hosted on Render.
  # Uses HTTPS and basic auth to securely scrape the /metrics endpoint.
  - job_name: 'render-backend'
    scrape_timeout: 10s
    sample_limit: 5000
    body_size_limit: 10MB
    scheme: https
    static_configs:
      - targets: ['servicehere.onrender.com']
    basic_auth:
      username: ${METRICS_AUTH_USERNAME}
      password: ${METRICS_AUTH_PASSWORD}

  # --- Local-only jobs ---

  - job_name: 'node-exporter'
    scrape_timeout: 12s
    sample_limit: 30000
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    scrape_timeout: 12s
    sample_limit: 40000
    static_configs:
      - targets: ['cadvisor:8081']

  - job_name: 'alertmanager'
    scrape_timeout: 10s
    sample_limit: 1000
    static_configs:
      - targets: ['alertmanager:9093']
```

3. Alertmanager config
   - Copy `monitoring/alertmanager.template.yml` → `monitoring/alertmanager.yml`.
``` alertmanager.template.yml
# ============================================================
# ALERTMANAGER CONFIGURATION TEMPLATE
# ============================================================
# HOW TO USE:
#   1. Copy this file and rename it to `alertmanager.yml`
#   2. Replace every ${VARIABLE} placeholder with your actual values
#   3. Never commit the completed `alertmanager.yml` to version control
#
# PLACEHOLDERS TO REPLACE:
#   ${ALERTS_EMAIL}    → Gmail address used to SEND alert emails
#   ${ALERTS_PASSWORD} → Gmail app password (NOT your regular password)
#                        Create one at: Google Account → Security → App Passwords
#   ${SMTP_EMAIL}      → Email address to RECEIVE alert notifications
#
# If you have set these variables up in your `.env` file, just directly copy and paste it
#
# ROUTING LOGIC:
#   - job = "render-backend" → alerts sent via EMAIL (production alerts)
#   - job = "backend"        → alerts sent to backend WEBHOOK (local alerts)
#   - Everything else         → falls through to the default receiver (webhook)
# ============================================================

global:
  smtp_smarthost: "smtp.gmail.com:587"
  smtp_from: "${ALERTS_EMAIL}"
  smtp_auth_username: "${ALERTS_EMAIL}"
  smtp_auth_password: "${ALERTS_PASSWORD}"
  smtp_require_tls: true

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'local-backend-receiver'

  routes:
    - matchers:
        - job = "render-backend"
      receiver: 'email-receiver'
      continue: false

    - matchers:
        - job = "backend"
      receiver: 'local-backend-receiver'
      continue: false

receivers:
  - name: 'email-receiver'
    email_configs:
      - to: "${SMTP_EMAIL}"
        send_resolved: true

  - name: 'local-backend-receiver'
    webhook_configs:
      - url: 'http://backend:3000/api/alerts'
        send_resolved: true
```
---

### 3) Local run (application only)
#### Run everything with Docker Compose
From the project root:
```bash
docker compose up --build
```

#### Access endpoints
- Frontend (Next.js): http://localhost:8080
- Backend API: http://localhost:3000
- Backend health check: http://localhost:3000/health

#### Stop
```bash
docker compose down
```

---

### 4) Local run (with Monitoring)
The monitoring stack is already included in `docker-compose.yml`.

#### Run everything with Docker Compose
```bash
docker compose up --build
```

#### Monitoring endpoints
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3005 (default credentials: username is `admin`; password is `admin`)
- Alertmanager: http://localhost:9093
- etc.

For more info on monitoring, check out MONITORING_GUIDE.md
---

</br>

---

### 6) Testing the monitoring setup (quick verification)
1. Start containers:
   ```bash
   docker-compose up
   ```
2. Verify the metrics endpoint is reachable:
   - http://localhost:3000/metrics
3. In Prometheus UI:
   - http://localhost:9090
   - Check that `brainbytes_*` series appear after traffic is generated.

> Generate some API calls (login, chat messages, etc.) so metrics like:
> - `brainbytes_http_requests_total`
> - `brainbytes_http_request_duration_seconds`
> - `brainbytes_ai_response_time_seconds`
> - `brainbytes_ai_empty_responses_total`
> are emitted.

---

## 7) Production run (Render)
Production uses:
- Render web services for frontend + backend
- Grafana/Prometheus metrics flow via Grafana Cloud

### Render configuration files
- `render.yaml` defines:
  - **brainbytes-backend**
  - **brainbytes-frontend**

### Build & push Docker images
Production uses images referenced in `render.yaml`:
- `ghcr.io/gracielleee/brainbytes-backend:latest`
- `ghcr.io/gracielleee/brainbytes-frontend:latest`

The CI/CD workflow is expected to build and push these.

---

### 7.2. Environment Variables in GitHub for GitHub Actions
To make your pipeline function correctly, add these variables inside your GitHub repository under **Settings → Secrets and variables → Actions**.

#### Required for CI (Continuous Integration)
* `SNYK_TOKEN`: Security vulnerability token generated in [snyk.io](https://snyk.io).

#### Required for CD (Continuous Deployment)
*These values are gathered from your Render dashboard after the initial Blueprint sync:*
* `RENDER_BACKEND_DEPLOY_HOOK`: The unique deployment webhook URL for your backend service.
* `RENDER_FRONTEND_DEPLOY_HOOK`: The unique deployment webhook URL for your frontend service.
* `RENDER_SERVICE_BE_URL`: The live domain of your deployed backend.
* `RENDER_SERVICE_FE_URL`: The live domain of your deployed frontend.

---

### 7.3. How to Set Up Render via Blueprint
1. **Connect Version Control:** Link your GitHub account to your Render dashboard profile.
2. **Deploy Blueprint:** Select **New + → Blueprint** in Render and connect your repository.
3. **Target Your Code Branch:** Point the blueprint setup directly to your `main` branch where your `render.yaml` file lives.
4. **Configure Production Environment Variables:** Render will automatically parse your `render.yaml` and prompt you to input the values for your backend and frontend infrastructure directly in the UI:
   * **Backend:**
     * `NODE_ENV=production`
     * `MONGO_URI`
     * `JWT_SECRET`
     * `HF_TOKEN`
     * `FE_URL`: Set this value to your public frontend service domain.
     * `ENABLE_METRICS=true`
     * `METRICS_AUTH_USERNAME`, `METRICS_AUTH_PASSWORD`: Scraper credentials for Prometheus metrics collection.
   * **Frontend:**
     * `NODE_ENV=production`
     * `NEXT_PUBLIC_API_URL=/api/`
     * `BACKEND_URL`: Internal network address or public backend domain (e.g., `http://brainbytes-backend:3000`).

``` render.yaml
services:
  - type: web
    name: brainbytes-backend
    runtime: image
    autoDeploy: false
    region: singapore
    plan: free
    numInstances: 1
    image:
      url: ghcr.io/gracielleee/brainbytes-backend:latest
      creds:
        fromRegistryCreds:
          name: brainbytes-dchr-pull
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        scope: run
        sync: false
      - key: JWT_SECRET
        scope: run
        sync: false
      - key: HF_TOKEN
        scope: run
        sync: false
      - key: FE_URL
        value: https://brainbytes-frontend-brj1.onrender.com
      - key: PORT
        value: 3000
      - key: ENABLE_METRICS
        value: "true"
      - key: METRICS_AUTH_USERNAME
        scope: run
        sync: false
      - key: METRICS_AUTH_PASSWORD
        scope: run
        sync: false

  - type: web
    name: brainbytes-frontend
    runtime: image
    autoDeploy: false 
    region: singapore
    plan: free
    numInstances: 1
    image:
      url: ghcr.io/gracielleee/brainbytes-frontend:latest
      creds:
        fromRegistryCreds:
          name: brainbytes-dchr-pull
    healthCheckPath: /
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: /api/
      - key: BACKEND_URL
        value: http://brainbytes-backend:3000
      - key: NODE_ENV
        value: production
```

5. **Sync Blueprint:** Click **Apply** to provision your infrastructure.

---

### 7.4. Pipeline Execution & Verification

#### Workflow Trigger Rules
* **CI Testing:** Executes automatically on any code push or pull request hitting the `dev` or `main` branches.
* **CD Deployment:** Triggers **only** when code is successfully pushed or merged into the `main` branch, and **only** after all CI pipeline and security checks pass successfully.

For more info on ci/cd workflow, check out: CI-CD_WORKFLOWS.md
#### How to Test
1. Push a test commit to your `dev` branch. Verify that your CI tests and Snyk scans run, but no code deploys to Render.
2. Open a Pull Request from `dev` to `main`. Ensure the checks pass.
3. Merge the Pull Request into `main`. Verify that the CI checks pass first, followed immediately by the CD workflow triggering your Render deploy hooks.


## 9) Common issues
### Port conflicts
If ports are already in use (8080, 3000, 9090, 3005, 9093), update the mappings in `docker-compose.yml` or take down existing services using said ports.

### Metrics are not showing
- Ensure `ENABLE_METRICS=true` is set in backend container env
- Ensure `METRICS_AUTH_USERNAME` and `METRICS_AUTH_PASSWORD` match
- Ensure you generated traffic so `brainbytes_*` metrics appear

For more a more troubleshooting guide, visit TROUBLESHOOTING.md

---

## Quick Resources