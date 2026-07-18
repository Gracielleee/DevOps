# Complete Setup Guide

This document explains how to run **BrainBytes** locally, how to run the **monitoring stack**, and how to deploy to **production (Render + Grafana Cloud)**.

---

## Supported OS
This app is containerized with **Docker**, so it runs the same way on Windows, macOS, and Linux.

- **Windows 11**: Docker Desktop
- **macOS**: Docker Desktop
- **Linux**: Docker Engine + Docker Compose

Minimum requirements:
- Docker Desktop / Docker Engine
- Docker Compose (comes with Docker Desktop)
- Git
- RAM: at least **4GB** recommended

---
## Steps
### 1) Clone the repository
```bash
git clone https://github.com/Gracielleee/DevOps.git
cd DevOps
```

---

### 2) Environment variables
1. Copy the root example env file:
   - Create a file named **`.env`** in the project root
   - Copy from **`.env.example`**
2. Fill required values (at minimum for local run):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `HF_TOKEN`
   - `METRICS_AUTH_USERNAME` / `METRICS_AUTH_PASSWORD` (for protected metrics)
   - `GRAFANA_CLOUD_USER` / `GRAFANA_CLOUD_PASSWORD` / `GRAFANA_CLOUD_URL` (if you want Grafana Cloud connectivity)
   - `ALERTS_EMAIL` / `ALERTS_PASSWORD` (used by Grafana SMTP notifications)

> If you only need local app + local Prometheus/Grafana, you still must set metrics authentication environment variables because the backend exposes metrics with authentication.

3. Prometheus config
   - Copy `monitoring/prometheus.example.yml` → `monitoring/prometheus.yml`. Input the Grafana environment variables **only if** you want Grafana Cloud remote_write.

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

#### What gets scraped
`monitoring/prometheus.yml` scrapes:
- **Backend**
- **Node exporter**
- **cAdvisor**
- **Alertmanager**

It also defines **alert rules** from:
- `monitoring/alert_rules.yml`

#### Dashboards & data sources are provisioned
Grafana is provisioned via files under:
- `monitoring/grafana/provisioning/`
  - `datasources/datasource.yml`
  - `dashboards/dashboards.yml`
  - `dashboards/brainbytes.json`

---

### 5) Monitoring run (how to use)
#### Grafana dashboard
1. Open: http://localhost:3005
2. Login: `admin` / `admin`
3. Select the BrainBytes dashboard that is provisioned from:
   - `monitoring/grafana/provisioning/dashboards/`

#### Alerting
**Prometheus** Alerting is configured with:
- `monitoring/alert_rules.yml`
- `monitoring/alertmanager.yml`

`monitoring/alertmanager.yml` sends alerts to:
- `http://backend:3000/api/alerts`

So backend must be running.

</br>

**Grafana** provisioning for alert policies/contact points:
  - `monitoring/grafana/provisioning/alerting/alerts.yaml`
  - `monitoring/grafana/provisioning/alerting/policies.yaml`
  - `monitoring/grafana/provisioning/alerting/contact-points.yml`


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
5. **Sync Blueprint:** Click **Apply** to provision your infrastructure.

---

### 7.4. Pipeline Execution & Verification

#### Workflow Trigger Rules
* **CI Testing:** Executes automatically on any code push or pull request hitting the `dev` or `main` branches.
* **CD Deployment:** Triggers **only** when code is successfully pushed or merged into the `main` branch, and **only** after all CI pipeline and security checks pass successfully.

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

## Appendix A: Where things live
- Compose: `docker-compose.yml`
- Prometheus: `monitoring/prometheus.yml`
- Alert rules: `monitoring/alert_rules.yml`
- Alertmanager: `monitoring/alertmanager.yml`
- Grafana provisioning:
  - `monitoring/grafana/provisioning/datasources/`
  - `monitoring/grafana/provisioning/dashboards/`
  - `monitoring/grafana/provisioning/alerting/`
- Metrics definitions:
  - `backend/src/monitoring/metrics.js`
