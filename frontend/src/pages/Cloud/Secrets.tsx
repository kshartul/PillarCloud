import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', payload: '', secret_type: 'opaque', payload_content_type: 'text/plain' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/secrets'); setSecrets(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load secrets'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/secrets', form); setOpen(false); setForm({ name: '', payload: '', secret_type: 'opaque', payload_content_type: 'text/plain' }); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/secrets/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Secrets (Barbican)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Store Secret</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell>Expiration</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {secrets.map((s: any) => (
              <TableRow key={s.secret_ref || s.id}>
                <TableCell>{s.name || '—'}</TableCell>
                <TableCell>{s.secret_type}</TableCell>
                <TableCell><StatusChip status={s.status || 'ACTIVE'} /></TableCell>
                <TableCell sx={{ fontSize: 12 }}>{s.created ? new Date(s.created).toLocaleString() : '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{s.expiration ? new Date(s.expiration).toLocaleString() : 'Never'}</TableCell>
                <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(s.secret_ref?.split('/').pop() || s.id)}><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Store Secret</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Payload" value={form.payload} onChange={e => setForm({ ...form, payload: e.target.value })} fullWidth multiline rows={3} />
          <FormControl fullWidth><InputLabel>Type</InputLabel>
            <Select value={form.secret_type} label="Type" onChange={e => setForm({ ...form, secret_type: e.target.value })}>
              {['opaque', 'symmetric', 'public', 'private', 'certificate', 'passphrase'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Store</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this secret permanently?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
