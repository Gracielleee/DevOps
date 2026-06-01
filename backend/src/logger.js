import winston from 'winston';

const levelEmojis = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🔍',
};

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.printf(({ level, message, file }) => {
      const emoji = levelEmojis[level] || '📝';
      const fileStr = file ? `[${file}]` : '';
      return `${emoji} ${level.toUpperCase()} ${fileStr} → ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

export default logger;
