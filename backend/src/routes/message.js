import express from 'express';
import messageController from '../controllers/message-controller.js';

const router = express.Router();

// GET all messages (fetch conversation history)
router.get('/messages', messageController.getMessages);

// POST a new message
router.post('/messages', messageController.createMessage);

export default router;