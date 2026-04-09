import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchProjects, fetchQuota } from '../../store/slices/adminSlice';
import { adminApi } from '../../services/api';

export default function QuotasPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, selectedQuota } = useSelector((s: RootState) => s.admin);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [editQuota, setEditQuota] = useState<any>({});
  const [error, setError]  = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { dispatch(fetchProjects({ limit: 100 })); }, [dispatch]);
  useEffect(() => {
    if (selectedProjectId) dispatch(fetchQuota(selectedProjectId));
  }, [selectedProjectId, dispatch]);
  useEffect(() => {
    if (selectedQuota) setEditQuota({ ...selectedQuota });
  }, [selectedQuota]);

  const handleSave = async () => {
    try {
      await adminApi.updateQuota(selectedProjectId, editQuota);
      setSuccess('Quota updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed to update quota'); }
  };

  const quotaFields = ['instances', 'vcpus', 'ram', 'volumes', 'gigabytes', 'floating_ips', 'networks', 'security_groups'];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quotas</Typography>
      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormControl sx={{ mb: 3, minWidth: 300 }}>
        <InputLabel>Select Project</InputLabel>
        <Select value={selectedProjectId} label="Select Project"
          onChange={e => setSelectedProjectId(e.target.value)}>
          {(projects?.data || []).map((p: any) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedQuota && (
        <Paper sx={{ p: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Resource</TableCell><TableCell>Limit</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {quotaFields.map(field => (
                <TableRow key={field}>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    <TextField type="number" size="small" value={editQuota[field] ?? ''}
                      onChange={e => setEditQuota({ ...editQuota, [field]: parseInt(e.target.value) })}
                      inputProps={{ min: -1 }} sx={{ width: 120 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleSave}>Save Quotas</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
