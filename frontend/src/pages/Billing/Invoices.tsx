import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, Button, Select, MenuItem, FormControl, InputLabel,
         Pagination, Alert, Dialog, DialogTitle, DialogContent,
         List, ListItem, ListItemText, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchInvoices } from '../../store/slices/billingSlice';
import { billingApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import type { Invoice } from '../../types';

export default function InvoicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { invoices } = useSelector((s: RootState) => s.billing);
  const [page, setPage]           = useState(1);
  const [status, setStatus]       = useState('');
  const [error, setError]         = useState('');
  const [detail, setDetail]       = useState<Invoice | null>(null);

  const load = () => dispatch(fetchInvoices({ page, limit: 20, ...(status ? { status } : {}) }));
  useEffect(() => { load(); }, [page, status]);

  const handlePay = async (id: string) => {
    try {
      await billingApi.payInvoice(id);
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to process payment'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Invoices</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by status</InputLabel>
          <Select value={status} label="Filter by status"
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {['draft', 'issued', 'paid', 'overdue', 'void'].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell><TableCell>Customer</TableCell>
              <TableCell>Period</TableCell><TableCell>Amount</TableCell>
              <TableCell>Status</TableCell><TableCell>Due</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(invoices?.data || []).map((inv: any) => (
              <TableRow key={inv.id}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  <Button size="small" variant="text" onClick={() => setDetail(inv)}>
                    #{inv.id.slice(0, 8)}
                  </Button>
                </TableCell>
                <TableCell>{inv.company_name}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {new Date(inv.billing_period_start).toLocaleDateString()} –{' '}
                  {new Date(inv.billing_period_end).toLocaleDateString()}
                </TableCell>
                <TableCell>${parseFloat(inv.amount).toFixed(2)}</TableCell>
                <TableCell><StatusChip status={inv.status} /></TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  {['issued', 'overdue'].includes(inv.status) && (
                    <Button size="small" variant="outlined" color="success"
                      onClick={() => handlePay(inv.id)}>Pay</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {invoices && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={Math.ceil(invoices.total / 20)} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle>Invoice #{detail.id.slice(0, 8)}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                Period: {new Date(detail.billing_period_start).toLocaleDateString()} –{' '}
                {new Date(detail.billing_period_end).toLocaleDateString()}
              </Typography>
              <List dense>
                {(detail.items || []).map((item, i) => (
                  <React.Fragment key={i}>
                    <ListItem>
                      <ListItemText
                        primary={item.resource_type.replace(/_/g, ' ')}
                        secondary={`${item.quantity} × $${item.unit_price} / ${item.unit}`}
                      />
                      <Typography>${parseFloat(String(item.total_cost)).toFixed(4)}</Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Typography>Subtotal: ${parseFloat(String(detail.subtotal)).toFixed(2)}</Typography>
                {parseFloat(String(detail.discount)) > 0 && (
                  <Typography color="success.main">- Discount: ${parseFloat(String(detail.discount)).toFixed(2)}</Typography>
                )}
                <Typography variant="h6">Total: ${parseFloat(String(detail.amount)).toFixed(2)}</Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
