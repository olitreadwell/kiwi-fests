import { pino } from 'pino';

/**
 * Structured logger writing one JSON line per event to stdout.
 * Level comes from `LOG_LEVEL` so prod can stay quiet and dev can be chatty.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});
