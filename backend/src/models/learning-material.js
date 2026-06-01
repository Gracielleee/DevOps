import mongoose from 'mongoose';
import Subject from './subject.js';
import { CHARACTER_LIMITS } from '../config/characterLimits.js';

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
    required: true,
    trim: true,
    maxlength: [CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH, `Topic cannot exceed ${CHARACTER_LIMITS.MATERIAL_TOPIC_MAX_LENGTH} characters`] },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH, `Content cannot exceed ${CHARACTER_LIMITS.MATERIAL_CONTENT_MAX_LENGTH} characters`] },
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
