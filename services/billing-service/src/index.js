require('dotenv').config();
const express = require('express');
const morgan  = require('morgan');
const logger  = require('./utils/logger');
const config  = require('./config');
const Customer    = require('./models/Customer');
const Invoice     = require('./models/Invoice');
const UsageRecord = require('./models/UsageRecord');
const { startUsageTracker }    = require('./services/usageTracker');
const { startInvoiceGenerator } = require('./services/invoiceGenerator');

const app = express();
app.use(express.json());
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'billing-service' }));

app.use('/customers', require('./routes/customers'));
app.use('/invoices',  require('./routes/invoices'));
app.use('/usage',     require('./routes/usage'));

app.use((err, req, res, _next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await Customer.init();
    await Invoice.init();
    await UsageRecord.init();
    logger.info('Database tables initialized');

    startUsageTracker();
    startInvoiceGenerator();

    app.listen(config.port, () => {
      logger.info(`Billing service listening on port ${config.port}`);
    });
  } catch (e) {
    logger.error(`Startup failed: ${e.message}`);
    process.exit(1);
  }
}

start();
