import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
         TextField, Select, MenuItem, FormControl, InputLabel, Pagination, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchAuditLogs } from '../../store/slices/adminSlice';
import StatusChip from '../../components/common/StatusChip';

export default function AuditPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs } = useSelector((s: RootState) => s.admin);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ username: '', action: '', status: '' });

  const load = () => dispatch(fetchAuditLogs({ page, limit: 20, ...filters }));
  useEffect(() => { load(); }, [page]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Audit Log</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField label="Username" size="small" value={filters.username}
          onChange={e => setFilters({ ...filters, username: e.target.value })} />
        <TextField label="Action" size="small" value={filters.action}
          onChange={e => setFilters({ ...filters, action: e.target.value })} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status} label="Status"
            onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failure">Failure</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell><TableCell>User</TableCell>
              <TableCell>Action</TableCell><TableCell>Resource</TableCell>
              <TableCell>Status</TableCell><TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(auditLogs?.data || []).map((e: any) => (
              <TableRow key={e.id}>
                <TableCell sx={{ fontSize: 12 }}>{new Date(e.created_at).toLocaleString()}</TableCell>
                <TableCell>{e.username}</TableCell>
                <TableCell>{e.action}</TableCell>
                <TableCell>{e.resource_type}{e.resource_id ? ` (${e.resource_id.slice(0, 8)})` : ''}</TableCell>
                <TableCell><StatusChip status={e.status} /></TableCell>
                <TableCell sx={{ fontSize: 12 }}>{e.ip_address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {auditLogs && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={Math.ceil(auditLogs.total / 20)} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}
    </Box>
  );
}
