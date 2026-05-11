import express from 'express';
import messageController from '../controllers/message-controller.js';

const router = express.Router();

// POST a new message
router.post('/api/messages', messageController.createMessage);

export default router;