import request from 'supertest';
import app from '../app.js';
import { register } from '../src/monitoring/metrics.js';

describe('Metrics integration', () => {
  it('increments HTTP request metric and exposes it via register', async () => {
    // Reset metrics to a clean state for the test
    if (typeof register.resetMetrics === 'function') {
      register.resetMetrics();
    }

    // Exercise an endpoint that is instrumented
    const res = await request(app).get('/api/subjects');
    expect(res.status).toBe(200);

    // Pull metrics text from the registry
    const metricsText = await register.metrics();

    // Basic assertions that metrics were recorded and exposed
    expect(metricsText).toContain('brainbytes_http_requests_total');
    expect(metricsText).toContain('brainbytes_response_size_bytes');
    expect(metricsText).toContain('brainbytes_mobile_requests_total');
  });
});
