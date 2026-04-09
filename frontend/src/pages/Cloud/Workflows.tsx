import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function WorkflowsPage() {
  const [workflows, setWorkflows]   = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [error, setError]           = useState('');
  const [wfOpen, setWfOpen]         = useState(false);
  const [execOpen, setExecOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);
  const [wfForm, setWfForm] = useState({ definition: '' });
  const [execForm, setExecForm] = useState({ workflow_name: '', input: '' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/workflow/workflows'); setWorkflows(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    try { const { data } = await api.get('/cloud/workflow/executions'); setExecutions(data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreateWf = async () => {
    try { await api.post('/cloud/workflow/workflows', { definition: wfForm.definition }); setWfOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handleCreateExec = async () => {
    let input = {};
    if (execForm.input) try { input = JSON.parse(execForm.input); } catch {}
    try { await api.post('/cloud/workflow/executions', { workflow_name: execForm.workflow_name, input }); setExecOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'wf') await api.delete(`/cloud/workflow/workflows/${deleteTarget.id}`);
      else await api.delete(`/cloud/workflow/executions/${deleteTarget.id}`);
      load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Workflows (Mistral)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Workflows</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setWfOpen(true)}>Create</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Scope</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {workflows.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell>{w.name}</TableCell><TableCell>{w.scope}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{w.created_at ? new Date(w.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'wf', id: w.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Executions</Typography>
            <Button variant="contained" size="small" startIcon={<PlayArrowIcon />} onClick={() => setExecOpen(true)}>Execute</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Workflow</TableCell><TableCell>State</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {executions.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{e.id?.slice(0, 8)}</TableCell>
                  <TableCell>{e.workflow_name}</TableCell>
                  <TableCell><StatusChip status={e.state || '—'} /></TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{e.created_at ? new Date(e.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'exec', id: e.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
      </Grid>
      <Dialog open={wfOpen} onClose={() => setWfOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Workflow</DialogTitle>
        <DialogContent><TextField label="Workflow Definition (YAML/JSON)" value={wfForm.definition} onChange={e => setWfForm({ definition: e.target.value })} fullWidth multiline rows={12} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setWfOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateWf}>Create</Button></DialogActions>
      </Dialog>
      <Dialog open={execOpen} onClose={() => setExecOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Execute Workflow</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Workflow Name" value={execForm.workflow_name} onChange={e => setExecForm({ ...execForm, workflow_name: e.target.value })} fullWidth />
          <TextField label="Input (JSON, optional)" value={execForm.input} onChange={e => setExecForm({ ...execForm, input: e.target.value })} fullWidth multiline rows={4} />
        </DialogContent>
        <DialogActions><Button onClick={() => setExecOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateExec}>Execute</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} message={`Delete this ${deleteTarget?.type === 'wf' ? 'workflow' : 'execution'}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
