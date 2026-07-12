import express from 'express';
import cors from 'cors';
import messageRoutes from './src/routes/message.js';
import learningMaterialsRoutes from './src/routes/learning-material.js';
import subjectRoutes from './src/routes/subject.js';
import userProfileRoutes from './src/routes/user-profile.js';
import errorHandler from './src/middleware/errorHandler.js';
import requestMonitor from './src/middleware/requestMonitor.js';
import alertRoutes from './src/routes/alerts.js';

const app = express();
const FE_URLS = process.env.FE_URL ? process.env.FE_URL.split(',').map(url => url.trim()) : [];

// Cors
app.use(cors({
  origin: FE_URLS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Platform', 'X-Network-Type'],
  credentials: true
}));

app.use(express.json());

//----------------------Monitoring Block--------------------------
// Global HTTP Request Traffic 
app.use(requestMonitor);
//----------------------------------------------------------------

// All API Routes
app.use('/api/materials', learningMaterialsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', userProfileRoutes);
app.use('/api', alertRoutes);
app.get('/api/debug/error', (req, res) => {
  console.log("Debug error endpoint hit. Triggering 500 status code.");
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: "This is a test error for debugging purposes." 
  });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is healthy' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

export default app;