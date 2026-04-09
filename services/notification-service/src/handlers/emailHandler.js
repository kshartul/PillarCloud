const nodemailer = require('nodemailer');
const config = require('../config');
const { renderTemplate } = require('../templates/email');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
  }
  return transporter;
}

async function sendEmail({ to, type, data }) {
  if (!to) throw new Error('Recipient email (to) is required');
  const { subject, html } = renderTemplate(type, data || {});
  await getTransporter().sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
  logger.info(`Email sent: type=${type} to=${to}`);
}

async function handleMessage(msg) {
  let payload;
  try {
    payload = JSON.parse(msg.content.toString());
  } catch (e) {
    logger.error(`Failed to parse message: ${e.message}`);
    return;
  }

  const { type, to, data } = payload;
  try {
    await sendEmail({ to, type, data });
  } catch (e) {
    logger.error(`Email delivery failed (type=${type} to=${to}): ${e.message}`);
    // Don't rethrow — let message be acked to avoid requeue loops
  }
}

module.exports = { handleMessage, sendEmail };
