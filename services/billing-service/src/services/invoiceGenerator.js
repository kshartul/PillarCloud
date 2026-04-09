const cron = require('node-cron');
const logger = require('../utils/logger');
const config = require('../config');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const UsageRecord = require('../models/UsageRecord');

function getPreviousMonthPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end };
}

async function generateInvoiceForCustomer(customer) {
  const { start, end } = getPreviousMonthPeriod();
  const summary = await UsageRecord.summarizeForPeriod({
    customer_id: customer.id,
    start,
    end,
  });

  if (!summary.length) {
    logger.info(`No usage for customer ${customer.id} in period ${start.toISOString()} – ${end.toISOString()}`);
    return null;
  }

  const discount = config.planDiscounts[customer.plan_type] || 0;
  let subtotal = 0;
  const items = summary.map(row => {
    const cost = parseFloat(row.total_cost);
    subtotal += cost;
    return {
      resource_type: row.resource_type,
      quantity: parseFloat(row.total_quantity),
      unit: row.unit,
      unit_price: parseFloat(row.unit_price),
      total_cost: cost,
    };
  });

  const discountAmount = subtotal * discount;
  const amount = Math.max(0, subtotal - discountAmount);
  const dueDate = new Date(end);
  dueDate.setDate(dueDate.getDate() + 30); // Net 30

  const invoice = await Invoice.create({
    customer_id: customer.id,
    billing_period_start: start,
    billing_period_end: end,
    subtotal,
    discount: discountAmount,
    amount,
    items,
    due_date: dueDate,
    notes: `Plan: ${customer.plan_type}; Discount: ${(discount * 100).toFixed(0)}%`,
  });

  // Immediately mark as issued
  await Invoice.updateStatus(invoice.id, 'issued');
  logger.info(`Invoice ${invoice.id} issued for customer ${customer.id}: $${amount.toFixed(2)}`);
  return invoice;
}

async function runInvoiceGeneration() {
  logger.info('Starting monthly invoice generation...');
  try {
    const { data: customers } = await Customer.findAll({ status: 'active', limit: 1000 });
    const results = await Promise.allSettled(customers.map(c => generateInvoiceForCustomer(c)));
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed    = results.filter(r => r.status === 'rejected').length;
    logger.info(`Invoice generation complete: ${succeeded} issued, ${failed} failed`);
  } catch (e) {
    logger.error(`Invoice generation run failed: ${e.message}`);
  }
}

async function markOverdueInvoices() {
  try {
    const count = await Invoice.markOverdue();
    if (count > 0) logger.info(`Marked ${count} invoices as overdue`);
  } catch (e) {
    logger.error(`Overdue marking failed: ${e.message}`);
  }
}

function startInvoiceGenerator() {
  // Run on 1st of every month at 02:00
  cron.schedule('0 2 1 * *', runInvoiceGeneration);
  // Check for overdue invoices daily at 03:00
  cron.schedule('0 3 * * *', markOverdueInvoices);
  logger.info('Invoice generator scheduled (monthly on 1st at 02:00; overdue check daily at 03:00)');
}

module.exports = { startInvoiceGenerator, generateInvoiceForCustomer, runInvoiceGeneration };
