import express from 'express';
import logger from '../config/logger.js';

const alertRouter = express.Router();

alertRouter.post('/alerts', (req, res) => {
  const { alerts, groupLabels, commonLabels, commonAnnotations, externalURL } = req.body;

  
  if (!alerts || alerts.length === 0) {
    return res.status(200).json({ message: 'No alerts received' });
  }

  // Log all alerts received
  alerts.forEach(alert => {
    const { status, labels, annotations, startsAt, endsAt } = alert;
    
    const alertLog = {
        timestamp: new Date().toISOString(),
        alertname: labels?.alertname || commonLabels?.alertname || "Unknown",
        severity: labels?.severity || commonLabels?.severity || "unknown",
        instance: labels?.instance || "N/A",
        status,
        summary: annotations?.summary || commonAnnotations?.summary || "",
        description: annotations?.description || "",
        externalURL,
        startTime: startsAt,
        endTime: endsAt,
        groupLabels,
    };

    if (status === 'firing') {
      logger.error(`🚨 ALERT FIRING: ${alertLog.alertname}`, alertLog);
    } else if (status === 'resolved') {
      logger.info(`✅ ALERT RESOLVED: ${alertLog.alertname}`, alertLog);
    }

  });

  res.status(200).json({ message: 'Alerts processed successfully' });
});

export default alertRouter;
