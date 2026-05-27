import mongoose from 'mongoose';
import Subject from './subject.js';

const learningMaterialSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true },
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true },
  topic: { 
    type: String, 
    required: true },
  content: { 
    type: String, 
    required: true },
  createdAt: { 
    type: Date, 
    default: Date.now }
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


export default mongoose.model('LearningMaterial', learningMaterialSchema);
