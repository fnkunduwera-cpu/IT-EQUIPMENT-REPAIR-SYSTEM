import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { BRANDS, CONDITIONS, EQUIPMENT_TYPES, STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';

const blank = {
  customerId: '', equipmentType: 'Laptop', brand: 'HP', model: '', serialNumber: '', color: 'Black',
  accessories: '', conditionOnArrival: 'Good', description: '',
};

export default function EquipmentPage() {
  const store = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [brand, setBrand] = useState('All');
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = useMemo(() => store.equipment.map((e) => ({
    ...e,
    customerName: store.customerById(e.customerId)?.fullName || '—',
    currentStatus: store.currentEquipmentStatus(e.id),
  })).filter((e) => {
    const q = search.toLowerCase();
    const hit = !q || [e.equipmentNumber, e.customerName, e.brand, e.model, e.serialNumber].join(' ').toLowerCase().includes(q);
    return hit && (type === 'All' || e.equipmentType === type) && (brand === 'All' || e.brand === brand) && (status === 'All' || e.currentStatus === status);
  }), [store, search, type, brand, status]);

  const save = () => {
    const result = form.id ? store.updateEquipment(form) : store.addEquipment(form);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    setOpen(false);
    notify(form.id ? 'Equipment updated.' : 'Equipment registered.');
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
        <Box>
          <Typography variant="h4">Equipment</Typography>
          <Typography color="text.secondary">Devices received from customers. Serial numbers must be unique.</Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setForm(blank); setError(''); setOpen(true); }}>Add equipment</Button>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="All">All types</MenuItem>
          {EQUIPMENT_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="All">All brands</MenuItem>
          {BRANDS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Repair status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="All">All statuses</MenuItem>
          {STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ height: 640, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'equipmentNumber', headerName: 'Equipment No.', width: 150 },
            { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 160 },
            { field: 'equipmentType', headerName: 'Type', width: 160 },
            { field: 'brand', headerName: 'Brand', width: 110 },
            { field: 'model', headerName: 'Model', flex: 1, minWidth: 160 },
            { field: 'serialNumber', headerName: 'Serial', width: 150 },
            { field: 'conditionOnArrival', headerName: 'Condition', width: 150 },
            { field: 'currentStatus', headerName: 'Repair status', width: 140, renderCell: (p) => <StatusChip value={p.value} /> },
            {
              field: 'actions', headerName: 'Actions', width: 220, sortable: false,
              renderCell: (p) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                  <Button size="small" onClick={() => navigate(`/equipment/${p.row.id}`)}>View</Button>
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
        <DialogTitle>{form.id ? 'Edit equipment' : 'Add equipment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Autocomplete
              options={store.customers}
              getOptionLabel={(c) => `${c.fullName} (${c.customerNumber})`}
              value={store.customers.find((c) => c.id === form.customerId) || null}
              onChange={(_, value) => setForm({ ...form, customerId: value?.id || '' })}
              renderInput={(params) => <TextField {...params} label="Customer" required />}
            />
            <TextField select label="Type" value={form.equipmentType} onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}>
              {EQUIPMENT_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth />
              <TextField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Serial number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} required />
            <TextField label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            <TextField label="Accessories received" value={form.accessories} onChange={(e) => setForm({ ...form, accessories: e.target.value })} />
            <TextField select label="Condition on arrival" value={form.conditionOnArrival} onChange={(e) => setForm({ ...form, conditionOnArrival: e.target.value })}>
              {CONDITIONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete equipment?"
        message={`Delete ${pendingDelete?.equipmentNumber}? Blocked if a repair ticket exists.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          const result = store.deleteEquipment(pendingDelete.id);
          setPendingDelete(null);
          notify(result === true ? 'Equipment deleted.' : result, result === true ? 'success' : 'error');
        }}
      />
    </Stack>
  );
}
