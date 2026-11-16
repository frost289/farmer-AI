import { env } from './env.js';

/** Returns an ioredis connection when REDIS_URL is set, otherwise null (in-process jobs). */
export async function createRedis() {
  if (!env.redisUrl) return null;
  const { default: IORedis } = await import('ioredis');
  return new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
}
