import { aggregateRecent } from '../modules/outbreaks/outbreaks.repository.js';
import { logger } from '../config/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function runOutbreakAggregation() {
  try {
    await aggregateRecent();
    logger.info('Outbreak aggregation done');
  } catch (err) {
    logger.error('Outbreak aggregation failed', { error: err.message });
  }
}

/** Runs shortly after start, then once a day. */
export function scheduleOutbreakAggregation() {
  setTimeout(runOutbreakAggregation, 30 * 1000).unref();
  setInterval(runOutbreakAggregation, DAY_MS).unref();
}
