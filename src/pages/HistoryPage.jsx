import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import { formatDate } from '../utils/format';

export default function HistoryPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows = useMemo(() => store.history.map((h) => {
    const ticket = store.ticketById(h.ticketId);
    const eq = ticket ? store.equipmentById(ticket.equipmentId) : null;
    return {
      ...h,
      ticketNumber: ticket?.ticketNumber || '—',
      equipmentLabel: eq ? `${eq.equipmentNumber} ${eq.brand}` : '—',
      customerName: ticket ? store.customerById(ticket.customerId)?.fullName : '—',
    };
  }).filter((h) => {
    const q = search.toLowerCase();
    const hit = !q || [h.ticketNumber, h.customerName, h.action, h.staffName, h.comment].join(' ').toLowerCase().includes(q);
    return hit && (status === 'All' || h.newStatus === status);
  }), [store, search, status]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Repair history</Typography>
        <Typography color="text.secondary">Every row is written by a real action: create, assign, diagnose, cost, status change, or collection.</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="New status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All</MenuItem>
          {STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ height: 680, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'id', headerName: 'History ID', width: 110 },
            { field: 'date', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
            { field: 'time', headerName: 'Time', width: 110 },
            { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
            { field: 'equipmentLabel', headerName: 'Equipment', width: 160 },
            { field: 'customerName', headerName: 'Customer', width: 160 },
            { field: 'action', headerName: 'Action', flex: 1, minWidth: 180 },
            { field: 'previousStatus', headerName: 'Previous', width: 130 },
            { field: 'newStatus', headerName: 'New status', width: 130 },
            { field: 'staffName', headerName: 'Staff', width: 170 },
            { field: 'comment', headerName: 'Comment', flex: 1, minWidth: 180 },
          ]}
          onRowClick={(p) => p.row.ticketId && navigate(`/repair-tickets/${p.row.ticketId}`)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'date', sort: 'desc' }] } }}
        />
      </Box>
    </Stack>
  );
}
