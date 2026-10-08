import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert, Box, Button, IconButton, InputAdornment, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Desk Officer', 'Technician', 'Manager'];
const empty = { name: '', email: '', password: '', confirm: '', role: 'Desk Officer' };

export default function Signup() {
  const { user, accounts, signup, removeAccount } = useAuth();
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Manager') return <Navigate to="/" replace />;

  const submit = (event) => {
    event.preventDefault();
    setDone('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result = signup(form);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    setError('');
    setDone(`${result.name} can sign in as ${result.role}. Email: ${result.email}. Password: ${form.password}`);
    setForm(empty);
  };

  const remove = (account) => {
    if (!window.confirm(`Delete ${account.name}? This account will no longer be able to sign in.`)) return;
    const result = removeAccount(account.email);
    if (result !== true) {
      setDone('');
      setError(result);
      return;
    }
    setError('');
    setDone(`${account.name} was deleted.`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Staff accounts</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Only a manager can create or delete an account. You cannot delete the account you are using.
      </Typography>
      <Stack spacing={1.2} sx={{ mb: 3, maxWidth: 720 }}>
        {accounts.map((account) => (
          <Stack key={account.email} direction="row" spacing={2} alignItems="center" sx={{ p: 1.4, border: '1px solid #E6EDF5', borderRadius: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>{account.name}</Typography>
              <Typography variant="body2" color="text.secondary">{account.email} · {account.role}</Typography>
            </Box>
            <Button color="error" disabled={account.email === user.email} onClick={() => remove(account)}>Delete</Button>
          </Stack>
        ))}
      </Stack>
      <Box component="form" onSubmit={submit} sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {done && <Alert severity="success">{done}</Alert>}
          <TextField label="Full name" value={form.name} onChange={set('name')} required fullWidth />
          <TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth />
          <TextField select label="Role" value={form.role} onChange={set('role')} fullWidth>
            {ROLES.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </TextField>
          <TextField
            label="Password"
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow((value) => !value)} edge="end" aria-label="Toggle password visibility">
                    {show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} required fullWidth />
          <Button type="submit" variant="contained">Create staff account</Button>
        </Stack>
      </Box>
    </Box>
  );
}