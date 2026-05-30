import express from 'express';
import messageController from '../controllers/message-controller.js';
import { authenticate, optionalAuthentication } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import {
    validateMessageCreation,
} from '../middleware/validation/messageValidation.js';

const router = express.Router();
const fileName = 'message.js';

// GET all messages (fetch conversation history)
router.get('/', optionalAuthentication, messageController.getMessages);

// POST: guest allowed without Authorization; any header present must pass JWT validation
router.post('/', validateMessageCreation, authenticate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await messageController.createMessage(req, res);
    } catch (error) {
        logger.error('Error creating message:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to create message'
        });
    }
});

export default router;