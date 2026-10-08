import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function Login() {
  const { user, login } = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      setShake(true);
      return;
    }
    const result = login(email, password);
    if (typeof result === 'string') {
      setError(result);
      setShake(true);
      return;
    }
    store.updateSettings({ officerName: result.name });
    navigate(location.state?.from || '/', { replace: true });
  };

  return (
    <Box className="login-screen">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <span className="orb orb-c" />
      <Card className={`login-card ${shake ? 'shake' : ''}`} onAnimationEnd={() => setShake(false)}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.2} component="form" onSubmit={submit}>
            <Stack direction="row" spacing={1.2} alignItems="center" className="login-brand">
              <BuildCircleIcon sx={{ fontSize: 42, color: '#0E8A6A' }} />
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 1.4, color: 'rgba(255,255,255,0.7)' }}>RP Karongi College</Typography>
                <Typography variant="h5" sx={{ color: 'white', lineHeight: 1.15 }}>IT Repair Center</Typography>
              </Box>
            </Stack>
            <Box>
              <Typography variant="h4" sx={{ color: 'white' }}>Sign in</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                Enter the authorized email and password. Both are required and are not shown on this screen.
              </Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
              fullWidth
            />
            <TextField
              label="Password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((v) => !v)} edge="end" aria-label="Toggle password visibility">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" className="login-submit">Sign in</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}