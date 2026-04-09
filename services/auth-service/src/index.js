require('dotenv').config();
const express = require('express');
const morgan  = require('morgan');
const config  = require('./config');
const { User } = require('./models/User');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// Auth routes (no prefix — gateway rewrites /api/auth -> /)
app.use('/', authRoutes);

// Boot
async function start() {
  try {
    await User.init();
    console.log('Database initialized');
    app.listen(config.port, () => console.log(`Auth service on port ${config.port}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
