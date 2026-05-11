import Message from "../models/message.js";
import generateResponse from '..services/ai-service.js';

const messageController = {
  createMessage: async (req, res) => {
    try {
    // Save user message
    const userMessage = new Message({
      text: req.body.text,
      isUser: true
    });
    await userMessage.save();
    
    // Generate AI response with a 15-second overall timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );
    
    const aiResultPromise = generateResponse(req.body.text);
    
    // Race between the AI response and the timeout
    const aiResult = await Promise.race([aiResultPromise, timeoutPromise])
      .catch(error => {
        console.error('AI response timed out or failed:', error);
        return {
          category: 'error',
          response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
        };
      });
    
    // Save AI response
    const aiMessage = new Message({
      text: aiResult.response,
      isUser: false
    });
    await aiMessage.save();
    
    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage,
      category: aiResult.category
    });
  } catch (err) {
    console.error('Error in /api/messages route:', err);
    res.status(400).json({ error: err.message });
  }
}};

export default messageController;
