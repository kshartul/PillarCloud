const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const { generateInvoiceForCustomer } = require('../services/invoiceGenerator');
const Customer = require('../models/Customer');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /invoices
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, customer_id, status } = req.query;
    const result = await Invoice.findAll({
      page: parseInt(page), limit: parseInt(limit), customer_id, status,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /invoices/:id
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /invoices/generate  — manually trigger invoice generation for a customer
router.post('/generate',
  body('customer_id').notEmpty().isUUID(),
  validate,
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.body.customer_id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      const invoice = await generateInvoiceForCustomer(customer);
      if (!invoice) return res.status(200).json({ message: 'No usage found for the billing period' });
      res.status(201).json(invoice);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// PUT /invoices/:id/status
router.put('/:id/status',
  body('status').isIn(['draft', 'issued', 'paid', 'overdue', 'void']),
  validate,
  async (req, res) => {
    try {
      const invoice = await Invoice.updateStatus(req.params.id, req.body.status, req.body);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// POST /invoices/:id/pay
router.post('/:id/pay', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(409).json({ error: 'Invoice already paid' });
    if (['void', 'draft'].includes(invoice.status))
      return res.status(409).json({ error: `Cannot pay invoice with status: ${invoice.status}` });

    // Apply customer credit if available
    const customer = await Customer.findById(invoice.customer_id);
    let remaining = parseFloat(invoice.amount);
    if (customer.credit_balance > 0) {
      const creditApplied = Math.min(customer.credit_balance, remaining);
      await Customer.applyCredit(customer.id, -creditApplied);
      remaining -= creditApplied;
    }

    const updated = await Invoice.updateStatus(invoice.id, 'paid', { paid_at: new Date() });
    res.json({ ...updated, remaining_amount: remaining });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
