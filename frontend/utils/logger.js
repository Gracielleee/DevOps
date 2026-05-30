import log from "loglevel";

const levelEmojis = {
  error: "❌",
  warn: "⚠️",
  info: "ℹ️",
  debug: "🔍",
  trace: "🔄",
};

const originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (message, ...args) {
    const emoji = levelEmojis[methodName] || "📝";
    const componentStr = loggerName ? `[${loggerName}]` : "";
    
    // Format: 🔍 DEBUG [ChatContainer] → Your message here
    rawMethod(`${emoji} ${methodName.toUpperCase()} ${componentStr} → ${message}`, ...args);
  };
};

export default log;