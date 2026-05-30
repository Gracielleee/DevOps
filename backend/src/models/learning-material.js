import mongoose from 'mongoose';
import Subject from './subject.js';

const learningMaterialSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true,
    index: true
  },
  topic: { 
    type: String, 
    required: true },
  content: { 
    type: String, 
    required: true },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id; 
      delete ret._id;   
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for owner and createdAt for efficient querying and sorting
learningMaterialSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('LearningMaterial', learningMaterialSchema);
