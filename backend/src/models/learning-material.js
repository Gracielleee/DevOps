import mongoose from 'mongoose';
import Subject from './subject.js';

const learningMaterialSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);

export default LearningMaterial;
