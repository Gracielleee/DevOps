import { body } from 'express-validator';
import { CHARACTER_LIMITS } from '../../config/characterLimits.js';

const validateSubjectCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Subject name is required')
        .isLength({ max: CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH }).withMessage(`Name cannot exceed ${CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH} characters`),
    body('description')
        .trim()
        .notEmpty().withMessage('Subject description is required')
        .isLength({ max: CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH }).withMessage(`Description cannot exceed ${CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH} characters`),
];

const validateSubjectUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Subject name cannot be empty')
        .isLength({ max: CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH }).withMessage(`Name cannot exceed ${CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH} characters`),
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Subject description cannot be empty')
        .isLength({ max: CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH }).withMessage(`Description cannot exceed ${CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH} characters`),
];

export {
    validateSubjectCreation,
    validateSubjectUpdate,
};