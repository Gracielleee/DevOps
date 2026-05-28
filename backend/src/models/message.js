import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false }, // user can be null for anonymous guests
  text: { 
    type: String, 
    required: true },
  isUser: { 
    type: Boolean, 
    default: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now }
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

export default mongoose.model('Message', messageSchema);