import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { formatDate, money } from '../utils/format';

export default function CustomerDetails() {
  const { customerId } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const customer = store.customerById(customerId);
  const equipment = useMemo(() => store.equipment.filter((e) => e.customerId === customerId), [store, customerId]);
  const tickets = useMemo(() => store.tickets.filter((t) => t.customerId === customerId), [store, customerId]);
  const history = useMemo(() => store.history.filter((h) => tickets.some((t) => t.id === h.ticketId)), [store, tickets]);
  const total = tickets.reduce((s, t) => s + Number(t.actualCost || 0), 0);
  const outstanding = tickets.filter((t) => t.collectionStatus === 'Ready for Collection').reduce((s, t) => s + Number(t.actualCost || t.estimatedCost || 0), 0);

  if (!customer) return <Typography>Customer not found.</Typography>;

  return (
    <Stack spacing={2}>
      <Button onClick={() => navigate('/customers')} sx={{ alignSelf: 'flex-start' }}>Back to customers</Button>
      <Box>
        <Typography variant="h4">{customer.fullName}</Typography>
        <Typography color="text.secondary">{customer.customerNumber} · {customer.customerType}</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        <Tab label="Overview" /><Tab label="Equipment" /><Tab label="Repair Tickets" /><Tab label="Repair History" />
      </Tabs>
      {tab === 0 && (
        <Card><CardContent>
          <Stack spacing={1}>
            <Typography>Phone: {customer.phone}</Typography>
            <Typography>Email: {customer.email || '—'}</Typography>
            <Typography>Address: {customer.address || '—'}</Typography>
            <Typography>Gender: {customer.gender}</Typography>
            <Typography>Contact person: {customer.contactPerson || '—'}</Typography>
            <Typography>Registered: {formatDate(customer.registrationDate)}</Typography>
            <StatusChip value={customer.status} kind="tech" />
            <Typography>Equipment count: {equipment.length}</Typography>
            <Typography>Repair tickets: {tickets.length}</Typography>
            <Typography>Total repair costs: {money(total)}</Typography>
            <Typography>Outstanding amount: {money(outstanding)}</Typography>
          </Stack>
        </CardContent></Card>
      )}
      {tab === 1 && (
        <Box sx={{ height: 420, bgcolor: 'white' }}>
          <DataGrid
            rows={equipment.map((e) => ({ ...e, currentStatus: store.currentEquipmentStatus(e.id) }))}
            columns={[
              { field: 'equipmentNumber', headerName: 'Number', width: 150 },
              { field: 'equipmentType', headerName: 'Type', width: 160 },
              { field: 'brand', headerName: 'Brand', width: 120 },
              { field: 'model', headerName: 'Model', flex: 1 },
              { field: 'serialNumber', headerName: 'Serial', width: 160 },
              { field: 'currentStatus', headerName: 'Status', width: 140, renderCell: (p) => <StatusChip value={p.value} /> },
            ]}
            onRowClick={(p) => navigate(`/equipment/${p.row.id}`)}
          />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ height: 420, bgcolor: 'white' }}>
          <DataGrid
            rows={tickets}
            columns={[
              { field: 'ticketNumber', headerName: 'Ticket', width: 150 },
              { field: 'dateReceived', headerName: 'Received', width: 130, valueFormatter: (v) => formatDate(v) },
              { field: 'priority', headerName: 'Priority', width: 120, renderCell: (p) => <StatusChip value={p.value} kind="priority" /> },
              { field: 'status', headerName: 'Status', width: 140, renderCell: (p) => <StatusChip value={p.value} /> },
              { field: 'actualCost', headerName: 'Actual', width: 140, valueFormatter: (v) => money(v) },
            ]}
            onRowClick={(p) => navigate(`/repair-tickets/${p.row.id}`)}
          />
        </Box>
      )}
      {tab === 3 && (
        <Box sx={{ height: 420, bgcolor: 'white' }}>
          <DataGrid
            rows={history}
            columns={[
              { field: 'date', headerName: 'Date', width: 130, valueFormatter: (v) => formatDate(v) },
              { field: 'action', headerName: 'Action', flex: 1 },
              { field: 'previousStatus', headerName: 'Previous', width: 130 },
              { field: 'newStatus', headerName: 'New', width: 130 },
              { field: 'staffName', headerName: 'Staff', width: 180 },
            ]}
          />
        </Box>
      )}
    </Stack>
  );
}
