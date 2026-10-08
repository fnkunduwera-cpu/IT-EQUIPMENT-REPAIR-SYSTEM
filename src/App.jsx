import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import theme from './theme';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetails from './pages/EquipmentDetails';
import RepairTickets from './pages/RepairTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import Technicians from './pages/Technicians';
import TechnicianDetails from './pages/TechnicianDetails';
import DiagnosisPage from './pages/DiagnosisPage';
import RepairQueue from './pages/RepairQueue';
import Payments from './pages/Payments';
import HistoryPage from './pages/HistoryPage';
import Reports from './pages/Reports';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:customerId" element={<CustomerDetails />} />
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/equipment/:equipmentId" element={<EquipmentDetails />} />
                <Route path="/repair-tickets" element={<RepairTickets />} />
                <Route path="/repair-tickets/create" element={<CreateTicket />} />
                <Route path="/repair-tickets/:ticketId" element={<TicketDetails />} />
                <Route path="/technicians" element={<Technicians />} />
                <Route path="/technicians/:technicianId" element={<TechnicianDetails />} />
                <Route path="/diagnosis" element={<DiagnosisPage />} />
                <Route path="/queue" element={<RepairQueue />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/staff" element={<Signup />} />
                <Route path="/password" element={<ChangePassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}