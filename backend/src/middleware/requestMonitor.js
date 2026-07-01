import { httpRequestCounter, httpRequestDuration } from '../monitoring/metrics.js';

const requestMonitor = (req, res, next) => {
  // Exclude health endpoint
  if (req.path === '/health') {
    return next();
  }

  const endTimer = httpRequestDuration.startTimer();
  
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