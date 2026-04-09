const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const User = {
  async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username          VARCHAR(100) UNIQUE NOT NULL,
        email             VARCHAR(255) UNIQUE NOT NULL,
        password_hash     TEXT NOT NULL,
        role              VARCHAR(20) NOT NULL DEFAULT 'viewer'
                            CHECK (role IN ('admin','operator','viewer')),
        project_id        VARCHAR(255),
        openstack_user_id VARCHAR(255),
        is_active         BOOLEAN NOT NULL DEFAULT true,
        last_login        TIMESTAMPTZ,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
    `);
    // Seed admin if not present
    const { rows } = await pool.query("SELECT 1 FROM users WHERE username='admin' LIMIT 1");
    if (rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 12);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ('admin', 'admin@openstack.local', $1, 'admin')`,
        [hash]
      );
    }
  },

  async findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username=$1 LIMIT 1', [username]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1 LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findAll({ page = 1, limit = 20, role, search } = {}) {
    const offset = (page - 1) * limit;
    let q = 'SELECT id, username, email, role, project_id, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];
    if (role)   { params.push(role);   q += ` AND role=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    params.push(limit, offset);
    q += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(q, params);
    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM users');
    return { data: rows, total: parseInt(cnt[0].count) };
  },

  async create({ username, email, passwordHash, role = 'viewer', projectId, openstackUserId }) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, project_id, openstack_user_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, username, email, role, project_id, is_active, created_at`,
      [username, email, passwordHash, role, projectId, openstackUserId]
    );
    return rows[0];
  },

  async update(id, fields) {
    const sets = [];
    const vals = [];
    const allowed = ['email', 'role', 'project_id', 'is_active', 'password_hash'];
    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) { vals.push(v); sets.push(`${k}=$${vals.length}`); }
    }
    if (!sets.length) return null;
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(',')}, updated_at=NOW() WHERE id=$${vals.length}
       RETURNING id, username, email, role, project_id, is_active`,
      vals
    );
    return rows[0];
  },

  async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login=NOW() WHERE id=$1', [id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
  },
};

module.exports = { User, pool };
