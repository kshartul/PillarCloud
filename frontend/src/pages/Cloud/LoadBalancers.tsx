import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function LoadBalancersPage() {
  const [lbs, setLbs]     = useState<any[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm]   = useState({ name: '', vip_subnet_id: '', description: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/load-balancers'); setLbs(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/load-balancers', form); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/load-balancers/${deleteId}?cascade=true`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Load Balancers (Octavia)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create LB</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>VIP Address</TableCell><TableCell>Status</TableCell><TableCell>Provider</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {lbs.map((lb: any) => (
              <TableRow key={lb.id}>
                <TableCell>{lb.name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{lb.vip_address || '—'}</TableCell>
                <TableCell><StatusChip status={lb.provisioning_status || lb.operating_status || '—'} /></TableCell>
                <TableCell>{lb.provider || '—'}</TableCell>
                <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(lb.id)}><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Load Balancer</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="VIP Subnet ID" value={form.vip_subnet_id} onChange={e => setForm({ ...form, vip_subnet_id: e.target.value })} fullWidth />
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this load balancer and all its children?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
