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

export default function OptimizationPage() {
  const [audits, setAudits]         = useState<any[]>([]);
  const [templates, setTemplates]   = useState<any[]>([]);
  const [plans, setPlans]           = useState<any[]>([]);
  const [goals, setGoals]           = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [error, setError]           = useState('');
  const [auditOpen, setAuditOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);
  const [form, setForm] = useState({ audit_template_id: '', audit_type: 'ONESHOT' });

  const load = async () => {
    try { const { data } = await api.get('/cloud/optimization/audits'); setAudits(data); } catch {}
    try { const { data } = await api.get('/cloud/optimization/audit-templates'); setTemplates(data); } catch {}
    try { const { data } = await api.get('/cloud/optimization/action-plans'); setPlans(data); } catch {}
    try { const { data } = await api.get('/cloud/optimization/goals'); setGoals(data); } catch {}
    try { const { data } = await api.get('/cloud/optimization/strategies'); setStrategies(data); } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const handleCreateAudit = async () => {
    try { await api.post('/cloud/optimization/audits', form); setAuditOpen(false); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handleStartPlan = async (planId: string) => {
    try { await api.post(`/cloud/optimization/action-plans/${planId}/start`); load(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'audit') await api.delete(`/cloud/optimization/audits/${deleteTarget.id}`);
      else await api.delete(`/cloud/optimization/audit-templates/${deleteTarget.id}`);
      load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Resource Optimization (Watcher)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Goals</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Display Name</TableCell></TableRow></TableHead>
            <TableBody>
              {goals.map((g: any) => (
                <TableRow key={g.uuid || g.name}><TableCell>{g.name}</TableCell><TableCell>{g.display_name || '—'}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Strategies</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Display Name</TableCell><TableCell>Goal</TableCell></TableRow></TableHead>
            <TableBody>
              {strategies.map((s: any) => (
                <TableRow key={s.uuid || s.name}><TableCell>{s.name}</TableCell><TableCell>{s.display_name || '—'}</TableCell><TableCell>{s.goal_name || '—'}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Audits</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAuditOpen(true)}>Run Audit</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Type</TableCell><TableCell>State</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {audits.map((a: any) => (
                <TableRow key={a.uuid || a.id}>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{(a.uuid || a.id)?.slice(0, 8)}</TableCell>
                  <TableCell>{a.audit_type}</TableCell>
                  <TableCell><StatusChip status={a.state || '—'} /></TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'audit', id: a.uuid || a.id })}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Action Plans</Typography>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Audit</TableCell><TableCell>State</TableCell><TableCell>Efficacy</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {plans.map((p: any) => (
                <TableRow key={p.uuid || p.id}>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{(p.uuid || p.id)?.slice(0, 8)}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{p.audit_uuid?.slice(0, 8) || '—'}</TableCell>
                  <TableCell><StatusChip status={p.state || '—'} /></TableCell>
                  <TableCell>{p.global_efficacy ? JSON.stringify(p.global_efficacy) : '—'}</TableCell>
                  <TableCell>
                    {p.state === 'RECOMMENDED' && (
                      <Button size="small" variant="outlined" startIcon={<PlayArrowIcon />} onClick={() => handleStartPlan(p.uuid || p.id)}>Start</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </Grid>
      </Grid>
      <Dialog open={auditOpen} onClose={() => setAuditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Run Audit</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Audit Template ID" value={form.audit_template_id} onChange={e => setForm({ ...form, audit_template_id: e.target.value })} fullWidth />
          <TextField label="Audit Type (ONESHOT / CONTINUOUS)" value={form.audit_type} onChange={e => setForm({ ...form, audit_type: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions><Button onClick={() => setAuditOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateAudit}>Run</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} message={`Delete this ${deleteTarget?.type}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
