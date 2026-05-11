import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: String,
  isUser: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);