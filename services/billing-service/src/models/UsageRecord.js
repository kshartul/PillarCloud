const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

const UsageRecord = {
  async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        project_id    VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id   VARCHAR(255) NOT NULL,
        resource_name VARCHAR(255),
        start_time    TIMESTAMPTZ NOT NULL,
        end_time      TIMESTAMPTZ,
        quantity      NUMERIC(14,4) NOT NULL DEFAULT 0,
        unit          VARCHAR(50)  NOT NULL,
        unit_price    NUMERIC(12,6) NOT NULL DEFAULT 0,
        total_cost    NUMERIC(12,4) NOT NULL DEFAULT 0,
        metadata      JSONB,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_usage_customer_id ON usage_records(customer_id);
      CREATE INDEX IF NOT EXISTS idx_usage_project_id  ON usage_records(project_id);
      CREATE INDEX IF NOT EXISTS idx_usage_resource_type ON usage_records(resource_type);
      CREATE INDEX IF NOT EXISTS idx_usage_start_time  ON usage_records(start_time);
    `);
  },

  async create(record) {
    const { customer_id, project_id, resource_type, resource_id, resource_name,
            start_time, end_time, quantity, unit, unit_price, total_cost, metadata } = record;
    const { rows } = await pool.query(
      `INSERT INTO usage_records
         (customer_id, project_id, resource_type, resource_id, resource_name,
          start_time, end_time, quantity, unit, unit_price, total_cost, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [customer_id, project_id, resource_type, resource_id, resource_name,
       start_time, end_time, quantity, unit, unit_price, total_cost,
       metadata ? JSON.stringify(metadata) : null]
    );
    return rows[0];
  },

  async bulkCreate(records) {
    if (!records.length) return [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const r of records) {
        const { rows } = await client.query(
          `INSERT INTO usage_records
             (customer_id, project_id, resource_type, resource_id, resource_name,
              start_time, end_time, quantity, unit, unit_price, total_cost, metadata)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
          [r.customer_id, r.project_id, r.resource_type, r.resource_id, r.resource_name,
           r.start_time, r.end_time, r.quantity, r.unit, r.unit_price, r.total_cost,
           r.metadata ? JSON.stringify(r.metadata) : null]
        );
        inserted.push(rows[0]);
      }
      await client.query('COMMIT');
      return inserted;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async findForPeriod({ customer_id, project_id, start, end, resource_type } = {}) {
    const conditions = ['start_time >= $1', 'start_time < $2'];
    const values = [start, end];
    let i = 3;
    if (customer_id)   { conditions.push(`customer_id = $${i++}`);   values.push(customer_id); }
    if (project_id)    { conditions.push(`project_id = $${i++}`);    values.push(project_id); }
    if (resource_type) { conditions.push(`resource_type = $${i++}`); values.push(resource_type); }
    const { rows } = await pool.query(
      `SELECT * FROM usage_records WHERE ${conditions.join(' AND ')} ORDER BY start_time`,
      values
    );
    return rows;
  },

  async summarizeForPeriod({ customer_id, start, end }) {
    const { rows } = await pool.query(
      `SELECT resource_type,
              SUM(quantity)   AS total_quantity,
              MAX(unit)       AS unit,
              MAX(unit_price) AS unit_price,
              SUM(total_cost) AS total_cost
       FROM usage_records
       WHERE customer_id = $1 AND start_time >= $2 AND start_time < $3
       GROUP BY resource_type`,
      [customer_id, start, end]
    );
    return rows;
  },

  pool,
};

module.exports = UsageRecord;
