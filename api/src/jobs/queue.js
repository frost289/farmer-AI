import { createRedis } from '../config/redis.js';
import { logger } from '../config/logger.js';

const handlers = {};
let bullQueue = null;

/**
 * With REDIS_URL set, jobs run in BullMQ workers. Without it (development), jobs run in-process.
 * handlersMap: { jobName: async (data) => void }
 */
export async function startQueue(handlersMap) {
  Object.assign(handlers, handlersMap);
  const connection = await createRedis();
  if (!connection) {
    logger.info('Queue: in-process mode (no REDIS_URL)');
    return;
  }
  const { Queue, Worker } = await import('bullmq');
  bullQueue = new Queue('farmai', { connection });
  new Worker('farmai', (job) => handlers[job.name]?.(job.data), { connection, concurrency: 2 });
  logger.info('Queue: BullMQ mode');
}

export async function enqueue(name, data) {
  if (bullQueue) {
    return bullQueue.add(name, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }
  setImmediate(() => {
    handlers[name]?.(data).catch((err) => logger.error('Job failed', { job: name, error: err.message }));
  });
  return null;
}
