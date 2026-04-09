import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = 'primary.main' }: Props) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {icon && <Box sx={{ color, opacity: 0.8, '& svg': { fontSize: 40 } }}>{icon}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
}
