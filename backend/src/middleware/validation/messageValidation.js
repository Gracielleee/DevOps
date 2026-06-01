import { body } from 'express-validator';
import mongoose from 'mongoose';
import { CHARACTER_LIMITS } from '../../config/characterLimits.js';

const validateMessageCreation = [
    body('text')
        .trim()
        .notEmpty().withMessage('Message content (text) is required')
        .isLength({ max: CHARACTER_LIMITS.MESSAGE_TEXT_MAX_LENGTH }).withMessage(`Message too long. Maximum length is ${CHARACTER_LIMITS.MESSAGE_TEXT_MAX_LENGTH} characters`),
    body('subject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
];

export {
    validateMessageCreation,
};