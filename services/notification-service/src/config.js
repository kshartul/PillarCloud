require('dotenv').config();
module.exports = {
  port: process.env.PORT || 3003,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  smtp: {
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user:   process.env.SMTP_USER || '',
    pass:   process.env.SMTP_PASS || '',
    from:   process.env.SMTP_FROM || 'noreply@openstack-portal.local',
  },
  queues: {
    notifications: 'notifications',
    invoices: 'invoice.notifications',
    alerts: 'alert.notifications',
  },
};
