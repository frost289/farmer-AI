import * as appModule from './src/app.js';
import { env } from './src/config/env.js';
import { closeDb } from './src/config/db.js';
import { logger } from './src/config/logger.js';
import { startQueue } from './src/jobs/queue.js';
import { processDiagnosis } from './src/jobs/diagnosis.worker.js';
import { scheduleOutbreakAggregation } from './src/jobs/outbreak.aggregator.js';

// src/app.js may export the Express app itself (export default app) or a factory
// (export default createApp / export function createApp). Support both.
async function resolveApp() {
  const candidate = appModule.default ?? appModule.app ?? appModule.createApp;
  if (candidate && typeof candidate.listen === 'function') return candidate;
  if (candidate && typeof candidate.use === 'function' && Array.isArray(candidate.stack)) {
    throw new Error(
      'src/app.js exports an Express Router, not the app. It probably contains the contents of routes.js. ' +
        'Restore src/app.js (it must call express() and end with "export default app").',
    );
  }
  const factory = typeof appModule.createApp === 'function' ? appModule.createApp : candidate;
  if (typeof factory !== 'function') {
    throw new Error('src/app.js must export an Express app or a createApp() function');
  }
  const app = await factory();
  if (typeof app?.listen !== 'function') throw new Error('createApp() did not return an Express app');
  return app;
}

const app = await resolveApp();

await startQueue({ diagnosis: processDiagnosis });
scheduleOutbreakAggregation();

const server = app.listen(env.port, '0.0.0.0', () =>
  logger.info(`FarmAI api listening on :${env.port}`),
);

const shutdown = () => {
  logger.info('Shutting down');
  server.close(() => closeDb().then(() => process.exit(0)));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
