import express from 'express';
import messageController from '../controllers/message-controller.js';
import { optionalAuthentication } from '../middleware/auth.js';

const router = express.Router();
const fileName = 'message.js';

// GET all messages (fetch conversation history)
router.get('/', optionalAuthentication, messageController.getMessages);

// POST a new message
router.post('/', optionalAuthentication, messageController.createMessage);

export default router;