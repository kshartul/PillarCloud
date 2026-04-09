import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 240;

export default function Layout() {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ display: 'flex' }}>
      <Header drawerWidth={DRAWER_WIDTH} open={open} onToggle={() => setOpen(!open)} />
      <Sidebar width={DRAWER_WIDTH} open={open} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
