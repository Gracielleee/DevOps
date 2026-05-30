import express from 'express';
import Subject from '../models/subject.js';
import logger from '../logger.js';
import { validationResult } from 'express-validator';
import {
    validateSubjectCreation,
    validateSubjectUpdate,
} from '../middleware/validation/subjectValidation.js';

const router = express.Router();
const fileName = 'subject.js';

// GET all subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json({
            message: 'Subjects fetched successfully',
            data: subjects
        });
    } catch (error) {
        logger.error('Error fetching subjects:', error, { file: fileName });
        res.status(500).json({
            message: error.message || 'Failed to fetch subjects'
        });
    }
});

// POST /api/subjects/ - Create new subject
router.post('/', validateSubjectCreation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description} = req.body;
        // Original checks removed as express-validator handles them
        const newSubject = new Subject({
            name,
            description
        });
        
        await newSubject.save();
        res.status(201).json({
            message: 'Subject created successfully',
            data: newSubject
        });
    } catch (error) {
        logger.error('Error creating subject:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to create subject'
        });
    }
});

// GET /api/subjects/:id - Get subject by ID
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                message: 'Subject not found'
            });
        }
        res.json({
            message: 'Subject fetched successfully',
            data: subject
        });
    } catch (error) {
        logger.error('Error fetching subject:', error);
        res.status(500).json({
            message: error.message || 'Failed to fetch subject'
        });
    }
});

// PUT /api/subjects/:id - Update subject
router.put('/:id', validateSubjectUpdate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description } = req.body;
        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true });
        if (!updatedSubject) {
            return res.status(404).json({
                message: 'Subject not found'
            });
        }
        res.json({
            message: 'Subject updated successfully',
            data: updatedSubject
        });
    } catch (error) {
        logger.error('Error updating subject:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to update subject'
        });
    }
});

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({
                message: 'Subject not found'
            });
        }
        res.json({
            message: 'Subject deleted',
            data: deletedSubject
        });
    } catch (error) {
        logger.error('Error deleting subject:', error, { file: fileName });
        res.status(400).json({
            message: error.message || 'Failed to delete subject'
        });
    }
});

export default router;