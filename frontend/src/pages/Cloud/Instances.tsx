import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Menu, MenuItem, Alert, Dialog, DialogTitle,
         DialogContent, DialogActions, TextField, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchInstances, fetchFlavors, fetchNetworks } from '../../store/slices/cloudSlice';
import { cloudApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function InstancesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { instances, flavors, networks } = useSelector((s: RootState) => s.cloud);
  const [open, setOpen]         = useState(false);
  const [error, setError]       = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);
  const [form, setForm] = useState({ name: '', flavor_id: '', network_id: '', image_id: '', key_name: '' });

  useEffect(() => {
    dispatch(fetchInstances());
    dispatch(fetchFlavors());
    dispatch(fetchNetworks());
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      await cloudApi.createInstance(form);
      setOpen(false);
      dispatch(fetchInstances());
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create instance'); }
  };

  const handleAction = async (action: string) => {
    if (!menuAnchor) return;
    setMenuAnchor(null);
    try {
      await cloudApi.instanceAction(menuAnchor.id, action);
      setTimeout(() => dispatch(fetchInstances()), 2000);
    } catch (e: any) { setError(e.response?.data?.detail || `Action ${action} failed`); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await cloudApi.deleteInstance(deleteId); dispatch(fetchInstances()); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Instances</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Launch Instance</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Status</TableCell>
              <TableCell>Flavor</TableCell><TableCell>IP</TableCell>
              <TableCell>Created</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instances.map(i => {
              const ips = Object.values(i.addresses || {}).flat().map((a: any) => a.addr).join(', ');
              return (
                <TableRow key={i.id}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell><StatusChip status={i.status} /></TableCell>
                  <TableCell>{i.flavor?.name || i.flavor?.vcpus + 'vCPU'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{ips}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(i.created).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={e => setMenuAnchor({ el: e.currentTarget, id: i.id })}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handleAction('start')}>Start</MenuItem>
        <MenuItem onClick={() => handleAction('stop')}>Stop</MenuItem>
        <MenuItem onClick={() => handleAction('reboot')}>Reboot</MenuItem>
        <MenuItem onClick={() => { setDeleteId(menuAnchor!.id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Launch Instance</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Image ID" value={form.image_id} onChange={e => setForm({ ...form, image_id: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Flavor</InputLabel>
            <Select value={form.flavor_id} label="Flavor" onChange={e => setForm({ ...form, flavor_id: e.target.value })}>
              {flavors.map(f => <MenuItem key={f.id} value={f.id}>{f.name} ({f.vcpus} vCPU, {f.ram}MB)</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Network</InputLabel>
            <Select value={form.network_id} label="Network" onChange={e => setForm({ ...form, network_id: e.target.value })}>
              {networks.map(n => <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Key Pair Name (optional)" value={form.key_name}
            onChange={e => setForm({ ...form, key_name: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Launch</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteId} message="Terminate this instance? All data will be lost."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
