import { body } from 'express-validator';
import mongoose from 'mongoose';

const validateLearningMaterialCreation = [
    body('subject')
        .notEmpty().withMessage('Subject is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
    body('topic')
        .trim()
        .notEmpty().withMessage('Topic is required'),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required'),
];

const validateLearningMaterialUpdate = [
    body('subject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
    body('topic')
        .optional()
        .trim()
        .notEmpty().withMessage('Topic cannot be empty'),
    body('content')
        .optional()
        .trim()
        .notEmpty().withMessage('Content cannot be empty'),
];

export {
    validateLearningMaterialCreation,
    validateLearningMaterialUpdate,
};