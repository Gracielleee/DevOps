import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
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
        .notEmpty().withMessage('Name cannot be empty'),
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('preferredSubject')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid preferred subject ID'),
];

export {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
};