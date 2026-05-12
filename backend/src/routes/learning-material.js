import express from 'express';
import learningMaterialsController from '../controllers/learning-material-controller.js';

const router = express.Router();

// Get all learning materials
router.get('/materials', learningMaterialsController.getAllMaterials);

// Create a new learning material
router.post('/materials', learningMaterialsController.createMaterial);

export default router;