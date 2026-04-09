import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Chip, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadIcon from '@mui/icons-material/Upload';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ObjectStoragePage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [objects, setObjects]       = useState<any[]>([]);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [error, setError]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [containerName, setContainerName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);

  const loadContainers = async () => {
    try { const { data } = await api.get('/cloud/object-storage/containers'); setContainers(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load containers'); }
  };

  const loadObjects = async (name: string) => {
    try { const { data } = await api.get(`/cloud/object-storage/containers/${name}/objects`); setObjects(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to load objects'); }
  };

  useEffect(() => { loadContainers(); }, []);

  const openContainer = (name: string) => { setActiveContainer(name); loadObjects(name); };

  const handleCreateContainer = async () => {
    try { await api.post(`/cloud/object-storage/containers?name=${encodeURIComponent(containerName)}`);
      setCreateOpen(false); setContainerName(''); loadContainers(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to create container'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'container') { await api.delete(`/cloud/object-storage/containers/${deleteTarget.id}`); loadContainers(); setActiveContainer(null); }
      else { await api.delete(`/cloud/object-storage/containers/${activeContainer}/objects/${deleteTarget.id}`); loadObjects(activeContainer!); }
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to delete'); }
    setDeleteTarget(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !activeContainer) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try { await api.post(`/cloud/object-storage/containers/${activeContainer}/objects`, formData);
      loadObjects(activeContainer); }
    catch (err: any) { setError(err.response?.data?.detail || 'Upload failed'); }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Object Storage (Swift)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {!activeContainer ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Containers</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Container</Button>
          </Box>
          <Paper>
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Objects</TableCell><TableCell>Size</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {containers.map((c: any) => (
                  <TableRow key={c.name} hover sx={{ cursor: 'pointer' }} onClick={() => openContainer(c.name)}>
                    <TableCell><Stack direction="row" spacing={1} alignItems="center"><FolderIcon color="primary" fontSize="small" /><span>{c.name}</span></Stack></TableCell>
                    <TableCell>{c.count ?? '—'}</TableCell>
                    <TableCell>{c.bytes ? `${(c.bytes / 1024).toFixed(1)} KB` : '—'}</TableCell>
                    <TableCell><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'container', id: c.name }); }}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      ) : (
        <>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveContainer(null)}>Back</Button>
            <Typography variant="h6">{activeContainer}</Typography>
            <Button variant="outlined" startIcon={<UploadIcon />} component="label">
              Upload <input type="file" hidden onChange={handleUpload} />
            </Button>
          </Stack>
          <Paper>
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Size</TableCell><TableCell>Content Type</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {objects.map((o: any) => (
                  <TableRow key={o.name}>
                    <TableCell>{o.name}</TableCell>
                    <TableCell>{o.bytes ? `${(o.bytes / 1024).toFixed(1)} KB` : '—'}</TableCell>
                    <TableCell>{o.content_type || '—'}</TableCell>
                    <TableCell><IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'object', id: o.name })}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Container</DialogTitle>
        <DialogContent><TextField label="Container Name" value={containerName} onChange={e => setContainerName(e.target.value)} fullWidth sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateContainer}>Create</Button></DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} message={`Delete this ${deleteTarget?.type}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
