import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function MessagingPage() {
  const [queues, setQueues]       = useState<any[]>([]);
  const [messages, setMessages]   = useState<any[]>([]);
  const [activeQueue, setActiveQueue] = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [msgOpen, setMsgOpen]     = useState(false);
  const [queueName, setQueueName] = useState('');
  const [msgBody, setMsgBody]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{type: string; id: string} | null>(null);

  const loadQueues = async () => {
    try { const { data } = await api.get('/cloud/messaging/queues'); setQueues(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const loadMessages = async (name: string) => {
    try { const { data } = await api.get(`/cloud/messaging/queues/${name}/messages`); setMessages(data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  useEffect(() => { loadQueues(); }, []);

  const handleCreateQueue = async () => {
    try { await api.post('/cloud/messaging/queues', { name: queueName }); setCreateOpen(false); setQueueName(''); loadQueues(); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handlePostMessage = async () => {
    try {
      let parsed: any;
      try { parsed = JSON.parse(msgBody); } catch { parsed = { body: msgBody }; }
      await api.post(`/cloud/messaging/queues/${activeQueue}/messages`, { messages: [parsed] });
      setMsgOpen(false); setMsgBody(''); loadMessages(activeQueue!);
    } catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/cloud/messaging/queues/${deleteTarget.id}`); loadQueues(); setActiveQueue(null); }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed'); }
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Messaging (Zaqar)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {!activeQueue ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Queues</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Queue</Button>
          </Box>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {queues.map((q: any) => (
                <TableRow key={q.name} hover sx={{ cursor: 'pointer' }} onClick={() => { setActiveQueue(q.name); loadMessages(q.name); }}>
                  <TableCell>{q.name}</TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'queue', id: q.name }); }}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </>
      ) : (
        <>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveQueue(null)}>Back</Button>
            <Typography variant="h6">{activeQueue}</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setMsgOpen(true)}>Post Message</Button>
          </Stack>
          <Paper><Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Body</TableCell><TableCell>TTL</TableCell><TableCell>Age</TableCell></TableRow></TableHead>
            <TableBody>
              {messages.map((m: any, i: number) => (
                <TableRow key={m.id || i}>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{m.id || i}</TableCell>
                  <TableCell sx={{ fontSize: 12, maxWidth: 400 }}><pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(m.body || m, null, 2)}</pre></TableCell>
                  <TableCell>{m.ttl}</TableCell>
                  <TableCell>{m.age}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Paper>
        </>
      )}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Queue</DialogTitle>
        <DialogContent><TextField label="Queue Name" value={queueName} onChange={e => setQueueName(e.target.value)} fullWidth sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateQueue}>Create</Button></DialogActions>
      </Dialog>
      <Dialog open={msgOpen} onClose={() => setMsgOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post Message</DialogTitle>
        <DialogContent><TextField label="Message Body (JSON)" value={msgBody} onChange={e => setMsgBody(e.target.value)} fullWidth multiline rows={4} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setMsgOpen(false)}>Cancel</Button><Button variant="contained" onClick={handlePostMessage}>Post</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} message="Delete this queue?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
