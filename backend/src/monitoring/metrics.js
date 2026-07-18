import client from 'prom-client';
import NodeCache from 'node-cache';
import { setInterval } from 'timers';

const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });



// =====================================================
// HTTP HEALTH
// =====================================================

const httpRequestCounter = new client.Counter({
  name: "brainbytes_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route_pattern", "status"],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: "brainbytes_http_request_duration_seconds",
  help: "HTTP request duration in seconds (SLO: <3s under normal load)",
  labelNames: ["method", "route_pattern", "status"],
  buckets: [0.05, 0.1, 0.5, 1, 2, 3, 5, 10],
  registers: [register],
});



// =====================================================
// LOW-BANDWITH TRACKING
// =====================================================

const payloadSizeHistogram = new client.Histogram({
  name: 'brainbytes_response_size_bytes',
  help: 'Size of HTTP responses in bytes (SLO: <100KB for 1Mbps connection compliance)',
  labelNames: ['endpoint'],
  // 100KB = ~0.8s at 1Mbps, 300KB = ~2.4s, 500KB = ~4s (breaks SLO alone)
  buckets: [1000, 5000, 10000, 50000, 100000, 300000, 500000],
  registers: [register]
});

const mobilePlatformCounter = new client.Counter({
  name: 'brainbytes_mobile_requests_total',
  help: 'Requests from mobile devices by platform and network type',
  labelNames: ['platform', 'network_type'], // network_type: wifi, 4g, 3g, unknown
  registers: [register]
});



// =====================================================
// AI-SERVICE HEALTH
// =====================================================

const aiResponseTimeHistogram = new client.Histogram({
  name: "brainbytes_ai_response_time_seconds",
  help: "Time taken for AI to generate responses",
  labelNames: ["subject", "status"],
  buckets: [0.2, 0.5, 1, 2, 3, 5, 10, 20],
  registers: [register],
});

const aiEmptyResponseCounter = new client.Counter({
  name: 'brainbytes_ai_empty_responses_total',
  help: 'AI requests returning empty responses (critical: service degraded)',
  labelNames: ['subject'],
  registers: [register]
});



// =====================================================
// CAPACITY
// =====================================================

const activeSessionsGauge = new client.Gauge({
  name: "brainbytes_active_sessions",
  help: "Active sessions from authenticated users.",
  registers: [register],
});
const sessionCache = new NodeCache({ stdTTL: 3600, checkperiod: 60 });  //For tracking active sessions. Imported into auth middleware. 1hr window
setInterval(() => {
  const activeCount = sessionCache.getStats().keys;
  activeSessionsGauge.set(activeCount);
}, 15000); //Updates every 15 seconds

const questionCounter = new client.Counter({
  name: "brainbytes_questions_total",
  help: "Total number of questions asked",
  labelNames: ["subject", "status"],
  registers: [register],
});

const learningMaterialsCounter = new client.Counter({
  name: "brainbytes_learning_materials_total",
  help: "Learning materials created, grouped by byte size range",
  labelNames: ["subject", "byte_range"],
  registers: [register],
});



// =====================================================
// ERROR MONITORING
// =====================================================

const connectionDropCounter = new client.Counter({
  name: 'brainbytes_connection_drops_total',
  help: 'Number of dropped connections by reason',
  labelNames: ['reason'], //Errors: timeout, network_error, client_disconnect
  registers: [register]
});





export {
  sessionCache,
  register,
  httpRequestCounter,
  httpRequestDuration,
  activeSessionsGauge,
  aiResponseTimeHistogram,
  aiEmptyResponseCounter,
  payloadSizeHistogram,
  mobilePlatformCounter,
  connectionDropCounter,
  questionCounter,
  learningMaterialsCounter
};
