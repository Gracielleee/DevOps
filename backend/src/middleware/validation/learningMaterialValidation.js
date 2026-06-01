import { body } from 'express-validator';
import mongoose from 'mongoose';
import { CHARACTER_LIMITS } from '../../config/characterLimits.js';

const validateLearningMaterialCreation = [
    body('subject')
        .notEmpty().withMessage('Subject is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
    body('topic')
        .trim()
        .notEmpty().withMessage('Topic is required')
        .isLength({ max: CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH }).withMessage(`Topic cannot exceed ${CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH} characters`),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ max: CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH }).withMessage(`Content cannot exceed ${CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH} characters`),
];

const validateLearningMaterialUpdate = [
    body('subject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid subject ID'),
    body('topic')
        .optional()
        .trim()
        .notEmpty().withMessage('Topic cannot be empty')
        .isLength({ max: CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH }).withMessage(`Topic cannot exceed ${CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH} characters`),
    body('content')
        .optional()
        .trim()
        .notEmpty().withMessage('Content cannot be empty')
        .isLength({ max: CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH }).withMessage(`Content cannot exceed ${CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH} characters`),
];

export {
    validateLearningMaterialCreation,
    validateLearningMaterialUpdate,
};