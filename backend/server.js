import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import userProfileRouter from './src/userProfile.js';
import { generateResponse } from './src/services/ai-service.js';
import logger from './src/logger.js';
import LearningMaterial from './src/models/learning-material.js';
import messageRoutes from './src/routes/message.js';
import learningMaterialsRoutes from './src/routes/learning-material.js';
import subjectRoutes from './src/routes/subject.js';
import userProfileRoutes from './src/routes/user-profile.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const FE_URLS = process.env.FE_URL ? process.env.FE_URL.split(',').map(url => url.trim()) : [];

// Cors
app.use(cors({
  origin: FE_URLS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());

// TURN OFF FOR NOW
// Basic Authentication
// const users = {
//   'admin': 'password'
// };

// app.use('/api', basicAuth({
//   users,
//   challenge: false,
//   unauthorizedResponse: 'Unauthorized'
// }));

// Routes
// app.use('/api/user-profiles', userProfileRouter);

// Routes
app.use('/api/materials', learningMaterialsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/messages', messageRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is healthy' });
});
app.use('/api', userProfileRoutes);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch(err => {
  logger.error('Failed to connect to MongoDB:', err);
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
