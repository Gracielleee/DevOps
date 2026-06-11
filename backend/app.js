import express from 'express';
import cors from 'cors';
import messageRoutes from './src/routes/message.js';
import learningMaterialsRoutes from './src/routes/learning-material.js';
import subjectRoutes from './src/routes/subject.js';
import userProfileRoutes from './src/routes/user-profile.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();
const FE_URLS = process.env.FE_URL ? process.env.FE_URL.split(',').map(url => url.trim()) : [];

app.use(cors({
  origin: FE_URLS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/api/materials', learningMaterialsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/messages', messageRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is healthy' });
});
app.use('/api', userProfileRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;
