import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const userProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    preferences: { type: Map, of: String },
    bio: String,
    createdAt: { type: Date, default: Date.now }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Create a new user profile
router.post('/', async (req, res) => {
    try {
        const newUserProfile = new UserProfile(req.body);
        await newUserProfile.save();
        res.status(201).json(newUserProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all user profiles
router.get('/', async (req, res) => {
    try {
        const userProfiles = await UserProfile.find();
        res.json(userProfiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single user profile by userId
router.get('/:userId', async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ userId: req.params.userId });
        if (!userProfile) return res.status(404).json({ message: 'User profile not found' });
        res.json(userProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a user profile
router.patch('/:userId', async (req, res) => {
    try {
        const userProfile = await UserProfile.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!userProfile) return res.status(404).json({ message: 'User profile not found' });
        res.json(userProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user profile
router.delete('/:userId', async (req, res) => {
    try {
        const userProfile = await UserProfile.findOneAndDelete({ userId: req.params.userId });
        if (!userProfile) return res.status(404).json({ message: 'User profile not found' });
        res.json({ message: 'User profile deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
