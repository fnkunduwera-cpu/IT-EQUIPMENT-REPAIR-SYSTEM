import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { PRIORITIES } from '../data/seed';
import { useStore } from '../context/StoreContext';

export default function AssignTechnicianDialog({ open, ticket, onClose, onDone }) {
  const store = useStore();
  const [technicianId, setTechnicianId] = useState(ticket?.technicianId || '');
  const [priority, setPriority] = useState(ticket?.priority || 'Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTechnicianId(ticket?.technicianId || '');
    setPriority(ticket?.priority || 'Medium');
    setError('');
  }, [open, ticket]);

  const workload = useMemo(() => store.technicians.map((tech) => ({
    ...tech,
    active: store.techActive(tech.id),
    done: store.techDone(tech.id),
  })), [store]);

  const submit = () => {
    const result = store.assignTechnician({ ticketId: ticket.id, technicianId, priority });
    if (result !== true) {
      setError(result);
      return;
    }
    onDone?.('Technician assigned.');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign technician</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            {ticket?.ticketNumber} — choose an available technician. Workload is shown before assignment.
          </Typography>
          <TextField select label="Technician" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
            {workload.map((tech) => (
              <MenuItem key={tech.id} value={tech.id} disabled={tech.status === 'Inactive' || tech.status === 'On Leave'}>
                {tech.fullName} — {tech.active} active repairs · {tech.status} · {tech.specialization}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>Confirm assignment</Button>
      </DialogActions>
    </Dialog>
  );
}
