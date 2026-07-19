Status: Complete

# Operations Manual

## System Overview

- Frontend: Next.js application in `frontend/`, served by Render for production and by Docker Compose locally on `localhost:8080` mapped from container port `3001`.
- Backend: Node.js / Express application in `backend/`, served by Render for production and by Docker Compose locally on `localhost:3000`.
- Database: MongoDB Atlas is used via `MONGO_URI`; the local `docker-compose.yml` does not launch a Mongo container. The compose file explicitly comments out a `mongo:` service and relies on the Atlas connection string instead.
- Monitoring: Local stack includes Prometheus, Alertmanager, Grafana, Node Exporter, and cAdvisor. Backend metrics are exposed on port 3000 at the `/metrics` endpoint.

## Deployment Procedure

### CI pipeline (`.github/workflows/main.yml`)

1. `lint-and-scan` job
   - Checkout repository
   - Run TruffleHog secret scan
   - Install Node.js and frontend/backend dependencies
   - Lint frontend and backend
   - Run `npm audit` for frontend/backend
   - Run Snyk scans for frontend/backend

2. `frontend-test` job
   - Checkout repository
   - Install frontend dependencies
   - Start frontend container with Docker Compose
   - Wait for `http://localhost:8080`
   - Install Playwright browsers and dependencies
   - Run frontend unit tests and publish JUnit report
   - Run Playwright E2E tests
   - Upload Playwright HTML report

3. `backend-test` job
   - Checkout repository
   - Install backend dependencies
   - Run backend tests and publish results

4. `build` job
   - Checkout repository
   - Setup Docker Buildx
   - Login to GitHub Container Registry
   - Build and push frontend/backend Docker images to `ghcr.io/<owner>/brainbytes-frontend` and `ghcr.io/<owner>/brainbytes-backend`
   - Tag images `latest`, short SHA, and branch-timestamp

### Deployment workflow (`.github/workflows/deploy.yml`)

- Triggered after a successful `main` branch CI run
- Determines image tag from the workflow run SHA or manual input
- Posts deploy hook to Render for backend and frontend with the chosen image tag
- Verifies the backend via `GET /health` for up to 6 minutes
- Verifies the frontend via `GET /` for up to 6 minutes
- Records deployment metadata and uploads rollback logs

## Environment Variables

| Variable | Defined In | Purpose | Notes |
| --- | --- | --- | --- |
| `HF_TOKEN` | `.env.template`, `render.yaml` | Hugging Face API token for backend AI inference | Required for both local and production use |
| `MONGO_URI` | `.env.template`, `render.yaml` | MongoDB Atlas connection string | Production uses Atlas; local compose does not start Mongo container |
| `JWT_SECRET` | `.env.template`, `render.yaml` | Backend JWT signing secret | Must be strong in production |
| `NODE_ENV` | `.env.template`, `render.yaml` | Runtime environment mode | `development` locally, `production` on Render |
| `GRAFANA_CLOUD_USER` | `.env.template` | Grafana Cloud datasource username | Required for Grafana provisioning |
| `GRAFANA_CLOUD_PASSWORD` | `.env.template` | Grafana Cloud datasource password | Required for Grafana provisioning |
| `GRAFANA_CLOUD_URL` | `.env.template` | Grafana Cloud datasource URL | Required for Grafana provisioning |
| `GRAFANA_CLOUD_URL_PUSH` | `.env.template` | Grafana Cloud remote write endpoint | Intended for Prometheus remote write |
| `NEXT_PUBLIC_API_URL` | `.env.template`, `render.yaml` | Frontend API endpoint | Local Docker Compose uses `/api/` |
| `BACKEND_URL` | `.env.template`, `render.yaml` | Backend URL for frontend server-side use | Local compose uses `http://localhost:3000` or internal Docker network |
| `FE_URL` | `render.yaml` | Backend production frontend URL | Set only in backend Render service |
| `PORT` | `render.yaml` | Backend runtime port | Set to `3000` for Render backend service |

## Routine Operations

### Restarting services

- Local Docker Compose
  - `docker compose restart backend frontend prometheus alertmanager grafana node-exporter cadvisor`
  - `docker compose down && docker compose up -d`

- Individual containers
  - `docker restart backend`
  - `docker restart grafana`

### Viewing logs

- Backend: `docker compose logs -f backend`
- Prometheus: `docker compose logs -f prometheus`
- Alertmanager: `docker compose logs -f alertmanager`
- Grafana: `docker compose logs -f grafana`
- Render logs: use the Render dashboard or Render service log stream for each deployed service

### Manual redeploy

- Use Render deploy hooks or the Render dashboard to redeploy the backend/frontend images
- The CI deploy workflow uses `RENDER_BACKEND_DEPLOY_HOOK` and `RENDER_FRONTEND_DEPLOY_HOOK`

### Rollback

- Use `.github/workflows/rollback.yml` via GitHub Actions workflow dispatch
- Required inputs:
  - `service`: `backend`, `frontend`, or `both`
  - `image_tag`: the tag to roll back to
- The rollback flow posts the same Render deploy hook URL with the specified image tag and verifies service health

## Monitoring Overview

- Canonical monitoring documentation: `docs/MONITORING-GUIDE.md`
- Verified by repository content:
  - Prometheus scrape jobs and alert rules are configured in `monitoring/prometheus.yml` and `monitoring/alert_rules.yml`
  - Recording rules are configured in `monitoring/recording_rules.yml`
  - Alertmanager routes alerts to `http://backend:3000/api/alerts` in `monitoring/alertmanager.yml`
  - Grafana provisioning exists for a dashboard and a Grafana Cloud datasource in `monitoring/grafana/provisioning`
  - Grafana alert provisioning file `monitoring/grafana/provisioning/alerting/alerts.yaml` is now populated with a `BrainBytes Alerts` group and defined alert rules
  - The BrainBytes Overview dashboard has been substantially expanded with additional panels
- Status: Configured — Validation Pending. Prometheus alert rules, recording rules, and Alertmanager routing are configured and active, while end-to-end validation of the Grafana alert pipeline has not yet been documented or evidenced in this repo.

## Backup & Recovery

- Database persistence relies on MongoDB Atlas via `MONGO_URI`
- The local compose stack does not include a Mongo container
- Atlas free-tier clusters are typically limited in backup capabilities and may not support advanced point-in-time restore; confirm project backup settings in Atlas before relying on them for recovery
- For recovery, export critical collections or use Atlas snapshots if available, and preserve `MONGO_URI` credentials securely

## Ownership & Escalation

| Area | Owner |
| --- | --- |
| Repository / source code | Gracielle Salvador |
| Render deployment & service hosting | Ralph R-Nold Nocum |
| MongoDB Atlas / database connectivity | J.R. Gabriel Portillo |
| Monitoring stack (Prometheus, Grafana, Alertmanager) | Krizia Aligado |
