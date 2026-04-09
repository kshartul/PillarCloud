const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const Customer = require('../models/Customer');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan_type } = req.query;
    const result = await Customer.findAll({
      page: parseInt(page), limit: parseInt(limit), status, plan_type,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /customers/by-project/:projectId
router.get('/by-project/:projectId', async (req, res) => {
  try {
    const customer = await Customer.findByProjectId(req.params.projectId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /customers
router.post('/',
  body('project_id').notEmpty(),
  body('company_name').notEmpty(),
  body('contact_email').isEmail(),
  body('plan_type').optional().isIn(['basic', 'standard', 'enterprise']),
  validate,
  async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'Customer for this project already exists' });
      res.status(500).json({ error: e.message });
    }
  }
);

// PUT /customers/:id
router.put('/:id',
  body('plan_type').optional().isIn(['basic', 'standard', 'enterprise']),
  body('status').optional().isIn(['active', 'suspended', 'cancelled']),
  body('contact_email').optional().isEmail(),
  validate,
  async (req, res) => {
    try {
      const customer = await Customer.update(req.params.id, req.body);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// POST /customers/:id/credit
router.post('/:id/credit',
  body('amount').isFloat({ min: 0.01 }),
  validate,
  async (req, res) => {
    try {
      const customer = await Customer.applyCredit(req.params.id, req.body.amount);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
