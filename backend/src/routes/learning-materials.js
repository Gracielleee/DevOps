import express from 'express';
import learningMaterialsController from '../controllers/learning-material-controller.js';

const app = express();

// Get all learning materials
app.get('/api/materials', learningMaterialsController.getAllMaterials);

// Create a new learning material
app.post('/api/materials', learningMaterialsController.createMaterial);