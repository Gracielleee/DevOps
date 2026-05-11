import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { generateResponse } from './src/services/ai-service.js';
import logger from './logger.js';
import LearningMaterial from './models/LearningMaterial.js';

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

// Define schemas
const messageSchema = new mongoose.Schema({
  text: String,
  isUser: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message and get AI response
app.post('/api/messages', async (req, res) => {
  try {
    // Save user message
    const userMessage = new Message({
      text: req.body.text,
      isUser: true
    });
    await userMessage.save();
    
    // Generate AI response with a 15-second overall timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );
    
    const aiResultPromise = generateResponse(req.body.text);
    
    // Race between the AI response and the timeout
    const aiResult = await Promise.race([aiResultPromise, timeoutPromise])
      .catch(error => {
        logger.error('AI response timed out or failed:', error);
        return {
          category: 'error',
          response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
        };
      });
    
    // Save AI response
    const aiMessage = new Message({
      text: aiResult.response,
      isUser: false
    });
    await aiMessage.save();
    
    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage,
      category: aiResult.category
    });
  } catch (err) {
    console.error('Error in /api/messages route:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get all learning materials
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await LearningMaterial.find().sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new learning material
app.post('/api/materials', async (req, res) => {
  try {
    const material = new LearningMaterial({
      subject: req.body.subject,
      topic: req.body.topic,
      content: req.body.content
    });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error('Error in /api/materials route:', err);
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
