import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Switch, FormControlLabel, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchNetworks, fetchFloatingIps } from '../../store/slices/cloudSlice';
import { cloudApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function NetworksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { networks, floatingIps } = useSelector((s: RootState) => s.cloud);
  const [netOpen, setNetOpen]   = useState(false);
  const [error, setError]       = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'network' | 'fip'>('network');
  const [form, setForm] = useState({ name: '', admin_state_up: true });

  useEffect(() => { dispatch(fetchNetworks()); dispatch(fetchFloatingIps()); }, [dispatch]);

  const handleCreateNetwork = async () => {
    try {
      await cloudApi.createNetwork(form);
      setNetOpen(false);
      dispatch(fetchNetworks());
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create network'); }
  };

  const handleAllocateFip = async () => {
    try { await cloudApi.allocateFloatingIp({}); dispatch(fetchFloatingIps()); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to allocate floating IP'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      if (deleteType === 'network') { await cloudApi.deleteNetwork(deleteId); dispatch(fetchNetworks()); }
      else                          { await cloudApi.releaseFloatingIp(deleteId); dispatch(fetchFloatingIps()); }
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Networks</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Networks</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setNetOpen(true)}>Create</Button>
          </Box>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Shared</TableCell><TableCell></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {networks.map(n => (
                  <TableRow key={n.id}>
                    <TableCell>{n.name}</TableCell>
                    <TableCell><StatusChip status={n.status} /></TableCell>
                    <TableCell>{n.shared ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error"
                        onClick={() => { setDeleteId(n.id); setDeleteType('network'); }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Floating IPs</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAllocateFip}>Allocate</Button>
          </Box>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>IP</TableCell><TableCell>Status</TableCell><TableCell></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {floatingIps.map(f => (
                  <TableRow key={f.id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{f.floating_ip_address}</TableCell>
                    <TableCell><StatusChip status={f.status} /></TableCell>
                    <TableCell>
                      <IconButton size="small" color="error"
                        onClick={() => { setDeleteId(f.id); setDeleteType('fip'); }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={netOpen} onClose={() => setNetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Network</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <FormControlLabel control={
            <Switch checked={form.admin_state_up} onChange={e => setForm({ ...form, admin_state_up: e.target.checked })} />
          } label="Admin State Up" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNetOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNetwork} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteId} message={`Delete this ${deleteType === 'fip' ? 'floating IP' : 'network'}?`}
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
