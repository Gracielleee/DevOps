import { body } from 'express-validator';
import mongoose from 'mongoose';
import { CHARACTER_LIMITS } from '../../config/characterLimits.js';

const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: CHARACTER_LIMITS.USER_NAME_MAX_LENGTH }).withMessage(`Name cannot exceed ${CHARACTER_LIMITS.USER_NAME_MAX_LENGTH} characters`),
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .isLength({ min: CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH }).withMessage(`Password must be at least ${CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH} characters long`),
    body('preferredSubject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid preferred subject ID'),
];

const validateLogin = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ max: CHARACTER_LIMITS.USER_NAME_MAX_LENGTH }).withMessage(`Name cannot exceed ${CHARACTER_LIMITS.USER_NAME_MAX_LENGTH} characters`),
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH }).withMessage(`Password must be at least ${CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH} characters long`),
    body('preferredSubject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid preferred subject ID'),
];

export {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
};