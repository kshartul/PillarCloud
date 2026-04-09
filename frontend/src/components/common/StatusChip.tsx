import React from 'react';
import { Chip } from '@mui/material';

const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  active: 'success', ACTIVE: 'success', paid: 'success', enabled: 'success', ok: 'success',
  suspended: 'warning', SHUTOFF: 'warning', overdue: 'warning', issued: 'info', draft: 'default',
  cancelled: 'error', ERROR: 'error', void: 'error',
  BUILD: 'info', REBOOT: 'info',
};

interface Props { status: string; size?: 'small' | 'medium'; }

export default function StatusChip({ status, size = 'small' }: Props) {
  const color = colorMap[status] || 'default';
  return <Chip label={status} color={color} size={size} />;
}
