import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
         TextField, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchCustomers } from '../../store/slices/billingSlice';
import { billingApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';

const planColors: Record<string, 'default' | 'primary' | 'secondary'> = {
  basic: 'default', standard: 'primary', enterprise: 'secondary',
};

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers } = useSelector((s: RootState) => s.billing);
  const [open, setOpen]   = useState(false);
  const [error, setError] = useState('');
  const [form, setForm]   = useState({ project_id: '', company_name: '', contact_email: '', plan_type: 'basic' });

  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  const handleCreate = async () => {
    try {
      await billingApi.createCustomer(form);
      setOpen(false);
      setForm({ project_id: '', company_name: '', contact_email: '', plan_type: 'basic' });
      dispatch(fetchCustomers());
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to create customer'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Customers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Customer</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell><TableCell>Email</TableCell>
              <TableCell>Plan</TableCell><TableCell>Status</TableCell>
              <TableCell>Credit</TableCell><TableCell>Since</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(customers?.data || []).map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.company_name}</TableCell>
                <TableCell>{c.contact_email}</TableCell>
                <TableCell><Chip label={c.plan_type} color={planColors[c.plan_type]} size="small" /></TableCell>
                <TableCell><StatusChip status={c.status} /></TableCell>
                <TableCell>${parseFloat(c.credit_balance).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="OpenStack Project ID" value={form.project_id}
            onChange={e => setForm({ ...form, project_id: e.target.value })} fullWidth />
          <TextField label="Company Name" value={form.company_name}
            onChange={e => setForm({ ...form, company_name: e.target.value })} fullWidth />
          <TextField label="Contact Email" value={form.contact_email}
            onChange={e => setForm({ ...form, contact_email: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Plan</InputLabel>
            <Select value={form.plan_type} label="Plan"
              onChange={e => setForm({ ...form, plan_type: e.target.value })}>
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="standard">Standard (10% discount)</MenuItem>
              <MenuItem value="enterprise">Enterprise (20% discount)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
