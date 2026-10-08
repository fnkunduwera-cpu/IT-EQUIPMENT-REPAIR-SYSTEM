import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { CUSTOMER_TYPES, GENDERS } from '../data/seed';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../utils/format';

const blank = { fullName: '', contactPerson: '', gender: 'Female', phone: '', email: '', address: '', customerType: 'Individual', status: 'Active' };

export default function Customers() {
  const store = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = useMemo(() => store.customers
    .map((c) => ({
      ...c,
      equipmentCount: store.equipmentCount(c.id),
      ticketCount: store.ticketCount(c.id),
    }))
    .filter((c) => {
      const q = search.toLowerCase();
      const hit = !q || [c.fullName, c.customerNumber, c.phone, c.email, c.address].join(' ').toLowerCase().includes(q);
      return hit && (type === 'All' || c.customerType === type) && (status === 'All' || c.status === status);
    }), [store, search, type, status]);

  const save = () => {
    const result = form.id ? store.updateCustomer(form) : store.addCustomer(form);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    setOpen(false);
    notify(form.id ? 'Customer updated.' : 'Customer registered.');
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h4">Customers</Typography>
          <Typography color="text.secondary">Individuals, businesses, organizations, and institutions.</Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setForm(blank); setError(''); setOpen(true); }}>Add customer</Button>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All types</MenuItem>
          {CUSTOMER_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Stack>
      <Box sx={{ height: 640, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'customerNumber', headerName: 'Customer No.', width: 150 },
            { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 180 },
            { field: 'gender', headerName: 'Gender', width: 110 },
            { field: 'phone', headerName: 'Phone', width: 170 },
            { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
            { field: 'customerType', headerName: 'Type', width: 140 },
            { field: 'registrationDate', headerName: 'Registered', width: 130, valueFormatter: (v) => formatDate(v) },
            { field: 'equipmentCount', headerName: 'Equipment', width: 110 },
            { field: 'ticketCount', headerName: 'Tickets', width: 100 },
            { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip value={p.value} kind="tech" /> },
            {
              field: 'actions', headerName: 'Actions', width: 220, sortable: false, filterable: false,
              renderCell: (p) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                  <Button size="small" onClick={() => navigate(`/customers/${p.row.id}`)}>View</Button>
                  <Button size="small" onClick={() => { setForm(p.row); setError(''); setOpen(true); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => setPendingDelete(p.row)}>Delete</Button>
                </Stack>
              ),
            },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit customer' : 'Add customer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full name / organization" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <TextField label="Contact person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} fullWidth>
                {GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
              <TextField select label="Type" value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })} fullWidth>
                {CUSTOMER_TYPES.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete customer?"
        message={`Delete ${pendingDelete?.fullName}? This is blocked if the customer has equipment or tickets.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          const result = store.deleteCustomer(pendingDelete.id);
          setPendingDelete(null);
          notify(result === true ? 'Customer deleted.' : result, result === true ? 'success' : 'error');
        }}
      />
    </Stack>
  );
}
