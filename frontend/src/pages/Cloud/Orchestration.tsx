import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function OrchestrationPage() {
  const [stacks, setStacks] = useState<any[]>([]);
  const [error, setError]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailStack, setDetailStack] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', template: '', parameters: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/orchestration/stacks'); setStacks(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load stacks'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      let tmpl: any = form.template;
      try { tmpl = JSON.parse(form.template); } catch { /* send as string/URL */ }
      let params = {};
      if (form.parameters) try { params = JSON.parse(form.parameters); } catch {}
      await api.post('/cloud/orchestration/stacks', { name: form.name, template: tmpl, parameters: params });
      setCreateOpen(false); setForm({ name: '', template: '', parameters: '' }); load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create stack'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/cloud/orchestration/stacks/${deleteId}`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  const viewResources = async (stackId: string) => {
    try {
      const [stackRes, resRes] = await Promise.all([
        api.get(`/cloud/orchestration/stacks/${stackId}`),
        api.get(`/cloud/orchestration/stacks/${stackId}/resources`),
      ]);
      setDetailStack(stackRes.data);
      setResources(resRes.data);
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to load stack details'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Orchestration (Heat)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Stack</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {stacks.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.name || s.stack_name}</TableCell>
                <TableCell><StatusChip status={s.stack_status || s.status || '—'} /></TableCell>
                <TableCell sx={{ fontSize: 12 }}>{s.creation_time ? new Date(s.creation_time).toLocaleString() : '—'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => viewResources(s.id)}><VisibilityIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(s.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Stack</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Stack Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Template (JSON/YAML)" value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} fullWidth multiline rows={8} />
          <TextField label="Parameters (JSON, optional)" value={form.parameters} onChange={e => setForm({ ...form, parameters: e.target.value })} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>

      <Dialog open={!!detailStack} onClose={() => setDetailStack(null)} maxWidth="md" fullWidth>
        {detailStack && (
          <>
            <DialogTitle>Stack: {detailStack.name || detailStack.stack_name}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>Resources ({resources.length})</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {resources.map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{r.resource_name || r.name}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{r.resource_type}</TableCell>
                      <TableCell><StatusChip status={r.resource_status || r.status || '—'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteId} message="Delete this stack and all its resources?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
