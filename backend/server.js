import mongoose from 'mongoose';
import app from './app.js';
import logger from './src/logger.js';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch(err => {
  logger.error('Failed to connect to MongoDB:', err);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
