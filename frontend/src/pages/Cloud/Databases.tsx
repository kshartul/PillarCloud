import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function DatabasesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [datastores, setDatastores] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', flavor_id: '', volume_size: '5', datastore_type: 'mysql' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/databases/instances'); setInstances(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    try { const { data } = await api.get('/cloud/databases/datastores'); setDatastores(data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/databases/instances', { ...form, volume_size: parseInt(form.volume_size) }); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/databases/instances/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Databases (Trove)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Instance</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper><Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Datastore</TableCell><TableCell>Status</TableCell><TableCell>Volume (GB)</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {instances.map((i: any) => (
            <TableRow key={i.id}>
              <TableCell>{i.name}</TableCell>
              <TableCell>{i.datastore?.type || '—'} {i.datastore?.version || ''}</TableCell>
              <TableCell><StatusChip status={i.status || '—'} /></TableCell>
              <TableCell>{i.volume?.size || '—'}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>{i.created ? new Date(i.created).toLocaleString() : '—'}</TableCell>
              <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(i.id)}><DeleteIcon /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Database Instance</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Flavor ID" value={form.flavor_id} onChange={e => setForm({ ...form, flavor_id: e.target.value })} fullWidth />
          <TextField label="Volume Size (GB)" type="number" value={form.volume_size} onChange={e => setForm({ ...form, volume_size: e.target.value })} fullWidth />
          <FormControl fullWidth><InputLabel>Datastore</InputLabel>
            <Select value={form.datastore_type} label="Datastore" onChange={e => setForm({ ...form, datastore_type: e.target.value })}>
              {['mysql', 'postgresql', 'mongodb', 'redis', 'mariadb', 'cassandra'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this database instance? All data will be lost." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
