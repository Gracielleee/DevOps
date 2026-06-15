import { validationResult } from 'express-validator';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('An error occurred:', err, { file: 'errorHandler.js', path: req.path });

  // Handle express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Duplicate field value: ${field} already exists.` });
  }

  // General error handling
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(statusCode).json({ message });
};

export default errorHandler;