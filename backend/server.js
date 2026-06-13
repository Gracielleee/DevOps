import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './src/logger.js';
import userProfileRoutes from './src/routes/user-profile.js';
import messageRoutes from './src/routes/message.js';
import learningMaterialsRoutes from './src/routes/learning-material.js';
import subjectRoutes from './src/routes/subject.js';
import errorHandler from './src/middleware/errorHandler.js';

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

// Routes
app.use('/api/materials', learningMaterialsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/messages', messageRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is healthy' });
});
app.use('/api', userProfileRoutes);

// Connect to MongoDB and Start server
const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info('Connected to MongoDB');
        
        // Error handling middleware
        app.use(errorHandler);

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to connect to MongoDB or start server:', err);
    }
};

startServer();
