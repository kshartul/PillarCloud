import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ContainerInfraPage() {
  const [clusters, setClusters]   = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [error, setError]         = useState('');
  const [open, setOpen]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);
  const [form, setForm] = useState({ name: '', cluster_template_id: '', master_count: '1', node_count: '1' });

  const loadClusters  = async () => { try { const { data } = await api.get('/cloud/container-infra/clusters'); setClusters(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); } };
  const loadTemplates = async () => { try { const { data } = await api.get('/cloud/container-infra/cluster-templates'); setTemplates(data); } catch {} };
  useEffect(() => { loadClusters(); loadTemplates(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/container-infra/clusters', { ...form, master_count: parseInt(form.master_count), node_count: parseInt(form.node_count) }); setOpen(false); loadClusters(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'cluster') await api.delete(`/cloud/container-infra/clusters/${deleteTarget.id}`);
      else await api.delete(`/cloud/container-infra/cluster-templates/${deleteTarget.id}`);
      loadClusters(); loadTemplates();
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Container Infrastructure (Magnum)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Clusters</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Cluster</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Masters</TableCell><TableCell>Nodes</TableCell><TableCell>COE</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {clusters.map((c: any) => (
                <TableRow key={c.uuid || c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell><StatusChip status={c.status || '—'} /></TableCell>
                  <TableCell>{c.master_count}</TableCell>
                  <TableCell>{c.node_count}</TableCell>
                  <TableCell>{c.coe || '—'}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'cluster', id: c.uuid || c.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Cluster Templates</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>COE</TableCell><TableCell>Image</TableCell><TableCell>Network Driver</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {templates.map((t: any) => (
                <TableRow key={t.uuid || t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.coe}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{t.image_id}</TableCell>
                  <TableCell>{t.network_driver}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'template', id: t.uuid || t.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Cluster</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Cluster Template ID" value={form.cluster_template_id} onChange={e => setForm({ ...form, cluster_template_id: e.target.value })} fullWidth />
          <TextField label="Master Count" type="number" value={form.master_count} onChange={e => setForm({ ...form, master_count: e.target.value })} fullWidth />
          <TextField label="Node Count" type="number" value={form.node_count} onChange={e => setForm({ ...form, node_count: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} message={`Delete this ${deleteTarget?.type}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
