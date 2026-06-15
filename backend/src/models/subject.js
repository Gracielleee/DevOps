import mongoose from 'mongoose';
import { CHARACTER_LIMITS } from '../config/characterLimits.js';

// src/models/subject.js

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH, `Name cannot exceed ${CHARACTER_LIMITS.SUBJECT_NAME_MAX_LENGTH} characters`]
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${CHARACTER_LIMITS.SUBJECT_DESCRIPTION_MAX_LENGTH} characters`]
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

export default mongoose.model('Subject', subjectSchema);