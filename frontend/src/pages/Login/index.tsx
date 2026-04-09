import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const { loading, error, token } = useSelector((s: RootState) => s.auth);
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => { if (token) navigate('/dashboard', { replace: true }); }, [token, navigate]);
  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ width: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>OpenStack Portal</Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={3}>Sign in to your account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username" fullWidth autoFocus
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label="Password" type="password" fullWidth
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 2 }} color="text.secondary">
            Default: admin / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
