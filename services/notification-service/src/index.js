require('dotenv').config();
const express = require('express');
const amqp    = require('amqplib');
const morgan  = require('morgan');
const logger  = require('./utils/logger');
const config  = require('./config');
const { handleMessage, sendEmail } = require('./handlers/emailHandler');

const app = express();
app.use(express.json());
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'notification-service' }));

// Direct send endpoint (internal use only)
app.post('/send', async (req, res) => {
  try {
    const { to, type, data } = req.body;
    await sendEmail({ to, type, data });
    res.json({ sent: true });
  } catch (e) {
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

async function startConsumer() {
  const RETRY_DELAY = 5000;
  const connect = async () => {
    try {
      const conn    = await amqp.connect(config.rabbitmqUrl);
      const channel = await conn.createChannel();

      conn.on('error', e => { logger.error(`RabbitMQ connection error: ${e.message}`); });
      conn.on('close', () => {
        logger.warn('RabbitMQ connection closed, reconnecting...');
        setTimeout(connect, RETRY_DELAY);
      });

      for (const queue of Object.values(config.queues)) {
        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, async msg => {
          if (!msg) return;
          await handleMessage(msg);
          channel.ack(msg);
        }, { noAck: false });
        logger.info(`Consuming queue: ${queue}`);
      }
    } catch (e) {
      logger.error(`RabbitMQ connect failed: ${e.message}. Retrying in ${RETRY_DELAY}ms...`);
      setTimeout(connect, RETRY_DELAY);
    }
  };
  await connect();
}

async function start() {
  await startConsumer();
  app.listen(config.port, () => {
    logger.info(`Notification service listening on port ${config.port}`);
  });
}

start().catch(e => { logger.error(e.message); process.exit(1); });
