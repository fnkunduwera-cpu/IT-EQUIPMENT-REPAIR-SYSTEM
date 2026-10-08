import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { PRIORITIES, STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { formatDate, money } from '../utils/format';

export default function RepairTickets() {
  const store = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [tech, setTech] = useState('All');

  const rows = useMemo(() => store.tickets.map((t) => {
    const eq = store.equipmentById(t.equipmentId);
    return {
      ...t,
      customerName: store.customerById(t.customerId)?.fullName || '—',
      equipmentLabel: eq ? `${eq.brand} ${eq.model}` : '—',
      equipmentType: eq?.equipmentType || '—',
      serialNumber: eq?.serialNumber || '—',
      technicianName: store.technicianById(t.technicianId)?.fullName || 'Unassigned',
    };
  }).filter((t) => {
    const q = search.toLowerCase();
    const hit = !q || [t.ticketNumber, t.customerName, t.equipmentLabel, t.serialNumber, t.problemDescription].join(' ').toLowerCase().includes(q);
    return hit && (status === 'All' || t.status === status) && (priority === 'All' || t.priority === priority) && (tech === 'All' || t.technicianId === tech);
  }), [store, search, status, priority, tech]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
        <Box>
          <Typography variant="h4">Repair tickets</Typography>
          <Typography color="text.secondary">Intake, assignment, diagnosis, cost, and collection.</Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/repair-tickets/create')}>Create ticket</Button>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="All">All</MenuItem>
          {STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="All">All</MenuItem>
          {PRIORITIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Technician" value={tech} onChange={(e) => setTech(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All</MenuItem>
          {store.technicians.map((item) => <MenuItem key={item.id} value={item.id}>{item.fullName}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ height: 640, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
            { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 150 },
            { field: 'equipmentLabel', headerName: 'Equipment', flex: 1, minWidth: 160 },
            { field: 'equipmentType', headerName: 'Type', width: 140 },
            { field: 'serialNumber', headerName: 'Serial', width: 140 },
            { field: 'dateReceived', headerName: 'Received', width: 120, valueFormatter: (v) => formatDate(v) },
            { field: 'priority', headerName: 'Priority', width: 110, renderCell: (p) => <StatusChip value={p.value} kind="priority" /> },
            { field: 'technicianName', headerName: 'Technician', width: 150 },
            { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <StatusChip value={p.value} /> },
            { field: 'estimatedCost', headerName: 'Estimated', width: 130, valueFormatter: (v) => money(v) },
            { field: 'actualCost', headerName: 'Actual', width: 130, valueFormatter: (v) => money(v) },
            { field: 'collectionStatus', headerName: 'Collection', width: 170, renderCell: (p) => <StatusChip value={p.value} kind="collection" /> },
            {
              field: 'actions', headerName: 'Open', width: 90, sortable: false,
              renderCell: (p) => <Button size="small" onClick={() => navigate(`/repair-tickets/${p.row.id}`)}>View</Button>,
            },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(p) => navigate(`/repair-tickets/${p.id}`)}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );
}
