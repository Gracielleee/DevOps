import express from 'express';
import userProfileController from '../controllers/user-profile-controller.js';

const router = express.Router();

// POST	/profile	Create new user profile
router.post('/profile', userProfileController.createUserProfile);

// GET	/profile/:id	Get profile by ID
router.get('/profile/:id', userProfileController.getUserProfile);

// PUT	/profile/:id	Update profile
router.put('/profile/:id', userProfileController.updateUserProfile);

// DELETE	/profile/:id	Delete profile
router.delete('/profile/:id', userProfileController.deleteUserProfile);

export default router;
