import pino from 'pino';

type LogData = Record<string, unknown> | unknown;

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// Simple pino configuration without transport to avoid worker thread issues in Next.js
const rawLogger = pino({
  level: logLevel,
  base: {
    service: 'greenquote',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

function normalizeData(data?: LogData): LogData {
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
    };
  }
  return data;
}

// Keep the same call signature used across the codebase.
export const logger = {
  info: (message: string, data?: LogData) => {
    if (data === undefined) {
      rawLogger.info(message);
      return;
    }
    rawLogger.info({ data: normalizeData(data) }, message);
  },
  error: (message: string, error?: LogData) => {
    if (error === undefined) {
      rawLogger.error(message);
      return;
    }
    rawLogger.error({ error: normalizeData(error) }, message);
  },
  warn: (message: string, data?: LogData) => {
    if (data === undefined) {
      rawLogger.warn(message);
      return;
    }
    rawLogger.warn({ data: normalizeData(data) }, message);
  },
  debug: (message: string, data?: LogData) => {
    if (data === undefined) {
      rawLogger.debug(message);
      return;
    }
    rawLogger.debug({ data: normalizeData(data) }, message);
  },
};

export { rawLogger };
