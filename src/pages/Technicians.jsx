import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { SPECIALIZATIONS, TECH_STATUSES } from '../data/seed';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';

const blank = { fullName: '', phone: '', email: '', specialization: 'Computer Hardware', experience: 1, status: 'Available', password: '', confirm: '' };

export default function Technicians() {
  const store = useStore();
  const { user, signup, changeAccountPassword } = useAuth();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = useMemo(() => store.technicians.map((t) => ({
    ...t,
    activeTickets: store.techActive(t.id),
    completedRepairs: store.techDone(t.id),
  })).filter((t) => {
    const q = search.toLowerCase();
    const hit = !q || [t.fullName, t.staffNumber, t.phone, t.email, t.specialization].join(' ').toLowerCase().includes(q);
    return hit && (spec === 'All' || t.specialization === spec) && (status === 'All' || t.status === status);
  }), [store, search, spec, status]);

  const save = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!form.id && (!form.password || form.password.length < 6)) {
      setError('A login password of at least 6 characters is required.');
      return;
    }
    if (form.password && form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result = form.id ? store.updateTechnician({ ...form, experience: Number(form.experience) }) : store.addTechnician({ ...form, experience: Number(form.experience) });
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    if (!form.id) {
      const account = signup({ name: form.fullName, email: form.email, password: form.password, role: 'Technician' });
      if (typeof account === 'string') {
        setError(`Technician saved, but login was not created: ${account}`);
        return;
      }
      setOpen(false);
      notify(`Technician added. Sign in with ${form.email} and password ${form.password}.`);
      return;
    }
    if (form.password && user?.role === 'Manager') changeAccountPassword(form.email, form.password);
    setOpen(false);
    notify(form.password ? `Technician updated. New password: ${form.password}` : 'Technician updated.');
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
        <Box>
          <Typography variant="h4">Technicians</Typography>
          <Typography color="text.secondary">Workload is calculated from assigned tickets that are not collected.</Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setForm(blank); setError(''); setOpen(true); }}>Add technician</Button>
      </Stack>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' } }}>
        {rows.slice(0, 6).map((t) => (
          <Card key={t.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/technicians/${t.id}`)}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={700}>{t.fullName}</Typography>
                <StatusChip value={t.status} kind="tech" />
              </Stack>
              <Typography variant="body2" color="text.secondary">{t.specialization} · {t.experience} yrs</Typography>
              <Typography variant="body2">{t.fullName} — {t.activeTickets} active repairs</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Specialization" value={spec} onChange={(e) => setSpec(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="All">All</MenuItem>
          {SPECIALIZATIONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="All">All</MenuItem>
          {TECH_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ height: 560, bgcolor: 'white', borderRadius: 3 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'staffNumber', headerName: 'Staff No.', width: 140 },
            { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 160 },
            { field: 'phone', headerName: 'Phone', width: 160 },
            { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
            { field: 'specialization', headerName: 'Specialization', width: 170 },
            { field: 'experience', headerName: 'Years', width: 90 },
            { field: 'activeTickets', headerName: 'Active', width: 90 },
            { field: 'completedRepairs', headerName: 'Completed', width: 110 },
            { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <StatusChip value={p.value} kind="tech" /> },
            {
              field: 'actions', headerName: 'Actions', width: 220, sortable: false,
              renderCell: (p) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                  <Button size="small" onClick={() => navigate(`/technicians/${p.row.id}`)}>View</Button>
                  <Button size="small" onClick={() => { setForm(p.row); setError(''); setOpen(true); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => setPendingDelete(p.row)}>Delete</Button>
                </Stack>
              ),
            },
          ]}
          pageSizeOptions={[10, 15, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit technician' : 'Add technician'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField select label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
              {SPECIALIZATIONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label="Experience (years)" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {TECH_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label={form.id ? 'New login password (optional)' : 'Login password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            <Alert severity="info">This email and password are used on the sign-in page. The password is shown once after saving.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete technician?"
        message={`Delete ${pendingDelete?.fullName}? Blocked while active tickets are assigned.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          const result = store.deleteTechnician(pendingDelete.id);
          setPendingDelete(null);
          notify(result === true ? 'Technician deleted.' : result, result === true ? 'success' : 'error');
        }}
      />
    </Stack>
  );
}
