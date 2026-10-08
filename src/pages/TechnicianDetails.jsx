import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { formatDate, money } from '../utils/format';

export default function TechnicianDetails() {
  const { technicianId } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const tech = store.technicianById(technicianId);
  if (!tech) return <Typography>Technician not found.</Typography>;
  const assigned = store.tickets.filter((t) => t.technicianId === tech.id && t.status !== 'Collected');
  const done = store.tickets.filter((t) => t.technicianId === tech.id && t.status === 'Collected');
  const cols = [
    { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    { field: 'equipmentLabel', headerName: 'Equipment', flex: 1 },
    { field: 'priority', headerName: 'Priority', width: 110, renderCell: (p) => <StatusChip value={p.value} kind="priority" /> },
    { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <StatusChip value={p.value} /> },
    { field: 'actualCost', headerName: 'Actual', width: 130, valueFormatter: (v) => money(v) },
  ];
  const mapRows = (list) => list.map((t) => ({
    ...t,
    customerName: store.customerById(t.customerId)?.fullName,
    equipmentLabel: `${store.equipmentById(t.equipmentId)?.brand || ''} ${store.equipmentById(t.equipmentId)?.model || ''}`,
  }));

  return (
    <Stack spacing={2}>
      <Button onClick={() => navigate('/technicians')} sx={{ alignSelf: 'flex-start' }}>Back to technicians</Button>
      <Card><CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4">{tech.fullName}</Typography>
            <Typography color="text.secondary">{tech.staffNumber} · {tech.specialization} · {tech.experience} years</Typography>
            <Typography>{tech.phone} · {tech.email}</Typography>
          </Box>
          <StatusChip value={tech.status} kind="tech" />
        </Stack>
        <Typography sx={{ mt: 1 }}>{tech.fullName} — {assigned.length} active repairs · {done.length} completed</Typography>
      </CardContent></Card>
      <Typography variant="h6">Assigned tickets</Typography>
      <Box sx={{ height: 320, bgcolor: 'white' }}>
        <DataGrid rows={mapRows(assigned)} columns={cols} onRowClick={(p) => navigate(`/repair-tickets/${p.id}`)} />
      </Box>
      <Typography variant="h6">Completed repairs</Typography>
      <Box sx={{ height: 320, bgcolor: 'white' }}>
        <DataGrid rows={mapRows(done)} columns={[...cols, { field: 'collectionDate', headerName: 'Collected', width: 130, valueFormatter: (v) => formatDate(v) }]} onRowClick={(p) => navigate(`/repair-tickets/${p.id}`)} />
      </Box>
    </Stack>
  );
}
