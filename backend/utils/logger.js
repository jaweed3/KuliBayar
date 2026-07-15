/**
 * Simple logger for KuliBayar backend
 * - Adds timestamp and log level
 * - Can be disabled in production by setting LOG_LEVEL=error
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
  
  info: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.info(formatMessage('info', message), ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },
  
  error: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message), ...args);
    }
  }
};
