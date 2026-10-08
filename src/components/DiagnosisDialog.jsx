import { useEffect, useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material';
import { useStore } from '../context/StoreContext';

const empty = {
  technicianId: '',
  problemIdentified: '',
  cause: '',
  recommendedSolution: '',
  requiredParts: '',
  estimatedRepairTime: '2 day(s)',
  estimatedCost: '',
  notes: '',
};

export default function DiagnosisDialog({ open, ticket, onClose, onDone }) {
  const store = useStore();
  const existing = ticket ? store.diagnosisFor(ticket.id) : null;
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(existing ? { ...empty, ...existing, estimatedCost: existing.estimatedCost } : { ...empty, technicianId: ticket?.technicianId || '' });
  }, [open, ticket, existing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = (advance) => {
    const result = store.saveDiagnosis({ ...form, ticketId: ticket.id }, advance);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    onDone?.(advance === 'repair' ? 'Diagnosis saved and repair started.' : 'Diagnosis saved.');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{existing ? 'Edit diagnosis' : 'Add diagnosis'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Technician" value={form.technicianId} onChange={set('technicianId')}>
            {store.technicians.filter((t) => t.status !== 'Inactive').map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.fullName} · {t.specialization}</MenuItem>
            ))}
          </TextField>
          <TextField label="Problem identified" value={form.problemIdentified} onChange={set('problemIdentified')} required />
          <TextField label="Cause" value={form.cause} onChange={set('cause')} />
          <TextField label="Recommended solution" value={form.recommendedSolution} onChange={set('recommendedSolution')} required />
          <TextField label="Required parts" value={form.requiredParts} onChange={set('requiredParts')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Estimated repair time" value={form.estimatedRepairTime} onChange={set('estimatedRepairTime')} fullWidth />
            <TextField label="Estimated cost (RWF)" type="number" value={form.estimatedCost} onChange={set('estimatedCost')} fullWidth required />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={set('notes')} multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => save(false)}>Save</Button>
        <Button variant="contained" onClick={() => save('repair')}>Complete and start repair</Button>
      </DialogActions>
    </Dialog>
  );
}
