require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { logger, morganMiddleware } = require('./middleware/logger');
const registerProxies = require('./routes/proxy');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }));
app.use(morganMiddleware);
app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);

// ── Health check (no auth required) ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway', ts: new Date() }));

// ── JWT Auth gate ─────────────────────────────────────────────────────────────
app.use(authMiddleware);

// ── Upstream proxy routes ─────────────────────────────────────────────────────
registerProxies(app);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  logger.info(`API Gateway listening on port ${config.port}`);
});
