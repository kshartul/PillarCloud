const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const Customer = {
  async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(255) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic','standard','enterprise')),
        credit_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_customers_project_id ON customers(project_id);
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
    `);
  },

  async findAll({ page = 1, limit = 20, status, plan_type } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let i = 1;
    if (status)    { conditions.push(`status = $${i++}`);    values.push(status); }
    if (plan_type) { conditions.push(`plan_type = $${i++}`); values.push(plan_type); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows, count] = await Promise.all([
      pool.query(`SELECT * FROM customers ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...values, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM customers ${where}`, values),
    ]);
    return { data: rows.rows, total: parseInt(count.rows[0].count), page, limit };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByProjectId(projectId) {
    const { rows } = await pool.query('SELECT * FROM customers WHERE project_id = $1', [projectId]);
    return rows[0] || null;
  },

  async create({ project_id, company_name, contact_email, plan_type = 'basic' }) {
    const { rows } = await pool.query(
      `INSERT INTO customers (project_id, company_name, contact_email, plan_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, company_name, contact_email, plan_type]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['company_name', 'contact_email', 'plan_type', 'credit_balance', 'status'];
    const sets = [];
    const values = [];
    let i = 1;
    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); values.push(v); }
    }
    if (!sets.length) throw new Error('No valid fields to update');
    sets.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE customers SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, values
    );
    return rows[0] || null;
  },

  async applyCredit(id, amount) {
    const { rows } = await pool.query(
      `UPDATE customers SET credit_balance = credit_balance + $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [amount, id]
    );
    return rows[0] || null;
  },

  pool,
};

module.exports = Customer;
