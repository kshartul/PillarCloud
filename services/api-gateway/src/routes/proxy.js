const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { logger } = require('../middleware/logger');

function onError(err, req, res) {
  logger.error(`Proxy error: ${err.message}`);
  res.status(502).json({ error: 'Service temporarily unavailable', details: err.message });
}

function buildProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: { error: onError },
    logger: console,
  });
}

module.exports = function registerProxies(app) {
  // Auth service
  app.use('/api/auth', buildProxy(config.services.auth, { '^/api/auth': '' }));

  // Admin service
  app.use('/api/admin', buildProxy(config.services.admin, { '^/api/admin': '' }));

  // Cloud service
  app.use('/api/cloud', buildProxy(config.services.cloud, { '^/api/cloud': '' }));

  // Billing service
  app.use('/api/billing', buildProxy(config.services.billing, { '^/api/billing': '' }));

  // Notification service
  app.use('/api/notifications', buildProxy(config.services.notification, { '^/api/notifications': '' }));
};
