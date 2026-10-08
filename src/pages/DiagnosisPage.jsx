import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useStore } from '../context/StoreContext';
import { formatDate, money } from '../utils/format';

export default function DiagnosisPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tech, setTech] = useState('All');
  const rows = useMemo(() => store.diagnoses.map((d) => {
    const ticket = store.ticketById(d.ticketId);
    const eq = ticket ? store.equipmentById(ticket.equipmentId) : null;
    return {
      ...d,
      ticketNumber: ticket?.ticketNumber || '—',
      customerName: ticket ? store.customerById(ticket.customerId)?.fullName : '—',
      equipmentLabel: eq ? `${eq.brand} ${eq.model}` : '—',
      technicianName: store.technicianById(d.technicianId)?.fullName || '—',
      status: ticket?.status || '—',
    };
  }).filter((d) => {
    const q = search.toLowerCase();
    const hit = !q || [d.ticketNumber, d.customerName, d.problemIdentified, d.recommendedSolution].join(' ').toLowerCase().includes(q);
    return hit && (tech === 'All' || d.technicianId === tech);
  }), [store, search, tech]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Diagnosis</Typography>
        <Typography color="text.secondary">Each diagnosis is linked to one repair ticket. Completing it can move Received → Diagnosis → Repairing.</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Technician" value={tech} onChange={(e) => setTech(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="All">All</MenuItem>
          {store.technicians.map((t) => <MenuItem key={t.id} value={t.id}>{t.fullName}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ height: 640, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'diagnosisNumber', headerName: 'Diagnosis', width: 140 },
            { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
            { field: 'customerName', headerName: 'Customer', width: 160 },
            { field: 'equipmentLabel', headerName: 'Equipment', width: 180 },
            { field: 'technicianName', headerName: 'Technician', width: 160 },
            { field: 'diagnosisDate', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
            { field: 'problemIdentified', headerName: 'Problem', flex: 1, minWidth: 180 },
            { field: 'recommendedSolution', headerName: 'Solution', flex: 1, minWidth: 160 },
            { field: 'estimatedCost', headerName: 'Estimate', width: 130, valueFormatter: (v) => money(v) },
            { field: 'status', headerName: 'Ticket status', width: 130 },
            { field: 'actions', headerName: 'Open', width: 90, renderCell: (p) => <Button size="small" onClick={() => navigate(`/repair-tickets/${p.row.ticketId}`)}>View</Button> },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );
}
