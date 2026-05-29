import { body } from 'express-validator';

const validateSubjectCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Subject name is required'),
    body('description')
        .trim()
        .notEmpty().withMessage('Subject description is required'),
];

const validateSubjectUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Subject name cannot be empty'),
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Subject description cannot be empty'),
];

export {
    validateSubjectCreation,
    validateSubjectUpdate,
};