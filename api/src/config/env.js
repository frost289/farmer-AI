import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

function secret(key) {
  const v = process.env[key];
  if (!v || v.startsWith('change-me')) {
    if (isProd) throw new Error(`${key} must be set to a strong value in production`);
    return `dev-only-${key.toLowerCase()}`;
  }
  return v;
}

// Must equal INTERNAL_API_KEY of the AI services (their dev default is the same).
function internalKey() {
  const v = process.env.INTERNAL_API_KEY || 'dev-internal-key';
  if (isProd && (v === 'dev-internal-key' || v.startsWith('change-me'))) {
    throw new Error('INTERNAL_API_KEY must be set to a strong value in production');
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  port: Number(process.env.API_PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/farmai_dev',
  jwtAccessSecret: secret('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: secret('JWT_REFRESH_SECRET'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_MB || 5) * 1024 * 1024,
  internalApiKey: internalKey(),
  advisoryUrl: process.env.ADVISORY_URL || 'http://localhost:8001',
  visionUrl: process.env.VISION_URL || 'http://localhost:8002',
  advisoryTimeoutMs: Number(process.env.ADVISORY_TIMEOUT_MS || 20000),
  visionTimeoutMs: Number(process.env.VISION_TIMEOUT_MS || 30000),
  redisUrl: process.env.REDIS_URL || '',
  weatherApiUrl: process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
};
