# BrainBytes Monitoring Documentation

## System Architecture Documentation
### Overview

The BrainBytes monitoring stack uses Prometheus as a time-series database to collect metrics from application, infrastructure, and containers. AlertManager routes alerts to the backend, which logs and can trigger notifications.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MONITORING STACK                            │
└─────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │   Prometheus     │
                          │   (Port 9090)    │
                          │   15s intervals  │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
         ┌──────────▼────┐ ┌───────▼────────┐ ┌──▼────────────────┐
         │ Backend App   │ │ Node Exporter  │ │     cAdvisor       │
         │ (Port 9080)   │ │ (Port 9100)    │ │  (Port 8080)       │
         │               │ │                │ │                    │
         │ - HTTP        │ │ - CPU          │ │ - Container CPU    │
         │ - AI Service  │ │ - Memory       │ │ - Container Mem    │
         │ - Sessions    │ │ - Disk         │ │ - Network I/O      │
         │ - Mobile      │ │ - Network      │ │ - Block I/O        │
         └───────────────┘ └────────────────┘ └────────────────────┘

                                   │
                                   │ (Scrapes every 15s)
                                   │
                          ┌────────▼─────────┐
                          │  Prometheus TSDB │
                          │ /prometheus vol  │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
         ┌──────────▼────┐ ┌───────▼────────┐ ┌──▼────────────────┐
         │ Recording     │ │  Alert Rules   │ │   Grafana/UI      │
         │ Rules         │ │ (evaluates     │ │ (queries TSDB)    │
         │ (pre-agg)     │ │  every 15s)    │ │                   │
         └───────────────┘ └────────┬───────┘ └────────────────────┘
                                   │
                                   │ (Fires when rules match)
                                   │
                          ┌────────▼─────────┐
                          │   AlertManager   │
                          │   (Port 9093)    │
                          │ Groups/Dedupes   │
                          └────────┬─────────┘
                                   │
                                   │ (Webhook POST)
                                   │
                          ┌────────▼──────────────┐
                          │  Backend /api/alerts  │
                          │  (Port 3000)          │
                          │                       │
                          │  - Logs alerts        │
                          │                       │
                          │                       │
                          └───────────────────────┘
```

### Data Flow

```
1. APPLICATION CODE
   ├── requestMonitor.js (middleware)
   │   └── Increments: httpRequestCounter, observes: httpRequestDuration
   │
   ├── trackers.js (in service, in controller)
   │   ├── trackAiRequest() → questionCounter.inc()
   │   ├── trackAiResponseLength() → aiResponseLength.observe()
   │   └── trackMaterialCreation() → learningMaterialsCounter.inc()
   │
   └── metrics.js (registry)
       └── Registers all metrics with prom-client

2. PROM-CLIENT REGISTRY
   └── In-memory metric state (counters, gauges, histograms)

3. PROMETHEUS SCRAPE (every 15s)
   └── GET http://backend:9080/metrics
       └── Renders metrics in Prometheus text format

4. PROMETHEUS TSDB
   ├── Receives samples from all scrape jobs
   ├── Stores as time-series data with timestamps
   ├── Compresses and indexes by metric name + labels
   └── Persists to /prometheus volume

5. RECORDING RULES (evaluated every 15s)
   ├── Pre-aggregates expensive queries
   └── Writes new time-series back to TSDB

6. ALERT RULES (evaluated every 15s)
   ├── Evaluates PromQL expressions against TSDB
   ├── Transitions alerts: inactive → pending → firing
   ├── Holds in pending state for `for:` duration
   └── Fires when condition sustained for duration

7. ALERTMANAGER
   ├── Receives alerts from Prometheus
   ├── Deduplicates by alertname + labels
   ├── Groups alerts per route config
   ├── Waits group_wait duration (30s)
   └── Sends webhook to backend /api/alerts

8. BACKEND ALERT HANDLER
   ├── POST /api/alerts receives JSON
   ├── Parses: status, labels, annotations
   └── Logs to application logger

9. VISUALIZATION/QUERIES
   └── Grafana (Port 3005) queries Prometheus TSDB
       ├── Automatically provisioned with Prometheus data source
       ├── Pre-loaded with 'BrainBytes Overview' dashboard
       └── Credentials: admin / admin
