import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import { money, pct } from '../utils/format';

export default function Payments() {
  const store = useStore();
  const navigate = useNavigate();
  const [flag, setFlag] = useState('All');
  const rows = useMemo(() => store.tickets.map((t) => {
    const difference = Number(t.actualCost || 0) - Number(t.estimatedCost || 0);
    return {
      ...t,
      customerName: store.customerById(t.customerId)?.fullName || '—',
      equipmentLabel: `${store.equipmentById(t.equipmentId)?.brand || ''} ${store.equipmentById(t.equipmentId)?.model || ''}`,
      difference,
      percent: pct(difference, t.estimatedCost),
      over: t.actualCost > 0 && t.estimatedCost > 0 && difference > 0,
    };
  }).filter((t) => flag === 'All' || (flag === 'Over' && t.over) || (flag === 'Ready' && t.collectionStatus === 'Ready for Collection')), [store, flag]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Payments / costs</Typography>
        <Typography color="text.secondary">Difference = actual cost − estimated cost. Totals cover every ticket.</Typography>
      </Box>
      <Alert severity="info">Estimated total {money(store.stats.estimated)} · Actual total {money(store.stats.actual)} · Outstanding collection {money(store.stats.outstandingAmount)}</Alert>
      <TextField select label="Filter" value={flag} onChange={(e) => setFlag(e.target.value)} sx={{ maxWidth: 280 }}>
        <MenuItem value="All">All tickets</MenuItem>
        <MenuItem value="Over">Actual exceeds estimate</MenuItem>
        <MenuItem value="Ready">Ready for collection</MenuItem>
      </TextField>
      <Box sx={{ height: 640, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
            { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 150 },
            { field: 'equipmentLabel', headerName: 'Equipment', flex: 1, minWidth: 160 },
            { field: 'estimatedCost', headerName: 'Estimated', width: 140, valueFormatter: (v) => money(v) },
            { field: 'actualCost', headerName: 'Actual', width: 140, valueFormatter: (v) => money(v) },
            { field: 'difference', headerName: 'Difference', width: 140, valueFormatter: (v) => money(v) },
            { field: 'percent', headerName: '% diff', width: 100 },
            { field: 'over', headerName: 'Warning', width: 120, renderCell: (p) => p.value ? <StatusChip value="Over estimate" kind="priority" /> : '—' },
            { field: 'collectionStatus', headerName: 'Collection', width: 170, renderCell: (p) => <StatusChip value={p.value} kind="collection" /> },
          ]}
          onRowClick={(p) => navigate(`/repair-tickets/${p.id}`)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Stack>
  );
}
