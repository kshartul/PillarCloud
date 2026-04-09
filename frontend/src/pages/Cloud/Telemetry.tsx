import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Grid, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const severityColors: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error', high: 'error', moderate: 'warning', low: 'info',
};

export default function TelemetryPage() {
  const [alarms, setAlarms] = useState<any[]>([]);
  const [error, setError]   = useState('');
  const [open, setOpen]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'threshold', description: '', severity: 'moderate' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/telemetry/alarms'); setAlarms(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load alarms'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/telemetry/alarms', form); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/telemetry/alarms/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Telemetry & Alarms</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Alarm</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper><Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>State</TableCell><TableCell>Severity</TableCell><TableCell>Enabled</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {alarms.map((a: any) => (
            <TableRow key={a.alarm_id || a.id}>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.type}</TableCell>
              <TableCell><StatusChip status={a.state || '—'} /></TableCell>
              <TableCell><Chip label={a.severity} size="small" color={severityColors[a.severity] || 'default'} /></TableCell>
              <TableCell>{a.enabled ? 'Yes' : 'No'}</TableCell>
              <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(a.alarm_id || a.id)}><DeleteIcon /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Alarm</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} fullWidth helperText="threshold, gnocchi_resources_threshold, etc." />
          <TextField label="Severity" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} fullWidth helperText="low, moderate, critical" />
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this alarm?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
