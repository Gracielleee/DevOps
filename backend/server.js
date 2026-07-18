import 'dotenv/config';
import mongoose from 'mongoose';
import logger from './src/config/logger.js';
import { app, ENABLE_METRICS} from './app.js';

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

if (ENABLE_METRICS) {
  requiredEnvVars.push('METRICS_AUTH_USERNAME', 'METRICS_AUTH_PASSWORD');
}

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

logger.info(`Starting BrainBytes Backend - Environment: ${NODE_ENV}`);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(ENABLE_METRICS ? '/metrics enabled' : '/metrics disabled');
    });
  } catch (err) {
    logger.error('Failed to connect to MongoDB or start server:', err);
    process.exit(1);
  }
};

startServer();
