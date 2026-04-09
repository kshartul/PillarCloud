import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText,
         DialogActions, Button } from '@mui/material';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
}

export default function ConfirmDialog({
  open, title = 'Confirm', message, onConfirm, onCancel,
  confirmLabel = 'Confirm', confirmColor = 'error',
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
