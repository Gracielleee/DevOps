import express from 'express';
import subjectController from '../controllers/subject-controller.js';

const router = express.Router();

// GET all subjects
router.get('/subjects', subjectController.getAllSubjects);

// GET /api/subjects/:id - Get subject by ID
router.get('/subjects/:id', subjectController.getSubject);

// POST /api/subjects - Create new subject
router.post('/subjects', subjectController.createSubject);

// PUT /api/subjects/:id - Update subject
router.put('/subjects/:id', subjectController.updateSubject);

// DELETE /api/subjects/:id - Delete subject
router.delete('/subjects/:id', subjectController.deleteSubject);

export default router;