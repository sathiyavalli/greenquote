// Simple console-based structured logging
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ level: 'INFO', message, data, timestamp: new Date() }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'ERROR', message, error: String(error), timestamp: new Date() }));
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({ level: 'WARN', message, data, timestamp: new Date() }));
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'DEBUG', message, data, timestamp: new Date() }));
    }
  },
};
