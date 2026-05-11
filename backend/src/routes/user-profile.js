import express from 'express';
import userProfileController from '../controllers/user-profile-controller.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// POST	/profile	Create new user profile
router.post('/profile', authenticate, userProfileController.createUserProfile);

// GET	/profile/:id	Get profile by ID
router.get('/profile/:id', authenticate, userProfileController.getUserProfile);

// PUT	/profile/:id	Update profile
router.put('/profile/:id', authenticate, userProfileController.updateUserProfile);

// DELETE	/profile/:id	Delete profile
router.delete('/profile/:id', authenticate, userProfileController.deleteUserProfile);

export default router;
