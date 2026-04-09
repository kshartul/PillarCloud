import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
         Toolbar, Divider, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import ComputerIcon from '@mui/icons-material/Computer';
import NetworkIcon from '@mui/icons-material/Lan';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import LayersIcon from '@mui/icons-material/Layers';
import BalanceIcon from '@mui/icons-material/Balance';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DnsIcon from '@mui/icons-material/Dns';
import ShareIcon from '@mui/icons-material/FolderShared';
import KubernetesIcon from '@mui/icons-material/Hub';
import DatabaseIcon from '@mui/icons-material/TableChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HardwareIcon from '@mui/icons-material/Memory';
import MessageIcon from '@mui/icons-material/Forum';
import MonitorIcon from '@mui/icons-material/MonitorHeart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string; icon: React.ReactNode; path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  {
    label: 'Admin', icon: <PeopleIcon />,
    children: [
      { label: 'Users',    icon: <PeopleIcon />,  path: '/admin/users' },
      { label: 'Projects', icon: <FolderIcon />,  path: '/admin/projects' },
      { label: 'Quotas',   icon: <TuneIcon />,    path: '/admin/quotas' },
      { label: 'Audit',    icon: <HistoryIcon />, path: '/admin/audit' },
    ],
  },
  {
    label: 'Cloud', icon: <ComputerIcon />,
    children: [
      { label: 'Instances',      icon: <ComputerIcon />,   path: '/cloud/instances' },
      { label: 'Networks',       icon: <NetworkIcon />,    path: '/cloud/networks' },
      { label: 'Block Storage',  icon: <StorageIcon />,    path: '/cloud/storage' },
      { label: 'Object Storage', icon: <CloudIcon />,      path: '/cloud/object-storage' },
      { label: 'Orchestration',  icon: <LayersIcon />,     path: '/cloud/orchestration' },
      { label: 'Load Balancers', icon: <BalanceIcon />,    path: '/cloud/load-balancers' },
      { label: 'Secrets',        icon: <VpnKeyIcon />,     path: '/cloud/secrets' },
      { label: 'DNS',            icon: <DnsIcon />,        path: '/cloud/dns' },
      { label: 'Shared FS',     icon: <ShareIcon />,      path: '/cloud/shared-fs' },
      { label: 'Container Infra', icon: <KubernetesIcon />, path: '/cloud/container-infra' },
      { label: 'Databases',     icon: <DatabaseIcon />,   path: '/cloud/databases' },
      { label: 'Data Processing', icon: <AnalyticsIcon />, path: '/cloud/data-processing' },
      { label: 'Bare Metal',    icon: <HardwareIcon />,   path: '/cloud/baremetal' },
      { label: 'Messaging',     icon: <MessageIcon />,    path: '/cloud/messaging' },
      { label: 'Telemetry',     icon: <MonitorIcon />,    path: '/cloud/telemetry' },
      { label: 'Workflows',     icon: <AccountTreeIcon />, path: '/cloud/workflows' },
      { label: 'Optimization',  icon: <SpeedIcon />,      path: '/cloud/optimization' },
    ],
  },
  {
    label: 'Billing', icon: <AttachMoneyIcon />,
    children: [
      { label: 'Overview',   icon: <AttachMoneyIcon />, path: '/billing/overview' },
      { label: 'Customers',  icon: <GroupIcon />,       path: '/billing/customers' },
      { label: 'Invoices',   icon: <ReceiptIcon />,     path: '/billing/invoices' },
    ],
  },
];

interface Props { width: number; open: boolean; }

export default function Sidebar({ width, open }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = React.useState<string[]>(['Admin', 'Cloud', 'Billing']);

  const toggle = (label: string) =>
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);

  const renderItem = (item: NavItem, depth = 0) => {
    if (item.children) {
      const isOpen = expanded.includes(item.label);
      return (
        <React.Fragment key={item.label}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggle(item.label)} sx={{ pl: 2 + depth * 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto">
            <List disablePadding>
              {item.children.map(c => renderItem(c, depth + 1))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    const active = location.pathname === item.path;
    return (
      <ListItem key={item.label} disablePadding>
        <ListItemButton
          selected={active}
          onClick={() => item.path && navigate(item.path)}
          sx={{ pl: 2 + depth * 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
        transition: 'width 0.2s',
      }}
    >
      <Toolbar />
      <Divider />
      <List dense>{navItems.map(item => renderItem(item))}</List>
    </Drawer>
  );
}
