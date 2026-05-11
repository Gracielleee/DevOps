import Subject from "../models/subject.js";

const subjectController = {
    // Create new subject
    createSubject: async (req, res) => {
        try {
            const { name, description, tags } = req.body;
            if (!name || !description || !tags) {
                return res.status(400).json({ 
                    message: 'Name, description, and tags are required' 
                });
            }
            const newSubject = new Subject({
                name,
                description,
                tags
            });
            
            await newSubject.save();
            res.status(201).json({
                success: true,
                data: newSubject
            });
        } catch (error) {
            console.error('Error creating subject:', error);
            res.status(400).json({ 
                message: error.message || 'Failed to create subject' 
            });
        }
    },

    // Get all subjects
    getAllSubjects: async (req, res) => {
        try {
            const subjects = await Subject.find();
            res.json({
                success: true,
                data: subjects
            });
        } catch (error) {
            console.error('Error fetching subjects:', error);
            res.status(500).json({ 
                message: error.message || 'Failed to fetch subjects' 
            });
        }
    },
    
    // Get subject by ID
    getSubject: async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id);
            
            if (!subject) {
                return res.status(404).json({ 
                    message: 'Subject not found' 
                });
            }
            
            res.json({
                success: true,
                data: subject
            });
        } catch (error) {
            console.error('Error fetching subject:', error);
            res.status(500).json({ 
                message: error.message || 'Failed to fetch subject' 
            });
        }
    },
    
    // Update subject
    updateSubject: async (req, res) => {
        try {
            const { name, description, tags } = req.body;
            
            const updateData = {};
            
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (tags !== undefined) updateData.tags = tags;
            
            const updatedSubject = await Subject.findByIdAndUpdate(
                req.params.id,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );
            
            if (!updatedSubject) {
                return res.status(404).json({ 
                    message: 'Subject not found' 
                });
            }
            
            res.json({
                success: true,
                data: updatedSubject
            });
        } catch (error) {
            console.error('Error updating subject:', error);
            res.status(400).json({ 
                message: error.message || 'Failed to update subject' 
            });
        }
    },
    
    // Delete subject
    deleteSubject: async (req, res) => {
        try {
            const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
            
            if (!deletedSubject) {
                return res.status(404).json({ 
                    message: 'Subject not found' 
                });
            }
            res.json({
                success: true,
                message: 'Subject deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting subject:', error);
            res.status(500).json({ 
                message: error.message || 'Failed to delete subject' 
            });
        }
    }
};

export default subjectController;