import express from 'express';
import User from '../models/user-profile.js';
import Subject from '../models/subject.js';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
} from '../middleware/validation/userProfileValidation.js';

const router = express.Router();
const fileName = 'user-profile.js';

const saltRounds = 10;

router.post('/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, preferredSubject } = req.body;

        let finalSubjectId = preferredSubject;

        // Fallback if missing
        if (!finalSubjectId) {
            const defaultSubject = await Subject.findOne({ name: 'General' });
            
            if (!defaultSubject) {
                logger.error("Default 'General' subject not found in the database.", { file: fileName });
                throw new Error("Default 'General' subject not found in the database.");
            }
            finalSubjectId = defaultSubject._id; 
        }

        const newUserProfile = new User({
            name,
            email,
            password,
            preferredSubject: finalSubjectId
        });

        newUserProfile.password = await bcrypt.hash(password, saltRounds);

        await newUserProfile.save();

        logger.info('User profile created successfully', { file: fileName, userId: newUserProfile._id });

        res.status(201).json({
            message: 'User profile created successfully',
            data: newUserProfile
        });
    } catch (error) {
        logger.error('Error creating user profile:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to create user profile'
        });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // The original check for email and password presence can be removed
        // as express-validator now handles it with notEmpty()
        const user = await User.findOne({ email }).select('+password');
        logger.debug(`User found for email: ${email} ? ${!!user}`, { file: fileName });

        let passwordMatch = false;
        if (user && user.password) {
            passwordMatch = await bcrypt.compare(password, user.password);
            logger.debug(`Password comparison result for user ${email}: ${passwordMatch}`, { file: fileName });
        }
        logger.debug(`Login attempt for user ${email}: ${!!user && passwordMatch}`, { file: fileName });
        if (!user || !passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // turn to 10s to test if the token expires
        logger.info(`Login successful`);
        res.json({
            email,
            token });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Login failed' });
    }
});

router.get('/profile/', authenticate, async (req, res) => {
    try {
        const profile = await User.findById(req.user.id).populate('preferredSubject')
        if (!profile) {
            return res.status(404).json({
                message: 'User profile not found'
            });
        }
        logger.info(`User profile fetched successfully: ${profile._id}`, { file: fileName });
        res.json({
            message: 'User profile fetched successfully',
            data: profile
        });
    } catch (error) {
        logger.error('Error fetching user profile:', error, { file: fileName });
        res.status(500).json({
            message: error.message || 'Failed to fetch user profile'
        });
    }
});

router.put('/profile/', authenticate, validateProfileUpdate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, preferredSubject } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (password !== undefined) updateData.password = password;
        if (preferredSubject !== undefined) updateData.preferredSubject = preferredSubject;

        const updatedProfile = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        );
        if (!updatedProfile) {
            return res.status(404).json({
                message: 'User profile not found'
            });
        }
        logger.info(`User profile updated successfully: ${updatedProfile._id}`, { file: fileName });
        res.json({
            message: 'User profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        logger.error('Error updating user profile:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to update user profile'
        });
    }
});

//WILL PROBABLY BE UNUSED
router.delete('/profile/', authenticate, async (req, res) => {
    try {
        const deletedProfile = await User.findByIdAndDelete(req.user.id);
        if (!deletedProfile) {
            return res.status(404).json({
                message: 'User profile not found'
            });
        }
        logger.info(`User profile deleted successfully: ${deletedProfile._id}`, { file: fileName });
        res.json({
            message: 'User profile deleted successfully',
            data: deletedProfile
        });
    } catch (error) {
        logger.error('Error deleting user profile:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to delete user profile'
        });
    }
});

export default router;
