import app from './src/app.js';
import { env } from './src/config/env.js';
import { closeDb } from './src/config/db.js';
import { logger } from './src/config/logger.js';
import { startQueue } from './src/jobs/queue.js';
import { processDiagnosis } from './src/jobs/diagnosis.worker.js';
import { scheduleOutbreakAggregation } from './src/jobs/outbreak.aggregator.js';

await startQueue({ diagnosis: processDiagnosis });
scheduleOutbreakAggregation();

const server = app.listen(env.port, () => logger.info(`FarmAI api listening on :${env.port}`));

const shutdown = () => {
  logger.info('Shutting down');
  server.close(() => closeDb().then(() => process.exit(0)));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
