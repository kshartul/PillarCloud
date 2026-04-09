const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const Invoice = {
  async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        billing_period_start TIMESTAMPTZ NOT NULL,
        billing_period_end   TIMESTAMPTZ NOT NULL,
        subtotal  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        discount  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        amount    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        status    VARCHAR(50)  NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','issued','paid','overdue','void')),
        due_date  TIMESTAMPTZ,
        paid_at   TIMESTAMPTZ,
        items     JSONB NOT NULL DEFAULT '[]',
        notes     TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(billing_period_start, billing_period_end);
    `);
  },

  async findAll({ page = 1, limit = 20, customer_id, status } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let i = 1;
    if (customer_id) { conditions.push(`customer_id = $${i++}`); values.push(customer_id); }
    if (status)      { conditions.push(`status = $${i++}`);      values.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows, count] = await Promise.all([
      pool.query(
        `SELECT i.*, c.company_name, c.project_id
         FROM invoices i JOIN customers c ON c.id = i.customer_id
         ${where} ORDER BY i.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
        [...values, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM invoices ${where}`, values),
    ]);
    return { data: rows.rows, total: parseInt(count.rows[0].count), page, limit };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT i.*, c.company_name, c.project_id, c.plan_type
       FROM invoices i JOIN customers c ON c.id = i.customer_id
       WHERE i.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ customer_id, billing_period_start, billing_period_end, subtotal, discount, amount, items, due_date, notes }) {
    const { rows } = await pool.query(
      `INSERT INTO invoices
         (customer_id, billing_period_start, billing_period_end, subtotal, discount, amount, items, due_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [customer_id, billing_period_start, billing_period_end, subtotal, discount, amount,
       JSON.stringify(items || []), due_date, notes]
    );
    return rows[0];
  },

  async updateStatus(id, status, extra = {}) {
    const sets = ['status = $1', 'updated_at = NOW()'];
    const values = [status];
    let i = 2;
    if (status === 'paid') { sets.push(`paid_at = $${i++}`); values.push(extra.paid_at || new Date()); }
    if (extra.notes)       { sets.push(`notes = $${i++}`);   values.push(extra.notes); }
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE invoices SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, values
    );
    return rows[0] || null;
  },

  async markOverdue() {
    const { rows } = await pool.query(
      `UPDATE invoices SET status = 'overdue', updated_at = NOW()
       WHERE status = 'issued' AND due_date < NOW()
       RETURNING id`
    );
    return rows.length;
  },

  pool,
};

module.exports = Invoice;
