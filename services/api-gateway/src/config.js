require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  services: {
    auth:         process.env.AUTH_SERVICE_URL    || 'http://localhost:3001',
    admin:        process.env.ADMIN_SERVICE_URL   || 'http://localhost:8001',
    cloud:        process.env.CLOUD_SERVICE_URL   || 'http://localhost:8002',
    billing:      process.env.BILLING_SERVICE_URL || 'http://localhost:3002',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
  },
};
