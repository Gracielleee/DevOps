import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import logger from './src/config/logger.js';
import app from './app.js';
import { register } from './src/monitoring/metrics.js';

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

console.log(process.env['MONGO_URI']);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const metricsApp = express();
const PORT = process.env.PORT || 3000;
const METRIC_PORT = process.env.METRIC_PORT || 9080;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

logger.info(`Starting BrainBytes Backend - Environment: ${NODE_ENV}`);

// Isolated Prometheus Endpoint
metricsApp.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});


const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // Start main application
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Start metrics application
    metricsApp.listen(METRIC_PORT, () => {
      logger.info(`/metrics running on port ${METRIC_PORT}`);
    });
  } catch (err) {
    logger.error('Failed to connect to MongoDB or start server:', err);
  }
};

startServer();