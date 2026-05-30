import express from 'express';
import messageController from '../controllers/message-controller.js';
import { authenticate, optionalAuthentication } from '../middleware/auth.js';

const router = express.Router();
const fileName = 'message.js';

// GET all messages (fetch conversation history)
router.get('/', optionalAuthentication, messageController.getMessages);

// POST: guest allowed without Authorization; any header present must pass JWT validation
router.post('/', authenticate, messageController.createMessage);

export default router;