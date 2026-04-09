const templates = {
  invoice_issued: ({ company_name, invoice_id, amount, due_date, billing_period_start, billing_period_end }) => ({
    subject: `Invoice #${invoice_id.slice(0, 8)} — $${parseFloat(amount).toFixed(2)} due ${new Date(due_date).toLocaleDateString()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Invoice Issued</h2>
        <p>Dear ${company_name},</p>
        <p>Your invoice for the period
          <strong>${new Date(billing_period_start).toLocaleDateString()}</strong> –
          <strong>${new Date(billing_period_end).toLocaleDateString()}</strong>
          has been issued.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border:1px solid #ddd">Invoice ID</td>
              <td style="padding:8px;border:1px solid #ddd">${invoice_id}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd">Amount Due</td>
              <td style="padding:8px;border:1px solid #ddd"><strong>$${parseFloat(amount).toFixed(2)}</strong></td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd">Due Date</td>
              <td style="padding:8px;border:1px solid #ddd">${new Date(due_date).toLocaleDateString()}</td></tr>
        </table>
        <p>Please log in to the portal to view details and make payment.</p>
        <p>Thank you for your business.</p>
      </div>`,
  }),

  invoice_overdue: ({ company_name, invoice_id, amount, due_date }) => ({
    subject: `OVERDUE: Invoice #${invoice_id.slice(0, 8)} — $${parseFloat(amount).toFixed(2)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#d32f2f">Invoice Overdue</h2>
        <p>Dear ${company_name},</p>
        <p>Invoice <strong>#${invoice_id}</strong> for <strong>$${parseFloat(amount).toFixed(2)}</strong>
           was due on <strong>${new Date(due_date).toLocaleDateString()}</strong> and has not been paid.</p>
        <p>Please make payment immediately to avoid service suspension.</p>
      </div>`,
  }),

  quota_warning: ({ company_name, resource_type, used_pct, project_id }) => ({
    subject: `Quota Warning: ${resource_type} at ${used_pct}%`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#f57c00">Quota Warning</h2>
        <p>Dear ${company_name},</p>
        <p>Your <strong>${resource_type}</strong> quota in project <strong>${project_id}</strong>
           is at <strong>${used_pct}%</strong> capacity.</p>
        <p>Please review your usage or request a quota increase.</p>
      </div>`,
  }),

  user_created: ({ username, email, role }) => ({
    subject: `Welcome to OpenStack Portal — Account Created`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Account Created</h2>
        <p>Hello ${username},</p>
        <p>Your account has been created with role <strong>${role}</strong>.</p>
        <p>Email: ${email}</p>
        <p>Please log in and change your password on first login.</p>
      </div>`,
  }),

  generic: ({ subject: _subj, body }) => ({
    subject: _subj || 'Notification',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto"><p>${body}</p></div>`,
  }),
};

function renderTemplate(type, data) {
  const fn = templates[type] || templates.generic;
  return fn(data);
}

module.exports = { renderTemplate };
