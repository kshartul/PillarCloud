import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function DataProcessingPage() {
  const [clusters, setClusters]   = useState<any[]>([]);
  const [plugins, setPlugins]     = useState<any[]>([]);
  const [jobs, setJobs]           = useState<any[]>([]);
  const [error, setError]         = useState('');
  const [open, setOpen]           = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', plugin_name: '', hadoop_version: '', cluster_template_id: '', default_image_id: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/data-processing/clusters'); setClusters(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    try { const { data } = await api.get('/cloud/data-processing/plugins'); setPlugins(data); } catch {}
    try { const { data } = await api.get('/cloud/data-processing/jobs'); setJobs(data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await api.post('/cloud/data-processing/clusters', form); setOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create cluster'); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/data-processing/clusters/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Data Processing (Sahara)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Clusters</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Cluster</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Plugin</TableCell><TableCell>Version</TableCell><TableCell>Status</TableCell><TableCell>Nodes</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {clusters.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell><TableCell>{c.plugin_name}</TableCell><TableCell>{c.hadoop_version}</TableCell>
                  <TableCell><StatusChip status={c.status || '—'} /></TableCell>
                  <TableCell>{c.node_groups?.reduce((a: number, ng: any) => a + (ng.count || 0), 0) || '—'}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Plugins</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Versions</TableCell></TableRow></TableHead>
            <TableBody>
              {plugins.map((p: any) => (
                <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell>{(p.versions || []).join(', ')}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Jobs</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell></TableRow></TableHead>
            <TableBody>
              {jobs.map((j: any) => (
                <TableRow key={j.id}><TableCell>{j.name}</TableCell><TableCell>{j.type}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Data Processing Cluster</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Plugin Name" value={form.plugin_name} onChange={e => setForm({ ...form, plugin_name: e.target.value })} fullWidth />
          <TextField label="Hadoop Version" value={form.hadoop_version} onChange={e => setForm({ ...form, hadoop_version: e.target.value })} fullWidth />
          <TextField label="Cluster Template ID" value={form.cluster_template_id} onChange={e => setForm({ ...form, cluster_template_id: e.target.value })} fullWidth />
          <TextField label="Default Image ID" value={form.default_image_id} onChange={e => setForm({ ...form, default_image_id: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteId} message="Delete this cluster?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
