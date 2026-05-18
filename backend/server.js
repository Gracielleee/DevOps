import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import userProfileRouter from './userProfile.js';
import { generateResponse } from './src/services/ai-service.js';
import logger from './logger.js';
import LearningMaterial from './src/models/learning-material.js';
import messageRoutes from './src/routes/message.js';
import learningMaterialsRoutes from './src/routes/learning-material.js';
import subjectRoutes from './src/routes/subject.js';
import userProfileRoutes from './src/routes/user-profile.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://frontend:3000','http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Basic Authentication
const users = {
  'admin': 'password'
};

app.use('/api', basicAuth({
  users,
  challenge: false,
  unauthorizedResponse: 'Unauthorized'
}));

// User Profile Routes
app.use('/api/user-profiles', userProfileRouter);

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

// Routes
app.use('/api', messageRoutes);
app.use('/api/materials', learningMaterialsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/profile', userProfileRoutes);
