require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: '7d',
  db: {
    host:     process.env.POSTGRES_HOST     || 'localhost',
    port:     parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB       || 'openstack_portal',
    user:     process.env.POSTGRES_USER     || 'portal_user',
    password: process.env.POSTGRES_PASSWORD || 'portal_pass',
  },
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  openstack: {
    authUrl:     process.env.OS_AUTH_URL      || 'http://keystone:5000/v3',
    username:    process.env.OS_USERNAME      || 'admin',
    password:    process.env.OS_PASSWORD      || 'admin_password',
    projectName: process.env.OS_PROJECT_NAME || 'admin',
    domainName:  process.env.OS_DOMAIN_NAME  || 'Default',
  },
};
