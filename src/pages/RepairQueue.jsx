import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Stack, Tab, Tabs, Typography } from '@mui/material';
import { STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { money } from '../utils/format';

export default function RepairQueue() {
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const status = STATUSES[tab];
  const tickets = store.tickets.filter((t) => t.status === status);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Repair queue</Typography>
        <Typography color="text.secondary">Kanban-style groups for Received, Diagnosis, Repairing, Ready, and Collected.</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        {STATUSES.map((item) => <Tab key={item} label={`${item} (${store.tickets.filter((t) => t.status === item).length})`} />)}
      </Tabs>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' } }}>
        {tickets.map((t) => {
          const eq = store.equipmentById(t.equipmentId);
          const tech = store.technicianById(t.technicianId);
          return (
            <Card key={t.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/repair-tickets/${t.id}`)}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700}>{t.ticketNumber}</Typography>
                  <StatusChip value={t.priority} kind="priority" />
                </Stack>
                <Typography>{eq?.brand} {eq?.model}</Typography>
                <Typography variant="body2" color="text.secondary">{store.customerById(t.customerId)?.fullName}</Typography>
                <Typography variant="body2">Technician: {tech?.fullName || 'Unassigned'}</Typography>
                <Typography variant="body2">Estimate: {money(t.estimatedCost)}</Typography>
                <Box sx={{ mt: 1 }}><StatusChip value={t.status} /></Box>
              </CardContent>
            </Card>
          );
        })}
        {!tickets.length && <Typography color="text.secondary">No tickets in this stage.</Typography>}
      </Box>
    </Stack>
  );
}
