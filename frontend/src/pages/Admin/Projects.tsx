import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Table, TableBody, TableCell, TableHead,
         TableRow, Paper, IconButton, Alert, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchProjects } from '../../store/slices/adminSlice';
import { adminApi } from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ProjectsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading } = useSelector((s: RootState) => s.admin);
  const [open, setOpen]         = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({ name: '', description: '', os_project_id: '' });

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const handleCreate = async () => {
    try {
      await adminApi.createProject(form);
      setOpen(false);
      setForm({ name: '', description: '', os_project_id: '' });
      dispatch(fetchProjects());
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to create project'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await adminApi.deleteProject(deleteId); dispatch(fetchProjects()); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Project</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Description</TableCell>
              <TableCell>OS Project ID</TableCell><TableCell>Enabled</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(projects?.data || []).map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.os_project_id}</TableCell>
                <TableCell><Switch checked={p.enabled} size="small" readOnly /></TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
          <TextField label="OpenStack Project ID (optional)" value={form.os_project_id} onChange={e => setForm({ ...form, os_project_id: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteId} message="Delete this project? This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
