const router = require('express').Router();
const UsageRecord = require('../models/UsageRecord');
const { runCollection } = require('../services/usageTracker');

// GET /usage  — query usage records for a period
router.get('/', async (req, res) => {
  try {
    const { customer_id, project_id, resource_type, start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required' });
    const records = await UsageRecord.findForPeriod({
      customer_id, project_id, resource_type,
      start: new Date(start), end: new Date(end),
    });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /usage/summary — aggregated by resource_type for a customer+period
router.get('/summary', async (req, res) => {
  try {
    const { customer_id, start, end } = req.query;
    if (!customer_id || !start || !end)
      return res.status(400).json({ error: 'customer_id, start, and end are required' });
    const summary = await UsageRecord.summarizeForPeriod({
      customer_id, start: new Date(start), end: new Date(end),
    });
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /usage/collect — manually trigger usage collection
router.post('/collect', async (req, res) => {
  try {
    runCollection(); // fire-and-forget
    res.json({ message: 'Usage collection triggered' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
