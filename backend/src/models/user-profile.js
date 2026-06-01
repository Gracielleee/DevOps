import mongoose from 'mongoose';
import Subject from './subject.js';
import { CHARACTER_LIMITS } from '../config/characterLimits.js';

const userProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [CHARACTER_LIMITS.USER_NAME_MAX_LENGTH, `Name cannot exceed ${CHARACTER_LIMITS.USER_NAME_MAX_LENGTH} characters`]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            message: 'Invalid email format'
        },
    },
    password: {
        type: String,
        required: true,
        minlength: [CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH, `Password must be at least ${CHARACTER_LIMITS.USER_PASSWORD_MIN_LENGTH} characters long`],
        select: false // Should be false. Don't return password in queries by default
    },
    preferredSubject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject',
        required: true,
        index: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
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

export default mongoose.model('User', userProfileSchema);