# Monitoring Guide

## Overview
This guide covers the monitoring infrastructure for BrainBytes, which uses **Prometheus** for metrics collection, **Grafana** for visualization, and **Grafana Cloud** for centralized storage.

---------

## Architecture
### Data Flow
```
Backend → Prometheus (local) → Grafana Cloud → Grafana (local instance)
```

**How it works:**
- Backend metrics are scraped by the **local Prometheus instance**
- Data is written to **Grafana Cloud** for centralized storage
- The **local Grafana instance** retrieves and visualizes data from Grafana Cloud
> Currently, prometheus scrapes from the local BrainBytes instance

---------

## Metrics Structure

### File Location
- **Metrics definitions:** `backend/monitoring/metrics.js`
- **Monitoring root folder:** `/monitoring`

### Metrics Tracking Reference
| Metric                                                              | Type                     | Source File(s)                                            |
| ------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| `httpRequestCounter`, `httpRequestDuration`, `payloadSizeHistogram` | HTTP request tracking    | `requestMonitor.js`                                       |
| `mobilePlatformCounter`                                             | Mobile platform requests | `requestMonitor.js` → `app.js` → `apiFetch.js` (frontend) |
| `aiResponseTimeHistogram`                                           | AI response latency      | `message-controller.js`                                   |
| `questionCounter`                                                   | Question submissions     | `trackers.js` → `message-controller.js`                   |
| `aiEmptyResponseCounter`                                            | Empty AI responses       | `trackers.js` → `ai-service.js`                           |
| `activeSessionsGauge`                                               | Active user sessions     | `auth.js` (via `sessionCache`)                            |
| `learningMaterialsCounter`                                          | Learning material submissions | `trackers.js` → `learning-material.js` (`/routes`)        |
| `connectionDropCounter`                                             | Connection failures      | `errorHandler.js`, `requestMonitor.js`                    |

> Note: The SLOs the metrics were based on were taken from the BrainBytes BSRD/SRS documentation.

---------
- setup (go to complete setup guide)

- prometheus alerts
- alertmanager
- dashboard; variables; charts in dashboard; how to interpret
- grafana alert rules
