import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { formatDate, money, pct } from '../utils/format';

export default function EquipmentDetails() {
  const { equipmentId } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const equipment = store.equipmentById(equipmentId);
  if (!equipment) return <Typography>Equipment not found.</Typography>;
  const customer = store.customerById(equipment.customerId);
  const tickets = store.tickets.filter((t) => t.equipmentId === equipmentId);
  const current = tickets.find((t) => t.status !== 'Collected') || tickets[0];
  const diagnosis = current ? store.diagnosisFor(current.id) : null;
  const tech = current ? store.technicianById(current.technicianId) : null;
  const history = store.history.filter((h) => tickets.some((t) => t.id === h.ticketId));
  const diff = Number(current?.actualCost || 0) - Number(current?.estimatedCost || 0);

  return (
    <Stack spacing={2}>
      <Button onClick={() => navigate('/equipment')} sx={{ alignSelf: 'flex-start' }}>Back to equipment</Button>
      <Box>
        <Typography variant="h4">{equipment.brand} {equipment.model}</Typography>
        <Typography color="text.secondary">{equipment.equipmentNumber} · {equipment.serialNumber}</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        <Tab label="Overview" /><Tab label="Repair Ticket" /><Tab label="Diagnosis" /><Tab label="Cost" /><Tab label="History" />
      </Tabs>
      {tab === 0 && (
        <Card><CardContent>
          <Stack spacing={1}>
            <Typography>Type: {equipment.equipmentType}</Typography>
            <Typography>Customer: {customer?.fullName}</Typography>
            <Typography>Color: {equipment.color}</Typography>
            <Typography>Condition on arrival: {equipment.conditionOnArrival}</Typography>
            <Typography>Accessories: {equipment.accessories || '—'}</Typography>
            <Typography>Registered: {formatDate(equipment.registrationDate)}</Typography>
            <Typography>Description: {equipment.description}</Typography>
            <Stack direction="row" spacing={1} alignItems="center"><Typography>Current repair status:</Typography><StatusChip value={store.currentEquipmentStatus(equipment.id)} /></Stack>
          </Stack>
        </CardContent></Card>
      )}
      {tab === 1 && (
        <Card><CardContent>
          {current ? (
            <Stack spacing={1}>
              <Typography fontWeight={700}>{current.ticketNumber}</Typography>
              <Typography>{current.problemDescription}</Typography>
              <Typography>Technician: {tech?.fullName || 'Unassigned'}</Typography>
              <StatusChip value={current.status} />
              <StatusChip value={current.collectionStatus} kind="collection" />
              <Button onClick={() => navigate(`/repair-tickets/${current.id}`)}>Open ticket</Button>
            </Stack>
          ) : <Typography>No repair ticket yet.</Typography>}
        </CardContent></Card>
      )}
      {tab === 2 && (
        <Card><CardContent>
          {diagnosis ? (
            <Stack spacing={1}>
              <Typography>Problem: {diagnosis.problemIdentified}</Typography>
              <Typography>Cause: {diagnosis.cause}</Typography>
              <Typography>Solution: {diagnosis.recommendedSolution}</Typography>
              <Typography>Parts: {diagnosis.requiredParts}</Typography>
              <Typography>Time: {diagnosis.estimatedRepairTime}</Typography>
            </Stack>
          ) : <Typography>No diagnosis recorded.</Typography>}
        </CardContent></Card>
      )}
      {tab === 3 && (
        <Card><CardContent>
          <Typography>Estimated: {money(current?.estimatedCost)}</Typography>
          <Typography>Actual: {money(current?.actualCost)}</Typography>
          <Typography>Difference: {money(diff)} ({pct(diff, current?.estimatedCost)}%)</Typography>
        </CardContent></Card>
      )}
      {tab === 4 && (
        <Stack spacing={1}>
          {history.map((h) => (
            <Card key={h.id}><CardContent>
              <Typography fontWeight={700}>{formatDate(h.date)} {h.time} · {h.action}</Typography>
              <Typography variant="body2">{h.previousStatus || '—'} → {h.newStatus} · {h.staffName}</Typography>
              <Typography variant="body2" color="text.secondary">{h.comment}</Typography>
            </CardContent></Card>
          ))}
          {!history.length && <Typography>No history yet.</Typography>}
        </Stack>
      )}
    </Stack>
  );
}
