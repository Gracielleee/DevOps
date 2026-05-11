import mongoose from 'mongoose';
import validator from 'validator';
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
            validator: validator.isEmail,
            message: 'Invalid email format'
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Don't return password in queries by default
    },
    age: { // We can use this to tailor AI responses based on age
        type: Number,
        min: 12,
        max: 150
    },
    preferredSubjects: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('UserProfile', userProfileSchema);