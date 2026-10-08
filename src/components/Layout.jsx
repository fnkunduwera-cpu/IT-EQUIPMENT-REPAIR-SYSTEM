import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Snackbar, Alert, Toolbar, Typography, useMediaQuery, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BiotechIcon from '@mui/icons-material/Biotech';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { canCreateTicket, canResetData } from '../context/roles';
import ConfirmDialog from './ConfirmDialog';

const NAV = [
  { label: 'Dashboard', to: '/', icon: <DashboardIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Repair Queue', to: '/queue', icon: <ViewKanbanIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Repair Tickets', to: '/repair-tickets', icon: <ConfirmationNumberIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Diagnosis', to: '/diagnosis', icon: <BiotechIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Payments / Costs', to: '/payments', icon: <PaymentsIcon />, roles: ['Manager', 'Desk Officer'] },
  { label: 'Customers', to: '/customers', icon: <PeopleIcon />, roles: ['Manager', 'Desk Officer'] },
  { label: 'Equipment', to: '/equipment', icon: <DevicesIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Technicians', to: '/technicians', icon: <EngineeringIcon />, roles: ['Manager', 'Desk Officer'] },
  { label: 'Repair History', to: '/history', icon: <HistoryIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
  { label: 'Reports', to: '/reports', icon: <AssessmentIcon />, roles: ['Manager'] },
  { label: 'Staff accounts', to: '/staff', icon: <PersonAddIcon />, roles: ['Manager'] },
  { label: 'Change password', to: '/password', icon: <LockResetIcon />, roles: ['Manager', 'Desk Officer', 'Technician'] },
];

const drawerWidth = 268;

export default function Layout() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const store = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const notify = (message, severity = 'success') => setToast({ open: true, message, severity });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#072A4C', color: 'white' }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: 0.7 }}>RP Karongi College</Typography>
        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>IT Repair Center</Typography>
        <Typography variant="caption" sx={{ opacity: 0.75 }}>Equipment repair management</Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {NAV.filter((item) => item.roles.includes(user?.role)).map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 2, mb: 0.4, color: 'rgba(255,255,255,0.82)',
              '&.active': { bgcolor: 'rgba(255,255,255,0.14)', color: 'white' },
            }}
            className="nav-item"
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        {canResetData(user?.role) && (
          <Button fullWidth startIcon={<RestartAltIcon />} color="inherit" variant="outlined" onClick={() => setResetOpen(true)}>
            Reset demo data
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={0} className="no-print" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #E6EDF5' }}>
        <Toolbar>
          {mobile && (
            <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>{store.settings.centerName}</Typography>
            <Typography variant="caption" color="text.secondary">Frontend workshop system · localStorage</Typography>
          </Box>
          {canCreateTicket(user?.role) && (
            <Button size="small" onClick={() => navigate('/repair-tickets/create')} variant="contained" sx={{ mr: 2 }}>
              New ticket
            </Button>
          )}
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{(user?.name || 'U').slice(0, 1)}</Avatar>
          <Box sx={{ ml: 1.2, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
          </Box>
          <IconButton sx={{ ml: 1 }} aria-label="Log out" onClick={() => { logout(); navigate('/login'); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={mobile ? 'temporary' : 'permanent'}
        open={mobile ? open : true}
        onClose={() => setOpen(false)}
        className="no-print"
        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 0 } }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, mt: 8, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Box key={location.pathname} className="page-enter">
          <Outlet context={{ notify }} />
        </Box>
      </Box>
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        message="This replaces customers, equipment, tickets, technicians, diagnoses, costs, collections, and history with a fresh mock dataset."
        confirmLabel="Reset"
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          store.resetData();
          setResetOpen(false);
          notify('Demo data restored.');
        }}
      />
    </Box>
  );
}