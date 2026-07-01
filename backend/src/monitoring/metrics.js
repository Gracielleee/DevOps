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
  help: "Time taken for AI to generate responses by input message length",
  labelNames: ["subject", "character_range", "status"],
  buckets: [0.2, 0.5, 1, 2, 3, 4, 5, 10, 20, 30],
  registers: [register],
});

const aiResponseLength = new client.Histogram({
  name: "brainbytes_ai_response_length_characters",
  help: "Distribution of response lengths (characters) for AI-generated content",
  labelNames: ["subject", "status"],
  // Keep 0 bucket to detect empty AI responses explicitly (empty string)
  buckets: [0, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000],
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

const mobilePlatformCounter = new client.Counter({
  name: 'brainbytes_mobile_requests_total',
  help: 'Total requests from mobile devices',
  labelNames: ['platform', 'network_type'],
  registers: [register]
});

const payloadSizeHistogram = new client.Histogram({
  name: 'brainbytes_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['endpoint'],
  buckets: [1000, 10000, 50000, 100000, 500000],
  registers: [register]
});


const connectionDropCounter = new client.Counter({
  name: 'brainbytes_connection_drops_total',
  help: 'Number of dropped connections',
  labelNames: ['reason'],
  registers: [register]
});

// Counter for explicit empty AI responses to make alerting simpler than relying solely on the zero bucket in the histogram.
const aiEmptyResponseCounter = new client.Counter({
  name: 'brainbytes_ai_empty_responses_total',
  help: 'Number of AI requests that returned an empty response',
  labelNames: ['subject'],
  registers: [register]
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
  aiResponseLength,
  questionCounter,
  learningMaterialsCounter,
  mobilePlatformCounter,
  payloadSizeHistogram,
  connectionDropCounter,
  aiEmptyResponseCounter
};
