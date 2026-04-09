import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function BareMetalPage() {
  const [nodes, setNodes]     = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [error, setError]     = useState('');
  const [open, setOpen]       = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);
  const [form, setForm] = useState({ name: '', driver: 'ipmi', resource_class: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/baremetal/nodes'); setNodes(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    try { const { data } = await api.get('/cloud/baremetal/drivers'); setDrivers(data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/baremetal/nodes', form); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/baremetal/nodes/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteId(null);
  };
  const handlePower = async (target: string) => {
    if (!menuAnchor) return;
    try { await api.put(`/cloud/baremetal/nodes/${menuAnchor.id}/power`, { target }); setTimeout(load, 2000); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setMenuAnchor(null);
  };
  const handleProvision = async (target: string) => {
    if (!menuAnchor) return;
    try { await api.put(`/cloud/baremetal/nodes/${menuAnchor.id}/provision`, { target }); setTimeout(load, 2000); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setMenuAnchor(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Bare Metal (Ironic)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Register Node</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper><Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Driver</TableCell><TableCell>Provision State</TableCell><TableCell>Power State</TableCell><TableCell>Resource Class</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {nodes.map((n: any) => (
            <TableRow key={n.uuid || n.id}>
              <TableCell>{n.name || n.uuid?.slice(0, 8)}</TableCell>
              <TableCell>{n.driver}</TableCell>
              <TableCell><StatusChip status={n.provision_state || '—'} /></TableCell>
              <TableCell><StatusChip status={n.power_state || '—'} /></TableCell>
              <TableCell>{n.resource_class || '—'}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={e => setMenuAnchor({ el: e.currentTarget, id: n.uuid || n.id })}><MoreVertIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></Paper>
      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handlePower('power on')}>Power On</MenuItem>
        <MenuItem onClick={() => handlePower('power off')}>Power Off</MenuItem>
        <MenuItem onClick={() => handlePower('rebooting')}>Reboot</MenuItem>
        <MenuItem onClick={() => handleProvision('manage')}>Manage</MenuItem>
        <MenuItem onClick={() => handleProvision('provide')}>Provide</MenuItem>
        <MenuItem onClick={() => handleProvision('inspect')}>Inspect</MenuItem>
        <MenuItem onClick={() => { setDeleteId(menuAnchor!.id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register Bare Metal Node</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Driver" value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} fullWidth helperText={`Available: ${drivers.map((d: any) => d.name).join(', ') || 'loading...'}`} />
          <TextField label="Resource Class" value={form.resource_class} onChange={e => setForm({ ...form, resource_class: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Register</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this bare metal node?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
