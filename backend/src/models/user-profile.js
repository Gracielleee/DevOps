import mongoose from 'mongoose';
import Subject from './subject.js';

const userProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
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
        minlength: 8,
        select: false // Should be false. Don't return password in queries by default
    },
    preferredSubject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', 
        required: true },
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