const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const PUBLIC_PATHS = [
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/refresh', method: 'POST' },
  { path: '/health', method: 'GET' },
];

function isPublic(req) {
  return PUBLIC_PATHS.some(
    (p) => req.path === p.path && req.method === p.method
  );
}

function authMiddleware(req, res, next) {
  if (isPublic(req)) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    // Forward user info to downstream services
    req.headers['x-user-id']    = decoded.userId;
    req.headers['x-user-role']  = decoded.role;
    req.headers['x-project-id'] = decoded.projectId || '';
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
