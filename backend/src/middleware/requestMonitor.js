import {
  httpRequestCounter,
  httpRequestDuration,
  payloadSizeHistogram,
  mobilePlatformCounter,
  connectionDropCounter,
} from "../monitoring/metrics.js";

const requestMonitor = (req, res, next) => {
  // Exclude health endpoint
  if (req.path === "/health") {
    return next();
  }

  const endTimer = httpRequestDuration.startTimer();

  // Detect client aborts
  res.on("close", () => {
    if (!res.writableEnded) {
      connectionDropCounter.inc({ reason: "client_abort" });
    }
  });

  res.on("finish", () => {
    // ── Route Pattern Normalization ──
    let routePattern = "unmapped";

    if (req.route && req.route.path) {
      // Express matched a real route
      routePattern = (req.baseUrl || "") + req.route.path;
    } else if (res.statusCode === 404) {
      routePattern = "404";
    } else if (res.statusCode >= 500) {
      routePattern = `error_${res.statusCode}`;
    }

    if (routePattern.length > 1 && routePattern.endsWith("/")) {
      routePattern = routePattern.slice(0, -1);
    }

    const status = res.statusCode;

    if (status >= 500) {
    console.log(`[METRICS] 5xx detected - method=${req.method}, route=${routePattern}, status=${status}`);
    }

    // ── HTTP Request Counter ──
    try {
      httpRequestCounter.inc({
        method: req.method,
        route_pattern: routePattern,
        status,
      });
    } catch (e) {
      console.log("httpRequestCounter hit")
      console.log(req.method + ", " + routePattern + ", " + status)
      console.error("Error incrementing httpRequestCounter:", e);
    }

    // ── HTTP Duration Timer ──
    try {
      endTimer({
        method: req.method,
        route_pattern: routePattern,
        status,
      });
    } catch (e) {
      console.error("Error ending HTTP timer:", e);
    }

    // ── Payload Size ──
    const contentLength = res.getHeader && res.getHeader("content-length");
    const bytes = contentLength ? parseInt(contentLength, 10) || 0 : 0;
    try {
      payloadSizeHistogram.observe({ endpoint: routePattern }, bytes);
    } catch (e) {
      console.error("Error observing payload size:", e);
    }

    // ── Mobile Platform Detection ──
    const platformHeader = (req.headers["x-client-platform"] || "").toString();
    const networkHeader = (req.headers["x-network-type"] || "").toString();
    const ua = (req.headers["user-agent"] || "").toString();

    let platform = "unknown";
    if (platformHeader) {
      const ph = platformHeader.toLowerCase();
      if (ph.includes("ios")) platform = "ios";
      else if (ph.includes("android")) platform = "android";
      else platform = ph || "other";
    } else if (/android/i.test(ua)) {
      platform = "android";
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      platform = "ios";
    } else if (/mobile/i.test(ua)) {
      platform = "other";
    }

    const network_type = networkHeader
      ? networkHeader.toLowerCase()
      : "unknown";

    if (["ios", "android", "other"].includes(platform)) {
      try {
        mobilePlatformCounter.inc({ platform, network_type });
      } catch (e) {
        console.error("Error incrementing mobilePlatformCounter:", e);
      }
    }
  });

  next();
};

export default requestMonitor;