import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchVolumes } from '../../store/slices/cloudSlice';
import { cloudApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function StoragePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { volumes } = useSelector((s: RootState) => s.cloud);
  const [open, setOpen]         = useState(false);
  const [error, setError]       = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', size: 10, description: '' });

  useEffect(() => { dispatch(fetchVolumes()); }, [dispatch]);

  const handleCreate = async () => {
    try {
      await cloudApi.createVolume({ ...form, size: Number(form.size) });
      setOpen(false);
      dispatch(fetchVolumes());
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create volume'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await cloudApi.deleteVolume(deleteId); dispatch(fetchVolumes()); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  const totalGb = volumes.reduce((a, v) => a + v.size, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5">Storage</Typography>
          <Typography variant="body2" color="text.secondary">{volumes.length} volumes — {totalGb} GB total</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Volume</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Size (GB)</TableCell>
              <TableCell>Status</TableCell><TableCell>Type</TableCell>
              <TableCell>Created</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volumes.map(v => (
              <TableRow key={v.id}>
                <TableCell>{v.name || '—'}</TableCell>
                <TableCell>{v.size}</TableCell>
                <TableCell><StatusChip status={v.status} /></TableCell>
                <TableCell>{v.volume_type || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(v.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Volume</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Size (GB)" type="number" value={form.size}
            onChange={e => setForm({ ...form, size: parseInt(e.target.value) })}
            inputProps={{ min: 1 }} fullWidth />
          <TextField label="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteId} message="Delete this volume? Data cannot be recovered."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
