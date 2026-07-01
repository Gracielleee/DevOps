import { httpRequestCounter, httpRequestDuration, payloadSizeHistogram, mobilePlatformCounter, connectionDropCounter } from '../monitoring/metrics.js';

const requestMonitor = (req, res, next) => {
  // Exclude health endpoint
  if (req.path === '/health') {
    return next();
  }

  const endTimer = httpRequestDuration.startTimer();
  
  // Detect client aborts: if the response closes before finishing, count as a drop
  res.on('close', () => {
    if (!res.writableEnded) {
      connectionDropCounter.inc({ reason: 'client_abort' });
    }
  });

  res.on('finish', () => {
    let routePattern = req.path;

    //Route capture
    if (req.route) {
      // Scenario A: The route is defined directly on the root app (like '/')
      routePattern = req.route.path;
    } else if (req.baseUrl) {
      // Scenario B: The route lives inside a sub-router (like /api/materials)
      const subPath = req.route ? req.route.path : '';
      routePattern = `${req.baseUrl}${subPath}`;
    }

    if (routePattern.length > 1 && routePattern.endsWith('/')) {
      routePattern = routePattern.slice(0, -1);
    }

    // Observe response payload size if available via header
    const contentLength = res.getHeader && res.getHeader('content-length');
    const bytes = contentLength ? parseInt(contentLength, 10) || 0 : 0;
    try {
      payloadSizeHistogram.observe({ endpoint: routePattern }, bytes);
    } catch (e) {
      console.error("Error observing payload size:", e);
    }

    // Detect mobile platforms and network type from headers (prefer explicit headers)
    const platformHeader = (req.headers['x-client-platform'] || '').toString();
    const networkHeader = (req.headers['x-network-type'] || '').toString();
    const ua = (req.headers['user-agent'] || '').toString();
    let platform = 'unknown';
    if (platformHeader) {
      const ph = platformHeader.toLowerCase();
      if (ph.includes('ios')) platform = 'ios';
      else if (ph.includes('android')) platform = 'android';
      else platform = ph || 'other';
    } else if (/android/i.test(ua)) {
      platform = 'android';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      platform = 'ios';
    } else if (/mobile/i.test(ua)) {
      platform = 'other';
    }

    const network_type = networkHeader ? networkHeader.toLowerCase() : 'unknown';

    // Only increment mobile metric for recognized mobile platforms
    if (['ios', 'android', 'other'].includes(platform)) {
      try {
        mobilePlatformCounter.inc({ platform, network_type });
      } catch (e) {
        console.error("Error incrementing mobilePlatformCounter:", e);
      }
    }

    httpRequestCounter.inc({
      method: req.method,
      endpoint: routePattern,
      status: res.statusCode
    });

    endTimer({
      method: req.method,
      endpoint: routePattern,
      status: res.statusCode
    });
  });

  next();
};

export default requestMonitor;