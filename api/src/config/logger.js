import { env } from './env.js';

function log(level, msg, meta = {}) {
  const line = JSON.stringify({ level, time: new Date().toISOString(), msg, ...meta });
  (level === 'error' ? console.error : console.log)(line);
}

export const logger = {
  info: (m, x) => log('info', m, x),
  warn: (m, x) => log('warn', m, x),
  error: (m, x) => log('error', m, x),
  debug: (m, x) => !env.isProd && log('debug', m, x),
};
