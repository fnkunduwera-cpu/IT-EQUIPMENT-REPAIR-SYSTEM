import { useMemo, useState } from 'react';
import {
  Box, Button, Card, CardContent, MenuItem, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { COLLECTION_STATUSES, EQUIPMENT_TYPES, PRIORITIES, STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import { downloadCsv, formatDate, money } from '../utils/format';

const COLORS = ['#0B3D6E', '#0E8A6A', '#E07A1F', '#1C6EA4', '#C4382A', '#7A8797'];

export default function Reports() {
  const store = useStore();
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({
    from: '2026-01-01', to: '2026-12-31', customerId: 'All', equipmentType: 'All', technicianId: 'All', priority: 'All', status: 'All', collection: 'All',
  });
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const tickets = useMemo(() => store.tickets.filter((t) => {
    const eq = store.equipmentById(t.equipmentId);
    return t.dateReceived >= filters.from && t.dateReceived <= filters.to
      && (filters.customerId === 'All' || t.customerId === filters.customerId)
      && (filters.equipmentType === 'All' || eq?.equipmentType === filters.equipmentType)
      && (filters.technicianId === 'All' || t.technicianId === filters.technicianId)
      && (filters.priority === 'All' || t.priority === filters.priority)
      && (filters.status === 'All' || t.status === filters.status)
      && (filters.collection === 'All' || t.collectionStatus === filters.collection);
  }).map((t) => {
    const eq = store.equipmentById(t.equipmentId);
    return {
      ...t,
      customerName: store.customerById(t.customerId)?.fullName || '—',
      equipmentType: eq?.equipmentType || '—',
      equipmentLabel: eq ? `${eq.brand} ${eq.model}` : '—',
      technicianName: store.technicianById(t.technicianId)?.fullName || 'Unassigned',
      difference: Number(t.actualCost || 0) - Number(t.estimatedCost || 0),
    };
  }), [store, filters]);

  const reportRows = {
    0: tickets,
    1: tickets,
    2: store.customers.map((c) => ({
      id: c.id,
      customer: c.fullName,
      type: c.customerType,
      equipment: store.equipmentCount(c.id),
      tickets: store.ticketCount(c.id),
      cost: store.tickets.filter((t) => t.customerId === c.id).reduce((s, t) => s + Number(t.actualCost || 0), 0),
    })).filter((c) => filters.customerId === 'All' || c.id === filters.customerId).sort((a, b) => b.tickets - a.tickets),
    3: tickets.filter((t) => filters.collection === 'All' || t.collectionStatus === filters.collection),
  }[tab];

  const columns = tab === 2
    ? [
        { field: 'customer', headerName: 'Customer', flex: 1 },
        { field: 'type', headerName: 'Type', width: 140 },
        { field: 'equipment', headerName: 'Equipment', width: 120 },
        { field: 'tickets', headerName: 'Tickets', width: 110 },
        { field: 'cost', headerName: 'Repair cost', width: 150, valueFormatter: (v) => money(v) },
      ]
    : [
        { field: 'ticketNumber', headerName: 'Ticket', width: 140 },
        { field: 'dateReceived', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
        { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 140 },
        { field: 'equipmentType', headerName: 'Type', width: 140 },
        { field: 'technicianName', headerName: 'Technician', width: 150 },
        { field: 'priority', headerName: 'Priority', width: 110 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'collectionStatus', headerName: 'Collection', width: 170 },
        { field: 'estimatedCost', headerName: 'Estimated', width: 130, valueFormatter: (v) => money(v) },
        { field: 'actualCost', headerName: 'Actual', width: 130, valueFormatter: (v) => money(v) },
        { field: 'difference', headerName: 'Difference', width: 130, valueFormatter: (v) => money(v) },
      ];

  const byTech = useMemo(() => {
    const map = {};
    tickets.forEach((t) => { map[t.technicianName] = (map[t.technicianName] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);
  const byType = useMemo(() => {
    const map = {};
    tickets.forEach((t) => { map[t.equipmentType] = (map[t.equipmentType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const exportRows = () => downloadCsv(`irms-report-${tab}.csv`, reportRows);

  return (
    <Stack spacing={2} className="print-area">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" className="no-print">
        <Box>
          <Typography variant="h4">Reports</Typography>
          <Typography color="text.secondary">Repair, cost, customer, and collection reports with filters, print, and CSV export.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => window.print()}>Print report</Button>
          <Button variant="contained" onClick={exportRows}>Export CSV</Button>
        </Stack>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} className="no-print" flexWrap="wrap">
        <TextField label="From" type="date" value={filters.from} onChange={set('from')} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" value={filters.to} onChange={set('to')} InputLabelProps={{ shrink: true }} />
        <TextField select label="Customer" value={filters.customerId} onChange={set('customerId')} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All</MenuItem>
          {store.customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
        </TextField>
        <TextField select label="Equipment type" value={filters.equipmentType} onChange={set('equipmentType')} sx={{ minWidth: 160 }}>
          <MenuItem value="All">All</MenuItem>
          {EQUIPMENT_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Technician" value={filters.technicianId} onChange={set('technicianId')} sx={{ minWidth: 160 }}>
          <MenuItem value="All">All</MenuItem>
          {store.technicians.map((t) => <MenuItem key={t.id} value={t.id}>{t.fullName}</MenuItem>)}
        </TextField>
        <TextField select label="Priority" value={filters.priority} onChange={set('priority')} sx={{ minWidth: 130 }}>
          <MenuItem value="All">All</MenuItem>
          {PRIORITIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Repair status" value={filters.status} onChange={set('status')} sx={{ minWidth: 150 }}>
          <MenuItem value="All">All</MenuItem>
          {STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Collection" value={filters.collection} onChange={set('collection')} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All</MenuItem>
          {COLLECTION_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" className="no-print">
        <Tab label="Repair reports" />
        <Tab label="Cost reports" />
        <Tab label="Customer reports" />
        <Tab label="Collection reports" />
      </Tabs>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Card><CardContent>
          <Typography variant="h6">Repairs by technician</Typography>
          <Box sx={{ height: 220 }}>
            <ResponsiveContainer><BarChart data={byTech}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#0B3D6E" /></BarChart></ResponsiveContainer>
          </Box>
        </CardContent></Card>
        <Card><CardContent>
          <Typography variant="h6">Repairs by equipment type</Typography>
          <Box sx={{ height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" outerRadius={80}>
                  {byType.map((e, i) => <Cell key={e.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent></Card>
      </Box>
      <Box sx={{ height: 560, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid rows={reportRows} columns={columns} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Showing {reportRows.length} row(s). High-cost repairs are tickets whose actual cost is above the estimate. Monthly costs can be reviewed by narrowing the date range.
      </Typography>
    </Stack>
  );
}
