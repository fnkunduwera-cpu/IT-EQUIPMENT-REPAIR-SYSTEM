import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { user, changeOwnPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  const submit = (event) => {
    event.preventDefault();
    setDone('');
    if (!currentPassword || !nextPassword || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (nextPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    const result = changeOwnPassword(currentPassword, nextPassword);
    if (result !== true) {
      setError(result);
      return;
    }
    setError('');
    setDone('Password changed. Use the new password the next time you sign in.');
    setCurrentPassword('');
    setNextPassword('');
    setConfirm('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Change password</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Every signed-in user can change their own password. The current password is required.
      </Typography>
      <Box component="form" onSubmit={submit} sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {done && <Alert severity="success">{done}</Alert>}
          <TextField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required fullWidth />
          <TextField label="New password" type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} required fullWidth />
          <TextField label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained">Save new password</Button>
        </Stack>
      </Box>
    </Box>
  );
}