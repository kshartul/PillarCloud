import React, { useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchCustomers, fetchInvoices } from '../../store/slices/billingSlice';
import StatCard from '../../components/common/StatCard';

export default function BillingOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, invoices, loading } = useSelector((s: RootState) => s.billing);

  useEffect(() => {
    dispatch(fetchCustomers({ limit: 1000 }));
    dispatch(fetchInvoices({ limit: 1000 }));
  }, [dispatch]);

  const totalRevenue = (invoices?.data || [])
    .filter(i => i.status === 'paid')
    .reduce((a, i) => a + parseFloat(String(i.amount)), 0);

  const overdueCount = (invoices?.data || []).filter(i => i.status === 'overdue').length;

  // Simple monthly revenue chart from paid invoices
  const monthlyData: Record<string, number> = {};
  (invoices?.data || []).filter(i => i.status === 'paid').forEach(i => {
    const month = new Date(i.billing_period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyData[month] = (monthlyData[month] || 0) + parseFloat(String(i.amount));
  });
  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Billing Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`}
            icon={<AttachMoneyIcon />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Customers" value={customers?.total || 0}
            icon={<GroupIcon />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Invoices" value={invoices?.total || 0}
            icon={<ReceiptIcon />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Overdue" value={overdueCount}
            icon={<WarningIcon />} color={overdueCount > 0 ? 'error.main' : 'text.secondary'} />
        </Grid>
      </Grid>

      {chartData.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1565c0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
