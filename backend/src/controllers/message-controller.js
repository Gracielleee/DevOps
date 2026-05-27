import Message from "../models/message.js";
import generateResponse from '../services/ai-service.js';
import logger from "../logger.js";

const fileName = 'message-controller.js';

const messageController = {
  createMessage: async (req, res) => {

    let timerId;

    try {
      const content = req.body.text;

      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      const aiResultPromise = generateResponse(content);
      
      const aiResult = await Promise.race([aiResultPromise, timeoutPromise])
        .then(result => {
          clearTimeout(timerId); // Clear the timeout 
          return result;
        })
        .catch(error => {
          clearTimeout(timerId); 
          logger.error('AI response timed out or failed:', error, { file: fileName });
          return {
            category: 'error',
            response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
          };
        });

      if (req.user) {
        await Message.create({ 
          user: req.user.id, 
          text: content, 
          isUser: true 
        });
        await Message.create({ 
          user: req.user.id, 
          text: aiResult.response, 
          isUser: false 
        });
      } else {
        logger.info('Guest messages generated in-memory', { file: fileName });
      }

      res.status(201).json({
        content,
        aiMessage: aiResult.response,
        category: aiResult.category
      });

    } catch (err) {
      if (timerId) clearTimeout(timerId);
      logger.error('Error in /api/messages route:', err, { file: fileName });
      res.status(400).json({ error: err.message });
    }
  },


  getMessages: async (req, res) => {
    try {

      if (!req.user) {
        logger.info('Guest user attempted to fetch messages. Returning empty array.', { file: fileName });
        return res.status(200).json([]); 
      }
      
      const messages = await Message
        .find({ user: req.user.id })
        .sort({ createdAt: -1 });
      
    if (!messages || messages.length === 0) {
      logger.info('No messages found from user.', { file: fileName });
      return res.status(200).json([]); 
    }
      
    res.json(messages);

    } catch (error) {
      logger.error('Error fetching messages:', error, { file: fileName });
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
};

export default messageController;
