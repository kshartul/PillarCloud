import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
         Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { authApi } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm]         = useState({ username: '', email: '', password: '', role: 'viewer' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.getUsers();
      setUsers(data.data || data);
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await authApi.createUser(form);
      setOpen(false);
      setForm({ username: '', email: '', password: '', role: 'viewer' });
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to create user'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await authApi.deleteUser(deleteId); load(); } catch (e: any) { setError(e.response?.data?.error || 'Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add User</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell><TableCell>Email</TableCell>
              <TableCell>Role</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><StatusChip status={u.role} /></TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} fullWidth />
          <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={e => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="operator">Operator</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteId} message="Delete this user? This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