```

</br>

## Metrics Catalog

### Application Traffic Metrics

| Metric Name                                | Type      | Description                           | Labels                         | Example Query                                                   |
| ------------------------------------------ | --------- | ------------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `brainbytes_http_requests_total`           | Counter   | Total HTTP requests to backend        | `method`, `endpoint`, `status` | `rate(brainbytes_http_requests_total[5m])`                      |
| `brainbytes_http_request_duration_seconds` | Histogram | HTTP request latency in seconds       | `method`, `endpoint`, `status` | `histogram_quantile(0.95, rate(..._bucket[5m]))`                |
| `brainbytes_response_size_bytes`           | Histogram | HTTP response payload size in bytes   | `endpoint`                     | `avg(brainbytes_response_size_bytes) by (endpoint)`             |
| `brainbytes_connection_drops_total`        | Counter   | Connections dropped/aborted by client | `reason`                       | `sum(rate(brainbytes_connection_drops_total[5m])) by (reason)`  |
| `brainbytes_mobile_requests_total`         | Counter   | Requests from mobile devices          | `platform`, `network_type`     | `sum(rate(brainbytes_mobile_requests_total[5m])) by (platform)` |


### AI Service Metrics
| Metric Name                                | Type      | Description                                | Labels                                 | Example Query                                                     |
| ------------------------------------------ | --------- | ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------- |
| `brainbytes_questions_total`               | Counter   | Total questions asked to AI                | `subject`, `status`                    | `sum(rate(brainbytes_questions_total[5m])) by (subject)`          |
| `brainbytes_ai_response_time_seconds`      | Histogram | Time to generate AI response               | `subject`, `character_range`, `status` | `avg(brainbytes_ai_response_time_seconds) by (subject)`           |
| `brainbytes_ai_response_length_characters` | Histogram | Length of AI-generated text                | `subject`, `status`                    | `avg(brainbytes_ai_response_length_characters) by (subject)`      |
| `brainbytes_ai_empty_responses_total`      | Counter   | AI requests returning empty/null responses | `subject`                              | `sum(rate(brainbytes_ai_empty_responses_total[5m])) by (subject)` |


### User Engagement Metrics
| Metric Name                           | Type    | Description                      | Labels                       | Example Query                                                         |
| ------------------------------------- | ------- | -------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| `brainbytes_active_sessions`          | Gauge   | Currently active user sessions   | (none)                       | `brainbytes_active_sessions`                                          |
| `brainbytes_learning_materials_total` | Counter | Total learning materials created | `subject`, `character_range` | `sum(increase(brainbytes_learning_materials_total[1h])) by (subject)` |

</br>

## Alert Rules

### Alerting Pipeline Architecture
The system uses a 4-stage pipeline to catch, route, process, and record incidents:

```
[ Metrics / Infrastructure ] ──> [ Prometheus Server ] ──> [ Alertmanager ] ──> [ Backend API Router ]
(App Metrics, cAdvisor, Node)     (Evaluates Rules)        (Groups & Inhibits)      (Logs to Winston(Application logger))
```

### Grouping and Routing Policies
* **Grouping (`group_by`)**: Alerts are consolidated by alertname and job into unified notification payloads. This prevents single down events from spamming the system.
* **Timing Filters:**
    * `group_wait (30s)`: Buffers incoming alerts for 30 seconds to collect matching symptoms before firing
    * `group_interval (5m)`: Waits 5 minutes before appending newly generated alerts to an active notification group.
    * `repeat_interval (4h)`: Suppresses repetitive reminders for unchanged, active incidents for 4 hours.
* **Notification Webhook Receiver**: Alertmanager dispatches a unified JSON payload via an HTTP POST request to the local application endpoint: `http://backend:3000/api/alerts`
* **Application Logging Integration (`routes/alerts.js`)**: The backend router parses the payload elements. It writes active incidents out as system exceptions (`logger.error`) prefixed by `🚨 ALERT FIRING`. Cleared incidents are printed to the environment pipeline (`logger.info`) with a `✅ ALERT RESOLVED` marker.


> **Noise Prevention:** An inhibition rule is active to prevent redundant noise during cascading system failures. If a target critical alert fires, any matching system warning alerts sharing the same alertname and instance labels are automatically suppressed.

</br>

### Alert Rules Reference
| Alert Name             | Severity | Threshold & Condition                                               | Wait (`for`) | Justification                                                        | Initial Response Steps                                                                                             |
| ---------------------- | -------- | ------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
|  |
| HighContainerCPUUsage  | ⚠️ Warn  | Backend Docker container CPU > 80% over a 2-minute average.         | 1m           | Catches infinite loops or high resource strain before API crashes.   | 1\. Run `docker stats backend`<br>2\. Check app logs for heavy loops.<br>3\. Restart via `docker restart backend`. |
| HighMemoryUsage        | ⚠️ Warn  | Host available memory drops below 20%.                              | 5m           | Prevents host Out-Of-Memory (OOM) process termination.               | 1\. Check host RAM via `top` / Task Manager.<br>2\. Trace `nodejs_heap_size_used_bytes`.                           |
| LowDiskSpace           | ⚠️ Warn  | Root disk free space drops below 15%.                               | 5m           | Prevents logging, file writing, and database engine storage crashes. | 1\. Run `df -h` on host.<br>2\. Clean old images: `docker system prune -a --volumes`.                              |
| NetworkInstability     | ⚠️ Warn  | Network interface logs read / write errors > 0.                     | 5m           | Detects driver faults, hardware issues, or packet drops.             | 1\. Ping across connected container layers.<br>2\. Inspect host network interface logs.                            |
| HighErrorRate          | 🚨 Crit  | HTTP 5xx responses exceed 5% of total app traffic.                  | 2m           | Indicates widespread system runtime or database connection crashes.  | 1\. Search backend logs for 500 error stack traces.<br>2\. Check MongoDB Atlas connection status.                  |
| SlowResponseTime       | ⚠️ Warn  | 95% of API requests take longer than 2 seconds.                     | 2m           | Monitors deteriorating user experience and bottlenecking requests.   | 1\. Query slow endpoints using Prometheus web interface.<br>2\. Check for missing database indexes.                |
| AIServiceEmptyResponse | 🚨 Crit  | AI feature returns successful 200 OK but with an empty string body. | 1m           | Catches upstream token expiration or bad prompt filtering.           | 1\. Verify `HF_TOKEN` validity.<br>2\. Check status page of upstream AI provider.                                  |
| HighConnectionDrops    | ⚠️ Warn  | Network connection drops exceed 1 drop per second.                  | 2m           | Catches client disconnects, timeouts, or WebSocket failures.         | 1\. Query `brainbytes_connection_drops_total` by `reason`.                                                         |