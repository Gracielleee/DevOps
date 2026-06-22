import winston from 'winston';

const levelEmojis = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🔍',
};

const consoleFormat = winston.format.printf(({ level, message, file }) => {
  const emoji = levelEmojis[level] || '📝';
  const fileStr = file ? `[${file}]` : '';
  return `${emoji} ${level.toUpperCase()} ${fileStr} → ${message}`;
});

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(consoleFormat),
      silent: process.env.NODE_ENV === 'test' 
    }),

    new winston.transports.File({ 
      filename: 'logs/app.log',
      format: winston.format.combine(winston.format.json())
    })
  ]
});

export default logger;