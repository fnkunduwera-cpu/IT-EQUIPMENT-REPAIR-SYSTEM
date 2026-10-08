import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { PRIORITIES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import { today } from '../utils/format';

export default function CreateTicket() {
  const store = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const [form, setForm] = useState({
    customerId: '', equipmentId: '', problemDescription: '', priority: 'Medium', expectedCompletionDate: '', notes: '', dateReceived: today(),
  });
  const [error, setError] = useState('');
  const equipment = useMemo(() => store.equipment.filter((e) => e.customerId === form.customerId), [store, form.customerId]);

  const save = () => {
    const result = store.createTicket(form);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    notify(`Ticket ${result.ticketNumber} created with status Received.`);
    navigate(`/repair-tickets/${result.id}`);
  };

  return (
    <Stack spacing={2} maxWidth={820}>
      <Box>
        <Typography variant="h4">Create repair ticket</Typography>
        <Typography color="text.secondary">Register intake. Status starts at Received. Duplicate open tickets for the same equipment are blocked.</Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Autocomplete
              options={store.customers}
              getOptionLabel={(c) => `${c.fullName} (${c.customerNumber})`}
              onChange={(_, value) => setForm({ ...form, customerId: value?.id || '', equipmentId: '' })}
              renderInput={(params) => <TextField {...params} label="Customer" required />}
            />
            <TextField select label="Equipment" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} required>
              {equipment.map((e) => <MenuItem key={e.id} value={e.id}>{e.equipmentNumber} · {e.brand} {e.model} · {e.serialNumber}</MenuItem>)}
            </TextField>
            <TextField label="Problem description" value={form.problemDescription} onChange={(e) => setForm({ ...form, problemDescription: e.target.value })} multiline minRows={3} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} fullWidth>
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <TextField label="Date received" type="date" value={form.dateReceived} onChange={(e) => setForm({ ...form, dateReceived: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Expected completion" type="date" value={form.expectedCompletionDate} onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline minRows={2} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={save}>Create ticket</Button>
              <Button onClick={() => navigate('/repair-tickets')}>Cancel</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
