import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function DNSPage() {
  const [zones, setZones]         = useState<any[]>([]);
  const [recordsets, setRecordsets] = useState<any[]>([]);
  const [activeZone, setActiveZone] = useState<any>(null);
  const [error, setError]         = useState('');
  const [zoneOpen, setZoneOpen]   = useState(false);
  const [rsOpen, setRsOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);
  const [zoneForm, setZoneForm]   = useState({ name: '', email: 'admin@example.com', ttl: '3600' });
  const [rsForm, setRsForm]       = useState({ name: '', type: 'A', records: '', ttl: '3600' });

  const loadZones = async () => {
    try { const { data } = await api.get('/cloud/dns/zones'); setZones(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load zones'); }
  };
  const loadRecordsets = async (zoneId: string) => {
    try { const { data } = await api.get(`/cloud/dns/zones/${zoneId}/recordsets`); setRecordsets(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load recordsets'); }
  };
  useEffect(() => { loadZones(); }, []);

  const handleCreateZone = async () => {
    try { await api.post('/cloud/dns/zones', { ...zoneForm, ttl: parseInt(zoneForm.ttl) }); setZoneOpen(false); loadZones(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create zone'); }
  };
  const handleCreateRecordset = async () => {
    try {
      const records = rsForm.records.split('\n').map(r => r.trim()).filter(Boolean);
      await api.post(`/cloud/dns/zones/${activeZone.id}/recordsets`, { ...rsForm, records, ttl: parseInt(rsForm.ttl) });
      setRsOpen(false); loadRecordsets(activeZone.id);
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create recordset'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'zone') { await api.delete(`/cloud/dns/zones/${deleteTarget.id}`); loadZones(); setActiveZone(null); }
      else { await api.delete(`/cloud/dns/zones/${activeZone.id}/recordsets/${deleteTarget.id}`); loadRecordsets(activeZone.id); }
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>DNS (Designate)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {!activeZone ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Zones</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setZoneOpen(true)}>Create Zone</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>TTL</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {zones.map((z: any) => (
                <TableRow key={z.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setActiveZone(z); loadRecordsets(z.id); }}>
                  <TableCell>{z.name}</TableCell><TableCell>{z.type}</TableCell>
                  <TableCell><StatusChip status={z.status || 'ACTIVE'} /></TableCell>
                  <TableCell>{z.ttl}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'zone', id: z.id }); }}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </>
      ) : (
        <>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveZone(null)}>Back</Button>
            <Typography variant="h6">{activeZone.name}</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setRsOpen(true)}>Add Record</Button>
          </Stack>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Records</TableCell><TableCell>TTL</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {recordsets.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell><TableCell>{r.type}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{(r.records || []).join(', ')}</TableCell>
                  <TableCell>{r.ttl}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'rs', id: r.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </>
      )}
      <Dialog open={zoneOpen} onClose={() => setZoneOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Zone</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Zone Name (e.g. example.com.)" value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} fullWidth />
          <TextField label="Admin Email" value={zoneForm.email} onChange={e => setZoneForm({ ...zoneForm, email: e.target.value })} fullWidth />
          <TextField label="TTL" type="number" value={zoneForm.ttl} onChange={e => setZoneForm({ ...zoneForm, ttl: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setZoneOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateZone}>Create</Button></DialogActions>
      </Dialog>
      <Dialog open={rsOpen} onClose={() => setRsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Record</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name (e.g. www.example.com.)" value={rsForm.name} onChange={e => setRsForm({ ...rsForm, name: e.target.value })} fullWidth />
          <TextField label="Type (A, AAAA, CNAME, MX, etc.)" value={rsForm.type} onChange={e => setRsForm({ ...rsForm, type: e.target.value })} fullWidth />
          <TextField label="Records (one per line)" value={rsForm.records} onChange={e => setRsForm({ ...rsForm, records: e.target.value })} fullWidth multiline rows={3} />
          <TextField label="TTL" type="number" value={rsForm.ttl} onChange={e => setRsForm({ ...rsForm, ttl: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setRsOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateRecordset}>Add</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} message={`Delete this ${deleteTarget?.type === 'zone' ? 'zone' : 'record'}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
