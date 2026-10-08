import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c56517', light: '#1D5C99', dark: '#072A4C' },
    secondary: { main: '#0E8A6A' },
    warning: { main: '#E07A1F' },
    error: { main: '#C4382A' },
    success: { main: '#1F8A4C' },
    info: { main: '#1C6EA4' },
    background: { default: '#F3F6FB', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 24px rgba(11, 61, 110, 0.06)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;

export const STATUS_COLORS = {
  Received: 'info',
  Diagnosis: 'warning',
  Repairing: 'secondary',
  Ready: 'success',
  Collected: 'default',
};

export const PRIORITY_COLORS = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Urgent: 'error',
};

export const COLLECTION_COLORS = {
  'Not Ready': 'default',
  'Ready for Collection': 'success',
  Collected: 'primary',
};

export const TECH_COLORS = {
  Available: 'success',
  Busy: 'warning',
  'On Leave': 'info',
  Inactive: 'default',
};
