const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config  = require('../config');
const { User } = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/jwt');
const keystoneService = require('../services/keystoneService');

function sign(payload, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

// POST /login
router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty(),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await User.updateLastLogin(user.id);

    // Try OpenStack auth (non-blocking)
    const ksResult = await keystoneService.authenticateUser(username, password, user.project_id);

    const payload = {
      userId:    user.id,
      username:  user.username,
      email:     user.email,
      role:      user.role,
      projectId: user.project_id,
      osToken:   ksResult?.token || null,
    };

    const accessToken  = sign(payload, config.jwtExpiresIn);
    const refreshToken = sign({ userId: user.id }, config.refreshExpiresIn);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, projectId: user.project_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /refresh-token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) return res.status(401).json({ error: 'User not found' });
    const payload = { userId: user.id, username: user.username, email: user.email, role: user.role, projectId: user.project_id };
    res.json({ accessToken: sign(payload) });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /change-password
router.post('/change-password', verifyToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const user  = await User.findById(req.user.userId);
    const valid = await bcrypt.compare(req.body.currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(req.body.newPassword, 12);
    await User.update(user.id, { password_hash: hash });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /logout
router.post('/logout', verifyToken, (_req, res) => res.json({ message: 'Logged out successfully' }));

// ── Admin-only user management ─────────────────────────────────────────────────

// GET /users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await User.findAll({
      page:   parseInt(req.query.page)  || 1,
      limit:  parseInt(req.query.limit) || 20,
      role:   req.query.role,
      search: req.query.search,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /register  (admin only)
router.post('/register', verifyToken, requireRole('admin'), [
  body('username').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('role').optional().isIn(['admin','operator','viewer']),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const { username, email, password, role, projectId } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash: hash, role, projectId });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username or email already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id
router.put('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /users/:id
router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
