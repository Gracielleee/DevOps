import client from 'prom-client';
import NodeCache from 'node-cache';
import { setInterval } from 'timers';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "brainbytes_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "endpoint", "status"],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: "brainbytes_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "endpoint", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 20, 30], 
  registers: [register],
});

const activeSessionsGauge = new client.Gauge({
  name: "brainbytes_active_sessions",
  help: "Number of active sessions from authenticated users.",
  registers: [register],
});
const sessionCache = new NodeCache({ stdTTL: 900, checkperiod: 60 }); //For tracking active sessions. Imported into auth middleware

const aiResponseTimeHistogram = new client.Histogram({
  name: "brainbytes_ai_response_time_seconds",
  help: "Time taken for AI to generate responses by message length",
  labelNames: ["subject", "character_range", "status"],
  buckets: [0.2, 0.5, 1, 2, 3, 4, 5, 10, 20, 30],
  registers: [register],
});

const questionCounter = new client.Counter({
  name: "brainbytes_questions_total",
  help: "Total number of questions asked",
  labelNames: ["subject", "status"],
  registers: [register],
});

const learningMaterialsCounter = new client.Counter({
  name: "brainbytes_learning_materials_total",
  help: "Total number of learning materials",
  labelNames: ["subject", "character_range"],
  registers: [register],
});

setInterval(() => {
  const activeCount = sessionCache.getStats().keys;
  activeSessionsGauge.set(activeCount);
}, 15000);

export {
  sessionCache,
  register,
  httpRequestCounter,
  httpRequestDuration,
  activeSessionsGauge,
  aiResponseTimeHistogram,
  questionCounter,
  learningMaterialsCounter
};
