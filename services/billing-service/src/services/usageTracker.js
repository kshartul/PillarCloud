const cron = require('node-cron');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const Customer = require('../models/Customer');
const UsageRecord = require('../models/UsageRecord');

const cloudApi = axios.create({ baseURL: config.cloudServiceUrl, timeout: 30000 });

async function collectInstanceUsage(customer) {
  try {
    const { data: instances } = await cloudApi.get('/instances', {
      headers: { 'x-project-id': customer.project_id },
    });
    const now = new Date();
    const records = [];
    for (const inst of instances) {
      if (inst.status !== 'ACTIVE') continue;
      const vcpus = inst.flavor?.vcpus || 0;
      const ramGb = (inst.flavor?.ram || 0) / 1024;
      if (vcpus > 0) {
        records.push({
          customer_id: customer.id,
          project_id: customer.project_id,
          resource_type: 'vcpu',
          resource_id: inst.id,
          resource_name: inst.name,
          start_time: now,
          quantity: vcpus,
          unit: 'vcpu-hour',
          unit_price: config.pricing.vcpu_per_hour,
          total_cost: vcpus * config.pricing.vcpu_per_hour,
          metadata: { flavor: inst.flavor?.name, status: inst.status },
        });
      }
      if (ramGb > 0) {
        records.push({
          customer_id: customer.id,
          project_id: customer.project_id,
          resource_type: 'ram',
          resource_id: inst.id,
          resource_name: inst.name,
          start_time: now,
          quantity: ramGb,
          unit: 'gb-hour',
          unit_price: config.pricing.ram_gb_per_hour,
          total_cost: ramGb * config.pricing.ram_gb_per_hour,
          metadata: { flavor: inst.flavor?.name },
        });
      }
    }
    return records;
  } catch (e) {
    logger.warn(`Instance usage collection failed for project ${customer.project_id}: ${e.message}`);
    return [];
  }
}

async function collectVolumeUsage(customer) {
  try {
    const { data: volumes } = await cloudApi.get('/volumes', {
      headers: { 'x-project-id': customer.project_id },
    });
    const now = new Date();
    const records = [];
    for (const vol of volumes) {
      if (vol.status === 'deleting') continue;
      const sizeGb = vol.size || 0;
      if (sizeGb > 0) {
        // Convert monthly rate to hourly
        const hourlyRate = config.pricing.volume_gb_per_month / (24 * 30);
        records.push({
          customer_id: customer.id,
          project_id: customer.project_id,
          resource_type: 'volume',
          resource_id: vol.id,
          resource_name: vol.name || vol.id,
          start_time: now,
          quantity: sizeGb,
          unit: 'gb-hour',
          unit_price: hourlyRate,
          total_cost: sizeGb * hourlyRate,
          metadata: { volume_type: vol.volume_type, status: vol.status },
        });
      }
    }
    return records;
  } catch (e) {
    logger.warn(`Volume usage collection failed for project ${customer.project_id}: ${e.message}`);
    return [];
  }
}

async function collectFloatingIpUsage(customer) {
  try {
    const { data: fips } = await cloudApi.get('/floating-ips', {
      headers: { 'x-project-id': customer.project_id },
    });
    const now = new Date();
    const records = [];
    const hourlyRate = config.pricing.floating_ip_per_month / (24 * 30);
    for (const fip of fips) {
      records.push({
        customer_id: customer.id,
        project_id: customer.project_id,
        resource_type: 'floating_ip',
        resource_id: fip.id,
        resource_name: fip.floating_ip_address || fip.id,
        start_time: now,
        quantity: 1,
        unit: 'ip-hour',
        unit_price: hourlyRate,
        total_cost: hourlyRate,
        metadata: { status: fip.status, fixed_ip: fip.fixed_ip_address },
      });
    }
    return records;
  } catch (e) {
    logger.warn(`Floating IP usage collection failed for project ${customer.project_id}: ${e.message}`);
    return [];
  }
}

async function collectNetworkUsage(customer) {
  try {
    const { data: networks } = await cloudApi.get('/networks', {
      headers: { 'x-project-id': customer.project_id },
    });
    const now = new Date();
    const records = [];
    const hourlyRate = config.pricing.network_per_month / (24 * 30);
    for (const net of networks) {
      if (net.shared || net['router:external']) continue; // skip shared/external
      records.push({
        customer_id: customer.id,
        project_id: customer.project_id,
        resource_type: 'network',
        resource_id: net.id,
        resource_name: net.name || net.id,
        start_time: now,
        quantity: 1,
        unit: 'network-hour',
        unit_price: hourlyRate,
        total_cost: hourlyRate,
        metadata: { status: net.status },
      });
    }
    return records;
  } catch (e) {
    logger.warn(`Network usage collection failed for project ${customer.project_id}: ${e.message}`);
    return [];
  }
}

async function collectUsageForCustomer(customer) {
  const [instanceRecords, volumeRecords, fipRecords, networkRecords] = await Promise.all([
    collectInstanceUsage(customer),
    collectVolumeUsage(customer),
    collectFloatingIpUsage(customer),
    collectNetworkUsage(customer),
  ]);
  const all = [...instanceRecords, ...volumeRecords, ...fipRecords, ...networkRecords];
  if (all.length > 0) {
    await UsageRecord.bulkCreate(all);
    logger.info(`Collected ${all.length} usage records for customer ${customer.id} (project: ${customer.project_id})`);
  }
}

async function runCollection() {
  logger.info('Starting hourly usage collection...');
  try {
    const { data: customers } = await Customer.findAll({ status: 'active', limit: 1000 });
    await Promise.allSettled(customers.map(c => collectUsageForCustomer(c)));
    logger.info(`Usage collection complete for ${customers.length} customers`);
  } catch (e) {
    logger.error(`Usage collection run failed: ${e.message}`);
  }
}

function startUsageTracker() {
  // Run every hour at minute 5
  cron.schedule('5 * * * *', runCollection);
  logger.info('Usage tracker scheduled (hourly at :05)');
}

module.exports = { startUsageTracker, runCollection };
