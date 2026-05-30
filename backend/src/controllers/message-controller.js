import Message from "../models/message.js";
import Subject from "../models/subject.js";
import generateResponse from '../services/ai-service.js';
import { subjectNameToCategory } from '../services/ai-helper.js';
import logger from "../logger.js";

const fileName = 'message-controller.js';

const messageController = {
  createMessage: async (req, res) => {

    let timerId;

    try {
      const content = req.body.text;
      const subjectId = req.body.subject;

      let subjectCategory = 'general';
      let subjectRef = null;

      if (subjectId) {
        const subjectDoc = await Subject.findById(subjectId);
        if (subjectDoc) {
          subjectRef = subjectDoc._id;
          subjectCategory = subjectNameToCategory(subjectDoc.name);
        }
      } else {
        const defaultSubject = await Subject.findOne({ name: 'General' });
        if (defaultSubject) {
          subjectRef = defaultSubject._id;
          subjectCategory = subjectNameToCategory(defaultSubject.name);
        }
      }

      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      const aiResultPromise = generateResponse(content, subjectCategory);
      
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
        const messageFields = subjectRef ? { subject: subjectRef } : {};
        await Message.create({ 
          user: req.user.id, 
          text: content, 
          isUser: true,
          ...messageFields
        });
        await Message.create({ 
          user: req.user.id, 
          text: aiResult.response, 
          isUser: false,
          ...messageFields
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
      const emptyPaginatedResponse = {
        messages: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
      };

      if (!req.user) {
        logger.info('Guest user attempted to fetch messages. Returning empty paginated response.', { file: fileName });
        return res.status(200).json(emptyPaginatedResponse);
      }

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const filter = { user: req.user.id };
      const totalCount = await Message.countDocuments(filter);

      const messages = await Message
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;

      if (messages.length === 0) {
        logger.info('No messages found from user.', { file: fileName });
      }

      res.json({
        messages,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage,
      });

    } catch (error) {
      logger.error('Error fetching messages:', error, { file: fileName });
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
};

export default messageController;
