require('dotenv').config();
module.exports = {
  port: process.env.PORT || 3002,
  db: {
    host:     process.env.POSTGRES_HOST     || 'localhost',
    port:     parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB       || 'openstack_portal',
    user:     process.env.POSTGRES_USER     || 'portal_user',
    password: process.env.POSTGRES_PASSWORD || 'portal_pass',
  },
  rabbitmqUrl:    process.env.RABBITMQ_URL    || 'amqp://guest:guest@localhost:5672',
  cloudServiceUrl: process.env.CLOUD_SERVICE_URL || 'http://localhost:8002',
  pricing: {
    vcpu_per_hour:  0.05,   // $ per vCPU-hour
    ram_gb_per_hour: 0.01,  // $ per GB RAM-hour
    volume_gb_per_month: 0.10,
    floating_ip_per_month: 3.00,
    network_per_month: 1.00,
  },
  planDiscounts: { basic: 0, standard: 0.10, enterprise: 0.20 },
};
