import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { generateResponse } from './src/services/ai-service.js';
import logger from './logger.js';
import LearningMaterial from './src/models/learning-material.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/brainbytes', {
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch(err => {
  logger.error('Failed to connect to MongoDB:', err);
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
