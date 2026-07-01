# BrainBytes Prometheus Query & Monitoring Dashboard Reference Guide
This reference document outlines the core PromQL (Prometheus Query Language) expressions to monitor and analyze the performance, usage, and reliability of the BrainBytes backend platform based on the `metrics.js` file.

</br>

## System Traffic & HTTP Metrics (`httpRequestCounter` & `httpRequestDuration`)

#### 1. Total Request Rate
Calculates the global throughput of your application (requests per second) averaged over the last 5 minutes. Excellent for tracking sudden traffic spikes or load patterns.

```promql
sum(rate(brainbytes_http_requests_total[5m]))
```

#### 2. Error Rate by Endpoint
Monitors client-side (4xx) and server-side (5xx) errors across specific endpoints. Use this to identify failing routes quickly during an incident.

```promql
sum(rate(brainbytes_http_requests_total{status=~"[45].."}[5m])) by (endpoint)
```

#### 3. Successful Traffic Breakdown
Displays the absolute raw count of all successful (200 OK) operations filtered by their HTTP verbs (GET, POST, etc.).

```promql
brainbytes_http_requests_total{status="200"}
```


#### 4. 95th Percentile App Latency
Calculates the maximum response time that 95% of your users experience across all API routes. This is a critical Service Level Indicator (SLI) for performance tracking.

```promql
histogram_quantile(0.95, sum(rate(brainbytes_http_request_duration_seconds_bucket[5m])) by (le))
```

#### 5. Average Latency for AI/Message Flow
Isolates the exact average round-trip timing specifically for the /messages/ interface to identify backpressure or middleware lag.

```promql
sum(rate(brainbytes_http_request_duration_seconds_sum{endpoint="/messages/"}[5m])) / sum(rate(brainbytes_http_request_duration_seconds_count{endpoint="/messages/"}[5m]))
```

</br>

## 2. User Sessions & Engagement (`activeSessionsGauge`)
#### 1. Live Authenticated Users
Retrieves the exact, current count of distinct active user sessions verified in your auth middleware and managed via node-cache.

```promql
brainbytes_active_sessions
```

>💡 Tip: Plot this query on the Graph tab in Prometheus to watch the user pool expand during simulation bursts and decay naturally after 15 minutes of user idleness.

</br>

## 3. Core AI Metrics & Performance (`aiResponseTimeHistogram` & `questionCounter`)
#### 1. 95th Percentile AI Latency by Character Range
Computes the generation latency for 95% of your AI responses, dynamically grouped by your exponential bucket thresholds (e.g., "0-19", "3200-5000" characters). Use this line chart to confirm if larger tokens cause linear or exponential delay.

```promql
histogram_quantile(0.95, sum(rate(brainbytes_ai_response_time_seconds_bucket[5m])) by (le, character_range))
```

#### 2. AI Failure Rate by Subject
Tracks where the AI service or upstream model providers are throwing errors, broken down by academic category (Math, Science, History, etc.).

```promql
sum(rate(brainbytes_ai_response_time_seconds_count{status="error"}[5m])) by (subject)
```

#### 3. Question Rate per Minute by Subject
Provides a clear business metric indicating feature traction—showing how many prompts are being sent per minute in each subject area.

```promql
sum(rate(brainbytes_questions_total[5m])) by (subject) * 60
```

</br>

## 4. Content Creation Metrics (`learningMaterialsCounter`)
#### 1. Material Distribution by Size Footprint
Examines the cumulative profile of all generated learning summaries, organized by their configured character length range configurations.

```promql
sum(brainbytes_learning_materials_total) by (character_range)
```