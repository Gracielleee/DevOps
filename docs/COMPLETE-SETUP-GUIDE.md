# Complete Setup Guide

This guide covers running **BrainBytes** locally (app-only or app + monitoring) and deploying to **production (Render + Grafana Cloud)**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Scope-Based Setup Matrix](#scope-based-setup-matrix)
3. [Configuration Files Needed](#configuration-files-needed)
4. [Environment Variables](#environment-variables)
5. [Local Run — App Only](#local-run--app-only)
6. [Local Run — App + Monitoring](#local-run--app--monitoring)
7. [Verify Your Setup](#verify-your-setup)
8. [Production Deployment (Render)](#production-deployment-render)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Common Issues](#common-issues)

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Docker Desktop** | v20.10+ or latest stable (includes Docker Compose) |
| **Git** | For cloning the repository |
| **Node.js** | v24+ (only needed if running outside Docker) |
| **RAM** | At least 4GB available for Docker containers |
| **OS** | Windows, macOS, or Linux — runs identically as long as Docker is configured |

> The project is fully containerized, so you don't need to install Node.js dependencies manually. Docker handles everything.

---

## Scope-Based Setup Matrix

Not everyone needs every config file. What you prepare depends on what you're running:

| Scope | `.env` file | `prometheus.yml` | `alertmanager.yml` | Docker Compose Services |
|-------|:-----------:|:-----------------:|:-------------------:|------------------------|
| **App only (local)** | Partial | ❌ | ❌ | `frontend`, `backend` |
| **App + Monitoring (local)** | Full | ✅ | ✅ | All 7 services |
| **Production (Render)** | Set in Render UI | ❌ | ❌ | Render-managed |

> **Partial `.env`**: If you're only running the app without monitoring, you still need `HF_TOKEN`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, and frontend variables — but you can skip the monitoring section.

---

## Configuration Files Needed

Three files must be created from templates before running the full stack:

| Template File | Output File | What It Configures | When Needed |
|---------------|-------------|---------------------|-------------|
| `.env.template` | `.env` | All environment variables | Always |
| `monitoring/prometheus.template.yml` | `monitoring/prometheus.yml` | Metrics scraping targets & Grafana Cloud remote write | Monitoring only |
| `monitoring/alertmanager.template.yml` | `monitoring/alertmanager.yml` | Alert routing (email/webhook) | Monitoring only |

### How to create them

Each template file has detailed instructions in its header comments — open the file and follow the steps. The short version:

1. **Copy** the template file and **rename** it (remove `.template`)
2. **Replace** all placeholder values with your actual credentials
3. **Never commit** the completed files to version control

| Template | Placeholders to Replace | Where to Find Values |
|----------|------------------------|---------------------|
| `.env` | See [Environment Variables](#environment-variables) below | Various sources (table below) |
| `prometheus.yml` | `GRAFANA_CLOUD_URL_PUSH`, `GRAFANA_CLOUD_USER`, `GRAFANA_CLOUD_WRITE_PASSWORD`, `servicehere.onrender.com`, `METRICS_AUTH_USERNAME`, `METRICS_AUTH_PASSWORD` | Grafana Cloud dashboard → Prometheus card |
| `alertmanager.yml` | `${ALERTS_EMAIL}`, `${ALERTS_PASSWORD}`, `${SMTP_EMAIL}` | Gmail account → App Passwords |

> If you've already filled in your `.env` file, you can copy those values directly into the Prometheus and Alertmanager configs.

---

## Environment Variables

### Backend

| Variable | Purpose | Source |
|----------|---------|--------|
| `HF_TOKEN` | Hugging Face API authentication | [huggingface.co](https://huggingface.co/docs/hub/en/security-tokens) |
| `MONGO_URI` | MongoDB Atlas connection string | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) |
| `JWT_SECRET` | Signs authentication tokens | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `FE_URL` | Frontend URL(s) for CORS | Default: `http://localhost:8080,http://frontend:3001` |
| `ENABLE_METRICS` | Toggle metrics endpoint | `true` |
| `METRICS_AUTH_USERNAME` | Auth for `/metrics` endpoint | Create your own |
| `METRICS_AUTH_PASSWORD` | Auth for `/metrics` endpoint | Create a strong random string |

### Frontend

| Variable | Purpose | Local Value | Production Value |
|----------|---------|-------------|------------------|
| `NEXT_PUBLIC_API_URL` | API endpoint for browser calls | `/api/` | `/api/` |
| `BACKEND_URL` | Backend URL for server-side rewrites | `http://localhost:3000` (or `http://backend:3000` in Docker) | `https://your-backend.onrender.com` |

### Monitoring (Grafana Cloud)

| Variable | Purpose | Source |
|----------|---------|--------|
| `GRAFANA_CLOUD_USER` | Grafana Cloud instance ID | Grafana Cloud → Grafana card → Details |
| `GRAFANA_CLOUD_PASSWORD` | Read token (Viewer/Admin role) | Grafana Cloud → Administration → Service Accounts |
| `GRAFANA_CLOUD_URL` | Grafana Cloud base URL | e.g., `https://your-org.grafana.net` |
| `GRAFANA_CLOUD_URL_PUSH` | Remote write endpoint | Grafana Cloud → Prometheus card → Details |
| `GRAFANA_CLOUD_WRITE_PASSWORD` | Write token (`metrics:write` permission) | Grafana Cloud → Access Policies |

### Alerting (SMTP)

| Variable | Purpose | Source |
|----------|---------|--------|
| `ALERTS_EMAIL` | Email address that **sends** alerts | Your Gmail/Outlook address |
| `ALERTS_PASSWORD` | SMTP app password (**not** your regular password) | Gmail → Security → 2-Step Verification → App Passwords |
| `SMTP_EMAIL` | Email address that **receives** alerts | Any inbox you monitor |

> **Important**: Gmail requires 2-Step Verification enabled before you can create an App Password. Never use your regular login password for SMTP.

---

## Local Run — App Only

If you just want to run the application without monitoring:

1. Ensure `.env` is configured with at least the backend variables
2. From the project root:

```
bash docker compose up --build frontend backend
```

| Service      | URL                            | Purpose                   |
| ------------ | ------------------------------ | ------------------------- |
| Frontend     | `http://localhost:8080`        | Main application UI       |
| Backend API  | `http://localhost:3000`        | API server                |
| Health check | `http://localhost:3000/health` | Verify backend is running |

**Stop:**
```
docker compose down
```

## Local Run — App + Monitoring

If you want the full stack including dashboards and alerts:

1.  Ensure all three config files are created and filled (.env, prometheus.yml, alertmanager.yml)
2.  From the project root:

```
docker compose up --build
```

This launches 7 containers:
| Container       | Image                            | Port        | Purpose                                 |
| --------------- | -------------------------------- | ----------- | --------------------------------------- |
| `frontend`      | Built from `./frontend`          | 8080 → 3001 | Next.js UI                              |
| `backend`       | Built from `./backend`           | 3000 → 3000 | Node.js API + metrics                   |
| `prometheus`    | `prom/prometheus:v2.43.0`        | 9090        | Metrics collection                      |
| `node-exporter` | `prom/node-exporter:v1.5.0`      | 9100        | Host system metrics (CPU, disk, memory) |
| `cadvisor`      | `ghcr.io/google/cadvisor:0.55.1` | 8081 → 8080 | Container resource metrics              |
| `alertmanager`  | `prom/alertmanager:v0.25.0`      | 9093        | Alert routing & notifications           |
| `grafana`       | `grafana/grafana:10.0.3`         | 3005 → 3000 | Dashboards & visualization              |

### Access Points
| Service         | URL                             | Credentials                                                    |
| --------------- | ------------------------------- | -------------------------------------------------------------- |
| Frontend        | `http://localhost:8080`         | N/A                                                            |
| Backend         | `http://localhost:3000`         | N/A                                                            |
| Backend Metrics | `http://localhost:3000/metrics` | Basic auth (`METRICS_AUTH_USERNAME` / `METRICS_AUTH_PASSWORD`) |
| Prometheus      | `http://localhost:9090`         | N/A                                                            |
| Grafana         | `http://localhost:3005`         | `admin` / `admin`                                              |
| Alertmanager    | `http://localhost:9093`         | N/A                                                            |
| cAdvisor        | `http://localhost:8081/docker/` | N/A                                                            |
| Node Exporter   | `http://localhost:9100/metrics` | N/A                                                            |

> For detailed monitoring setup, dashboards, and alert configuration, see [`MONITORING-GUIDE`](MONITORING-GUIDE.md).

**Stop:**
```
docker compose down
```

## Verify Your Setup

After starting containers, confirm everything is working:

#### 1. Check container health

```
docker compose ps
```
All containers should show status **Up** (or **healthy**).

#### 2. Verify metrics endpoint

Open `http://localhost:3000/metrics` in your browser (enter your metrics auth credentials when prompted). You should see raw Prometheus metrics text.

#### 3. Verify Prometheus is scraping

Open `http://localhost:9090/targets` — all scrape targets should show **UP**.

#### 4. Generate traffic & check Grafana

Make some API calls (login, send chat messages, upload learning materials). Then open Grafana at `http://localhost:3005` and verify these metrics appear:

| Metric | What It Confirms |
|--------|------------------|
| `brainbytes_http_requests_total` | HTTP requests are being tracked |
| `brainbytes_http_request_duration_seconds` | Latency monitoring works |
| `brainbytes_ai_response_time_seconds` | AI calls are being measured |
| `brainbytes_ai_empty_responses_total` | Empty response tracking is active |

> Tip: See the **Generate Mock Traffic** section in [`MONITORING-GUIDE`](MONITORING-GUIDE.md) for more info on how to simulate traffic.

#### 5. Test alert firing

See the **Testing Your Setup** section in [`MONITORING-GUIDE`](MONITORING-GUIDE.md) for commands to trigger test alerts via webhook and email.

---

## Production Deployment (Render)

Production uses **Render web services** for frontend and backend, with metrics flowing through Grafana Cloud.

### Architecture
```
Render (Frontend) → Render (Backend) → Hugging Face API
                         ↓
                   Prometheus (local) ← scrapes /metrics via HTTPS
                         ↓
                   Grafana Cloud → Grafana (local dashboards)
```


### Render Configuration

Deployment is defined in `render.yaml`:

| Service | Image | Plan | Region |
|---------|-------|------|--------|
| brainbytes-backend | `ghcr.io/gracielleee/brainbytes-backend:latest` | Free | Singapore |
| brainbytes-frontend | `ghcr.io/gracielleee/brainbytes-frontend:latest` | Free | Singapore |

### Setup Steps

#### 1. Connect GitHub
Link your GitHub account in Render's dashboard

#### 2. Deploy Blueprint
Go to **New +** → **Blueprint**, connect your repository, and point to your main branch

#### 3. Set environment variables
Render parses `render.yaml` and prompts for values:

**Backend Variables:**

| Variable | Scope | Value |
|----------|-------|-------|
| `NODE_ENV` | Hardcoded | `production` |
| `MONGO_URI` | Secret | Your Atlas connection string |
| `JWT_SECRET` | Secret | Strong random string (different from dev) |
| `HF_TOKEN` | Secret | Your Hugging Face token |
| `FE_URL` | Hardcoded | `https://your-frontend.onrender.com` |
| `PORT` | Hardcoded | `3000` |
| `ENABLE_METRICS` | Hardcoded | `true` |
| `METRICS_AUTH_USERNAME` | Secret | Must match your local `prometheus.yml` |
| `METRICS_AUTH_PASSWORD` | Secret | Must match your local `prometheus.yml` |

**Frontend Variables:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `/api/` |
| `BACKEND_URL` | `http://brainbytes-backend:3000` (internal Render networking) |
| `NODE_ENV` | `production` |

#### 4. Apply
Click **Apply** to provision infrastructure

#### 5. Update prometheus.yml
Replace `servicehere.onrender.com` with your actual Render backend URL so your local Prometheus can scrape production metrics

> **Note:** `METRICS_AUTH_USERNAME` and `METRICS_AUTH_PASSWORD` in Render must match what's in your local `prometheus.yml` under the `render-backend` job — otherwise scraping will fail with **401 Unauthorized**.

---

## CI/CD Pipeline

### GitHub Secrets Required

Add these under **Settings → Secrets and variables → Actions** in your GitHub repository:

| Secret | Purpose | Phase |
|--------|---------|-------|
| `SNYK_TOKEN` | Security vulnerability scanning | CI |
| `RENDER_BACKEND_DEPLOY_HOOK` | Triggers backend deployment on Render | CD |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Triggers frontend deployment on Render | CD |
| `RENDER_SERVICE_BE_URL` | Live backend domain | CD |
| `RENDER_SERVICE_FE_URL` | Live frontend domain | CD |

### Workflow Triggers

| Phase | Trigger | Actions |
|-------|---------|---------|
| CI | Push or PR to `dev` or `main` | Run tests, lint, Snyk security scan |
| CD | Merge into `main` (after CI passes) | Push images to GHCR, trigger Render deploy hooks |

### How to Test the Pipeline

1. **Push to dev** — CI tests and Snyk scan run; nothing deploys
2. **Open PR dev → main** — CI checks run on the PR; verify they pass
3. **Merge into main** — CI runs first, then CD triggers Render deployments

For full CI/CD workflow details, see [CI-CD_WORKFLOWS](docs\CI-CD_WORKFLOWS.md).

---

## Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Port conflict (8080, 3000, 9090, etc.) | Another service using the port | Stop the conflicting service or remap ports in `docker-compose.yml` |
| Metrics not showing in Grafana | `ENABLE_METRICS` not set or auth mismatch | Verify `ENABLE_METRICS=true` in backend env; confirm `METRICS_AUTH_USERNAME`/`PASSWORD` match across `.env` and `prometheus.yml` |
| No `brainbytes_*` metrics in Prometheus | No traffic generated yet | Make API calls (login, chat) to emit metrics |
| Prometheus can't scrape `render-backend` | Wrong URL or auth credentials | Verify the Render backend URL in `prometheus.yml` matches your actual deployed URL; confirm metrics auth credentials match between Render and `prometheus.yml` |
| Grafana shows "No data" | Datasource misconfigured or remote write failing | Check Grafana Cloud credentials in `.env` and `datasource.yml`; verify remote write URL is correct in `prometheus.yml` |
| Alert emails not arriving | Gmail app password incorrect | Ensure 2-Step Verification is on; regenerate App Password; verify `smtp_require_tls: true` |
| Docker containers keep restarting | Build failure or missing env vars | Run `docker compose logs <service>` to inspect errors |

For more troubleshooting, see [TROUBLESHOOTING-GUIDE](docs/TROUBLESHOOTING-GUIDE.md).

---

## Quick Resources

| Resource | File / Link |
|----------|-------------|
| Monitoring deep dive | [`MONITORING-GUIDE`](MONITORING-GUIDE.md) |
| CI/CD workflow details | [`CI-CD_WORKFLOWS`](CI-CD_WORKFLOWS.md) |
| Troubleshooting | [`TROUBLESHOOTING-GUIDE`](TROUBLESHOOTING-GUIDE.md) |
| Grafana Cloud | grafana.com |
| MongoDB Atlas | mongodb.com/cloud/atlas |
| Hugging Face Tokens | huggingface.co |
| Render Dashboard | render.com |

---

> **Last Updated**: July 19, 2026  

