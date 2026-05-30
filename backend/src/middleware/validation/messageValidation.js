import { body } from 'express-validator';
import mongoose from 'mongoose';

const validateMessageCreation = [
    body('text')
        .trim()
        .notEmpty().withMessage('Message content (text) is required'),
    body('subject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
];

export {
    validateMessageCreation,
};