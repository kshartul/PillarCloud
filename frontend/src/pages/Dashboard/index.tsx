import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import StorageIcon from '@mui/icons-material/Storage';
import LanIcon from '@mui/icons-material/Lan';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchInstances, fetchVolumes, fetchNetworks } from '../../store/slices/cloudSlice';
import { fetchInvoices } from '../../store/slices/billingSlice';
import StatCard from '../../components/common/StatCard';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { instances, volumes, networks, loading } = useSelector((s: RootState) => s.cloud);
  const { invoices } = useSelector((s: RootState) => s.billing);

  useEffect(() => {
    dispatch(fetchInstances());
    dispatch(fetchVolumes());
    dispatch(fetchNetworks());
    dispatch(fetchInvoices({ status: 'overdue', limit: 100 }));
  }, [dispatch]);

  const activeInstances = instances.filter(i => i.status === 'ACTIVE').length;
  const overdueCount    = invoices?.data.length || 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Instances" value={instances.length}
              subtitle={`${activeInstances} active`} icon={<ComputerIcon />} color="primary.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Volumes" value={volumes.length}
              subtitle={`${volumes.reduce((a, v) => a + v.size, 0)} GB total`}
              icon={<StorageIcon />} color="secondary.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Networks" value={networks.length}
              icon={<LanIcon />} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Overdue Invoices" value={overdueCount}
              icon={<ReceiptIcon />} color={overdueCount > 0 ? 'error.main' : 'text.secondary'} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
