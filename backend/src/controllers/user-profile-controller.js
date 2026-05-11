import userProfile from "../models/user-profile.js";
import Subject from "../models/subject.js";

const userProfileController = {
    // Create new user profile
    createUserProfile: async (req, res) => {
        try {
            const { name, email, age, preferredSubjects } = req.body;
            
            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({ 
                    message: 'Name and email are required' 
                });
            }
            
            // Validate age
            if (age !== undefined && (age < 12 || age > 150)) {
                return res.status(400).json({ 
                    message: 'Age must be between 12 and 150' 
                });
            }
            
            // Create Subject instances from preferred subjects
            const subjects = preferredSubjects?.map(sub => {
                return new Subject(sub.name, sub.description);
            }) || [];
            
            const newUserProfile = new userProfile({
                name,
                email,
                age,
                preferredSubjects: subjects
            });
            
            await newUserProfile.save();
            res.status(201).json({
                success: true,
                data: newUserProfile
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            res.status(400).json({ 
                message: error.message || 'Failed to create user profile' 
            });
        }
    },
    
    // Get user profile by ID
    getUserProfile: async (req, res) => {
        try {
            const profile = await userProfile.findById(req.params.id);
            
            if (!profile) {
                return res.status(404).json({ 
                    message: 'User profile not found' 
                });
            }
            
            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ 
                message: error.message || 'Failed to fetch user profile' 
            });
        }
    },
    
    // Update user profile
    updateUserProfile: async (req, res) => {
        try {
            const { name, email, age, preferredSubjects } = req.body;
            
            const updateData = {};
            
            if (name !== undefined) updateData.name = name;
            if (email !== undefined) updateData.email = email;
            if (age !== undefined) updateData.age = age;
            if (preferredSubjects !== undefined) {
                updateData.preferredSubjects = preferredSubjects.map(sub => 
                    new Subject(sub.name, sub.description)
                );
            }
            
            const updatedProfile = await userProfile.findByIdAndUpdate(
                req.params.id,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );
            
            if (!updatedProfile) {
                return res.status(404).json({ 
                    message: 'User profile not found' 
                });
            }
            
            res.json({
                success: true,
                data: updatedProfile
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(400).json({ 
                message: error.message || 'Failed to update user profile' 
            });
        }
    },
    
    // Delete user profile
    deleteUserProfile: async (req, res) => {
        try {
            const deletedProfile = await userProfile.findByIdAndDelete(req.params.id);
            
            if (!deletedProfile) {
                return res.status(404).json({ 
                    message: 'User profile not found' 
                });
            }
            
            res.json({
                success: true,
                message: 'User profile deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user profile:', error);
            res.status(500).json({ 
                message: error.message || 'Failed to delete user profile' 
            });
        }
    }
};

export default userProfileController;