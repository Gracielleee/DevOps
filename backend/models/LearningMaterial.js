import mongoose from 'mongoose';

const learningMaterialSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);

export default LearningMaterial;
