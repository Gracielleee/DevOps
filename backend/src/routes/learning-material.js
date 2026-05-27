import express from 'express';
import LearningMaterial from '../models/learning-material.js';
import logger from '../logger.js';
import message from '../models/message.js';
import {authenticate, isMaterialOwner} from '../middleware/auth.js';

const router = express.Router();
const fileName = 'learning-material.js';

// Get all learning materials
router.get('/', authenticate, async (req, res) => {
    try {
        const materials = await LearningMaterial
            .find({ owner: req.user.id })
            .populate('subject')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Learning materials fetched successfully',
            data: materials
        });
    } catch (error) {
        logger.error('Error fetching learning materials:', error, { file: fileName });
        res.status(500).json({
            message: error.message || 'Failed to fetch learning materials'
        });
    }
});

// Create a new learning material
router.post('/', authenticate, async (req, res) => {
    try {
        const { subject, topic, content } = req.body;
        const newMaterial = new LearningMaterial({
            owner: req.user.id,
            subject,
            topic,
            content
        });

        await newMaterial.save();
        res.status(201).json({
            message: 'Learning material created successfully',
            data: newMaterial
        });
    } catch (error) {
        logger.error('Error creating learning material:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to create learning material'
        });
    }
});

// Get learning material by ID
router.get('/:id', authenticate, isMaterialOwner, async (req, res) => {
    try {
        const material = await LearningMaterial
            .findById(req.params.id)
            .populate('subject');
        if (!material) {
            return res.status(404).json({
                message: 'Learning material not found'
            });
        }
        res.json({
            message: 'Learning material fetched successfully',
            data: material
        });
    } catch (error) {
        logger.error('Error fetching learning material:', error, { file: fileName });
        res.status(500).json({
            message: error.message || 'Failed to fetch learning material'
        });
    }
});

// Update a learning material
router.put('/:id', authenticate, isMaterialOwner, async (req, res) => {
    try {
        const { subject, topic, content } = req.body;
        const updateData = {};
        if (subject !== undefined) updateData.subject = subject;
        if (topic !== undefined) updateData.topic = topic;
        if (content !== undefined) updateData.content = content;
        const updatedMaterial = await LearningMaterial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('subject');
        if (!updatedMaterial) {
            return res.status(404).json({
                message: 'Learning material not found'
            });
        }
        res.json({
            message: 'Learning material updated successfully',
            data: updatedMaterial
        });
    } catch (error) {
        logger.error('Error updating learning material:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to update learning material'
        });
    }
});

// Delete a learning material
router.delete('/:id', authenticate, isMaterialOwner, async (req, res) => {
    try {
        const deletedMaterial = await LearningMaterial.findByIdAndDelete(req.params.id);
        if (!deletedMaterial) {
            return res.status(404).json({
                message: 'Learning material not found'
            });
        }
        res.json({
            message: 'Learning material deleted successfully',
            data: deletedMaterial
        });
    } catch (error) {
        logger.error('Error deleting learning material:', error, { file: fileName });
        res.status(500).json({
            message: error.message || 'Failed to delete learning material'
        });
    }
});

export default router;