import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function SharedFileSystemsPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [error, setError]   = useState('');
  const [open, setOpen]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', size: '10', share_proto: 'NFS', description: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/shared-file-systems/shares'); setShares(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load shares'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/shared-file-systems/shares', { ...form, size: parseInt(form.size) }); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create share'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/shared-file-systems/shares/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Shared File Systems (Manila)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Share</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper><Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Protocol</TableCell><TableCell>Size (GB)</TableCell><TableCell>Status</TableCell><TableCell>Export Location</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {shares.map((s: any) => (
            <TableRow key={s.id}>
              <TableCell>{s.name || '—'}</TableCell>
              <TableCell>{s.share_proto}</TableCell>
              <TableCell>{s.size}</TableCell>
              <TableCell><StatusChip status={s.status || '—'} /></TableCell>
              <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{s.export_location || s.export_locations?.[0]?.path || '—'}</TableCell>
              <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(s.id)}><DeleteIcon /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Share</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Size (GB)" type="number" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} fullWidth />
          <FormControl fullWidth><InputLabel>Protocol</InputLabel>
            <Select value={form.share_proto} label="Protocol" onChange={e => setForm({ ...form, share_proto: e.target.value })}>
              {['NFS', 'CIFS', 'GlusterFS', 'HDFS', 'CephFS'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this share?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
