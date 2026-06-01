import mongoose from 'mongoose';
import { CHARACTER_LIMITS } from '../config/characterLimits.js';

const messageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false, // user can be null for anonymous guests
    index: true
  }, 
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [CHARACTER_LIMITS.MESSAGE_TEXT_MAX_LENGTH, `Message too long. Maximum length is ${CHARACTER_LIMITS.MESSAGE_TEXT_MAX_LENGTH} characters`]
  },
  isUser: { 
    type: Boolean, 
    default: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  toJSON: { //Mongo doc cleanup
    transform: function (doc, ret) {
      ret.id = ret._id; 
      delete ret._id;   
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for user and createdAt for efficient querying and sorting
messageSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);