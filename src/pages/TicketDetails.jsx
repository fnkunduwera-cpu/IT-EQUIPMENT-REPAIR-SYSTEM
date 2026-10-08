import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, LinearProgress, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import RepairWorkflow from '../components/RepairWorkflow';
import AssignTechnicianDialog from '../components/AssignTechnicianDialog';
import DiagnosisDialog from '../components/DiagnosisDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, money, pct } from '../utils/format';
import { STATUSES } from '../data/seed';

export default function TicketDetails() {
  const { ticketId } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const ticket = store.ticketById(ticketId);
  const [assignOpen, setAssignOpen] = useState(false);
  const [diagOpen, setDiagOpen] = useState(false);
  const [collectOpen, setCollectOpen] = useState(false);
  const [actual, setActual] = useState('');
  const [estimated, setEstimated] = useState('');
  const [notes, setNotes] = useState(ticket?.notes || '');
  const [error, setError] = useState('');

  if (!ticket) return <Typography>Ticket not found.</Typography>;
  const customer = store.customerById(ticket.customerId);
  const equipment = store.equipmentById(ticket.equipmentId);
  const tech = store.technicianById(ticket.technicianId);
  const diagnosis = store.diagnosisFor(ticket.id);
  const history = store.history.filter((h) => h.ticketId === ticket.id);
  const diff = Number(ticket.actualCost || 0) - Number(ticket.estimatedCost || 0);
  const over = ticket.actualCost > 0 && ticket.estimatedCost > 0 && diff > 0;
  const progress = (STATUSES.indexOf(ticket.status) / (STATUSES.length - 1)) * 100;

  const advance = () => {
    const result = store.changeStatus(ticket.id, 'Workflow advanced from ticket details.');
    setError(result === true ? '' : result);
    if (result === true) notify(`Status moved to the next stage.`);
  };

  return (
    <Stack spacing={2}>
      <Button onClick={() => navigate('/repair-tickets')} sx={{ alignSelf: 'flex-start' }}>Back to tickets</Button>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h4">{ticket.ticketNumber}</Typography>
          <Typography color="text.secondary">{customer?.fullName} · {equipment?.brand} {equipment?.model}</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <StatusChip value={ticket.priority} kind="priority" />
          <StatusChip value={ticket.status} />
          <StatusChip value={ticket.collectionStatus} kind="collection" />
        </Stack>
      </Stack>
      {ticket.priority === 'Urgent' && <Alert severity="error">High-priority indicator: this ticket is marked Urgent.</Alert>}
      {ticket.status === 'Ready' && <Alert severity="success">Ready-for-collection alert: the customer can collect this equipment.</Alert>}
      {error && <Alert severity="warning">{error}</Alert>}
      <Card>
        <CardContent>
          <RepairWorkflow status={ticket.status} />
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' } }}>
        <Card><CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">Ticket</Typography>
            <Typography>Problem: {ticket.problemDescription}</Typography>
            <Typography>Received: {formatDate(ticket.dateReceived)}</Typography>
            <Typography>Expected completion: {formatDate(ticket.expectedCompletionDate)}</Typography>
            <Typography>Serial: {equipment?.serialNumber}</Typography>
            <Typography>Type: {equipment?.equipmentType}</Typography>
            <Typography>Technician: {tech ? `${tech.fullName} — ${store.techActive(tech.id)} active repairs` : 'Unassigned'}</Typography>
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
            <Button onClick={() => { store.updateTicket({ ...ticket, notes }, 'Notes updated'); notify('Notes saved.'); }}>Save notes</Button>
          </Stack>
        </CardContent></Card>
        <Card><CardContent>
          <Stack spacing={1.2}>
            <Typography variant="h6">Actions</Typography>
            <Button variant="outlined" onClick={() => setAssignOpen(true)} disabled={ticket.status === 'Collected'}>Assign technician</Button>
            <Button variant="outlined" onClick={() => setDiagOpen(true)} disabled={ticket.status === 'Collected'}>Add / edit diagnosis</Button>
            <Button variant="contained" onClick={advance} disabled={ticket.status === 'Ready' || ticket.status === 'Collected'}>Advance workflow</Button>
            <Button color="success" variant="contained" onClick={() => setCollectOpen(true)} disabled={ticket.status !== 'Ready'}>Record collection</Button>
            <Typography variant="caption" color="text.secondary">Invalid jumps are blocked. Collection is allowed only from Ready.</Typography>
          </Stack>
        </CardContent></Card>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card><CardContent>
          <Typography variant="h6">Diagnosis</Typography>
          {diagnosis ? (
            <Stack spacing={0.6} sx={{ mt: 1 }}>
              <Typography>Identified: {diagnosis.problemIdentified}</Typography>
              <Typography>Cause: {diagnosis.cause || '—'}</Typography>
              <Typography>Solution: {diagnosis.recommendedSolution}</Typography>
              <Typography>Parts: {diagnosis.requiredParts || '—'}</Typography>
              <Typography>Time: {diagnosis.estimatedRepairTime || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">{diagnosis.notes}</Typography>
            </Stack>
          ) : <Typography color="text.secondary">No diagnosis yet.</Typography>}
        </CardContent></Card>
        <Card><CardContent>
          <Typography variant="h6">Costs</Typography>
          <Typography>Estimated: {money(ticket.estimatedCost)}</Typography>
          <Typography>Actual: {money(ticket.actualCost)}</Typography>
          <Typography>Difference: {money(diff)} ({pct(diff, ticket.estimatedCost)}%)</Typography>
          {over && <Alert severity="warning" sx={{ mt: 1 }}>Actual cost exceeds the estimate.</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" label="Estimated" type="number" value={estimated} onChange={(e) => setEstimated(e.target.value)} />
            <Button onClick={() => { const r = store.setCost(ticket.id, 'estimated', estimated); notify(r === true ? 'Estimated cost saved.' : r, r === true ? 'success' : 'error'); }}>Save estimate</Button>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" label="Actual" type="number" value={actual} onChange={(e) => setActual(e.target.value)} />
            <Button onClick={() => { const r = store.setCost(ticket.id, 'actual', actual); notify(r === true ? 'Actual cost saved.' : r, r === true ? 'success' : 'error'); }}>Save actual</Button>
          </Stack>
        </CardContent></Card>
      </Box>
      <Card><CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Timeline</Typography>
        <Stack spacing={1.2}>
          {history.map((h) => (
            <Box key={h.id} sx={{ borderLeft: '3px solid #0B3D6E', pl: 1.5 }}>
              <Typography fontWeight={700}>{formatDate(h.date)} {h.time} · {h.action}</Typography>
              <Typography variant="body2">{h.previousStatus || '—'} → {h.newStatus} · {h.staffName}</Typography>
              <Typography variant="body2" color="text.secondary">{h.comment}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent></Card>
      <AssignTechnicianDialog open={assignOpen} ticket={ticket} onClose={() => setAssignOpen(false)} onDone={notify} />
      <DiagnosisDialog open={diagOpen} ticket={ticket} onClose={() => setDiagOpen(false)} onDone={notify} />
      <ConfirmDialog
        open={collectOpen}
        title="Confirm collection"
        message="Mark this equipment as collected? Repair status and collection status will both become Collected."
        confirmLabel="Collect"
        color="success"
        onClose={() => setCollectOpen(false)}
        onConfirm={() => {
          const result = store.collectEquipment(ticket.id, 'Customer collected the equipment.');
          setCollectOpen(false);
          notify(result === true ? 'Equipment collected.' : result, result === true ? 'success' : 'error');
        }}
      />
    </Stack>
  );
}
